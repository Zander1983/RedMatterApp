import GraphPlotter, {
  GraphPlotterState,
} from "graph/renderers/plotters/graphPlotter";
import HistogramDrawer from "../drawers/histogramDrawer";

const binSize = 45;

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
    this.drawer.setDrawerState({
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.direction == "vertical" ? this.xRange[0] : 0,
      iex:
        this.direction == "vertical" ? this.xRange[1] : this.getBinList().max,
      iby: this.direction == "vertical" ? 0 : this.yRange[0],
      iey:
        this.direction == "vertical" ? this.getBinList().max : this.yRange[1],
      scale: this.scale,
      binSize: binSize,
    });
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

  public update() {
    if (this.direction === "vertical") {
      this.bins = this.verticalBinCount = Math.round(this.height / binSize);
      this.bins = this.verticalBinCount = Math.max(1, this.bins);
    } else {
      this.bins = this.horizontalBinCount = Math.round(this.width / binSize);
      this.bins = this.horizontalBinCount = Math.max(1, this.bins);
    }
    super.update();
  }

  public createDrawer(): void {
    this.drawer = new HistogramDrawer();
  }

  public draw() {
    super.draw();

    const { list, max } = this.getBinList();
    for (let i = 0; i < this.bins; i++) {
      this.drawer.addBin(i, list[i] / max);
    }
  }

  private getBinList() {
    const axis = this.direction == "vertical" ? this.xAxis : this.yAxis;
    const range = this.direction == "vertical" ? this.xRange : this.yRange;
    console.log("this.bins = ", this.bins);
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
