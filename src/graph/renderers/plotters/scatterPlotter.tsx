import Plotter, { PlotterState } from "./plotter";
import ScatterDrawer from "../../renderers/drawers/scatterDrawer";
import OvalGate from "../../dataManagement/gate/ovalGate";
import PolygonGate from "graph/dataManagement/gate/PolygonGate";
import {
  euclidianDistance2D,
  getVectorAngle2D,
  pointInsideEllipse,
} from "graph/dataManagement/math/euclidianPlane";

const leftPadding = 70;
const rightPadding = 50;
const topPadding = 50;
const bottomPadding = 50;

interface ScatterPlotterState extends PlotterState {
  heatmap: boolean;
}

/*
  How to use plotters?
   1. Instance the plotter (no args)
   2. Set plotter state with setPlotterState(state)
   3. Call setup(canvasContext)

  You are now ready to go!
  
  Call draw() when you need to draw to the canvas
  
  If you ever need to update the plotter
   1. Call setPlotterState(state)
   2. Call update()
*/
export default class ScatterPlotter extends Plotter {
  gates: (OvalGate | PolygonGate)[] = [];
  drawer: ScatterDrawer | null = null;

  constructor(params: ScatterPlotterInput) {
    super(params);
    this.xLabels = this.createRangeArray("x");
    this.yLabels = this.createRangeArray("y");

    this.heatmap = params.heatmap;
    this.xAxisName = params.xAxisName;
    this.yAxisName = params.yAxisName;

    // percentage of range in each dimension. seeks all points close to each
    // point to assign it's color.
    this.heatmappingRadius = 0.05;

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

  draw() {
    this.drawer.drawPlotGraph();

    if (this.xAxis.length != this.yAxis.length) {
      throw Error(
        "Axes point count are different. xAxis has " +
          this.xAxis.length.toString() +
          " points while yAxis has " +
          this.yAxis.length.toString() +
          " points"
      );
    }
    const pointCount = this.xAxis.length;
    for (let i = 0; i < pointCount; i++) {
      const color = "#000";
      const x = this.xAxis[i];
      const y = this.yAxis[i];
      this.drawer.addPoint(this.xAxis[i], this.yAxis[i], 1.4, color);
    }
  }
}
