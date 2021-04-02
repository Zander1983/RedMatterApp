import Plotter, { PlotterState } from "graph/renderers/plotters/plotter";
import Gate from "graph/dataManagement/gate/gate";
import GraphDrawer from "graph/renderers/drawers/graphDrawer";
import GraphTransformer from "graph/renderers/transformations/graphTransformer";

const leftPadding = 70;
const rightPadding = 50;
const topPadding = 50;
const bottomPadding = 50;

export interface GraphPlotterState extends PlotterState {
  width: number;
  height: number;
  scale: number;

  gates?: Gate[];

  xAxis: Array<number>;
  yAxis: Array<number>;

  xAxisName?: string;
  yAxisName?: string;

  xLabels?: Array<string>;
  yLabels?: Array<string>;

  xRange?: [number, number] | undefined;
  yRange?: [number, number] | undefined;
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
export default class GraphPlotter extends Plotter {
  /* === DATA === */

  public width: number = 0;
  public height: number = 0;
  public scale: number = 2;
  public xAxis: number[] = [];
  public yAxis: number[] = [];
  public xAxisName: string;
  public yAxisName: string;
  public xRange: [number, number] = [0, 0];
  public yRange: [number, number] = [0, 0];
  public xLabels: string[] = [];
  public yLabels: string[] = [];
  public gates: Gate[];

  protected canvasContext: any = null;
  protected drawer: GraphDrawer | null = null;
  protected transformer: GraphTransformer | null = null;
  protected verticalBinCount: number = 0;
  protected horizontalBinCount: number = 0;

  // Constants
  protected rangeSpacer: number = 0.05;

  /* === METHODS === */

  public draw(): void {
    this.drawer.drawPlotGraph();
  }

  public update(): void {
    this.xRange = this.findRangeBoundries("x");
    this.yRange = this.findRangeBoundries("y");
    this.xLabels = this.createRangeArray("x");
    this.yLabels = this.createRangeArray("y");
    super.update();
  }

  public setPlotterState(state: GraphPlotterState): void {
    super.setPlotterState(state);
    this.xAxis = state.xAxis;
    this.yAxis = state.yAxis;
    this.xAxisName = state.xAxisName;
    this.yAxisName = state.yAxisName;
    this.width = state.width;
    this.height = state.height;
    this.scale = state.scale;
    this.gates = state.gates === undefined ? this.gates : state.gates;
    this.xRange =
      state.xRange === undefined ? this.findRangeBoundries("x") : state.xRange;
    this.yRange =
      state.yRange === undefined ? this.findRangeBoundries("y") : state.yRange;
    this.xLabels =
      state.xLabels === undefined ? this.createRangeArray("x") : state.xLabels;
    this.yLabels =
      state.yLabels === undefined ? this.createRangeArray("y") : state.yLabels;
  }

  public getPlotterState(): GraphPlotterState {
    return {
      width: this.width,
      height: this.height,
      scale: this.scale,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      xRange: this.xRange,
      yRange: this.yRange,
      xLabels: this.xLabels,
      yLabels: this.yLabels,
      gates: this.gates,
    };
  }

  protected setDrawerState(): void {
    this.drawer.setDrawerState({
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

  protected createDrawer(): void {
    this.drawer = new GraphDrawer();
  }

  protected updateDrawer(): void {
    this.drawer.update();
  }

  protected setTransformerState(): void {
    this.transformer.setTransformerState({
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

  protected createTransformer(): void {
    this.transformer = new GraphTransformer();
  }

  protected updateTransformer(): void {
    this.transformer.update();
  }

  private findRangeBoundries(axis: "x" | "y"): [number, number] {
    const axisData = axis === "x" ? this.xAxis : this.yAxis;
    let min = axisData[0],
      max = axisData[0];
    for (const p of axisData) {
      min = Math.min(p, min);
      max = Math.max(p, max);
    }
    const d = Math.max(max - min, 1e-10);
    return [min - d * this.rangeSpacer, max + d * this.rangeSpacer];
  }

  private createRangeArray(axis: "x" | "y"): Array<string> {
    const plotSize = axis === "x" ? this.width : this.height;
    const rangeSize =
      axis === "x"
        ? this.xRange[1] - this.xRange[0]
        : this.yRange[1] - this.yRange[0];
    const rangeMin = axis === "x" ? this.xRange[0] : this.yRange[0];
    const lineCount = Math.round(
      plotSize / (axis == "x" ? this.horizontalBinCount : this.verticalBinCount)
    );
    return Array(lineCount).map((e, i) =>
      ((rangeSize * i) / lineCount + rangeMin).toString()
    );
  }
}
