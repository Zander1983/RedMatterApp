import GraphPlotter, {
  GraphPlotterState,
} from "graph/renderers/plotters/graphPlotter";
import HistogramDrawer from "../drawers/histogramDrawer";

const leftPadding = 70;
const rightPadding = 50;
const topPadding = 50;
const bottomPadding = 50;

interface HistogramPlotterState extends GraphPlotterState {
  direction: "vertical" | "horizontal";
  bins: number;
}

export default class HistogramPlotter extends GraphPlotter {
  direction: "vertical" | "horizontal" = "vertical";
  bins: number = 1;
  drawer: HistogramDrawer;

  protected setDrawerState(): void {
    const ranges = this.plotData.getXandYRanges();
    const drawerState = {
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.direction == "vertical" ? ranges.x[0] : 0,
      iex: this.direction == "vertical" ? ranges.x[1] : this.getBinList().max,
      iby: this.direction == "vertical" ? 0 : ranges.y[0],
      iey: this.direction == "vertical" ? this.getBinList().max : ranges.y[1],
      scale: this.scale,
      xpts: this.horizontalBinCount,
      ypts: this.verticalBinCount,
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
  }

  public createDrawer(): void {
    this.drawer = new HistogramDrawer();
  }

  public draw() {
    this.drawer.drawPlotGraph(
      false,
      (this.height - bottomPadding) / 50,
      (this.width - rightPadding) / 50
    );

    const { list, max } = this.getBinList();
    for (let i = 0; i < this.bins; i++) {
      this.drawer.addBin(i, list[i] / max);
    }
  }

  private getBinList() {
    const ranges = this.plotData.getXandYRanges();
    const axis = this.direction == "vertical" ? this.xAxis : this.yAxis;
    const range = this.direction == "vertical" ? ranges.x : ranges.y;
    const binCounts = Array(this.bins).fill(0);
    const step = (range[1] - range[0]) / this.bins;
    let mx = 0;
    for (let i = 0; i < axis.length; i++) {
      const index = Math.floor((axis[i] - range[0]) / step);
      binCounts[index]++;
      if (binCounts[index] > mx) mx = binCounts[index];
    }
    return { list: binCounts, max: mx };
  }
}
