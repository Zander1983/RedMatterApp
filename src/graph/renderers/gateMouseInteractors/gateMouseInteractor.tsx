import dataManager from "../../dataManagement/dataManager";
import Gate from "../../dataManagement/gate/gate";
import Plotter from "graph/plotters/plotter";

export interface Point {
  x: number;
  y: number;
}

export interface GateState {}

export default abstract class GateMouseInteractor {
  canvasID: string;
  canvasRender: Function;
  canvasRenderLastTimestamp: any = 0;
  started: boolean = false;
  plotter: Plotter;
  targetClass: Gate;
  lastMousePos: Point;

  constructor(canvasID: string) {
    this.canvasID = canvasID;
  }

  setCanvasRender(f: Function) {
    this.canvasRender = f;
  }

  start() {
    this.started = true;
  }

  end() {
    this.started = false;
    this.setPlotterState();
    this.canvasRender();
  }

  setPlotterState() {
    this.plotter.setGateState(this.generateGateState());
    this.canvasRender();
  }

  abstract generateGateState(): GateState;

  createAndAddGate() {
    const state = this.generateOvalGateState();
    const gate = new this.targetClass(this.generateOvalGateState());
    const id = dataManager.addGate(gate);
    dataManager.addGateToCanvas(id, this.canvasID, true);
    this.ovalGateEnd();
  }

  ovalGateEvent(type: string, x: number, y: number) {
    if (this.ovalGateP0 == null && type == "mousedown") {
      // Step 1: select first point
      this.ovalGateP0 = { x: x, y: y };
    } else if (this.ovalGateP1 == null && type == "mousedown") {
      // Step 2: select second point
      this.ovalGateP1 = { x: x, y: y };
      this.calculateEllipseAngle();
    } else if (
      // Step 3: move mouse to select other axis of oval gate
      this.ovalGateP0 != null &&
      this.ovalGateP1 != null &&
      type == "mousemove"
    ) {
      this.calculateEllipseAngle();
      this.calculateMainToSecondaryAxisEllipseSize(x, y);
    } else if (
      // Step 4: press to confirm and create gate
      this.ovalGateP0 != null &&
      this.ovalGateP1 != null &&
      type == "mousedown"
    ) {
      // create gate...
      this.createAndAddGate();
    }
    this.setPlotterOvalGateState();

    const now = new Date().getTime();
    if (this.canvasRenderLastTimestamp + 10 < now) {
      this.canvasRender();
      this.canvasRenderLastTimestamp = now;
    }
  }

  registerMouseEvent(type: string, x: number, y: number) {
    const p = this.plotter.convertToAbstractPoint(x, y);
    this.lastMousePos = { x: p.x, y: p.y };
    if (this.started) {
      this.ovalGateEvent(type, p.x, p.y);
    }
  }
}
