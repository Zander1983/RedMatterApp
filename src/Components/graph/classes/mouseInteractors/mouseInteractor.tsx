import Gate from "../gate/gate";
import ScatterPlotter from "../plotters/scatterPlotter";
import { euclidianDistance2D } from "../utils/euclidianPlane";

interface Point {
  x: number;
  y: number;
}

export default class MouseInteractor {
  plotter: ScatterPlotter;
  gateCreator: (gate: Gate) => void;
  setRerenderingInterval: Function;

  constructor(
    gateCreator: (gate: Gate) => void,
    plotter: ScatterPlotter,
    setRerenderingInterval: Function
  ) {
    this.gateCreator = gateCreator;
    this.plotter = plotter;
    this.setRerenderingInterval = setRerenderingInterval;
  }

  ovalGating: boolean = false;
  ovalGateP0: Point | null = null;
  ovalGateP1: Point | null = null;
  majorToMinorSize: number = 1;
  lastMousePos: { x: number; y: number } | null = null;

  ovalGateStart() {
    console.log("start");
    this.ovalGating = true;
    this.setRerenderingInterval(500);
  }

  ovalGateEnd() {
    console.log("end");
    this.ovalGating = false;
    this.ovalGateP0 = null;
    this.ovalGateP1 = null;
    this.setRerenderingInterval(0, true);
  }

  setPlotterOvalGateState() {
    this.plotter.setOvalGateState({
      p0: this.ovalGateP0,
      p1: this.ovalGateP1,
      e: this.majorToMinorSize,
      ovalGate: null,
      lastMousePos: this.lastMousePos,
    });
  }

  ovalGateEvent(type: string, x: number, y: number) {
    console.log("ovalGateEvent");
    if (this.ovalGateP0 == null && type == "mousedown") {
      // Step 1: select first point
      console.log("set first point");
      this.ovalGateP0 = { x: x, y: y };
    } else if (this.ovalGateP1 == null && type == "mousedown") {
      // Step 2: select second point
      console.log("set second point");
      this.ovalGateP1 = { x: x, y: y };
      this.majorToMinorSize = 1;
    } else if (
      // Step 3: move mouse to open oval gate up
      this.ovalGateP0 != null &&
      this.ovalGateP1 != null &&
      type == "mousemove"
    ) {
      this.majorToMinorSize =
        euclidianDistance2D(this.ovalGateP1, { x: x, y: y }) /
        euclidianDistance2D(this.ovalGateP0, this.ovalGateP1);
    } else if (
      // Step 4: press to confirm and create
      this.ovalGateP0 != null &&
      this.ovalGateP1 != null &&
      type == "mousedown"
    ) {
      // create gate...
    }
    this.setPlotterOvalGateState();
  }

  registerMouseEvent(type: string, x: number, y: number) {
    this.lastMousePos = { x: x, y: y };
    if (this.ovalGating) {
      this.ovalGateEvent(type, x, y);
    }
  }
}
