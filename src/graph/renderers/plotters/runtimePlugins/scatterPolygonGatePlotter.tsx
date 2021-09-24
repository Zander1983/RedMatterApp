import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";
import { euclidianDistance2D } from "graph/utils/euclidianPlane";
import FCSServices from "services/FCSServices/FCSServices";
import { selectPointDist } from "graph/renderers/gateMouseInteractors/polygonMouseInteractor";
import * as PlotResource from "graph/resources/plots";
import { Point, PolygonGate, Range } from "graph/resources/types";

export interface ScatterPolygonGatePlotterState {}

interface PolygonGateState {
  points: Point[];
  lastMousePos: Point | null;
}

export default class ScatterPolygonGatePlotter extends GatePlotterPlugin {
  plotter: ScatterPlotter | null = null;
  gaterType = "2D" as "1D" | "2D";

  points: Point[] = [];
  polygonGates: PolygonGate[] = [];

  setPlotter(plotter: ScatterPlotter) {
    this.plotter = plotter;
  }

  setGates(gates: PolygonGate[]) {
    this.gates = gates;
  }

  setGatingState(state: PolygonGateState) {
    this.points = state.points.map((e) => {
      return { ...e };
    });
    this.lastMousePos = state.lastMousePos;
  }

  protected drawGate(gate: PolygonGate) {
    if (
      gate.xAxisType !== this.plotter.plot.xPlotType ||
      gate.yAxisType !== this.plotter.plot.yPlotType
    ) {
      return;
    }
    const pointCount = gate.points.length;
    const scale = this.plotter.scale;
    for (let i = 0; i < pointCount; i++) {
      let p = { ...gate.points[i] };
      let pp = { ...gate.points[(i + 1) % gate.points.length] };
      p = this.plotter.transformer.toConcretePoint(p, undefined, true);
      pp = this.plotter.transformer.toConcretePoint(pp, undefined, true);
      let color = "#f00";
      let size = 2;
      if (
        this.lastMousePos !== undefined &&
        this.closeToFirstPoint(p, false, this.lastMousePos)
      ) {
        color = "#00f";
        size = 4;
      }
      this.plotter.drawer.addPoint(p.x, p.y, size, color);
      this.plotter.drawer.segment({
        x1: p.x * scale,
        y1: p.y * scale,
        x2: pp.x * scale,
        y2: pp.y * scale,
        lineWidth: 2,
        strokeColor: gate.color,
      });
    }
  }

  protected drawGating() {
    if (this.points === undefined) return;
    let lastMousePos = { ...this.lastMousePos };
    const points = [
      ...this.points.map((e) => {
        return { ...e };
      }),
    ];
    const pointCount = points.length;
    let lastPoint = null;
    const scale = this.plotter.scale;
    for (let i = 0; i < pointCount; i++) {
      const p = points[i];
      this.plotter.drawer.addPoint(p.x, p.y, 2, "#f00");
      if (i === pointCount - 1) {
        const mouse = lastMousePos;
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

  closeToFirstPoint(
    p: Point,
    abstract: boolean = false,
    otherPointToCompare: Point = undefined
  ) {
    const p1 =
      otherPointToCompare === undefined
        ? { ...this.points[0] }
        : otherPointToCompare;
    const p2 = abstract
      ? this.plotter.transformer.toConcretePoint({ ...p })
      : p;
    const dist = euclidianDistance2D(p1, p2);
    if (dist <= selectPointDist * 0.75) {
      return true;
    }
    return false;
  }
}
