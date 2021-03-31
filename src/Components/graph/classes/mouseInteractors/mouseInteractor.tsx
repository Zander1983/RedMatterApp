import { data } from "jquery";
import dataManager from "../dataManager";
import Gate from "../gate/gate";
import OvalGate from "../gate/ovalGate";
import ScatterPlotter from "../plotters/scatterPlotter";
import {
  euclidianDistance2D,
  distLinePoint2D,
  getVectorAngle2D,
  rotateVector2D,
  rotatePointOverTarget,
} from "../utils/euclidianPlane";

interface Point {
  x: number;
  y: number;
}

export default class MouseInteractor {
  parentID: string;
  plotter: ScatterPlotter;
  gateCreator: Function;
  renderInterval: Function;
  canvasRender: Function;
  canvasRenderLastTimestamp: any = 0;
  stopGatingParent: Function;
  xAxis: string;
  yAxis: string;

  constructor(plotter: ScatterPlotter, parentID: number) {
    this.plotter = plotter;
    this.parentID = parentID;
  }

  ovalGating: boolean = false;
  ovalGateP0: Point | null = null;
  ovalGateP1: Point | null = null;
  majorToMinorSize: number = 0;
  lastMousePos: { x: number; y: number } | null = null;
  ang: number = 0;

  setRerenderInterval(f: Function) {
    this.renderInterval = f;
  }

  setCanvasRender(f: Function) {
    this.canvasRender = f;
  }

  ovalGateStart() {
    this.ovalGating = true;
  }

  updateAxis(xAxis: string, yAxis: string) {
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  ovalGateEnd() {
    this.ovalGating = false;
    this.ovalGateP0 = null;
    this.ovalGateP1 = null;
    this.majorToMinorSize = 1;
    this.setPlotterOvalGateState();
    this.canvasRender();
    this.stopGatingParent();
  }

  setStopGatingParent(f: Function) {
    this.stopGatingParent = f;
  }

  setPlotterOvalGateState() {
    this.plotter.setOvalGateState(this.generateOvalGateState());
    this.plotter.setLastMousePos(this.lastMousePos);
  }

  calculateMainToSecondaryAxisEllipseSize(x: number, y: number) {
    if (this.ovalGateP0 === null || this.ovalGateP1 === null) {
      throw Error("Invalid axis calculation: points not defined");
    }
    const distMouseFromLine = distLinePoint2D(
      this.ovalGateP0,
      this.ovalGateP1,
      this.lastMousePos
    );
    this.majorToMinorSize =
      (distMouseFromLine * 2) /
      euclidianDistance2D(this.ovalGateP0, this.ovalGateP1);
  }

  calculateEllipseAngle(params?: { abstract: boolean }) {
    this.ang = -getVectorAngle2D(this.ovalGateP0, this.ovalGateP1);
    const p1 = this.plotter.convertToPlotPoint(
      this.ovalGateP0.x,
      this.ovalGateP0.y
    );
    const p2 = this.plotter.convertToPlotPoint(
      this.ovalGateP1.x,
      this.ovalGateP1.y
    );
    const concreteAngle = getVectorAngle2D(p1, p2);
    if (params !== undefined && params.abstract === true) {
      this.ang = abstractAngle;
    } else {
      this.ang = concreteAngle;
    }
  }

  presentPoint(name: string, point: { x: number; y: number }) {
    this.plotter.specialPointsList.push({
      x: point.x,
      y: point.y,
      color: "#3a3",
      text: name,
    });
  }

  presentConcretePoint(name: string, point: { x: number; y: number }) {
    this.plotter.specialPointsList.push({
      x: point.x,
      y: point.y,
      color: "#d33",
      text: name,
      concrete: true,
    });
  }

  generateOvalGateState() {
    // This is going to calculate the 2 secondary points by creating a vector
    // from center to primaryP1, then rotate that vector -90º and multiply
    // for secondaryP1 and do the same but 90º to get secondaryP2

    if (this.ovalGateP0 === null) {
      return {
        center: null,
        primaryP1: null,
        primaryP2: null,
        secondaryP1: null,
        secondaryP2: null,
        ang: null,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
      };
    }

    if (this.ovalGateP1 === null) {
      return {
        center: null,
        primaryP1: this.ovalGateP0,
        primaryP2: this.ovalGateP0,
        secondaryP1: null,
        secondaryP2: null,
        ang: null,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
      };
    }

    const mx = (this.ovalGateP0.x + this.ovalGateP1.x) / 2;
    const my = (this.ovalGateP0.y + this.ovalGateP1.y) / 2;
    const vec = { x: this.ovalGateP0.x - mx, y: this.ovalGateP0.y - my };
    const s1 = rotateVector2D(vec, -Math.PI / 2);
    const s2 = rotateVector2D(vec, Math.PI / 2);

    s1.x *= this.majorToMinorSize;
    s1.y *= this.majorToMinorSize;
    s2.x *= this.majorToMinorSize;
    s2.y *= this.majorToMinorSize;

    s1.x += mx;
    s1.y += my;
    s2.x += mx;
    s2.y += my;

    return {
      center: {
        x: mx,
        y: my,
      },
      primaryP1: this.ovalGateP0,
      primaryP2: this.ovalGateP1,
      secondaryP1: {
        x: s1.x,
        y: s1.y,
      },
      secondaryP2: {
        x: s2.x,
        y: s2.y,
      },
      ang: this.ang,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
    };
  }

  createAndAddGate() {
    const state = this.generateOvalGateState();
    this.calculateEllipseAngle();
    state.ang = this.ang;
    const gate = new OvalGate(this.generateOvalGateState());
    const id = dataManager.addGate(gate);
    dataManager.addGateToCanvas(id, this.parentID, true);
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
    if (this.ovalGating) {
      this.ovalGateEvent(type, p.x, p.y);
    }
  }
}
