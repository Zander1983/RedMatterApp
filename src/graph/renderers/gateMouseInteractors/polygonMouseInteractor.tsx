import { euclidianDistance2D } from "../../utils/euclidianPlane";
import GateMouseInteractor, {
  GateState,
  MouseInteractorState,
} from "./gateMouseInteractor";
import ScatterPolygonGatePlotter from "../plotters/runtimePlugins/scatterPolygonGatePlotter";
import ScatterPlotter from "../plotters/scatterPlotter";
import {
  AxisName,
  Point,
  PolygonGate,
  PolygonGate2,
} from "graph/resources/types";
import { getPopulation, getWorkspace } from "graph/utils/workspace";
import { generateColor } from "graph/utils/color";
import { createID } from "graph/utils/id";
import { isPointInsideWithLogicle } from "graph/resources/dataset";
import { getXandYRanges, getXandYRangesFromFile } from "graph/resources/plots";

export const selectPointDist = 15;

export interface PolygonGateState extends GateState {
  points: Point[];
  xAxis: AxisName;
  yAxis: AxisName;
}

export interface PolygonMouseInteractorState extends MouseInteractorState {
  xAxis: AxisName;
  yAxis: AxisName;
}

export default class PolygonMouseInteractor extends GateMouseInteractor {
  static targetGate: PolygonGate;
  static targetPlugin: ScatterPolygonGatePlotter;
  gaterType: "1D" | "2D" = "2D";

  plotter: ScatterPlotter | null = null;
  plugin: ScatterPolygonGatePlotter;

  private points: Point[] = [];
  xAxis: string;
  yAxis: string;
  isDraggingVertex: boolean = false;
  isDraggingGate: boolean = false;
  gatePivot: Point;

  targetEditGate: PolygonGate | null = null;
  targetPointIndex: number | null = null;

  setMouseInteractorState(state: PolygonMouseInteractorState) {
    super.setMouseInteractorState(state);
    this.xAxis = state.xAxis;
    this.yAxis = state.yAxis;
  }
  private validateGateOnSpace(gate: PolygonGate) {
    return (
      gate.xAxis === this.plotter.plot2.xAxis &&
      gate.yAxis === this.plotter.plot2.yAxis &&
      gate.xAxisType === this.plotter.plot2.xPlotType &&
      gate.yAxisType === this.plotter.plot2.yPlotType
    );
  }

  protected detectGatesClicked(mouse: Point) {
    const abstractMouse = this.plotter.transformer.toAbstractPoint(
      { ...mouse },
      true
    );
    this.plotter.gates
      .filter((e) => this.validateGateOnSpace(e as PolygonGate))
      .forEach((gate) => {
        if (
          isPointInsideWithLogicle(
            { gate: gate as PolygonGate, inverseGating: false },
            abstractMouse,
            true
          )
        ) {
          this.isDraggingGate = true;
          this.gatePivot = abstractMouse;
          this.targetEditGate = gate as PolygonGate;
          return;
        }
      });
  }

  protected detectPointsClicked(mouse: Point) {
    this.plotter.gates.forEach((gate) => {
      if (gate.gateType === "polygon" && this.targetEditGate === null)
        gate.points.forEach((p, i) => {
          p = { ...p };
          if (
            this.targetEditGate === null &&
            euclidianDistance2D(
              mouse,
              this.plotter.transformer.toConcretePoint(
                { ...p },
                undefined,
                true
              )
            ) <= selectPointDist
          ) {
            this.targetEditGate = gate;
            this.targetPointIndex = i;
            this.isDraggingVertex = true;
          }
        });
    });
  }

  protected gateMoveToMousePosition(mouse: Point) {
    const workspace = getWorkspace();
    if (workspace.selectedFile === this.plotter.plot2.file) {
      const gatePivot = this.plotter.transformer.toConcretePoint(
        {
          ...this.gatePivot,
        },
        undefined,
        true
      );
      let offset = {
        x: mouse.x - gatePivot.x,
        y: mouse.y - gatePivot.y,
      };
      this.gatePivot = this.plotter.transformer.toAbstractPoint(
        {
          ...mouse,
        },
        true
      );
      const gateState = this.targetEditGate;
      for (let index = 0; index < gateState.points.length; index++) {
        gateState.points[index] = { ...gateState.points[index] };
        gateState.points[index] = this.plotter.transformer.toConcretePoint(
          gateState.points[index],
          undefined,
          true
        );
        gateState.points[index] = {
          x: gateState.points[index].x + offset.x,
          y: gateState.points[index].y + offset.y,
        };
        gateState.points[index] = this.plotter.transformer.toAbstractPoint(
          gateState.points[index],
          true
        );
      }
      let scatterPlotterGate: any = this.plotter.gates.find(
        (x) => x.id == gateState.id
      );
      scatterPlotterGate.points = gateState.points;
      this.gateUpdater(gateState);
    }
  }

  protected pointMoveToMousePosition(mouse: Point) {
    const workspace = getWorkspace();
    if (workspace.selectedFile === this.plotter.plot2.file) {
      const gateState = this.targetEditGate;
      gateState.points[this.targetPointIndex] = {
        ...gateState.points[this.targetPointIndex],
      };
      gateState.points[this.targetPointIndex] =
        this.plotter.transformer.rawAbstractLogicleToLinear(
          this.plotter.transformer.toAbstractPoint(mouse)
        );
      let scatterPlotterGate: any = this.plotter.gates.find(
        (x) => x.id == gateState.id
      );
      scatterPlotterGate.points = gateState.points;
      this.gateUpdater(gateState);
    }
  }

  protected instanceGate2(): PolygonGate2 {
    if (!this.started) return;

    const originalRanges = getXandYRangesFromFile(this.plotter.plot2);
    const newPoints: Point[] = [];
    for (let i = 0; i < this.points.length; i++) {
      let p = { x: this.points[i].x, y: this.points[i].y };
      const a = this.plotter.transformer.toAbstractPoint(p);
      const b = this.plotter.transformer.rawAbstractLogicleToLinear(a);
      newPoints.push({ ...b });
    }
    const newGate: PolygonGate2 = {
      id: createID(),
      name: "New Gate",
      parent: this.plotter.plot2.gateId,
      points: [{ fileId: this.plotter.plot2.file, points: newPoints }],
      gateType: "polygon",
      color: generateColor(),
      xAxis: this.plotter.plot2.xAxis,
      xAxisOriginalRanges: originalRanges.x,
      xAxisType: this.plotter.plot2.xPlotType,
      yAxis: this.plotter.plot2.yAxis,
      yAxisOriginalRanges: originalRanges.y,
      yAxisType: this.plotter.plot2.xPlotType,
    };
    return newGate;
  }

  protected instanceGate(): PolygonGate {
    if (!this.started) return;
    const { points, xAxis, yAxis } = this.getGatingState();
    let originalRanges = getXandYRangesFromFile(this.plotter.plot2);
    // let originalRanges = getXandYRanges(this.plotter.plot);
    const newPoints: Point[] = [];
    for (let i = 0; i < points.length; i++) {
      let p = { x: points[i].x, y: points[i].y };
      const a = this.plotter.transformer.toAbstractPoint(p);
      const b = this.plotter.transformer.rawAbstractLogicleToLinear(a);
      newPoints.push({ ...b });
    }

    // let population = getPopulation(this.plotter.plot.population);
    const newGate: PolygonGate = {
      points: [...newPoints].map((e) => {
        return { ...e };
      }),
      xAxis: xAxis,
      xAxisType: this.plotter.plot2.xPlotType,
      xAxisOriginalRanges: originalRanges.x,
      yAxis: yAxis,
      yAxisType: this.plotter.plot2.yPlotType,
      yAxisOriginalRanges: originalRanges.y,
      parents: [],
      // population && population.gates && population.gates.length > 0
      //   ? [population.gates[0].gate]
      //   : [],
      color: generateColor(),
      gateType: "polygon",
      id: createID(),
      name: "New Gate",
      children: [],
    };
    newGate.points = [...newGate.points].map((e) => {
      return { ...e };
    });
    return newGate;
  }

  setup(plotter: ScatterPlotter) {
    this.plotter = plotter;
    this.plugin = plotter.polygonGatePlugin;
    this.plugin.isGating = true;
  }

  clearGateState() {
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
    this.lastMousePos = this.plugin.lastMousePos = point;
    const isCloseToFirstPoint = this.closeToFirstPoint(point);
    if (type === "mousedown" && !isCloseToFirstPoint) {
      this.points = [...this.points, { ...point }];
    } else if (type === "mousedown") {
      this.createAndAddGate();
      this.createAndAddGate2();
    }
  }

  private closeToFirstPoint(p: Point) {
    // Don't create a polygon if it has less than 3 points
    if (this.points.length < 2) {
      return false;
    }
    if (euclidianDistance2D(this.points[0], p) <= selectPointDist) {
      return true;
    }
    return false;
  }
}
