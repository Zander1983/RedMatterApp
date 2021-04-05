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
  canvasID: string;
  canvasRender: Function;
  plugin: GatePlotterPlugin;
}

export default abstract class GateMouseInteractor {
  static targetGate: Gate;
  static targetPlugin: GatePlotterPlugin;

  protected started: boolean = false;
  protected plugin: GatePlotterPlugin;
  protected lastMousePos: Point;
  private canvasRenderLastTimestamp: any = 0;

  canvasID: string;
  canvasRender: Function;

  setMouseInteractorState(state: MouseInteractorState) {
    this.canvasRender = state.canvasRender;
    this.canvasID = state.canvasID;
    this.plugin = state.plugin;
  }

  start() {
    this.started = true;
  }

  end() {
    this.started = false;
    this.clearGateState();
    this.setPluginState();
    this.canvasRender();
  }

  setPluginState() {
    this.plugin.setGatingState(this.getGatingState());
    this.canvasRender();
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
    const id = dataManager.addGate(gate);
    dataManager.addGateToCanvas(id, this.canvasID, true);
    this.end();
  }

  registerMouseEvent(type: string, x: number, y: number) {
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
