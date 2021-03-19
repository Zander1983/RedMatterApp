/*
    Responsible for providing a scatterplot with the input data
*/
import ScatterDrawer from "../drawers/scatterDrawer";

import Plotter, { PlotterInput } from "./plotter";

const leftPadding = 70;
const rightPadding = 50;
const topPadding = 50;
const bottomPadding = 50;

export default class ScatterPlotter extends Plotter {
  // Internal
  drawer: ScatterDrawer | null = null;

  // Optional params
  xLabels: Array<string>;
  yLabels: Array<string>;

  constructor(props: PlotterInput) {
    super(props);
    this.xLabels = this.createRangeArray("x");
    this.yLabels = this.createRangeArray("y");

    this.drawer = new ScatterDrawer({
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.xRange[0],
      iex: this.xRange[1],
      iby: this.yRange[0],
      iey: this.yRange[1],
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

  draw(context: any, frameCount: number) {
    this.drawer.setContext(context);

    let plotGraph = this.drawer.drawPlotGraph();

    for (let i = 0; i < this.xAxis.length; i++) {
      plotGraph.addPoint(this.xAxis[i], this.yAxis[i]);
    }

    // for each gate:
    //     plotgraph.drawPolygon()
  }

  getCanvas() {
    return this.canvas.getCanvasComponent(this.draw);
  }
}
