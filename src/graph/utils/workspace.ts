import {
  File,
  FileID,
  Gate,
  GateID,
  Plot,
  PlotID,
  Population,
  PopulationID,
  Workspace,
} from "graph/resources/types";
import { store } from "redux/store";

export const getWorkspace = (): Workspace => {
  return new ReduxCache().getWorkspace();
};

class ReduxCache {
  static instance: ReduxCache | null = null;
  private workspace: Workspace;

  constructor() {
    if (ReduxCache.instance) {
      return ReduxCache.instance;
    }
    ReduxCache.instance = this;
    this.workspace = store.getState().workspace as Workspace;
    store.subscribe((state: any) => {
      if (!state || !state?.workspace) return;
      this.workspace = state.workspace as Workspace;
    });
  }

  getWorkspace() {
    // TODO FIX CACHING SYNCHRONICITY BROKEN
    return store.getState().workspace;
    // return this.workspace;
  }
}

export const getFile = (fileID: FileID): File => {
  const workspace = getWorkspace();
  const files = workspace.files.filter((file) => file.id === fileID);
  if (files.length === 0) throw Error("File not found");
  if (files.length > 1) throw Error("Multiple files with ID = " + fileID);
  return files[0];
};

export const getPlot = (plotID: PlotID): Plot => {
  const workspace = getWorkspace();
  const plots = workspace.plots.filter((plot) => plot.id === plotID);
  if (plots.length === 0) throw Error("Plot not found");
  if (plots.length > 1) throw Error("Multiple plots with ID = " + plotID);
  return plots[0];
};

export const getPopulation = (populationID: PopulationID): Population => {
  const workspace = getWorkspace();
  const populations = workspace.populations.filter(
    (population) => population.id === populationID
  );
  if (populations.length === 0) throw Error("Population not found");
  if (populations.length > 1)
    throw Error("Multiple populations with ID = " + populationID);
  return populations[0];
};

export const getGate = (gateID: GateID): Gate => {
  const workspace = getWorkspace();
  const gates = workspace.gates.filter((gate) => gate.id === gateID);
  if (gates.length > 1) throw Error("Multiple gates with ID = " + gateID);
  return gates.length > 0 ? gates[0] : null;
};
