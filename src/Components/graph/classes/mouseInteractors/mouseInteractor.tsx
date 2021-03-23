interface Point {
  x: number;
  y: number;
}

export default class MouseInteractor {
  constructor() {}

  ovalGating: boolean = false;
  ovalGateP0: Point | null = null;
  ovalGateP1: Point | null = null;

  ovalGateStart() {
    this.ovalGating = true;
    console.log("oval gating start");
  }

  ovalGateEnd() {
    this.ovalGating = false;
    console.log("oval gating end");
  }

  ovalGateEvent(event: any) {
    console.log("event called");
  }

  registerMouseEvent(type: string, x: number, y: number) {}
}
