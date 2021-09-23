import GraphPlotter from "graph/renderers/plotters/graphPlotter";
import PlotterPlugin from "graph/renderers/plotters/plotterPlugin";
import { Gate, Gate1D, Gate2D, Point } from "graph/resources/types";

export default abstract class GatePlotterPlugin extends PlotterPlugin {
  static TargetPlotter = GraphPlotter;

  plotter: GraphPlotter;
  gatingState: any; // Too custom to be defined here
  gates: Gate[] = [];
  isGating: boolean = false;
  lastMousePos: Point;

  abstract gaterType: "1D" | "2D";
  public abstract setGates(gates: Gate[]): void;
  public abstract setGatingState(state: any): void;

  /* After draw is called in plotter, draw the gating/gate */
  public draw_AFTER() {
    if (this.isGating) {
      this.drawGating();
    }

    for (let gate of this.gates) {
      if (!this.plotter.plot.gates.find((e) => e === gate.id)) {
        continue;
      }
      const isGate1D = Object.keys(gate).includes("axis");
      const isGate2D = ["xAxis", "yAxis"]
        .map((e) => Object.keys(gate).includes(e))
        .every((e) => e);
      if (this.gaterType === "1D" && isGate1D) {
        const gate1d = gate as Gate1D;
        const axisPlotType =
          gate1d.histogramDirection === "vertical"
            ? this.plotter.plot.xPlotType
            : this.plotter.plot.yPlotType;
        if (
          this.plotter[
            gate1d.histogramDirection === "vertical" ? "xAxisName" : "yAxisName"
          ] === gate1d.axis &&
          gate1d.axisType === axisPlotType
        ) {
          this.drawGate(gate);
        }
      }
      if (this.gaterType === "2D" && isGate2D) {
        const gate2d = gate as Gate2D;
        if (
          this.plotter.xAxisName === gate2d.xAxis &&
          this.plotter.yAxisName === gate2d.yAxis
        ) {
          this.drawGate(gate);
        }
      }
    }
  }

  protected abstract drawGate(gate: Gate): void;
  protected abstract drawGating(): void;
}
