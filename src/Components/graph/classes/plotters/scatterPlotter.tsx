/*
    Responsible for providing a scatterplot with the input data
*/
import Drawer from "../drawers/drawer";
import ScatterDrawer from "../drawers/scatterDrawer";
import OvalGate from "../gate/OvalGate";

import Plotter, { PlotterInput } from "./plotter";

const leftPadding = 70;
const rightPadding = 50;
const topPadding = 50;
const bottomPadding = 50;

export default class ScatterPlotter extends Plotter {
  // Optional params
  xLabels: Array<string>;
  yLabels: Array<string>;

  ovalGateState: {
    p0: {
      x: number;
      y: number;
    } | null;
    p1: {
      x: number;
      y: number;
    } | null;
    lastMousePos: {
      x: number;
      y: number;
    } | null;
    e: number;
    ovalGate: OvalGate | null;
  } | null = null;

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

  ovalGate: OvalGate;

  draw(context: any, frameCount: number) {
    this.drawer.setContext(context);

    let plotGraph = this.drawer.drawPlotGraph();

    for (let i = 0; i < this.xAxis.length; i++) {
      plotGraph.addPoint(this.xAxis[i], this.yAxis[i]);
    }

    console.log("ovalGateState");
    if (this.ovalGateState != null) {
      this.drawOvalGating(context);
    }
  }

  setOvalGateState(state: {
    p0: {
      x: number;
      y: number;
    } | null;
    p1: {
      x: number;
      y: number;
    } | null;
    lastMousePos: {
      x: number;
      y: number;
    } | null;
    e: number;
    ovalGate: OvalGate | null;
  }) {
    this.ovalGateState = state;
  }

  unsetOvalGate() {
    this.ovalGateState = null;
  }

  drawOvalGating(context: any) {
    if (this.ovalGateState.p0 != null && this.ovalGateState.p1 != null) {
    }
    if (this.ovalGateState.p0 != null) {
      this.drawer.line({
        x1: this.ovalGateState.p0.x,
        y1: this.ovalGateState.p0.y,
        x2: this.ovalGateState.lastMousePos.x,
        y2: this.ovalGateState.lastMousePos.y,
        lineWidth: 3,
        strokeColor: "#d77",
      });
    }
  }

  convertToAbstractPoint(x: number, y: number): any {
    return this.drawer.convertToAbstractPoint(x, y);
  }
}
