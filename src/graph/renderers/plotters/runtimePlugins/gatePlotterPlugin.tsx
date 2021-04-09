import Gate from "graph/dataManagement/gate/gate";
import GraphPlotter from "graph/renderers/plotters/graphPlotter";
import PlotterPlugin from "graph/renderers/plotters/plotterPlugin";

export default abstract class GatePlotterPlugin extends PlotterPlugin {
  static TargetPlotter = GraphPlotter;

  plotter: GraphPlotter;
  gatingState: any; // Too custom to be defined here
  gates: Gate[] = [];
  isGating: boolean = false;

  public abstract setGates(gates: Gate[]): void;
  public abstract setGatingState(state: any): void;

  /* After draw is called in plotter, draw the gating/gate */
  public draw_AFTER() {
    if (this.isGating) {
      this.drawGating();
    }

    for (const gate of this.gates) {
      if (
        this.plotter.xAxisName == gate.xAxis &&
        this.plotter.yAxisName == gate.yAxis
      ) {
        this.drawGate(gate);
      }
    }
  }

  /* Every point that is inside the current available gates
     is painted a certain color. It's up to the children to
     determine which points are present or not */
  protected abstract getPointColor_AFTER(index: number): string;

  protected abstract drawGate(gate: Gate): void;
  protected abstract drawGating(): void;
}
