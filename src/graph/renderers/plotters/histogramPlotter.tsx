import {
  GraphPlotterState,
  leftPadding,
  topPadding,
  bottomPadding,
  rightPadding,
} from "graph/renderers/plotters/graphPlotter";
import HistogramDrawer from "../drawers/histogramDrawer";
import PluginGraphPlotter, { applyPlugin } from "./PluginGraphPlotter";
import * as PlotResource from "graph/resources/plots";
import { getGate, getPopulation } from "graph/utils/workspace";
import HistogramGatePlotter from "./runtimePlugins/histogramGatePlotter";

interface HistogramPlotterState extends GraphPlotterState {
  direction: "vertical" | "horizontal";
  bins: number;
}

export default class HistogramPlotter extends PluginGraphPlotter {
  direction: "vertical" | "horizontal" = "vertical";
  bins: number = 1;
  drawer: HistogramDrawer;

  globalMax: number = 0;
  rangeMin: number = 0;
  rangeMax: number = 0;

  private mainBins: any;

  histogramGatePlugin: HistogramGatePlotter | null = null;

  setup(canvasContext: any) {
    super.setup(canvasContext);
    this.histogramGatePlugin = new HistogramGatePlotter();
    this.addPlugin(this.histogramGatePlugin);
  }

  protected setDrawerState(): void {
    let hBins =
      this.width === undefined ? 2 : Math.round(this.width / (30 * this.scale));
    let vBins =
      this.height === undefined
        ? 2
        : Math.round(this.height / (30 * this.scale));
    hBins = Math.max(2, hBins);
    vBins = Math.max(2, vBins);

    const drawerState = {
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.ranges.x[0],
      iex: this.ranges.x[1],
      iby: this.rangeMin,
      iey: this.rangeMax,
      scale: this.scale,
      xpts: hBins,
      ypts: vBins,
      bins: this.bins,
      axis: this.direction,
    };

    this.drawer.setDrawerState(drawerState);
  }

  public getPlotterState() {
    return {
      ...super.getPlotterState(),
      direction: this.direction,
      bins: this.bins,
    };
  }

  public setPlotterState(state: HistogramPlotterState) {
    super.setPlotterState(state);
    this.direction = state.direction;
    this.bins = state.bins !== undefined ? state.bins : 0;
  }
  public createDrawer(): void {
    this.drawer = new HistogramDrawer();
  }

  protected setBins() {
    this.binSize = 30;
    this.horizontalBinCount =
      this.width === undefined
        ? 2
        : Math.max(
            2,
            Math.round(
              this.width /
                ((this.direction === "vertical" ? 1 : this.binSize) *
                  this.scale)
            )
          );
    this.verticalBinCount =
      this.height === undefined
        ? 2
        : Math.max(
            2,
            Math.round(
              this.height /
                ((this.direction === "vertical" ? this.binSize : 1) *
                  this.scale)
            )
          );
    this.bins =
      this.direction === "vertical"
        ? this.horizontalBinCount
        : this.verticalBinCount;
  }

  public update() {
    super.update();
    this.setBins();

    this.histogramGatePlugin.setGates(
      //@ts-ignore
      this.gates.filter((e) => e.gateType === "histogram")
    );

    const axis = this.plot.histogramAxis === "vertical" ? "x" : "y";

    const axisName = axis === "x" ? this.xAxisName : this.yAxisName;
    console.log("bins = ", this.bins);
    this.mainBins = PlotResource.getHistogramBins(
      this.plot,
      this.bins,
      axisName
    );

    this.yLabels = this.transformer.getAxisLabels(
      "lin",
      [0, this.mainBins.max],
      this.verticalBinCount
    );
    this.xLabels = this.transformer.getAxisLabels(
      "lin",
      this.ranges.x,
      this.horizontalBinCount / this.binSize
    );
  }

  private DRAW_DIVISION_CONST = 3;
  @applyPlugin()
  public draw() {
    this.update();

    const hideY =
      this.plot.xAxis === this.plot.yAxis &&
      this.plot.histogramAxis === "vertical";

    const hideX =
      this.plot.xAxis === this.plot.yAxis &&
      this.plot.histogramAxis === "horizontal";

    super.draw({
      lines: false,
      vbins: (this.height - bottomPadding) / 50,
      hbins: (this.width - rightPadding) / 50,
      yCustomLabelRange: [0, this.mainBins.max],
    });

    const axis =
      this.direction === "vertical" ? this.xAxisName : this.yAxisName;
    let globlMax = this.mainBins.max;
    let range = this.plot.ranges[axis];

    this.rangeMin = range[0];
    this.rangeMax = range[1];

    // const overlaysObj = this.plot.histogramOverlays;
    // const overlays = [];

    // for (const overlay of overlaysObj) {
    //   if (!overlay) continue;
    //   let newPlotData;

    //   switch (overlay.plotSource) {
    //     case "plot":
    //       newPlotData = getPlot(overlay.plotId);
    //       break;
    //     case "file":
    //       newPlotData = new PlotData();
    //       newPlotData.file = overlay.plot.file;
    //       newPlotData.population = overlay.plot.population;
    //       newPlotData.setupPlot();
    //       newPlotData.getXandYRanges();
    //       break;
    //   }
    //   newPlotData.ranges.set(axis, [range[0], range[1]]);
    //   const overlayRes = newPlotData.getBins(
    //     Math.round(this.bins / this.DRAW_DIVISION_CONST) - 1,
    //     axis,
    //     this.plot.population
    //   );
    //   overlayRes.list = overlayRes.list.map(
    //     (e: any) => e / this.DRAW_DIVISION_CONST
    //   );
    //   overlays.push({
    //     ...overlayRes,
    //     color: overlay.color,
    //   });
    //   const lastMax = newPlotData.getBins(Math.round(this.bins) - 1, axis).max;
    //   if (lastMax > globlMax) globlMax = lastMax;
    // }

    this.globalMax = globlMax;
    const barOverlays = this.plot.histogramBarOverlays;
    let binsArray = [];
    let parentBinsArray: any[] = [];
    const population = getPopulation(this.plot.population);
    let mainPlotColor =
      population.gates.length > 0
        ? getGate(population.gates[0].gate).color
        : "";

    for (let i = 0; i < this.bins; i++) {
      binsArray.push({
        value: this.mainBins.list[i] / globlMax,
        color: mainPlotColor,
      });
    }

    // if (barOverlays) {
    //   for (let i = 0; i < barOverlays.length; i++) {
    //     if (!barOverlays[i]) continue;
    //     let newPlotData;
    //     switch (barOverlays[i].plotSource) {
    //       case COMMON_CONSTANTS.PLOT:
    //         newPlotData = dataManager.getPlot(barOverlays[i].plotId);
    //         break;
    //       case COMMON_CONSTANTS.FILE:
    //         newPlotData = barOverlays[i].plot;
    //         break;
    //     }
    //     const lastMax = newPlotData.getBins(
    //       Math.round(this.bins) - 1,
    //       axis
    //     ).max;
    //     if (lastMax > globlMax) globlMax = lastMax;
    //   }
    //   this.globalMax = globlMax;
    //   for (let i = 0; i < barOverlays.length; i++) {
    //     let newPlotData;
    //     switch (barOverlays[i].plotSource) {
    //       case COMMON_CONSTANTS.PLOT:
    //         newPlotData = dataManager.getPlot(barOverlays[i].plotId);
    //         break;
    //       case COMMON_CONSTANTS.FILE:
    //         newPlotData = new PlotData();
    //         newPlotData.file = barOverlays[i].plot.file;
    //         newPlotData.population = barOverlays[i].plot.population;
    //         newPlotData.getXandYRanges();
    //         newPlotData.setupPlot();
    //         break;
    //     }
    //     newPlotData.ranges.set(axis, [range[0], range[1]]);
    //     let overlayMainHist = newPlotData.getBins(
    //       this.bins,
    //       axis,
    //       this.plot.population
    //     );
    //     let binsArray = [];
    //     for (let j = 0; j < this.bins; j++) {
    //       binsArray.push({
    //         value: overlayMainHist.list[j] / globlMax,
    //         color: barOverlays[i].color,
    //       });
    //     }
    //     parentBinsArray.push(binsArray);
    //     binsArray = [];
    //   }
    // }

    for (let i = 0; i < this.bins; i++) {
      binsArray.push({
        value: this.mainBins.list[i] / globlMax,
        color: mainPlotColor,
      });
    }

    for (let i = 0; i < binsArray.length; i++) {
      let binsAscArray = [];
      binsAscArray.push(binsArray[i]);
      for (let j = 0; j < parentBinsArray.length; j++) {
        binsAscArray.push(parentBinsArray[j][i]);
      }
      binsAscArray.sort((a, b) => {
        return b.value - a.value;
      });

      for (let j = 0; j < binsAscArray.length; j++) {
        if (binsAscArray[j]) {
          if (binsAscArray[j].color)
            this.drawer.addBin(i, binsAscArray[j].value, binsAscArray[j].color);
          else this.drawer.addBin(i, binsAscArray[j].value);
        }
      }
    }

    // for (const overlay of overlays) {
    //   const curve = overlay.list
    //     .map((e: any, i: number) => {
    //       return this.drawer.getBinPos(
    //         i,
    //         e / globlMax,
    //         Math.floor(this.bins / this.DRAW_DIVISION_CONST)
    //       );
    //     })
    //     .sort((a: any, b: any) => {
    //       return a.x - b.x;
    //     });
    //   this.drawer.curve({
    //     points: curve,
    //     strokeColor: overlay.color,
    //     lineWidth: 6,
    //   });
    // }
  }
}
