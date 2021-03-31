import Gate, { GateInput, Point } from "./gate";

interface PolygonGateInput extends GateInput {
  points: Array<[number, number]>;
}

class PolygonGate extends Gate {
  points: Array<[number, number]> = [];

  constructor(gate: PolygonGateInput) {
    super(gate);
    this.points = gate.points;
  }

  isPointInside(point: Point) {
    return true;
  }
}
