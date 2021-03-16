/*
    Responsible for providing a scatterplot with the input data
*/
import HistogramDrawer from "../drawers/histogramDrawer";

import Plotter, { PlotterInput } from "./plotter";

export default class HistogramPlotter extends Plotter {
  // Optional params
  xLabels: Array<string>;
  yLabels: Array<string>;

  constructor(props: PlotterInput) {
    super(props);
    this.xLabels = this.createRangeArray("x");
    this.yLabels = this.createRangeArray("y");
    this.drawer = new HistogramDrawer();
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
    if (this.drawer == null) {
      this.drawer = new GraphDrawer({
        context: context,
        x1: 70 * this.scale,
        y1: 50 * this.scale,
        x2: (this.width - 50) * this.scale,
        y2: (this.height - 50) * this.scale,
        ibx: this.xRange[0],
        iex: this.xRange[1],
        iby: this.yRange[0],
        iey: this.yRange[1],
      });
    }

    let plotGraph = this.drawer.drawPlotGraph();

    for (let i = 0; i < this.xData.length; i++) {
      plotGraph.addPoint(this.xData[i], this.yData[i]);
    }

    // for each gate:
    //     plotgraph.drawPolygon()
  }

  registerMouseEvent(event: any) {
    // console.log(event.type)
  }

  getCanvas() {
    return this.canvas.getCanvasComponent(this.draw);
  }

  getMouseEvents() {}
}
