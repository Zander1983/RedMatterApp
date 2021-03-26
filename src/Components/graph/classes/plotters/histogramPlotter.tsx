/*
    Responsible for providing a scatterplot with the input data
*/
import HistogramDrawer from "../drawers/histogramDrawer";

import Plotter, { PlotterInput } from "./plotter";

const leftPadding = 70;
const rightPadding = 50;
const topPadding = 50;
const bottomPadding = 50;
const binSize = 50;

export default class HistogramPlotter extends Plotter {
  // Optional params
  xLabels: Array<string>;
  yLabels: Array<string>;
  drawer: HistogramDrawer;
  bins: number;

  constructor(props: PlotterInput) {
    super(props);
    this.bins = this.width / 100;
    this.xLabels = this.createRangeArray("x");
    this.yLabels = this.createRangeArray("y");

    this.drawer = new HistogramDrawer({
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.xRange[0],
      iex: this.xRange[1],
      iby: 0,
      iey: this.getBinList().max,
      scale: this.scale,
    });
  }

  createRangeArray(axis: "x" | "y"): Array<string> {
    const plotSize = axis === "x" ? this.width : this.height;
    const rangeSize =
      axis === "x"
        ? this.xRange[1] - this.xRange[0]
        : this.yRange[1] - this.yRange[0];
    const rangeMin = axis === "x" ? this.xRange[0] : this.yRange[0];
    if (this.width === 0 || this.bins === 0) {
      return [];
    }
    const lineCount = Math.round(plotSize / (this.width / this.bins));
    return Array(lineCount).map((_, i) =>
      ((rangeSize * i) / lineCount + rangeMin).toString()
    );
  }

  convertToPlotPoint(x: number, y: number) {
    return this.drawer.convertToPlotCanvasPoint(x, y);
  }

  resetDrawer() {
    this.bins = Math.floor(this.width / binSize);
    this.xRange = this.findRangeBoundries("x");
    this.yRange = this.findRangeBoundries("y");

    this.xLabels = this.createRangeArray("x");
    this.yLabels = this.createRangeArray("y");
    this.drawer.setMeta({
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.xRange[0],
      iex: this.xRange[1],
      iby: 0,
      iey: this.getBinList().max,
      scale: this.scale,
      bins: this.bins,
    });
  }

  getBinList() {
    const binCounts = Array(this.bins).fill(0);
    const step = (this.xRange[1] - this.xRange[0]) / this.bins;
    let mx = 0;
    for (let i = 0; i < this.xAxis.length; i++) {
      const index = Math.floor((this.xAxis[i] - this.xRange[0]) / step);
      binCounts[index]++;
      if (binCounts[index] > mx) mx = binCounts[index];
    }
    return { list: binCounts, max: mx };
  }

  draw(context: any, frameCount: number) {
    this.resetDrawer();

    this.drawer.setContext(context);

    let plotGraph = this.drawer.drawPlotGraph();
    const { list, max } = this.getBinList();

    for (let i = 0; i < this.bins; i++) {
      plotGraph.addBin(i, list[i] / max);
    }
  }

  convertToAbstractPoint(x: number, y: number): any {
    return this.drawer.convertToAbstractPoint(x, y);
  }

  setGates(gates: any) {}
}
