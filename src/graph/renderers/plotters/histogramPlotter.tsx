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
import {
  getFile,
  getGate,
  getPopulation,
  getPopulationFromFileId,
} from "graph/utils/workspace";
import HistogramGatePlotter from "./runtimePlugins/histogramGatePlotter";
import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import { createBlankPlotObj, createPlot } from "graph/resources/plots";

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
      ibx: this.direction === "vertical" ? this.rangeMin : 0,
      iex: this.direction === "vertical" ? this.rangeMax : this.rangeMax,
      iby: this.direction === "vertical" ? 0 : this.rangeMin,
      iey: this.direction === "vertical" ? this.rangeMax : this.rangeMax,
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
    super.update(true);

    this.histogramGatePlugin.setGates(
      //@ts-ignore
      this.gates.filter((e) => e.gateType === "histogram")
    );

    this.setBins();

    const axis = this.plot.histogramAxis === "vertical" ? "x" : "y";
    const axisName = axis === "x" ? this.xAxisName : this.yAxisName;
    this.mainBins = PlotResource.getHistogramBins(
      this.plot,
      this.bins,
      axisName
    );

    if (axis === "x") {
      this.yLabels = this.transformer.getAxisLabels(
        "lin",
        [0, this.globalMax],
        this.verticalBinCount
      );
    } else {
      this.xLabels = this.transformer.getAxisLabels(
        "lin",
        [0, this.globalMax],
        this.horizontalBinCount
      );
    }
  }

  public createDrawer(): void {
    this.drawer = new HistogramDrawer();
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

    if (this.direction === "vertical") {
      super.draw({
        lines: false,
        vbins: (this.height - bottomPadding) / 50,
        hbins: (this.width - rightPadding) / 50,
        yCustomLabelRange: [0, this.globalMax],
      });
    } else {
      super.draw({
        lines: false,
        vbins: (this.height - bottomPadding) / 50,
        hbins: (this.width - rightPadding) / 50,
        xCustomLabelRange: [0, this.globalMax],
      });
    }

    const axis =
      this.direction === "vertical" ? this.xAxisName : this.yAxisName;

    let globlMax = this.mainBins.max;
    this.globalMax = globlMax;
    let range = this.plot.ranges[axis];

    const overlaysObj = this.plot.histogramOverlays.filter(
      (x) => x.plotType == COMMON_CONSTANTS.Line
    );
    const overlays = [];

    this.rangeMin = range[0];
    this.rangeMax = range[1];

    for (const overlay of overlaysObj) {
      if (!overlay) continue;
      let newPlotData = createBlankPlotObj();

      switch (overlay.plotSource) {
        // case "plot":
        //   newPlotData = getPlot(overlay.plotId);
        //   break;
        case COMMON_CONSTANTS.FILE:
          newPlotData.xAxis = this.plot.xAxis;
          newPlotData.yAxis = this.plot.yAxis;
          newPlotData.xPlotType = this.plot.xPlotType;
          newPlotData.yPlotType = this.plot.yPlotType;
          newPlotData.ranges = this.plot.ranges;
          newPlotData.gates = this.plot.gates;
          newPlotData.population = overlay.populationId;
          newPlotData = createPlot({ clonePlot: newPlotData });
          break;
      }

      const overlayRes = PlotResource.getHistogramBins(
        newPlotData,
        this.bins,
        axis
      );
      overlayRes.list = overlayRes.list.map(
        (e: any) => e / this.DRAW_DIVISION_CONST
      );
      overlays.push({
        ...overlayRes,
        color: overlay.color,
      });
      const lastMax = overlayRes.max;
      if (lastMax > globlMax) globlMax = lastMax;
    }
    debugger;

    const barOverlays = this.plot.histogramOverlays.filter(
      (x) => x.plotType == COMMON_CONSTANTS.Bar
    );
    let binsArray = [];
    let parentBinsArray: any[] = [];
    const population = getPopulation(this.plot.population);
    let mainPlotColor =
      population.gates.length > 0
        ? getGate(population.gates[0].gate).color
        : "";

    if (barOverlays) {
      for (let i = 0; i < barOverlays.length; i++) {
        if (!barOverlays[i]) continue;
        let newPlotData = createBlankPlotObj();
        switch (barOverlays[i].plotSource) {
          // case COMMON_CONSTANTS.PLOT:
          //   newPlotData = dataManager.getPlot(barOverlays[i].plotId);
          //   break;
          case COMMON_CONSTANTS.FILE:
            newPlotData.xAxis = this.plot.xAxis;
            newPlotData.gates = this.plot.gates;
            newPlotData.yAxis = this.plot.yAxis;
            newPlotData.xPlotType = this.plot.xPlotType;
            newPlotData.yPlotType = this.plot.yPlotType;
            newPlotData.ranges = this.plot.ranges;
            newPlotData.population = barOverlays[i].populationId;
            newPlotData = createPlot({ clonePlot: newPlotData });
            break;
        }

        let newBins = PlotResource.getHistogramBins(
          newPlotData,
          this.bins,
          axis
        );

        const lastMax = newBins.max;

        let overlayMainHist = newBins;
        let newBinsArray = [];

        for (let j = 0; j < this.bins; j++) {
          newBinsArray.push({
            value: overlayMainHist.list[j] / this.globalMax,
            color: barOverlays[i].color,
          });
        }
        parentBinsArray.push(newBinsArray);
        newBinsArray = [];

        if (lastMax > globlMax) globlMax = lastMax;
      }
    }

    for (let i = 0; i < this.bins; i++) {
      binsArray.push({
        value: this.mainBins.list[i] / this.globalMax,
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

    for (const overlay of overlays) {
      const curve = overlay.list
        .map((e: any, i: number) => {
          return this.drawer.getBinPos(
            i,
            e / this.globalMax,
            Math.floor(this.bins / this.DRAW_DIVISION_CONST)
          );
        })
        .sort((a: any, b: any) => {
          return a.x - b.x;
        });
      this.drawer.curve({
        points: curve,
        strokeColor: overlay.color,
        lineWidth: 6,
      });
    }
    this.globalMax = globlMax;
    this.update();
    if (this.direction === "vertical") {
      super.draw({
        lines: false,
        vbins: (this.height - bottomPadding) / 50,
        hbins: (this.width - rightPadding) / 50,
        yCustomLabelRange: [0, this.globalMax],
      });
    } else {
      super.draw({
        lines: false,
        vbins: (this.height - bottomPadding) / 50,
        hbins: (this.width - rightPadding) / 50,
        xCustomLabelRange: [0, this.globalMax],
      });
    }
  }
}
