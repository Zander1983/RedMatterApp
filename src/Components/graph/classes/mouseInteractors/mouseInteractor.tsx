export default class MouseInteractor {
  constructor() {}

  ovalGating: boolean = false;
  ovalGateP0: Point | null = null;

  ovalGateStart() {
    this.ovalGating = true;
  }

  ovalGateEnd() {
    this.ovalGating = false;
  }

  ovalGateEvent(event: any) {
    console.log("event called");
  }

  registerMouseEvent(event: any) {
    if (this.ovalGating) {
      this.ovalGateEvent(event);
    }
  }
}
