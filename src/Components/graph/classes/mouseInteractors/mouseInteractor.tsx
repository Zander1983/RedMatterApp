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
    this.plotter.setOvalGateState({
      p0: this.ovalGateP0,
      p1: this.ovalGateP1,
      e: this.majorToMinorSize,
      ovalGate: null,
      lastMousePos: this.lastMousePos,
      ang: this.ang,
    });
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
      distMouseFromLine / euclidianDistance2D(this.ovalGateP0, this.ovalGateP1);
  }

  calculateEllipseAngle() {
    const [pc0x, pc0y] = this.plotter.convertToPlotPoint(
      this.ovalGateP0.x,
      this.ovalGateP0.y
    );
    const [pc1x, pc1y] = this.plotter.convertToPlotPoint(
      this.ovalGateP1.x,
      this.ovalGateP1.y
    );
    this.ang = getVectorAngle2D({ x: pc0x, y: pc0y }, { x: pc1x, y: pc1y });
  }

  createAndAddGate() {
    // This is going to calculate the 2 secondary points by creating a vector
    // from center to primaryP1, then rotate that vector -90º and multiply
    // for secondaryP1 and do the same but 90º to get secondaryP2
    const [p0x, p0y] = this.plotter.convertToPlotPoint(
      this.ovalGateP0.x,
      this.ovalGateP0.y
    );
    const [p1x, p1y] = this.plotter.convertToPlotPoint(
      this.ovalGateP1.x,
      this.ovalGateP1.y
    );

    const mx = (p0x + p1x) / 2;
    const my = (p0y + p1y) / 2;
    const vec = { x: mx - p0x, y: my - p0y };
    const s1 = rotateVector2D(vec, -Math.PI / 2);
    const s2 = rotateVector2D(vec, Math.PI / 2);

    s1.x *= this.majorToMinorSize / 2;
    s1.y *= this.majorToMinorSize / 2;
    s2.x *= this.majorToMinorSize / 2;
    s2.y *= this.majorToMinorSize / 2;

    s1.x += mx;
    s1.y += my;
    s2.x += mx;
    s2.y += my;

    const as1 = this.plotter.convertToAbstractPoint(s1.x, s1.y);
    const as2 = this.plotter.convertToAbstractPoint(s2.x, s2.y);

    const gate = new OvalGate({
      center: {
        x: (this.ovalGateP1.x + this.ovalGateP0.x) / 2,
        y: (this.ovalGateP1.y + this.ovalGateP0.y) / 2,
      },
      primaryP1: this.ovalGateP0,
      primaryP2: this.ovalGateP1,
      secondaryP1: {
        x: as1.x,
        y: as1.y,
      },
      secondaryP2: {
        x: as2.x,
        y: as2.y,
      },
      ang: this.ang,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
    });
    const id = dataManager.addGate(gate);
    dataManager.addGateToCanvas(id, this.parentID);
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
    this.lastMousePos = { x: x, y: y };
    if (this.ovalGating) {
      this.ovalGateEvent(type, x, y);
    }
  }
}
