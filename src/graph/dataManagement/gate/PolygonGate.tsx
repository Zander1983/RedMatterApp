import Gate, { GateInput, Point } from "./gate";
import { pointInsidePolygon } from "graph/dataManagement/math/euclidianPlane";

interface PolygonGateInput extends GateInput {
  points: { x: number; y: number }[];
}

export default class PolygonGate extends Gate {
  points: { x: number; y: number }[] = [];
  gateType: string = "PolygonGate";

  constructor(gate: PolygonGateInput) {
    super(gate);
    this.points = gate.points;
  }

  isPointInside(point: Point): boolean {
    return pointInsidePolygon(point, this.points);
  }
}
