import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import { Gate, Point } from "graph/resources/types";
import ScatterPlotter from "../plotters/scatterPlotter";
import * as PlotResource from "graph/resources/plots";
import { getPlot } from "graph/utils/workspace";
import { store } from "redux/store";

export interface GateState {
  lastMousePos: Point;
}

export interface MouseInteractorState {
  plotID: string;
  rerender: Function;
  xAxis: string;
  yAxis: string;
}

export default abstract class GateMouseInteractor {
  started: boolean = false;
  protected plugin: GatePlotterPlugin;
  protected lastMousePos: Point;
  private rerenderLastTimestamp: any = 0;

  plotID: string;
  rerender: Function;
  xAxis: string;
  yAxis: string;
  plotter: ScatterPlotter | null = null;

  setMouseInteractorState(state: MouseInteractorState) {
    this.rerender = state.rerender;
    this.plotID = state.plotID;
    this.xAxis = state.xAxis;
    this.yAxis = state.yAxis;
  }

  setup(plotter: ScatterPlotter) {
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

  unsetGating() {
    this.started = false;
    let plot = this.plotter.plot;
    if (plot.gatingActive !== "") {
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
  protected abstract editGateEvent(type: string, point: Point): void;

  async createAndAddGate() {
    const gate = this.instanceGate();
    //@ts-ignore
    gate.points = [...gate.points].map((e) => {
      return { ...e };
    });
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
    PlotResource.createSubpopPlot(this.plotter.plot, [
      { gate: gate.id, inverseGating: false },
    ]);
    this.end();
  }

  registerMouseEvent(type: string, x: number, y: number) {
    if (this.plugin === undefined || this.plugin.plotter === undefined) return;
    const p = { x, y };
    this.lastMousePos = this.plugin.lastMousePos = p;
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
}
