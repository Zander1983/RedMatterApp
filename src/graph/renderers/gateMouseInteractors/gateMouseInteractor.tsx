import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import {
  Gate,
  Point,
  PolygonGate2,
  WorkspaceEventGateNaming,
} from "graph/resources/types";
import ScatterPlotter from "../plotters/scatterPlotter";
import * as PlotResource from "graph/resources/plots";
import HistogramPlotter from "../plotters/histogramPlotter";
import { createPopulation } from "graph/resources/populations";
import { getPopulation } from "graph/utils/workspace";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import WorkspaceDispatch2 from "graph/workspaceRedux2/workspaceDispatcher";
import EventQueueDispatch from "graph/workspaceRedux/eventQueueDispatchers";
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

  intervalSet: any = null;

  private lastMouseAction: string = "";
  private lastGateUpdate: Date = new Date();
  private lastGateMouseClick: Date = new Date();
  private doubleClickTimeBounds = 500; //ms

  private updateInterval = 20; // miliseconds
  private currentInterval: NodeJS.Timeout = null;
  private latest: Gate | null = null;
  private updateGate: Gate | null = null;

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
    this.plugin.isGating = false;
    this.clearGateState();
    this.setPluginState();
    this.unsetGating();
  }

  unsetGating(noDispatch: boolean = false) {
    this.started = false;
    let plot = this.plotter.plot;
    if (plot.gatingActive !== "" && !noDispatch) {
      plot.gatingActive = "";
      WorkspaceDispatch.UpdatePlot(plot);
    }
  }

  setPluginState() {
    let state = { ...this.getGatingState() };
    this.plugin.setGatingState(state);
  }

  getGatingState(): GateState {
    return {
      lastMousePos: this.lastMousePos,
    };
  }

  protected abstract instanceGate(): Gate;

  protected abstract instanceGate2(): PolygonGate2;
  abstract clearGateState(): void;
  protected abstract gateEvent(type: string, point: Point): void;
  protected abstract detectPointsClicked(mouse: Point): void;
  protected abstract pointMoveToMousePosition(mouse: Point): void;
  protected abstract gateMoveToMousePosition(mouse: Point): void;
  protected abstract detectGatesClicked(mouse: Point): void;

  async createAndAddGate() {
    const gate = this.instanceGate();
    if (gate.gateType === "polygon") {
      gate.name = `${this.plotter.plot.xAxis}, ${this.plotter.plot.yAxis} Subset`;
    } else if (gate.gateType === "histogram") {
      gate.name = `${this.plotter.plot.xAxis} Subset`;
    }

    this.plugin.provisoryGateID = gate.id;
    await WorkspaceDispatch.AddGate({ ...gate });
    let eventGateName: WorkspaceEventGateNaming = {
      id: "",
      plotID: this.plotter.plot.id,
      gateID: gate.id,
      type: "gateNaming",
      used: false,
    };
    await EventQueueDispatch.AddQueueItem(eventGateName);
    this.end();
  }

  async createAndAddGate2() {
    const gate: PolygonGate2 = this.instanceGate2();
    if (gate.gateType === "polygon") {
      gate.name = `polygonGate`;
    } else if (gate.gateType === "histogram") {
      gate.name = `${this.plotter.plot.xAxis} Subset`;
    }
    await WorkspaceDispatch2.AddGate(gate);
    // let eventGateName: WorkspaceEventGateNaming = {
    //   id: "",
    //   plotID: this.plotter.plot2._id,
    //   gateID: gate.id,
    //   type: "gateNaming",
    //   used: false,
    // };
    // await EventQueueDispatch.AddQueueItem(eventGateName);
  }

  async clonePlotWithSelectedGate(gate: Gate) {
    const originPlot = this.plotter.plot;
    let newPopulation = createPopulation({
      clonePopulation: getPopulation(originPlot.population),
      parentPopulationId: originPlot.parentPlotId,
    });
    newPopulation.gates = [
      ...newPopulation.gates,
      { gate: gate.id, inverseGating: false },
    ];
    await WorkspaceDispatch.AddPopulation(newPopulation);
    let newPlot = PlotResource.createPlot({
      clonePlot: originPlot,
      population: newPopulation,
    });
    newPlot.gates = [];
    WorkspaceDispatch.AddPlot(newPlot);
  }

  registerMouseEvent(type: string, x: number, y: number) {
    if (this.plugin === undefined || this.plugin.plotter === undefined) return;
    if (
      type === "mousedown" &&
      this.plugin.provisoryGateID &&
      !this.plugin.isGating
    ) {
      this.plugin.provisoryGateID = null;
    }
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

    if (type === "mousedown" && this.intervalSet !== null) {
      clearTimeout(this.intervalSet);
      this.intervalSet = null;
    }

    const withinDoubleClickBounds =
      new Date().getTime() - this.lastGateMouseClick.getTime() <
      this.doubleClickTimeBounds;

    const foundTarget = this.targetEditGate !== null;
    this.lastMousePos = this.plugin.lastMousePos = mouse;
    if (type === "mousedown" && foundTarget && withinDoubleClickBounds) {
      this.clonePlotWithSelectedGate(this.targetEditGate);
    } else if (
      !foundTarget &&
      type === "mousedown" &&
      !this.started &&
      !this.isDraggingGate
    ) {
      this.detectPointsClicked(mouse);
    } else if (foundTarget && type === "mouseup") {
      this.intervalSet = setTimeout(
        () => this.reset(),
        this.doubleClickTimeBounds
      );
    } else if (
      foundTarget &&
      type === "mousemove" &&
      this.isDraggingVertex &&
      !this.isDraggingGate &&
      this.lastMouseAction !== "mouseup"
    ) {
      this.pointMoveToMousePosition(mouse);
    } else if (
      foundTarget &&
      type === "mousemove" &&
      this.isDraggingGate &&
      !this.isDraggingVertex &&
      this.lastMouseAction !== "mouseup"
    ) {
      this.gateMoveToMousePosition(mouse);
    }

    if (
      type === "mousedown" &&
      this.plotter.gates.length > 0 &&
      !this.isDraggingVertex
    ) {
      this.detectGatesClicked(mouse);
      if (this.targetEditGate !== null) this.lastGateMouseClick = new Date();
    }

    if (type === "mouseup") {
      if (this.isDraggingVertex) this.isDraggingVertex = false;
      else if (type === "mouseup" && this.isDraggingGate) {
        this.isDraggingGate = false;
      }
      if (this.updateGate) {
        WorkspaceDispatch.UpdateGate(this.updateGate);
      }
    }

    if (type !== "mousemove") this.lastMouseAction = type;
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
      this.rerender();
      this.updateGate = gate;
      this.lastGateUpdate = new Date();
    }
  }
}
