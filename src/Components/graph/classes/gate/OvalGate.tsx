import Gate, { GateInput } from "./gate";
import { euclidianDistance2D, rotateVector2D } from "../utils/euclidianPlane";

interface Point {
  x: number;
  y: number;
}

export interface OvalGateInput extends GateInput {
  center: Point;
  primaryP1: Point;
  primaryP2: Point;
  secondaryP1: Point;
  secondaryP2: Point;
  ang: number;
}

export default class OvalGate extends Gate {
  center: Point;
  primaryP1: Point;
  primaryP2: Point;
  secondaryP1: Point;
  secondaryP2: Point;
  ang: number;

  constructor(gate: OvalGateInput) {
    super(gate);
    this.center = gate.center;
    this.primaryP1 = gate.primaryP1;
    this.primaryP2 = gate.primaryP2;
    this.secondaryP1 = gate.secondaryP1;
    this.secondaryP2 = gate.secondaryP2;
    this.ang = gate.ang;
  }

  // Abstract override, returns true if given point is inside ellipse (2D)
  isPointInside(p: { x: number; y: number }) {
    // First we spin the point around until it matches the angle of the ellipse
    const centralizedPoint = rotateVector2D(p, this.ang);
    // Then we check the ellipse inequality and return true if inside
    const primaryAxisSize = euclidianDistance2D(this.primaryP1, this.primaryP2);
    const secondaryAxisSize = euclidianDistance2D(
      this.secondaryP1,
      this.secondaryP2
    );
    return (
      Math.pow(p.x - this.x, 2) / Math.pow(primaryAxisSize, 2) +
        Math.pow(p.y - this.y, 2) / Math.pow(secondaryAxisSize, 2) <=
      1
    );
  }
}
