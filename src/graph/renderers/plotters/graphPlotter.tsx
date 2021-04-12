import Plotter, { PlotterState } from "graph/renderers/plotters/plotter";
import Gate from "graph/dataManagement/gate/gate";
import GraphDrawer from "graph/renderers/drawers/graphDrawer";
import GraphTransformer from "graph/renderers/transformers/graphTransformer";

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

  width: number = 0;
  height: number = 0;
  scale: number = 2;
  xAxis: number[] = [];
  yAxis: number[] = [];
  xAxisName: string;
  yAxisName: string;
  xRange: [number, number] = [0, 0];
  yRange: [number, number] = [0, 0];
  xLabels: string[] = [];
  yLabels: string[] = [];
  gates: Gate[];

  canvasContext: any = null;
  drawer: GraphDrawer | null = null;
  transformer: GraphTransformer | null = null;
  verticalBinCount: number = 1;
  horizontalBinCount: number = 1;

  // Constants
  rangeSpacer: number = 0.05;
  binSize: number = 30;

  /* === METHODS === */

  public draw(): void {
    this.drawer.drawPlotGraph();
  }

  public update(): void {
    if (this.xRange === undefined) {
      this.getBins();
      this.xRange = this.findRangeBoundries("x");
      this.yRange = this.findRangeBoundries("y");
      // this.xRange = [0, 273300];
      // this.yRange = [0, 273300];
      this.xLabels = this.createRangeArray("x");
      this.yLabels = this.createRangeArray("y");
    }
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
    this.xRange = state.xRange;
    this.yRange = state.yRange;
    this.xLabels = state.xLabels;
    this.yLabels = state.yLabels;
  }

  protected getBins() {
    if (this.scale === 0 || this.width === 0) {
      this.verticalBinCount = 1;
      this.horizontalBinCount = 1;
      return;
    }
    this.horizontalBinCount =
      this.width === undefined
        ? 2
        : Math.round(this.width / (this.binSize * this.scale));
    this.verticalBinCount =
      this.height === undefined
        ? 2
        : Math.round(this.height / (this.binSize * this.scale));
    this.horizontalBinCount = Math.max(2, this.horizontalBinCount);
    this.verticalBinCount = Math.max(2, this.verticalBinCount);
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
      xpts: this.horizontalBinCount,
      ypts: this.verticalBinCount,
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
