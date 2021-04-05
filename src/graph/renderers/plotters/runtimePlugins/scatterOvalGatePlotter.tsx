import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import OvalGate from "graph/dataManagement/gate/ovalGate";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";
import {
  euclidianDistance2D,
  getVectorAngle2D,
} from "graph/dataManagement/math/euclidianPlane";

export interface ScatterOvalGatePlotterState {}

interface Point {
  x: number;
  y: number;
}

interface OvalGateState {
  center: Point | null;
  primaryP1: Point | null;
  primaryP2: Point | number;
  secondaryP1: Point | null;
  secondaryP2: Point | null;
  ang: number | null;
  lastMousePos: Point | null;
}

export default class ScatterOvalGatePlotter extends GatePlotterPlugin {
  static TargetPlotter = ScatterPlotter;
  plotter: ScatterPlotter;

  ovalGateState: OvalGateState | null = null;

  ovalGates: OvalGate[] = [];

  setPlotter(plotter: ScatterPlotter) {
    this.plotter = plotter;
  }

  setGates(gates: OvalGate[]) {
    this.gates = gates;
  }

  setGatingState(state: OvalGateState) {
    this.ovalGateState = state;
  }

  setState(state: ScatterOvalGatePlotterState) {}

  /* TODO: WILL REQUIRE PLUGIN DYNAMIC RETURN IMPLEMENTATION */
  getPointColor_AFTER(index: number): string {
    return "#000";
  }

  protected drawGate(gate: OvalGate) {
    const toConcretePoint = this.plotter.transformer.toConcretePoint;
    const c = toConcretePoint({ x: gate.center.x, y: gate.center.y });
    const p1 = toConcretePoint({ x: gate.primaryP1.x, y: gate.primaryP1.y });
    const p2 = toConcretePoint({ x: gate.primaryP2.x, y: gate.primaryP2.y });
    const s1 = toConcretePoint({
      x: gate.secondaryP1.x,
      y: gate.secondaryP1.y,
    });
    const s2 = toConcretePoint({
      x: gate.secondaryP2.x,
      y: gate.secondaryP2.y,
    });

    const d1 = euclidianDistance2D(p1, p2);
    const d2 = euclidianDistance2D(s1, s2);

    const ang = getVectorAngle2D(p1, p2);

    this.plotter.drawer.oval({
      x: c.x,
      y: c.y,
      d1: d1 / 2,
      d2: d2 / 2,
      ang: ang,
      fill: false,
    });
  }

  protected drawGating() {
    const plotter = this.plotter;
    if (
      this.ovalGateState.primaryP1 != null &&
      this.ovalGateState.secondaryP1 != null
    ) {
      //@ts-ignore
      this.drawOvalGate(this.ovalGateState);
      plotter.drawer.segment({
        x1: this.ovalGateState.center.x,
        y1: this.ovalGateState.center.y,
        x2: this.ovalGateState.primaryP1.x,
        y2: this.ovalGateState.primaryP1.y,
        lineWidth: 3,
        strokeColor: "#d00",
      });
      plotter.drawer.addPoint(
        this.ovalGateState.center.x,
        this.ovalGateState.center.y,
        2,
        "#00d"
      );
    } else if (this.ovalGateState.primaryP1 != null) {
      plotter.drawer.segment({
        x1: this.ovalGateState.primaryP1.x,
        y1: this.ovalGateState.primaryP1.y,
        x2: this.ovalGateState.lastMousePos.x,
        y2: this.ovalGateState.lastMousePos.y,
        lineWidth: 3,
        strokeColor: "#f00",
      });
    }
  }
}
