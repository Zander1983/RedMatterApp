import GraphPlotter, {
  GraphPlotterState,
} from "graph/renderers/plotters/graphPlotter";
import HistogramDrawer from "../drawers/histogramDrawer";
import PluginGraphPlotter, { applyPlugin } from "./PluginGraphPlotter";
import PlotData from "graph/dataManagement/plotData";

const leftPadding = 70;
const rightPadding = 50;
const topPadding = 50;
const bottomPadding = 50;

interface HistogramPlotterState extends GraphPlotterState {
  direction: "vertical" | "horizontal";
  bins: number;
}

export default class HistogramPlotter extends PluginGraphPlotter {
  direction: "vertical" | "horizontal" = "vertical";
  bins: number = 1;
  drawer: HistogramDrawer;
  drawer1: HistogramDrawer;

  globalMax: number = 0;
  rangeMin: number = 0;
  rangeMax: number = 0;

  setup(canvasContext: any) {
    super.setup(canvasContext);
  }

  protected setDrawerState(): void {
    const ranges = this.plotData.getXandYRanges();
    const binListMax = this.plotData.getBins(
      this.bins,
      this.direction == "vertical" ? this.xAxisName : this.yAxisName
    ).max;
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
      ibx: this.direction == "vertical" ? this.rangeMin : 0,
      iex: this.direction == "vertical" ? this.rangeMax : this.globalMax,
      iby: this.direction == "vertical" ? 0 : this.rangeMin,
      iey: this.direction == "vertical" ? this.globalMax : this.rangeMax,
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

  protected getBins() {
    this.binSize = 1;
    this.horizontalBinCount =
      this.width === undefined
        ? 2
        : Math.max(2, Math.round(this.width / (this.binSize * this.scale)));
    this.verticalBinCount =
      this.height === undefined
        ? 2
        : Math.max(2, Math.round(this.height / (this.binSize * this.scale)));
    this.bins =
      this.direction === "vertical"
        ? this.horizontalBinCount
        : this.verticalBinCount;
  }

  public update() {
    super.update();
    // const ranges = this.plotData.getXandYRanges();
    // if (this.plotData.histogramAxis === "vertical") {
    //   const xRange =
    //     this.plotData.xPlotType === "lin"
    //       ? ranges.x
    //       : this.plotData.findRangeBoundries(
    //           this.plotData.getAxesData().map((e) => e[this.plotData.xAxis])
    //         );
    //   this.xLabels = this.transformer.getAxisLabels(
    //     this.plotData.xPlotType,
    //     xRange,
    //     this.plotData.xPlotType === "bi"
    //       ? Math.round(this.horizontalBinCount / 2)
    //       : this.horizontalBinCount
    //   );
    // } else {
    //   const yRange =
    //     this.plotData.yPlotType === "lin"
    //       ? ranges.y
    //       : this.plotData.findRangeBoundries(
    //           this.plotData.getAxesData().map((e) => e[this.plotData.yAxis])
    //         );

    //   const yLabels = this.transformer.getAxisLabels(
    //     this.plotData.yPlotType,
    //     yRange,
    //     this.plotData.yPlotType === "bi"
    //       ? Math.round(this.verticalBinCount / 2)
    //       : this.verticalBinCount
    //   );
    // }
  }

  public createDrawer(): void {
    this.drawer = new HistogramDrawer();
    this.drawer1 = new HistogramDrawer();
  }

  private DRAW_DIVISION_CONST = 3;
  @applyPlugin()
  public draw() {
    const hideY =
      this.plotData.xAxis === this.plotData.yAxis &&
      this.plotData.histogramAxis === "vertical";

    const hideX =
      this.plotData.xAxis === this.plotData.yAxis &&
      this.plotData.histogramAxis === "horizontal";

    super.draw({
      lines: false,
      vbins: (this.height - bottomPadding) / 50,
      hbins: (this.width - rightPadding) / 50,
      xAxisLabel: !hideX ? this.plotData.xAxis : "",
      yAxisLabel: !hideY ? this.plotData.yAxis : "",
    });
    const axis =
      this.direction === "vertical" ? this.xAxisName : this.yAxisName;

    let mainHist = this.plotData.getBins(this.bins, axis);

    let globlMax = mainHist.max;
    let range = this.plotData.ranges.get(axis);

    const overlaysObj = this.plotData.getOverlays();
    const overlays = [];

    for (const overlay of overlaysObj) {
      if (overlay.plot === undefined || overlay.plot === null) continue;
      const overlayRes = overlay.plot.getBins(
        Math.round(this.bins / this.DRAW_DIVISION_CONST) - 1,
        axis
      );
      overlayRes.list = overlayRes.list.map(
        (e) => e / this.DRAW_DIVISION_CONST
      );
      overlays.push({
        ...overlayRes,
        color: overlay.color,
      });
      const lastMax = overlay.plot.getBins(Math.round(this.bins) - 1, axis).max;
      if (lastMax > globlMax) globlMax = lastMax;
      const overlayRanges = overlay.plot.ranges.get(axis);
      if (overlayRanges[0] < range[0]) range[0] = overlayRanges[0];
      if (overlayRanges[1] > range[1]) range[1] = overlayRanges[1];
    }

    this.globalMax = globlMax;
    this.rangeMin = range[0];
    this.rangeMax = range[1];
    const barOverlays = this.plotData.histogramBarOverlays;
    let binsArray = [];
    let parentBinsArray = [];
    let mainPlotColor = this.plotData.population && this.plotData.population.length > 0 ? this.plotData.population[0].gate.color : "";
    for (let i = 0; i < this.bins; i++) {
      binsArray.push({
        value: mainHist.list[i] / globlMax,
        color: mainPlotColor,
      });
    }

    if (barOverlays) {
      for (let i = 0; i < barOverlays.length; i++) {
        let newPlotData = new PlotData();
        newPlotData.file = barOverlays[i].plot.file;
        newPlotData.population = barOverlays[i].plot.population;
        newPlotData.setupPlot();
        newPlotData.getXandYRanges();
        newPlotData.ranges.set(axis, [range[0], range[1]]);
        let overlayMainHist = newPlotData.getBins(this.bins, axis);
        let binsArray = [];
        let overlayGloblMax = overlayMainHist.max;
        for (let j = 0; j < this.bins; j++) {
          binsArray.push({
            value: overlayMainHist.list[j] / overlayGloblMax,
            color: barOverlays[i].color,
          });
        }
        parentBinsArray.push(binsArray);
        binsArray = [];
      }
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
        if (binsAscArray[j].color)
          this.drawer.addBin(i, binsAscArray[j].value, binsAscArray[j].color);
        else this.drawer.addBin(i, binsAscArray[j].value);
      }
    }

    for (const overlay of overlays) {
      const curve = overlay.list
        .map((e: any, i: number) => {
          return this.drawer.getBinPos(
            i,
            e / globlMax,
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
  }
}
