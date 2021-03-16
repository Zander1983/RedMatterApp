import Gate, { GateInput, Point } from "./gate";

export interface OvalGateInput extends GateInput {
  x: number;
  y: number;
  semiMajorAxisSize: number;
  semiMinorAxisSize: number;
  tiltInRadians: number;
}

export default class OvalGate extends Gate {
  x: number;
  y: number;
  semiMajorAxisSize: number;
  semiMinorAxisSize: number;
  tiltInRadians: number;

  constructor(gate: OvalGateInput) {
    super(gate);
    this.x = gate.x;
    this.y = gate.y;
    this.semiMajorAxisSize = gate.semiMajorAxisSize;
    this.semiMinorAxisSize = gate.semiMinorAxisSize;
    this.tiltInRadians = gate.tiltInRadians;
  }

  isPointInside(point: Point) {
    return true;
  }
}
