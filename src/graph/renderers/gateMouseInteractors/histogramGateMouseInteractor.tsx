import {
  euclidianDistance1D,
  euclidianDistance2D,
} from "../../utils/euclidianPlane";
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
import { getGate, getPopulation } from "graph/utils/workspace";
import { generateColor } from "graph/utils/color";
import { createID } from "graph/utils/id";
import { isPointInsideInterval } from "graph/resources/dataset";
import { store } from "redux/store";
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

export const histogramGateEditThreshold = 7;

export default class HistogramGateMouseInteractor extends GateMouseInteractor {
  static targetGate: HistogramGate;
  static targetPlugin: HistogramGatePlotter;

  gaterType: "1D" | "2D" = "1D";

  plotter: HistogramPlotter | null = null;
  plugin: HistogramGatePlotter;

  private lastGateUpdate: Date = new Date();

  private points: number[] = [];
  axis: AxisName;
  axisPlotType: PlotType;
  histogramDirection: HistogramAxisType;

  isDraggingVertex: boolean = false;
  isDraggingGate: boolean = false;
  gatePivot: Point;
  targetEditGate: HistogramGate | null = null;
  targetPointIndex: number | null = null;

  setPluginState() {
    let state = { ...this.getGatingState() };
    this.plugin.setGatingState(state);
  }

  setMouseInteractorState(state: HistogramGateMouseInteractorState) {
    super.setMouseInteractorState(state);
    this.axis = state.axis;
    this.axisPlotType = state.axisPlotType;
    this.histogramDirection = state.histogramDirection;
  }

  editGateEvent(type: string, mouse: Point) {
    if (this.started) return;
    this.lastMousePos = this.plugin.lastMousePos = mouse;

    if (
      this.targetEditGate === null &&
      type === "mousedown" &&
      !this.started &&
      !this.isDraggingGate
    ) {
      this.detectPointsClicked(mouse);
    } else if (this.targetEditGate !== null && type === "mouseup") {
      this.reset();
    } else if (
      this.targetEditGate !== null &&
      type === "mousemove" &&
      this.isDraggingVertex &&
      !this.isDraggingGate
    ) {
      this.pointMoveToMousePosition(mouse);
    } else if (
      this.targetEditGate !== null &&
      type === "mousemove" &&
      this.isDraggingGate &&
      !this.isDraggingVertex
    ) {
      this.gateMoveToMousePosition(mouse);
    }
    if (
      type === "mousedown" &&
      this.plotter.gates.length > 0 &&
      !this.isDraggingVertex
    ) {
      this.detectGatesClicked(mouse);
    }

    if (type === "mouseup" && this.isDraggingVertex)
      this.isDraggingVertex = false;
    else if (type === "mouseup" && this.isDraggingGate)
      this.isDraggingGate = false;
  }

  private validateGateOnSpace(gate: HistogramGate) {
    return (
      (gate.axis === this.plotter.plot.xAxis &&
        gate.axisType === this.plotter.plot.xPlotType &&
        gate.histogramDirection === "vertical") ||
      (gate.axis === this.plotter.plot.yAxis &&
        gate.axisType === this.plotter.plot.yPlotType &&
        gate.histogramDirection === "horizontal")
    );
  }

  private detectGatesClicked(mouse: Point) {
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

  private detectPointsClicked(mouse: Point) {
    const axis = this.histogramDirection === "vertical" ? "x" : "y";
    const mouseP = mouse[axis];
    this.plotter.gates.forEach((gate: Gate) => {
      if (gate.gateType === "histogram" && this.targetEditGate === null)
        (gate as HistogramGate).points.forEach((p, i) => {
          p = this.plotter.transformer.toConcretePoint({ x: p, y: p })[axis];
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

  private gateMoveToMousePosition(mouse: Point) {
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
    const axis = this.histogramDirection === "vertical" ? "x" : "y";
    const range = this.plotter.ranges[axis];
    // The 1.5 below is a factor to correct for a weird problem on
    // offset calculation which I have no clue why happens
    const abstractOffset =
      ((axis === "y" ? -2 : 1) * 1.5 * offset[axis] * (range[1] - range[0])) /
      this.plotter.width;
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

  private pointMoveToMousePosition(mouse: Point) {
    const gateState = this.targetEditGate;
    const axis = this.histogramDirection === "vertical" ? "x" : "y";
    gateState.points[this.targetPointIndex] =
      this.plotter.transformer.rawAbstractLogicleToLinear(
        this.plotter.transformer.toAbstractPoint(mouse)
      )[axis];
    if (gateState.points[0] > gateState.points[1]) {
      gateState.points = gateState.points.reverse() as [number, number];
      this.targetPointIndex = this.targetPointIndex === 0 ? 1 : 0;
    }
    this.gateUpdater(gateState);
  }

  private reset() {
    this.isDraggingVertex = false;
    this.targetEditGate = null;
    this.targetPointIndex = null;
  }

  private updateInterval = 20; // miliseconds
  private currentInterval: NodeJS.Timeout = null;
  private latest: Gate | null = null;
  protected gateUpdater(gate: Gate, fromTimout: boolean = false) {
    if (fromTimout) this.currentInterval = null;
    if (
      this.lastGateUpdate.getTime() + this.updateInterval >
      new Date().getTime()
    ) {
      if (this.currentInterval === null) {
        const waitUntilCurrentCycleTimesOut =
          this.lastGateUpdate.getTime() +
          this.updateInterval -
          new Date().getTime() +
          1;
        this.currentInterval = setTimeout(
          () => this.gateUpdater(this.latest, true),
          waitUntilCurrentCycleTimesOut
        );
      } else {
        this.latest = gate;
      }
    } else if (gate !== null) {
      store.dispatch({
        type: "workspace.UPDATE_GATE",
        payload: { gate },
      });
      this.lastGateUpdate = new Date();
    }
  }

  protected instanceGate(): HistogramGate {
    if (!this.started) return;
    const { points, axis, histogramDirection, plotType } =
      this.getGatingState();
    let originalRange = this.plotter.plot.ranges[axis];

    const newPoints: [number, number] = [...points] as [number, number];
    for (let i = 0; i < points.length; i++) {
      let p = { x: points[i], y: points[i] };
      const a = this.plotter.transformer.toAbstractPoint(p);
      const b = this.plotter.transformer.rawAbstractLogicleToLinear(a);
      newPoints[i] = { ...b }[histogramDirection === "vertical" ? "x" : "y"];
    }
    if (newPoints[0] > newPoints[1]) {
      newPoints[0] ^= newPoints[1];
      newPoints[1] ^= newPoints[0];
      newPoints[0] ^= newPoints[1];
    }

    const newGate: HistogramGate = {
      points: [...newPoints],
      axis: axis,
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
    const popGates = getPopulation(this.plotter.plot.population).gates.map(
      (e) => e.gate
    );
    for (let gate of popGates) {
      let popGate = getGate(gate);
      popGate.children.push(newGate.id);
      store.dispatch({
        type: "workspace.UPDATE_GATE",
        payload: { gate: popGate },
      });
    }
    return newGate;
  }

  setup(plotter: HistogramPlotter) {
    this.plotter = plotter;
    this.plugin = plotter.histogramGatePlugin;
    this.plugin.isGating = true;
  }

  end() {
    this.plugin.isGating = false;
    super.end();
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
    const axis = this.histogramDirection === "vertical" ? "x" : "y";
    if (type === "mousedown") {
      this.points = [...this.points, point[axis]];
      if (this.points.length === 2) {
        this.createAndAddGate();
      }
    }
  }
}
