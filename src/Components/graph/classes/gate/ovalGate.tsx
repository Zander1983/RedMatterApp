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
  // Shameless copy of:
  // https://stackoverflow.com/questions/7946187/point-and-ellipse-rotated-position-test-algorithm
  isPointInside(p: { x: number; y: number }) {
    const primarySize = euclidianDistance2D(this.primaryP1, this.primaryP2) / 2;
    const secondarySize =
      euclidianDistance2D(this.secondaryP1, this.secondaryP2) / 2;

    const eq1 =
      Math.pow(
        Math.cos(this.ang) * (p.x - this.center.x) +
          Math.sin(this.ang) * (p.y - this.center.y),
        2
      ) / Math.pow(primarySize, 2);

    const eq2 =
      Math.pow(
        Math.sin(this.ang) * (p.x - this.center.x) -
          Math.cos(this.ang) * (p.y - this.center.y),
        2
      ) / Math.pow(secondarySize, 2);

    return eq1 + eq2 <= 1;
  }
}
