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
import OvalGate from "graph/dataManagement/gate/ovalGate";

const maxPolygonDist = 10;

export interface PolygonGateState extends GateState {
  points: Point[];
  xAxis: string;
  yAxis: string;
}

export interface PolygonMouseInteractorState extends MouseInteractorState { }

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

  canMove(points: Point[], offset: Point) {
    let canMove = true;
    const bounds = this.plotter.plotData.getXandYRanges();
    for (let i = 0; i < points.length; i++) {
      let x = points[i].x + offset.x;
      let y = points[i].y + offset.y;
      if ((x < bounds.x[0]) || (y < bounds.y[0]) || (x > bounds.x[1]) || (y > bounds.y[1]))
        canMove = false;
    }
    return canMove;
  }

  editGateEvent(type: string, mouse: Point) {

    if (type === "mousedown" && this.plotter.gates.length > 0 && !this.isDraggingVertex) {      
      this.plotter.gates.forEach((gate) => {
        if (gate.isPointInside(this.plotter.transformer.toAbstractPoint(mouse))) {
          this.isDraggingGate = true;
          this.gatePivot = this.plotter.transformer.toAbstractPoint(mouse);
          this.targetEditGate = gate as PolygonGate;
          return;
        }
      });
    }

    if (this.targetEditGate === null && type === "mousedown" && !this.started && !this.isDraggingGate) {      
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
              this.isDraggingVertex = true;
            }
          });
      });
    } else if (this.targetEditGate !== null && type === "mouseup") {
      this.isDraggingVertex = false;
      this.targetEditGate = null;
      this.targetPointIndex = null;
    }

    if (this.targetEditGate !== null && type === "mousemove" && this.isDraggingGate && !this.isDraggingVertex) {
      const absPoint = this.plotter.transformer.toAbstractPoint(mouse);
      const gateState = this.targetEditGate.getState();      

      let offsetX = ((absPoint.x - this.gatePivot.x) / 8.5);
      let offsetY = ((absPoint.y - this.gatePivot.y) / 8.5);

      if (!this.canMove(gateState.points, { x: offsetX, y: offsetY })) {         
        this.isDraggingGate = false;
        return;
      } else{
        for (let index = 0; index < gateState.points.length; index++) {        
          let newX = gateState.points[index].x + offsetX;
          let newY = gateState.points[index].y + offsetY;
          
          gateState.points[index] = { x: newX, y: newY }          
        }
      }
      
      this.targetEditGate.update(gateState);
    }


    if (this.targetEditGate !== null && type === "mousemove" && this.isDraggingVertex && !this.isDraggingGate) {
      const gateState = this.targetEditGate.getState();
      gateState.points[
        this.targetPointIndex
      ] = this.plotter.transformer.toAbstractPoint(mouse);
      this.targetEditGate.update(gateState);
    }    

    if (type === "mouseup" && this.isDraggingVertex)
      this.isDraggingVertex = false;
    else if (type === "mouseup" && this.isDraggingGate)
      this.isDraggingGate = false;
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
