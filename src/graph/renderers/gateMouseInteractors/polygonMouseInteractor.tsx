import PolygonGate from "../../dataManagement/gate/polygonGate";
import { euclidianDistance2D } from "../../dataManagement/math/euclidianPlane";
import GateMouseInteractor, {
  Point,
  GateState,
  MouseInteractorState,
} from "./gateMouseInteractor";
import ScatterPolygonGatePlotter from "../plotters/runtimePlugins/scatterPolygonGatePlotter";
import ScatterPlotter from "../plotters/scatterPlotter";
import Gate from "graph/dataManagement/gate/gate";

const maxPolygonDist = 15;

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
  isDraggingVertex: boolean = false;
  isDraggingGate: boolean = false;
  gatePivot: Point;

  targetEditGate: PolygonGate | null = null;
  targetPointIndex: number | null = null;

  editGateEvent(type: string, mouse: Point) {
    if (
      type === "mousedown" &&
      this.plotter.gates.length > 0 &&
      !this.isDraggingVertex
    ) {
      console.log("calling detect gates clicked");
      this.detectGatesClicked(mouse);
    }

    if (
      this.targetEditGate === null &&
      type === "mousedown" &&
      !this.started &&
      !this.isDraggingGate
    ) {
      console.log("calling detect points clicked");
      this.detectPointsClicked(mouse);
    } else if (this.targetEditGate !== null && type === "mouseup") {
      // Reset gates and points on mouseup
      console.log("Reset gates and points on mouseup");
      this.reset();
    } else if (
      this.targetEditGate !== null &&
      type === "mousemove" &&
      this.isDraggingVertex &&
      !this.isDraggingGate
    ) {
      // Detect point selected and moved
      console.log("Detect point selected and moved");
      this.pointMoveToMousePosition(mouse);
    } else if (
      this.targetEditGate !== null &&
      type === "mousemove" &&
      this.isDraggingGate &&
      !this.isDraggingVertex
    ) {
      // Detect gate selected and moved
      console.log("Detect gate selected and moved");
      this.gateMoveToMousePosition(mouse);
    }

    if (type === "mouseup" && this.isDraggingVertex)
      this.isDraggingVertex = false;
    else if (type === "mouseup" && this.isDraggingGate)
      this.isDraggingGate = false;
  }

  private detectGatesClicked(mouse: Point) {
    this.plotter.gates.forEach((gate) => {
      if (gate.isPointInside(this.plotter.transformer.toAbstractPoint(mouse))) {
        this.isDraggingGate = true;
        this.gatePivot = this.plotter.transformer.toAbstractPoint(mouse);
        this.targetEditGate = gate as PolygonGate;
        return;
      }
    });
  }

  private detectPointsClicked(mouse: Point) {
    this.plotter.gates.forEach((gate) => {
      if (gate instanceof PolygonGate && this.targetEditGate === null)
        gate.points.forEach((p, i) => {
          if (
            this.targetEditGate === null &&
            euclidianDistance2D(
              mouse,
              this.plotter.transformer.toConcretePoint(
                { ...p },
                undefined,
                false
              )
            ) <= maxPolygonDist
          ) {
            this.targetEditGate = gate;
            this.targetPointIndex = i;
            this.isDraggingVertex = true;
          }
        });
    });
  }

  private gateMoveToMousePosition(mouse: Point) {
    console.log("gatepivot b4", this.gatePivot);
    const gatePivot = this.plotter.transformer.toConcretePoint({
      ...this.gatePivot,
    });
    console.log(mouse, gatePivot);
    let offset = {
      x: mouse.x - gatePivot.x,
      y: mouse.y - gatePivot.y,
    };
    console.log("offset", offset);
    this.gatePivot = this.plotter.transformer.toAbstractPoint({
      ...mouse,
    });
    console.log("gatepivot aft", this.gatePivot);

    const gateState = this.targetEditGate.getState();
    for (let index = 0; index < gateState.points.length; index++) {
      console.log("b4", gateState.points[index]);

      gateState.points[index] = this.plotter.transformer.toConcretePoint(
        gateState.points[index],
        undefined,
        false
      );

      gateState.points[index] = {
        x: gateState.points[index].x + offset.x,
        y: gateState.points[index].y + offset.y,
      };

      gateState.points[index] = this.plotter.transformer.toAbstractPoint(
        gateState.points[index]
      );
      console.log("aft", gateState.points[index]);
    }

    this.targetEditGate.update(gateState);
  }

  private pointMoveToMousePosition(mouse: Point) {
    const gateState = this.targetEditGate.getState();
    gateState.points[this.targetPointIndex] =
      this.plotter.transformer.toAbstractPoint(mouse);
    this.targetEditGate.update(gateState);
  }

  private reset() {
    this.isDraggingVertex = false;
    this.targetEditGate = null;
    this.targetPointIndex = null;
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

  gateEvent(type: string, point: Point) {
    if (!this.started) return;
    const isCloseToFirstPoint = this.closeToFirstPoint(point);
    if (type === "mousedown" && !isCloseToFirstPoint) {
      this.points = [...this.points, point];
    } else if (type === "mousedown") {
      this.createAndAddGate();
    }
  }

  private closeToFirstPoint(p: Point) {
    // Don't create a polygon if it has less than 3 points
    if (this.points.length < 2) {
      return false;
    }
    const p1 = this.plotter.transformer.toConcretePoint(
      { ...this.points[0] },
      undefined,
      false
    );
    const p2 = this.plotter.transformer.toConcretePoint(
      { ...p },
      undefined,
      false
    );
    // console.log(p1, p2);
    if (euclidianDistance2D(p1, p2) <= maxPolygonDist) {
      return true;
    }
    return false;
  }
}
