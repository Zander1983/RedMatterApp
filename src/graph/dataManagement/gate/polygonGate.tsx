import Gate, { GateState, Point } from "./gate";
import { pointInsidePolygon } from "graph/dataManagement/math/euclidianPlane";

interface PolygonGateState extends GateState {
  points: Point[];
}

export default class PolygonGate extends Gate {
  points: Point[] = [];
  gateType: string = "PolygonGate";

  constructor(gate: PolygonGateState) {
    super(gate);
    this.points = gate.points;
  }

  setState(gate: PolygonGateState) {
    super.setState(gate);
    this.points = gate.points;
  }

  getState(): PolygonGateState {
    return {
      ...super.getState(),
      points: this.points,
    };
  }

  getGateType() {
    return "Polygon Gate";
  }

  isPointInside(point: Point): boolean {
    return pointInsidePolygon(point, this.points) && super.isPointInside(point);
  }
}
