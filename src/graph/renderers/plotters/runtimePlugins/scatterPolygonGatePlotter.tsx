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

  points: Point[] = [];
  lastMousePos: Point;
  polygonGates: PolygonGate[] = [];

  setPlotter(plotter: ScatterPlotter) {
    this.plotter = plotter;
  }

  setGates(gates: PolygonGate[]) {
    this.gates = gates;
  }

  setGatingState(state: PolygonGateState) {
    this.points = state.points;
    this.lastMousePos = state.lastMousePos;
  }

  setState(state: PolygonGateState) {
    this.gatingState = state;
  }

  /* TODO: WILL REQUIRE PLUGIN DYNAMIC RETURN IMPLEMENTATION */
  getPointColor_AFTER(index: number): string {
    return "#000";
  }

  protected drawGate(gate: PolygonGate) {
    const pointCount = gate.points.length;
    let lastPoint = null;
    const scale = this.plotter.scale;
    for (let i = 0; i < pointCount; i++) {
      const p = this.plotter.transformer.toConcretePoint(gate.points[i]);
      const pp = this.plotter.transformer.toConcretePoint(
        gate.points[(i + 1) % gate.points.length]
      );
      console.log("drawing point ", p);
      this.plotter.drawer.addPoint(p.x, p.y, 2, "#f00");
      this.plotter.drawer.segment({
        x1: p.x * scale,
        y1: p.y * scale,
        x2: pp.x * scale,
        y2: pp.y * scale,
        lineWidth: 2,
        strokeColor: "#f00",
      });
    }
  }

  protected drawGating() {
    if (this.points === undefined) return;
    console.log("drawing gate state");
    const pointCount = this.points.length;
    let lastPoint = null;
    const scale = this.plotter.scale;
    for (let i = 0; i < pointCount; i++) {
      const p = this.plotter.transformer.toConcretePoint(this.points[i]);
      console.log("drawing point ", p);
      this.plotter.drawer.addPoint(p.x, p.y, 2, "#f00");
      if (i == pointCount - 1) {
        const mouse = this.plotter.transformer.toConcretePoint(
          this.lastMousePos
        );
        this.plotter.drawer.addPoint(p.x, p.y, 2, "#f00");
        this.plotter.drawer.segment({
          x1: p.x * scale,
          y1: p.y * scale,
          x2: mouse.x * scale,
          y2: mouse.y * scale,
          lineWidth: this.closeToFirstPoint(mouse, false) ? 4 : 2,
          strokeColor: this.closeToFirstPoint(mouse, false) ? "#00f" : "#f00",
        });
      }
      if (lastPoint !== null) {
        this.plotter.drawer.segment({
          x1: p.x * scale,
          y1: p.y * scale,
          x2: lastPoint.x * scale,
          y2: lastPoint.y * scale,
          lineWidth: 2,
          strokeColor: "#f00",
        });
      }
      lastPoint = p;
    }
  }

  private closeToFirstPoint(p: Point, abstract: boolean = false) {
    const p1 = this.plotter.transformer.toConcretePoint(this.points[0]);
    const p2 = abstract ? this.plotter.transformer.toConcretePoint(p) : p;
    const dist = euclidianDistance2D(p1, p2);
    console.log("DIST = ", dist);
    if (dist <= 10) {
      return true;
    }
    return false;
  }
}
