import PolygonGate from "../../dataManagement/gate/polygonGate";
import {
  euclidianDistance2D,
  distLinePoint2D,
  getVectorAngle2D,
  rotateVector2D,
} from "../../dataManagement/math/euclidianPlane";
import GateMouseInteractor, {
  Point,
  GateState,
  MouseInteractorState,
} from "./gateMouseInteractor";
import ScatterPolygonGatePlotter from "../plotters/runtimePlugins/scatterPolygonGatePlotter";
import ScatterPlotter from "../plotters/scatterPlotter";

const maxPolygonDist = 10;

export interface PolygonGateState extends GateState {
  points: Point[];
  xAxis: string;
  yAxis: string;
}

export interface PolygonMouseInteractorState extends MouseInteractorState {
  xAxis: string;
  yAxis: string;
}

export default class PolygonMouseInteractor extends GateMouseInteractor {
  static targetGate: PolygonGate;
  static targetPlugin: ScatterPolygonGatePlotter;

  plotter: ScatterPlotter | null = null;
  protected plugin: ScatterPolygonGatePlotter;

  private points: Point[] = [];
  xAxis: string;
  yAxis: string;

  setMouseInteractorState(state: PolygonMouseInteractorState) {
    super.setMouseInteractorState(state);
    this.xAxis = state.xAxis;
    this.yAxis = state.yAxis;
  }

  protected instanceGate(): PolygonGate {
    const { points, xAxis, yAxis } = this.getGatingState();

    const checkNotNullOrUndefined = (x: any): void => {
      if (x === null || x === undefined) {
        throw Error("Invalid gate params on instancing");
      }
    };
    checkNotNullOrUndefined(points);
    checkNotNullOrUndefined(xAxis);
    checkNotNullOrUndefined(yAxis);

    return new PolygonGate({
      points: points,
      xAxis: xAxis,
      yAxis: yAxis,
    });
  }

  setup(plotter: ScatterPlotter) {
    this.plotter = plotter;
    this.plugin = plotter.polygonGatePlugin;
    this.plugin.isGating = true;
  }

  end() {
    this.plugin.isGating = false;
    super.end();
  }

  protected clearGateState() {
    this.points = [];
  }

  getGatingState(): PolygonGateState {
    if (
      this.points === null ||
      this.points === undefined ||
      this.points === []
    ) {
      return {
        ...super.getGatingState(),
        points: [],
        xAxis: this.xAxis,
        yAxis: this.yAxis,
      };
    }

    return {
      ...super.getGatingState(),
      points: this.points,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      lastMousePos: this.lastMousePos,
    };
  }

  gateEvent(type: string, { x, y }: Point) {
    const isCloseToFirstPoint = this.closeToFirstPoint({ x, y });
    if (type === "mousedown" && !isCloseToFirstPoint) {
      this.points = [...this.points, { x, y }];
    } else if (type === "mousedown") {
      this.createAndAddGate();
    }
  }

  private closeToFirstPoint(p: Point) {
    // Don't create a polygon if it has less than 3 points
    if (this.points.length < 2) {
      return false;
    }
    const p1 = this.plotter.transformer.toConcretePoint(this.points[0]);
    const p2 = this.plotter.transformer.toConcretePoint(p);
    if (euclidianDistance2D(p1, p2) <= maxPolygonDist) {
      return true;
    }
    return false;
  }
}
