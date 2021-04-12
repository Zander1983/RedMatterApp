/*
  Should instance every plot with it's correspodent data, should also be able
  to load and save workspaces to json, somehow.
*/

import FCSFile from "./fcsFile";
import Gate from "./gate/gate";
import ObserversFunctionality from "./observersFunctionality";
import PlotData from "./plotData";

export interface WorkspaceState {
  plots: PlotData[];
  workspaceName: string;
  gates: Gate[];
}

export default class WorkspaceData extends ObserversFunctionality {
  id: string;
  workspaceName: string;

  files: Map<string, FCSFile> = new Map();
  plots: Map<string, PlotData> = new Map();
  gates: Map<string, Gate> = new Map();

  setupWorkspace() {
    this.plots.forEach((e) => e.setupPlot());
  }

  export(): string {
    const currentState: any = this.getState();
    currentState.plots = currentState.plots.map((e: PlotData) => e.export());
    return JSON.stringify(currentState);
  }

  import(workspaceJSON: string) {
    const workspace = JSON.parse(workspaceJSON);
    workspace.plots = workspace.plots.map((e: string) => {
      const newPlot = new PlotData();
      newPlot.import(e);
      return newPlot;
    });
    const currentStateAdaptedToInterface: WorkspaceState = workspace;
    this.setState(currentStateAdaptedToInterface);
  }

  setState(state: WorkspaceState) {}

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
