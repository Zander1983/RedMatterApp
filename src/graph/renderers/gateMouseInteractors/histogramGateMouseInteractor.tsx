import { euclidianDistance1D } from "../../utils/euclidianPlane";
import GateMouseInteractor, {
  GateState,
  MouseInteractorState,
} from "./gateMouseInteractor";
import {
  Gate,
  Point,
  HistogramGate,
  AxisName,
  HistogramAxisType,
  PlotType,
} from "graph/resources/types";
import { getPopulation } from "graph/utils/workspace";
import { generateColor } from "graph/utils/color";
import { createID } from "graph/utils/id";
import { isPointInsideInterval } from "graph/resources/dataset";
import HistogramPlotter from "../plotters/histogramPlotter";
import HistogramGatePlotter from "../plotters/runtimePlugins/histogramGatePlotter";

export interface HistogramGateState extends GateState {
  axis: AxisName;
  histogramDirection: HistogramAxisType;
  plotType: PlotType;
  points: number[];
  lastMousePos: Point | null;
}

export interface HistogramGateMouseInteractorState
  extends MouseInteractorState {
  axis: AxisName;
  axisPlotType: PlotType;
  histogramDirection: HistogramAxisType;
}

export const histogramGateEditThreshold = 20;

export default class HistogramGateMouseInteractor extends GateMouseInteractor {
  static targetGate: HistogramGate;
  static targetPlugin: HistogramGatePlotter;

  gaterType: "1D" | "2D" = "1D";

  plotter: HistogramPlotter | null = null;
  plugin: HistogramGatePlotter;

  private points: number[] = [];
  axis: AxisName;
  axisPlotType: PlotType;
  histogramDirection: HistogramAxisType;

  isDraggingVertex: boolean = false;
  isDraggingGate: boolean = false;
  gatePivot: Point;
  targetEditGate: HistogramGate | null = null;
  targetPointIndex: number | null = null;

  setMouseInteractorState(state: HistogramGateMouseInteractorState) {
    super.setMouseInteractorState(state);
    this.axis = state.axis;
    this.axisPlotType = state.axisPlotType;
    this.histogramDirection = state.histogramDirection;
  }

  private validateGateOnSpace(gate: HistogramGate) {
    return (
      gate.axis === this.plotter.plot.xAxis &&
      gate.axisType === this.plotter.plot.xPlotType
    );
  }

  protected detectGatesClicked(mouse: Point) {
    const abstractMouse = this.plotter.transformer.toAbstractPoint(
      { ...mouse },
      true
    );
    this.plotter.gates
      .filter((e) => this.validateGateOnSpace(e as HistogramGate))
      .forEach((gate) => {
        if (
          isPointInsideInterval(
            { gate: gate as HistogramGate, inverseGating: false },
            abstractMouse,
            true
          )
        ) {
          this.isDraggingGate = true;
          this.gatePivot = abstractMouse;
          this.targetEditGate = gate as HistogramGate;
          return;
        }
      });
  }

  protected detectPointsClicked(mouse: Point) {
    const mouseP = mouse.x;
    this.plotter.gates.forEach((gate: Gate) => {
      if (gate.gateType === "histogram" && this.targetEditGate === null)
        (gate as HistogramGate).points.forEach((p, i) => {
          p = this.plotter.transformer.toConcretePoint({ x: p, y: p }).x;
          if (
            this.targetEditGate === null &&
            euclidianDistance1D(p, mouseP) <= histogramGateEditThreshold
          ) {
            this.targetEditGate = gate as HistogramGate;
            this.targetPointIndex = i;
            this.isDraggingVertex = true;
          }
        });
    });
  }

  protected gateMoveToMousePosition(mouse: Point) {
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
    const range = this.plotter.ranges.x;
    // The 1.5 below is a factor to correct for a weird problem on
    // offset calculation which I have no clue why happens
    const abstractOffset =
      (1.5 * offset.x * (range[1] - range[0])) / this.plotter.width;
    for (let index = 0; index < gateState.points.length; index++) {
      const newPos = gateState.points[index] + abstractOffset;
      if (newPos >= this.plotter.rangeMax || newPos <= this.plotter.rangeMin) {
        return;
      }
    }
    for (let index = 0; index < gateState.points.length; index++) {
      gateState.points[index] += abstractOffset;
    }
    this.gateUpdater(gateState);
  }

  protected pointMoveToMousePosition(mouse: Point) {
    const gateState = this.targetEditGate;
    const newPoint = this.plotter.transformer.rawAbstractLogicleToLinear(
      this.plotter.transformer.toAbstractPoint(mouse)
    ).x;
    if (
      newPoint >= this.plotter.rangeMax ||
      newPoint <= this.plotter.rangeMin
    ) {
      return;
    }
    gateState.points[this.targetPointIndex] = newPoint;
    if (gateState.points[0] > gateState.points[1]) {
      gateState.points = gateState.points.reverse() as [number, number];
      this.targetPointIndex = this.targetPointIndex === 0 ? 1 : 0;
    }
    this.gateUpdater(gateState);
  }

  protected instanceGate(): HistogramGate {
    if (!this.started) return;
    const { points, histogramDirection, plotType } = this.getGatingState();
    let originalRange = this.plotter.plot.ranges.x;

    const newPoints: [number, number] = [...points] as [number, number];

    for (let i = 0; i < points.length; i++) {
      let p = { x: points[i], y: points[i] };
      const a = this.plotter.transformer.toAbstractPoint(p);
      const b = this.plotter.transformer.rawAbstractLogicleToLinear(a);
      newPoints[i] = { ...b }.x;
    }

    if (newPoints[0] > newPoints[1]) {
      // swap ints
      newPoints[0] ^= newPoints[1];
      newPoints[1] ^= newPoints[0];
      newPoints[0] ^= newPoints[1];
    }

    const newGate: HistogramGate = {
      points: [...newPoints],
      axis: this.plotter.plot.xAxis,
      axisType: plotType,
      axisOriginalRanges: originalRange,
      histogramDirection,
      parents: getPopulation(this.plotter.plot.population).gates.map(
        (e) => e.gate
      ),
      color: generateColor(),
      gateType: "histogram",
      id: createID(),
      name: "New Gate",
      children: [],
    };
    return newGate;
  }

  setup(plotter: HistogramPlotter) {
    this.plotter = plotter;
    this.plugin = plotter.histogramGatePlugin;
    this.plugin.isGating = true;
  }

  protected clearGateState() {
    this.points = [];
  }

  getGatingState(): HistogramGateState {
    return {
      ...super.getGatingState(),
      points: this.points,
      axis: this.axis,
      histogramDirection: this.histogramDirection,
      lastMousePos: this.lastMousePos,
      plotType: this.axisPlotType,
    };
  }

  gateEvent(type: string, point: Point) {
    if (!this.started) return;
    this.lastMousePos = this.plugin.lastMousePos = point;
    if (type === "mousedown") {
      this.points = [...this.points, point.x];
      if (this.points.length === 2) {
        this.createAndAddGate();
      }
    }
  }
}
