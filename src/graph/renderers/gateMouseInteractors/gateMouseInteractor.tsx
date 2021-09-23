import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import { Gate, Point } from "graph/resources/types";
import ScatterPlotter from "../plotters/scatterPlotter";
import * as PlotResource from "graph/resources/plots";
import { store } from "redux/store";
import HistogramPlotter from "../plotters/histogramPlotter";

export interface GateState {
  lastMousePos: Point;
}

export interface MouseInteractorState {
  plotID: string;
  rerender: Function;
}

export default abstract class GateMouseInteractor {
  started: boolean = false;
  plugin: GatePlotterPlugin;
  protected lastMousePos: Point;
  private rerenderLastTimestamp: any = 0;
  abstract gaterType: "1D" | "2D";

  plotID: string;
  rerender: Function;
  xAxis: string;
  yAxis: string;
  plotter: ScatterPlotter | HistogramPlotter | null = null;
  isDraggingVertex: boolean = false;
  isDraggingGate: boolean = false;
  gatePivot: Point;

  targetEditGate: Gate | null = null;
  targetPointIndex: number | null = null;

  private lastGateUpdate: Date = new Date();

  private updateInterval = 20; // miliseconds
  private currentInterval: NodeJS.Timeout = null;
  private latest: Gate | null = null;

  setMouseInteractorState(state: MouseInteractorState) {
    this.rerender = state.rerender;
    this.plotID = state.plotID;
  }

  setup(plotter: ScatterPlotter | HistogramPlotter) {
    this.plotter = plotter;
    this.plugin.isGating = true;
  }

  start() {
    this.started = true;
  }

  end() {
    this.clearGateState();
    this.setPluginState();
    this.unsetGating();
  }

  unsetGating(noDispatch: boolean = false) {
    this.started = false;
    let plot = this.plotter.plot;
    if (plot.gatingActive !== "" && !noDispatch) {
      plot.gatingActive = "";
      store.dispatch({
        type: "workspace.UPDATE_PLOT",
        payload: { plot },
      });
    }
  }

  setPluginState() {
    this.plugin.setGatingState(this.getGatingState());
  }

  getGatingState(): GateState {
    return {
      lastMousePos: this.lastMousePos,
    };
  }

  protected abstract instanceGate(): Gate;
  protected abstract clearGateState(): void;
  protected abstract gateEvent(type: string, point: Point): void;
  protected abstract detectPointsClicked(mouse: Point): void;
  protected abstract pointMoveToMousePosition(mouse: Point): void;
  protected abstract gateMoveToMousePosition(mouse: Point): void;
  protected abstract detectGatesClicked(mouse: Point): void;

  async createAndAddGate() {
    const gate = this.instanceGate();
    gate.name = "Unammed gate";
    await store.dispatch({
      type: "workspace.ADD_GATE",
      payload: { gate: { ...gate } },
    });
    let plot = this.plotter.plot;
    plot.gates = [...plot.gates, gate.id];
    plot.gatingActive = "";
    store.dispatch({
      type: "workspace.UPDATE_PLOT",
      payload: { plot },
    });
    let basedOffPlot = { ...this.plotter.plot };
    basedOffPlot.gates = [];
    PlotResource.createSubpopPlot(basedOffPlot, [
      { gate: gate.id, inverseGating: false },
    ]);
    this.end();
  }

  registerMouseEvent(type: string, x: number, y: number) {
    if (this.plugin === undefined || this.plugin.plotter === undefined) return;
    const p = { x, y };
    if (this.plotter != null && this.plotter.gates.length > 0) {
      this.editGateEvent(type, p);
    }

    if (this.started) {
      this.gateEvent(type, p);
      this.setPluginState();
      const now = new Date().getTime();
      if (this.rerenderLastTimestamp + 10 < now) {
        this.rerenderLastTimestamp = now;
        this.rerender();
      }
    }
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

  private reset() {
    this.isDraggingVertex = false;
    this.targetEditGate = null;
    this.targetPointIndex = null;
  }

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
}
