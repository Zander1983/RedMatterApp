import dataManager from "../../dataManagement/dataManager";
import Gate from "../../dataManagement/gate/gate";
import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import ScatterPlotter from "../plotters/scatterPlotter";
import FCSServices from "services/FCSServices/FCSServices";

export interface Point {
  x: number;
  y: number;
}

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
  static targetGate: Gate;
  static targetPlugin: GatePlotterPlugin;

  protected started: boolean = false;
  protected plugin: GatePlotterPlugin;
  protected lastMousePos: Point;
  private rerenderLastTimestamp: any = 0;

  unsetGating: Function;

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
    this.started = false;
    this.clearGateState();
    this.setPluginState();
    this.unsetGating();
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

  createAndAddGate() {
    const gate = this.instanceGate();
    dataManager.addNewGateToWorkspace(gate);
    dataManager.linkGateToPlot(this.plotID, gate.id);
    dataManager.clonePlot(this.plotID);
    this.end();
  }

  registerMouseEvent(type: string, x: number, y: number) {
    if (this.plugin === undefined || this.plugin.plotter === undefined) return;
    const p = this.convertMouseClickToAbstract({ x, y });
    this.lastMousePos = this.plugin.lastMousePos = p;
    if (this.plotter != null && this.plotter.gates.length > 0) {
      this.editGateEvent(type, { x: x, y: y });
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

  private convertMouseClickToAbstract(p: Point): Point {
    p = this.plugin.plotter.transformer.toAbstractPoint(p);
    let ranges = [
      this.plugin.plotter.plotData.linearRanges.get(
        this.plugin.plotter.plotData.xAxis
      ),
      this.plugin.plotter.plotData.linearRanges.get(
        this.plugin.plotter.plotData.yAxis
      ),
    ];
    const fcsService = new FCSServices();
    if (this.plugin.plotter.plotData.xPlotType === "bi") {
      p.x = 1 - (ranges[0][1] - p.x) / (ranges[0][1] - ranges[0][0]);
      p.x = fcsService.logicleInverseMarkTransformer(
        [p.x],
        ranges[0][0],
        ranges[0][1]
      )[0];
    }
    if (this.plugin.plotter.plotData.yPlotType === "bi") {
      p.y = 1 - (ranges[1][1] - p.y) / (ranges[1][1] - ranges[1][0]);
      p.y = fcsService.logicleInverseMarkTransformer(
        [p.y],
        ranges[0][0],
        ranges[0][1]
      )[0];
    }
    return p;
  }
}
