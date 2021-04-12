import Gate, { GateInput, Point } from "./gate";
import { pointInsidePolygon } from "graph/dataManagement/math/euclidianPlane";

interface PolygonGateInput extends GateInput {
  points: Point[];
}

export default class PolygonGate extends Gate {
  points: Point[] = [];
  gateType: string = "PolygonGate";

  constructor(gate: PolygonGateInput) {
    super(gate);
    this.points = gate.points;
  }

  protected getGateType() {
    return "Polygon Gate";
  }

  isPointInside(point: Point): boolean {
    return pointInsidePolygon(point, this.points) && super.isPointInside(point);
  }
}
