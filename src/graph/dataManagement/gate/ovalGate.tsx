import Gate, { GateState, Point } from "./gate";
import { pointInsideEllipse } from "../math/euclidianPlane";

export interface OvalGateState extends GateState {
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
  gateType: string = "OvalGate";

  protected getGateType() {
    return "Oval Gate";
  }

  constructor(gate: OvalGateState) {
    super(gate);
    this.setState(gate);
  }

  setState(gate: OvalGateState) {
    super.setState(gate);
    this.center = gate.center;
    this.primaryP1 = gate.primaryP1;
    this.primaryP2 = gate.primaryP2;
    this.secondaryP1 = gate.secondaryP1;
    this.secondaryP2 = gate.secondaryP2;
    this.ang = gate.ang;
  }

  getState(): OvalGateState {
    return {
      ...super.getState(),
      center: this.center,
      primaryP1: this.primaryP1,
      primaryP2: this.primaryP2,
      secondaryP1: this.secondaryP1,
      secondaryP2: this.secondaryP2,
      ang: this.ang,
    };
  }

  // Abstract override, returns true if given point is inside ellipse (2D)
  isPointInside(p: { x: number; y: number }) {
    return (
      pointInsideEllipse(p, {
        center: this.center,
        primaryP1: this.primaryP1,
        primaryP2: this.primaryP2,
        secondaryP1: this.secondaryP1,
        secondaryP2: this.secondaryP2,
        ang: this.ang,
      }) && super.isPointInside(p)
    );
  }
}
