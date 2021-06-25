import PolygonGate from "../../dataManagement/gate/polygonGate";
import { euclidianDistance2D } from "../../dataManagement/math/euclidianPlane";
import GateMouseInteractor, {
  Point,
  GateState,
  MouseInteractorState,
} from "./gateMouseInteractor";
import ScatterPolygonGatePlotter from "../plotters/runtimePlugins/scatterPolygonGatePlotter";
import ScatterPlotter from "../plotters/scatterPlotter";
import { ConsoleSqlOutlined } from "@ant-design/icons";

const maxPolygonDist = 10;

export interface PolygonGateState extends GateState {
  points: Point[];
  xAxis: string;
  yAxis: string;
}

export interface PolygonMouseInteractorState extends MouseInteractorState {}

export default class PolygonMouseInteractor extends GateMouseInteractor {
  static targetGate: PolygonGate;
  static targetPlugin: ScatterPolygonGatePlotter;

  plotter: ScatterPlotter | null = null;
  protected plugin: ScatterPolygonGatePlotter;

  private points: Point[] = [];
  xAxis: string;
  yAxis: string;
  isDragging: boolean = false;

  targetEditGate: PolygonGate | null = null;
  targetPointIndex: number | null = null;
  editGateEvent(type: string, mouse: Point) {
    if (this.targetEditGate === null && type === "mousedown" && !this.started) {
      this.isDragging = true;
    }
    else if (this.targetEditGate === null && type === "mousemove" && !this.started && this.isDragging) {      
      this.plotter.gates.forEach((gate) => {
        if (gate instanceof PolygonGate && this.targetEditGate === null)
          gate.points.forEach((p, i) => {
            if (
              this.targetEditGate === null &&
              euclidianDistance2D(
                mouse,
                this.plotter.transformer.toConcretePoint(p)
              ) <= maxPolygonDist
            ) {
              this.targetEditGate = gate;
              this.targetPointIndex = i;
            }
          });
      });
    } else if (this.targetEditGate !== null && type === "mouseup") {
      this.isDragging = false;
      this.targetEditGate = null;
      this.targetPointIndex = null;
    }
    if (this.targetEditGate !== null && type === "mousemove") {
      const gateState = this.targetEditGate.getState();
      gateState.points[
        this.targetPointIndex
      ] = this.plotter.transformer.toAbstractPoint(mouse);
      this.targetEditGate.update(gateState);
    }
  }

  protected instanceGate(): PolygonGate {
    if (!this.started) return;
    const { points, xAxis, yAxis } = this.getGatingState();

    const checkNotNullOrUndefined = (x: any): void => {
      if (x === null || x === undefined) {
        throw Error("Invalid gate params on instancing");
      }
    };
    checkNotNullOrUndefined(points);
    checkNotNullOrUndefined(xAxis);
    checkNotNullOrUndefined(yAxis);

    const newGate = new PolygonGate({
      points: points,
      xAxis: xAxis,
      yAxis: yAxis,
      parents: this.plotter.plotData.population.map((e) => e.gate),
    });

    for (const gate of this.plotter.plotData.population.map((e) => e.gate)) {
      gate.children.push(newGate);
    }

    return newGate;
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
    if (!this.started) return;
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
