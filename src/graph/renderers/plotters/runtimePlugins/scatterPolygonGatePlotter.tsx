import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import PolygonGate from "graph/dataManagement/gate/polygonGate";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";
import {
  euclidianDistance2D,
  getVectorAngle2D,
} from "graph/dataManagement/math/euclidianPlane";
import FCSServices from "services/FCSServices/FCSServices";

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

  protected drawGate(gate: PolygonGate) {
    const pointCount = gate.points.length;
    const scale = this.plotter.scale;
    const newPoints = gate.points;
    let { points, newRanges } = this.pointsToBi([...newPoints]);
    for (let i = 0; i < pointCount; i++) {
      const p = this.plotter.transformer.toConcretePoint(points[i], newRanges);
      const pp = this.plotter.transformer.toConcretePoint(
        points[(i + 1) % points.length],
        newRanges
      );
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
        strokeColor: "#f00",
      });
    }
  }

  protected pointsToBi(pts: Point[]): {
    points: Point[];
    newRanges: [[number, number], [number, number]];
  } {
    let ranges: any = this.plotter.plotData.getXandYRanges();
    const xBi = this.plotter.plotData.xPlotType === "bi";
    const yBi = this.plotter.plotData.yPlotType === "bi";
    if (xBi || yBi) {
      const fcsServices = new FCSServices();
      pts = pts.map((e) => {
        const logiclizedx = fcsServices.logicleMarkTransformer(
          [e.x],
          ranges.x[0],
          ranges.x[1]
        )[0];
        const logiclizedy = fcsServices.logicleMarkTransformer(
          [e.y],
          ranges.y[0],
          ranges.y[1]
        )[0];
        return {
          x: xBi ? logiclizedx : e.x,
          y: yBi ? logiclizedy : e.y,
        };
      });
      ranges = [xBi ? [0, 1] : ranges.x, yBi ? [0, 1] : ranges.y];
    } else {
      ranges = [ranges.x, ranges.y];
    }
    return {
      points: pts,
      newRanges: ranges,
    };
  }

  protected drawGating() {
    if (this.points === undefined) return;
    let lastMousePos = { ...this.lastMousePos };
    const newPoints = [...this.points, lastMousePos];
    const { points, newRanges } = this.pointsToBi(newPoints);
    const pointCount = points.length - 1;
    lastMousePos = points[pointCount];
    let lastPoint = null;
    const scale = this.plotter.scale;
    for (let i = 0; i < pointCount; i++) {
      const p = this.plotter.transformer.toConcretePoint(points[i], newRanges);
      this.plotter.drawer.addPoint(p.x, p.y, 2, "#f00");
      if (i == pointCount - 1) {
        const mouse = this.plotter.transformer.toConcretePoint(
          lastMousePos,
          newRanges
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

  private closeToFirstPoint(
    p: Point,
    abstract: boolean = false,
    otherPointToCompare: Point = undefined
  ) {
    const { points, newRanges } = this.pointsToBi([{ ...this.points[0] }]);
    const p1 = this.plotter.transformer.toConcretePoint(
      otherPointToCompare === undefined ? points[0] : otherPointToCompare,
      newRanges
    );
    const p2 = abstract
      ? this.plotter.transformer.toConcretePoint(p, undefined, false)
      : p;
    // console.log(p1, p2);
    const dist = euclidianDistance2D(p1, p2);
    if (dist <= 10) {
      return true;
    }
    return false;
  }
}
