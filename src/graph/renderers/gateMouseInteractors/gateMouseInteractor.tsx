import dataManager from "../../dataManagement/dataManager";
import Gate from "../../dataManagement/gate/gate";
import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";

export interface Point {
  x: number;
  y: number;
}

export interface GateState {
  lastMousePos: Point;
}

export interface MouseInteractorState {
  plotID: string;
  plotRender: Function;
  canvasRender: Function;
}

export default abstract class GateMouseInteractor {
  static targetGate: Gate;
  static targetPlugin: GatePlotterPlugin;

  protected started: boolean = false;
  protected plugin: GatePlotterPlugin;
  protected lastMousePos: Point;
  private canvasRenderLastTimestamp: any = 0;

  unsetGating: Function;

  plotID: string;
  plotRender: Function;
  canvasRender: Function;

  setMouseInteractorState(state: MouseInteractorState) {
    this.plotRender = state.plotRender;
    this.canvasRender = state.canvasRender;
    this.plotID = state.plotID;
  }

  start() {
    this.started = true;
  }

  end() {
    this.started = false;
    this.clearGateState();
    this.setPluginState();
    this.plotRender();
    this.unsetGating();
  }

  setPluginState() {
    this.plugin.setGatingState(this.getGatingState());
    this.plotRender();
  }

  getGatingState(): GateState {
    return {
      lastMousePos: this.lastMousePos,
    };
  }

  protected abstract instanceGate(): Gate;
  protected abstract clearGateState(): void;
  protected abstract gateEvent(type: string, point: Point): void;

  createAndAddGate() {
    const gate = this.instanceGate();
    dataManager.addNewGateToWorkspace(gate);
    dataManager.linkGateToPlot(this.plotID, gate.id);
    dataManager.clonePlot(this.plotID);
    this.end();
  }

  registerMouseEvent(type: string, x: number, y: number) {
    if (this.plugin === undefined || this.plugin.plotter === undefined) return;
    const p = this.plugin.plotter.transformer.toAbstractPoint({ x: x, y: y });
    this.lastMousePos = p;
    if (this.started) {
      this.gateEvent(type, p);
      this.setPluginState();
      const now = new Date().getTime();
      if (this.canvasRenderLastTimestamp + 10 < now) {
        this.canvasRender();
        this.canvasRenderLastTimestamp = now;
      }
    }
  }
}
