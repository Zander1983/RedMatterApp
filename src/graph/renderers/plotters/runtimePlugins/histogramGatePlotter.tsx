import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import HistogramPlotter from "graph/renderers/plotters/histogramPlotter";
import {
  Point,
  Gate,
  HistogramAxisType,
  HistogramGate,
  Color,
} from "graph/resources/types";
import {
  bottomPadding,
  leftPadding,
  rightPadding,
  topPadding,
} from "../graphPlotter";

export interface HistogramGatePlotterState {}

interface HistogramGateState {
  points: number[];
  lastMousePos: Point | null;
  histogramDirection: HistogramAxisType;
}

export default class HistogramGatePlotter extends GatePlotterPlugin {
  plotter: HistogramPlotter | null = null;
  gaterType = "1D" as "1D" | "2D";

  points: number[] = [];
  gates: Gate[] = [];
  histogramDirection: HistogramAxisType;

  setPlotter(plotter: HistogramPlotter) {
    this.plotter = plotter;
  }

  setGates(gates: Gate[]) {
    this.gates = gates;
  }

  setGatingState(state: HistogramGateState) {
    this.points = [...state.points];
    this.lastMousePos = state.lastMousePos;
    this.histogramDirection = state.histogramDirection;
  }

  private getPointConcretePos(ap: number, axis: "x" | "y"): number {
    let fp = { x: ap, y: ap };
    const cc = this.plotter.transformer.toConcretePoint(fp, undefined, true);
    return cc[axis];
  }

  protected drawGate(gate: HistogramGate) {
    const axis = gate.histogramDirection === "vertical" ? "x" : "y";
    let color = gate.color;
    const p1 = this.getPointConcretePos(gate.points[0], axis);
    const p2 = this.getPointConcretePos(gate.points[1], axis);
    const gates = this.gates.filter((e) => e.gateType === "histogram");
    const gateCount = gates.length / 2;
    if (gateCount === 1) {
      this.drawH(axis, p1, p2, color);
    } else {
      const inc = 1.0 / (gateCount + 1.0);
      for (let i = 0; i < gateCount; i++) {
        if (gates[i].id === gate.id) {
          const p = inc * (i + 1);
          this.drawH(axis, p1, p2, color, p);
          break;
        }
      }
    }
  }

  protected drawGating() {
    if (this.points === undefined || this.lastMousePos === undefined) return;
    const axis = this.histogramDirection === "vertical" ? "x" : "y";
    const scale = this.plotter.scale;
    let color = "#f00";

    if (this.points.length === 0) {
      const height = this.plotter.plot.plotHeight;
      if (axis === "x") {
        this.plotter.drawer.segment({
          x1: this.lastMousePos[axis] * scale,
          y1: topPadding * scale,
          x2: this.lastMousePos[axis] * scale,
          y2: (height - bottomPadding) * scale,
          lineWidth: 3,
          strokeColor: color,
        });
      } else {
        const width = this.plotter.plot.plotWidth;
        this.plotter.drawer.segment({
          x1: leftPadding * scale,
          y1: this.lastMousePos[axis] * scale,
          x2: width - rightPadding * scale,
          y2: this.lastMousePos[axis] * scale,
          lineWidth: 3,
          strokeColor: color,
        });
      }
    } else {
      let p1 = this.points[0];
      let p2 = this.lastMousePos[axis];
      if (p1 > p2) {
        p1 ^= p2;
        p2 ^= p1;
        p1 ^= p2;
      }
      this.drawH(axis, p1, p2, color);
    }
  }

  protected drawH(
    axis: "x" | "y",
    p1: number,
    p2: number,
    color: Color,
    drawPos: number = 0.5
  ) {
    const thickness = 2;
    const scale = this.plotter.scale;
    if (axis === "x") {
      const height = this.plotter.plot.plotHeight;
      this.plotter.drawer.segment({
        x1: p1 * scale,
        y1: topPadding * scale,
        x2: p1 * scale,
        y2: (height - bottomPadding) * scale,
        lineWidth: thickness,
        strokeColor: color,
      });
      const middleLineHeight =
        (1 - drawPos) * (height - topPadding - bottomPadding) + bottomPadding;
      this.plotter.drawer.segment({
        x1: p1 * scale,
        y1: middleLineHeight * scale,
        x2: p2 * scale,
        y2: middleLineHeight * scale,
        lineWidth: thickness,
        strokeColor: color,
      });
      this.plotter.drawer.segment({
        x1: p2 * scale,
        y1: topPadding * scale,
        x2: p2 * scale,
        y2: (height - bottomPadding) * scale,
        lineWidth: thickness,
        strokeColor: color,
      });
    } else {
      const width = this.plotter.plot.plotWidth;
      this.plotter.drawer.segment({
        x1: leftPadding * scale,
        y1: p1 * scale,
        x2: (width - rightPadding) * scale,
        y2: p1 * scale,
        lineWidth: 3,
        strokeColor: color,
      });
      const middleLineWidth =
        (1 - drawPos) * (width - leftPadding - rightPadding) + bottomPadding;
      this.plotter.drawer.segment({
        x1: middleLineWidth * scale,
        y1: p1 * scale,
        x2: middleLineWidth * scale,
        y2: p2 * scale,
        lineWidth: thickness,
        strokeColor: color,
      });
      this.plotter.drawer.segment({
        x1: leftPadding * scale,
        y1: p2 * scale,
        x2: (width - rightPadding) * scale,
        y2: p2 * scale,
        lineWidth: 3,
        strokeColor: color,
      });
    }
  }
}
