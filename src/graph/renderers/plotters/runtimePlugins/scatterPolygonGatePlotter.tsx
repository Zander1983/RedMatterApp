import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import PolygonGate from "graph/dataManagement/gate/polygonGate";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";
import {
  euclidianDistance2D,
  getVectorAngle2D,
} from "graph/dataManagement/math/euclidianPlane";

export interface ScatterPolygonGatePlotterState {}

interface Point {
  x: number;
  y: number;
}

interface PolygonGateState {
  points: Point[];
  lastMousePos: Point | null;
}

export default class ScatterPolygonGatePlotter extends GatePlotterPlugin {
  // static TargetPlotter = ScatterPlotter;
  plotter: ScatterPlotter | null = null;

  PolygonGateState: PolygonGateState | null = null;

  PolygonGates: PolygonGate[] = [];

  setPlotter(plotter: ScatterPlotter) {
    this.plotter = plotter;
  }

  setGates(gates: PolygonGate[]) {
    this.gates = gates;
  }

  setGatingState(state: PolygonGateState) {
    this.PolygonGateState = state;
  }

  setState(state: PolygonGateState) {}

  /* TODO: WILL REQUIRE PLUGIN DYNAMIC RETURN IMPLEMENTATION */
  getPointColor_AFTER(index: number): string {
    return "#000";
  }

  protected drawGate(gate: PolygonGate) {}

  protected drawGating() {}
}
