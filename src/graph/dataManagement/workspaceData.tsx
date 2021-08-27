/*
  Should instance every plot with it's correspodent data, should also be able
  to load and save workspaces to json, somehow.
*/

import dataManager from "./dataManager";
import FCSFile from "./fcsFile";
import Gate from "./gate/gate";
import ObserversFunctionality from "./observersFunctionality";
import PlotData from "./plotData";
import WorkspaceAssembler from "./reconstructors/workspaceAssembler";

export interface WorkspaceState {
  plots: PlotData[];
  workspaceName: string;
  gates: Gate[];
}

export default class WorkspaceData extends ObserversFunctionality {
  readonly id: string;
  workspaceName: string;

  files: Map<string, FCSFile> = new Map();
  plots: Map<string, PlotData> = new Map();
  gates: Map<string, Gate> = new Map();

  constructor() {
    super();
    this.id = dataManager.createID();
  }

  setupWorkspace() {
    this.plots.forEach((e) => e.setupPlot());
  }

  export(): string {
    const workspaceAssembler = new WorkspaceAssembler();
    return workspaceAssembler.exportWorkspace(this);
  }

  import(workspaceJSON: string) {
    const workspaceAssembler = new WorkspaceAssembler();
    workspaceAssembler.importWorkspace(workspaceJSON, this);
  }

  setState(state: any) {
    this.files = new Map();
    state.files.forEach((e: FCSFile) => {
      this.files.set(e.id, e);
    });
    this.gates = new Map();
    state.gates.forEach((e: Gate) => {
      this.gates.set(e.id, e);
    });
    this.plots = new Map();
    state.plots.forEach((e: PlotData) => {
      this.plots.set(e.id, e);
    });
  }

  getPlotList(): PlotData[] {
    const list: PlotData[] = [];
    this.plots.forEach((v, k) => list.push(v));
    return list;
  }

  getGateList(): Gate[] {
    const list: Gate[] = [];
    this.gates.forEach((v, k) => list.push(v));
    return list;
  }

  getState(): WorkspaceState {
    return {
      plots: this.getPlotList(),
      workspaceName: this.workspaceName,
      gates: this.getGateList(),
    };
  }
}
