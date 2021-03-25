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
  renderInterval: Function;
  canvasRender: Function;
  canvasRenderLastTimestamp: any = 0;
  stopGatingParent: Function;

  constructor(gateCreator: (gate: Gate) => void, plotter: ScatterPlotter) {
    this.gateCreator = gateCreator;
    this.plotter = plotter;
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

  distLinePoint(p0: any, p1: any, pl: any) {
    const top = Math.abs(
      (p1.x - p0.x) * (p0.y - pl.y) - (p0.x - pl.x) * (p1.y - p0.y)
    );
    const bottom = Math.sqrt(
      Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)
    );
    return top / bottom;
  }

  ovalGateEvent(type: string, x: number, y: number) {
    if (this.ovalGateP0 == null && type == "mousedown") {
      // Step 1: select first point
      console.log("set first point");
      this.ovalGateP0 = { x: x, y: y };
    } else if (this.ovalGateP1 == null && type == "mousedown") {
      // Step 2: select second point
      console.log("set second point");
      this.ovalGateP1 = { x: x, y: y };
      this.majorToMinorSize = 0;
      const [pc1x, pc1y] = this.plotter.convertToPlotPoint(
        this.ovalGateP1.x,
        this.ovalGateP1.y
      );
      const [pc0x, pc0y] = this.plotter.convertToPlotPoint(
        this.ovalGateP0.x,
        this.ovalGateP0.y
      );
      const vectorX = pc1x - pc0x;
      const vectorY = pc1y - pc0y;
      this.ang = Math.atan2(vectorY, vectorX);
    } else if (
      // Step 3: move mouse to open oval gate up
      this.ovalGateP0 != null &&
      this.ovalGateP1 != null &&
      type == "mousemove"
    ) {
      const [pc0x, pc0y] = this.plotter.convertToPlotPoint(
        this.ovalGateP0.x,
        this.ovalGateP0.y
      );
      const [pc1x, pc1y] = this.plotter.convertToPlotPoint(
        this.ovalGateP1.x,
        this.ovalGateP1.y
      );
      const [pm1x, pm1y] = this.plotter.convertToPlotPoint(
        this.lastMousePos.x,
        this.lastMousePos.y
      );
      const distMouseFromLine = this.distLinePoint(
        { x: pc0x, y: pc0y },
        { x: pc1x, y: pc1y },
        { x: pm1x, y: pm1y }
      );
      const vectorX = pc1x - pc0x;
      const vectorY = pc1y - pc0y;
      this.ang = Math.atan2(vectorY, vectorX);
      this.majorToMinorSize =
        distMouseFromLine /
        euclidianDistance2D({ x: pc0x, y: pc0y }, { x: pc1x, y: pc1y });
    } else if (
      // Step 4: press to confirm and create
      this.ovalGateP0 != null &&
      this.ovalGateP1 != null &&
      type == "mousedown"
    ) {
      this.ovalGateEnd();
      // create gate...
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
