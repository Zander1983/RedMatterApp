import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import HistogramPlotter from "graph/renderers/plotters/histogramPlotter";
import {
  Point,
  Gate,
  HistogramAxisType,
  HistogramGate,
  Color,
} from "graph/resources/types";
import { bottomPadding, topPadding } from "../graphPlotter";

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

  private getPointConcretePos(ap: number): number {
    let fp = { x: ap, y: ap };
    const cc = this.plotter.transformer.toConcretePoint(fp, undefined, true);
    return cc.x;
  }

  protected drawGate(gate: HistogramGate, drawGates?: HistogramGate[]) {
    let color = gate.color;
    const p1 = this.getPointConcretePos(gate.points[0]);
    const p2 = this.getPointConcretePos(gate.points[1]);
    const gateCount = drawGates.length;
    if (gateCount === 1) {
      this.drawH(p1, p2, color);
    } else {
      const inc = 1.0 / (gateCount + 1.0);
      for (let i = 0; i < gateCount; i++) {
        if (drawGates[i].id === gate.id) {
          const p = inc * (i + 1);
          this.drawH(p1, p2, color, p);
          break;
        }
      }
    }
  }

  protected drawGating() {
    if (this.points === undefined || this.lastMousePos === undefined) return;
    const scale = this.plotter.scale;
    let color = "#f00";

    if (this.points.length === 0) {
      const height = this.plotter.plot.plotHeight;
      this.plotter.drawer.segment({
        x1: this.lastMousePos.x * scale,
        y1: topPadding * scale,
        x2: this.lastMousePos.x * scale,
        y2: (height - bottomPadding) * scale,
        lineWidth: 3,
        strokeColor: color,
      });
    } else {
      let p1 = this.points[0];
      let p2 = this.lastMousePos.x;
      if (p1 > p2) {
        p1 ^= p2;
        p2 ^= p1;
        p1 ^= p2;
      }
      this.drawH(p1, p2, color);
    }
  }

  protected drawH(p1: number, p2: number, color: Color, drawPos: number = 0.5) {
    const thickness = 3;
    const scale = this.plotter.scale;
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
  }
}
