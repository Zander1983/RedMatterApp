/*
    Responsible for providing a scatterplot with the input data
*/
import Drawer from "../drawers/drawer";
import ScatterDrawer from "../drawers/scatterDrawer";

import Plotter, { PlotterInput } from "./plotter";

const leftPadding = 70;
const rightPadding = 50;
const topPadding = 50;
const bottomPadding = 50;

export default class ScatterPlotter extends Plotter {
  // Optional params
  xLabels: Array<string>;
  yLabels: Array<string>;

  static index = 0;
  index: number;

  constructor(params: PlotterInput) {
    super(params);
    this.xLabels = this.createRangeArray("x");
    this.yLabels = this.createRangeArray("y");

    this.index = ScatterPlotter.index++;

    this.drawer = new ScatterDrawer({
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.xRange[0],
      iex: this.xRange[1],
      iby: this.yRange[0],
      iey: this.yRange[1],
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
    const lineCount = Math.round(plotSize / 100);
    return Array(lineCount).map((e, i) =>
      ((rangeSize * i) / lineCount + rangeMin).toString()
    );
  }

  sizeUpdater(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.drawer.sizeUpdater({
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
    });
  }

  dataUpdater({
    xData,
    yData,
  }: {
    xData: Array<number>;
    yData: Array<number>;
  }) {
    this.xAxis = xData;
    this.yAxis = yData;
    this.xLabels = this.createRangeArray("x");
    this.yLabels = this.createRangeArray("y");
    this.drawer.boundsUpdater({
      ibx: this.xRange[0],
      iex: this.xRange[1],
      iby: this.yRange[0],
      iey: this.yRange[1],
    });
  }

  draw(context: any, frameCount: number) {
    this.drawer.setContext(context);

    let plotGraph = this.drawer.drawPlotGraph();

    for (let i = 0; i < this.xAxis.length; i++) {
      plotGraph.addPoint(this.xAxis[i], this.yAxis[i]);
    }

    // for each gate:
    //     plotgraph.drawPolygon()
  }

  convertToAbstractPoint(x: number, y: number): any {
    return this.drawer.convertToAbstractPoint(x, y);
  }
}
