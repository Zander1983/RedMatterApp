import Plotter, { PlotterState } from "graph/renderers/plotters/plotter";
import Gate from "graph/old/dataManagement/gate/gate";
import GraphDrawer from "graph/renderers/drawers/graphDrawer";
import GraphTransformer, {
  Label,
} from "graph/renderers/transformers/graphTransformer";
import PlotData from "graph/old/dataManagement/plotData";

export const leftPadding = 70;
export const rightPadding = 50;
export const topPadding = 50;
export const bottomPadding = 50;

export interface GraphPlotterState extends PlotterState {
  plotData: PlotData;

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

  plotData: PlotData;

  width: number = 0;
  height: number = 0;
  scale: number = 2;
  xAxis: number[] = [];
  yAxis: number[] = [];
  xAxisName: string;
  yAxisName: string;
  xLabels: Label[] = [];
  yLabels: Label[] = [];
  gates: Gate[];
  ranges: { x: [number, number]; y: [number, number] } = {
    x: [0, 0],
    y: [0, 0],
  };

  canvasContext: any = null;
  drawer: GraphDrawer | null = null;
  transformer: GraphTransformer | null = null;
  verticalBinCount: number = 1;
  horizontalBinCount: number = 1;

  // Constants
  rangeSpacer: number = 0.05;
  binSize: number = 30;

  /* === METHODS === */
  private drawHeader() {
    const label = this.plotData.label;
    const filename = this.plotData.file.name;
    let text = label + " | " + filename;
    const maxLength = Math.round(
      (this.width - leftPadding / 2 - rightPadding / 2 + 10) / 10
    );
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + "...";
    }
    this.drawer.text({
      x: leftPadding * this.scale,
      y: 30 * this.scale,
      text,
      font: "500 30px Quicksand",
    });
  }

  public draw(drawPlotGraphParams?: any): void {
    this.update();
    this.drawer.drawPlotGraph({
      ...drawPlotGraphParams,
      xLabels: this.xLabels,
      yLabels: this.yLabels,
    });
    this.drawHeader();
  }

  public update(noLabels: boolean = false): void {
    super.update();
    this.ranges = this.plotData.getXandYRanges();

    this.getBins();

    if (noLabels === false) {
      const xRange = this.ranges.x;
      const yRange = this.ranges.y;

      const xLabels = this.transformer.getAxisLabels(
        this.plotData.xPlotType,
        xRange,
        this.plotData.xPlotType === "bi"
          ? Math.round(this.horizontalBinCount / 2)
          : this.horizontalBinCount
      );

      const yLabels = this.transformer.getAxisLabels(
        this.plotData.yPlotType,
        yRange,
        this.plotData.yPlotType === "bi"
          ? Math.round(this.verticalBinCount / 2)
          : this.verticalBinCount
      );

      this.xLabels = xLabels;
      this.yLabels = yLabels;
    }
  }

  public setPlotterState(state: GraphPlotterState): void {
    super.setPlotterState(state);

    this.plotData = state.plotData;
    this.xAxis = state.xAxis;
    this.yAxis = state.yAxis;
    this.xAxisName = state.xAxisName;
    this.yAxisName = state.yAxisName;
    this.width = state.width;
    this.height = state.height;
    this.scale = state.scale;
    this.gates = state.gates;
    this.xLabels =
      state.xLabels === undefined
        ? undefined
        : state.xLabels.map((e) => {
            return {
              name: e,
              pos: parseFloat(e),
            };
          });
    this.yLabels =
      state.yLabels === undefined
        ? undefined
        : state.yLabels.map((e) => {
            return {
              name: e,
              pos: parseFloat(e),
            };
          });
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
      plotData: this.plotData,
      width: this.width,
      height: this.height,
      scale: this.scale,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      xLabels: this.xLabels.map((e) => e.name),
      yLabels: this.yLabels.map((e) => e.name),
      gates: this.gates,
    };
  }

  protected setDrawerState(): void {
    this.drawer.setDrawerState({
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.ranges.x[0],
      iex: this.ranges.x[1],
      iby: this.ranges.y[0],
      iey: this.ranges.y[1],
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
    const ranges = this.plotData.getXandYRanges();
    this.transformer.setTransformerState({
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: ranges.x[0],
      iex: ranges.x[1],
      iby: ranges.y[0],
      iey: ranges.y[1],
      scale: this.scale,
      plotData: this.plotData,
    });
  }

  protected createTransformer(): void {
    this.transformer = new GraphTransformer();
  }

  protected updateTransformer(): void {
    this.transformer.update();
  }

  createRangeArray(axis: "x" | "y"): Array<string> {
    const plotSize =
      axis === "x" ? this.plotData.plotWidth : this.plotData.plotHeight;
    const rangeSize =
      axis === "x"
        ? this.ranges.x[1] - this.ranges.x[0]
        : this.ranges.y[1] - this.ranges.y[0];
    const rangeMin = axis === "x" ? this.ranges.x[0] : this.ranges.y[0];
    const lineCount = Math.round(
      plotSize /
        (axis === "x" ? this.horizontalBinCount : this.verticalBinCount)
    );
    return Array(lineCount).map((e, i) =>
      ((rangeSize * i) / lineCount + rangeMin).toString()
    );
  }
}
