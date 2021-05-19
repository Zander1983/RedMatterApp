/*
  dataManager - Singleton class reponsible for controlling the flow of all data
  on graphs, providing this data to each file and reloading visualization

  This is the main source of truth, all other classes extract from here the
  exitance or non-existance of any attribute. Any conflicting view with this
  class about the state of the workspace should never be tolerated. Because of 
  this, it's easy load new files from any source, as long as they follow the 
  FCSFile interface, delete, update or save them also.
*/
import FCSFile from "./fcsFile";
import Gate from "./gate/gate";
import PlotData from "graph/dataManagement/plotData";

import ObserversFunctionality, {
  publishDecorator,
} from "./observersFunctionality";
import WorkspaceData from "./workspaceData";
import Plot from "graph/renderers/plotRender";
import LinkReconstructor from "./reconstructors/linkReconstructor";
import axios from "axios";
import { snackbarService } from "uno-material-ui";

const uuid = require("uuid");

type PlotID = string;
type WorkspaceID = string;
type FileID = string;
type GateID = string;

const updateWorkspaceDecorator = () => {
  return function (
    target: DataManager,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const ret = original.apply(this, args);
      //@ts-ignore
      this.updateWorkspace();
      return ret;
    };
  };
};

// const workspaceLoadingOverride = () => {
//   return function (
//     target: DataManager,
//     key: string | symbol,
//     descriptor: PropertyDescriptor
//   ) {
//     const original = descriptor.value;
//     descriptor.value = function (...args: any[]) {
//       //@ts-ignore
//       if (this.loading) {
//         return undefined;
//       }
//       return original.apply(this, args);
//     };
//   };
// };

class DataManager extends ObserversFunctionality {
  /* 


    ================== PUBLIC ==================
  
  
    */

  // ======== General

  createID(): string {
    const newObjectInstaceID = uuid.v4();
    return newObjectInstaceID;
  }

  // ======== Creators
  @publishDecorator()
  createWorkspace(): WorkspaceID {
    this.currentWorkspace = new WorkspaceData();
    return this.currentWorkspace.id;
  }

  @publishDecorator()
  @updateWorkspaceDecorator()
  addNewFileToWorkspace(file: FCSFile): FileID {
    let found: any = null;
    this.currentWorkspace.files.forEach((e) => {
      if (e.name === file.name) {
        found = e.id;
      }
    });
    if (found !== null) return found;
    this.currentWorkspace.files.set(file.id, file);
    return file.id;
  }

  @publishDecorator()
  @updateWorkspaceDecorator()
  addNewGateToWorkspace(gate: Gate): GateID {
    let alreadyPresent = false;
    this.currentWorkspace.gates.forEach((v, k) => {
      if (gate.id === k) alreadyPresent = true;
    });
    if (alreadyPresent) {
      throw Error("Adding a gate that already exists in workspace");
    }
    this.currentWorkspace.gates.set(gate.id, gate);
    return gate.id;
  }

  @publishDecorator()
  @updateWorkspaceDecorator()
  clonePlot(plotID: PlotID, inverse: boolean = false): PlotID {
    return this.createSubpopFromGatesInPlot(plotID, inverse);
  }

  @publishDecorator()
  @updateWorkspaceDecorator()
  addNewPlotToWorkspace(plotData: PlotData): PlotID {
    this.currentWorkspace.plots.set(plotData.id, plotData);
    plotData.setupPlot();
    return plotData.id;
  }

  @publishDecorator()
  @updateWorkspaceDecorator()
  createSubpopFromGatesInPlot(
    plotID: PlotID,
    inverse: boolean = false
  ): PlotID {
    const cplot = this.currentWorkspace.plots.get(plotID);
    return cplot.createSubpop(inverse);
  }

  // ======== Gate-Plot management
  @publishDecorator()
  getPlotRendererForPlot(plotID: PlotID): Plot {
    if (!this.plotRenderers.has(plotID)) {
      this.plotRenderers.set(
        plotID,
        new Plot(this.currentWorkspace.plots.get(plotID))
      );
    }
    return this.plotRenderers.get(plotID);
  }

  @publishDecorator()
  linkGateToPlot(
    plotID: PlotID,
    gateID: GateID,
    forceGatedPoints: boolean = false
  ) {
    if (!this.currentWorkspace.plots.has(plotID)) {
      throw Error("Adding gate to non-existent plot");
    }
    if (!this.currentWorkspace.gates.has(gateID)) {
      throw Error("Adding non-existent gate to plot");
    }
    const cplot = this.currentWorkspace.plots.get(plotID);
    cplot.addGate(this.currentWorkspace.gates.get(gateID), forceGatedPoints);
  }

  @publishDecorator()
  unlinkGateFromPlot(plotID: PlotID, gateID: GateID) {
    if (!this.currentWorkspace.plots.has(plotID)) {
      throw Error("Removing gate to non-existent plot");
    }
    if (!this.currentWorkspace.gates.has(gateID)) {
      throw Error("Removing non-existent gate to plot");
    }
    const plotGates = this.currentWorkspace.plots.get(plotID).gates;
    for (let indx in plotGates) {
      if (plotGates[indx].gate.id == gateID) {
        this.currentWorkspace.plots
          .get(plotID)
          .removeGate(plotGates[indx].gate);
        return;
      }
    }
    throw Error("Gate " + gateID + " was not found in plot " + plotID);
  }

  // ======== Getters
  @publishDecorator()
  updateWorkspace() {
    this.saveWorkspaceToLocalStorage();
  }

  @publishDecorator()
  getWorkspace(): { workspace: WorkspaceData; workspaceID: WorkspaceID } {
    if (this.currentWorkspace === null) {
      this.createWorkspace();
      const linkReconstructor = new LinkReconstructor();
      if (linkReconstructor.canBuildWorkspace()) {
        linkReconstructor.retrieve((workspaceJSON) => {
          this.rebuildWorkspaceFromJson(workspaceJSON);
        });
      } else if (this.canLoadFromLocalStorage() && !this.isRemoteWorkspace()) {
        this.loadWorkspaceFromLocalStorage();
      }
    }
    const id = this.currentWorkspace.id;
    return { workspace: this.currentWorkspace, workspaceID: id };
  }

  @publishDecorator()
  getAllFiles(): { file: FCSFile; fileID: FileID }[] {
    const files: { file: FCSFile; fileID: string }[] = [];
    this.currentWorkspace.files.forEach((v, k) => {
      files.push({ file: v, fileID: k });
    });
    return files;
  }

  @publishDecorator()
  getAllPlots(): { plot: PlotData; plotID: PlotID }[] {
    const plots: { plot: PlotData; plotID: PlotID }[] = [];
    this.currentWorkspace.plots.forEach((v, k) => {
      plots.push({ plot: v, plotID: k });
    });
    return plots;
  }

  @publishDecorator()
  getAllGates(): { gate: Gate; gateID: GateID }[] {
    const gates: { gate: Gate; gateID: GateID }[] = [];
    this.currentWorkspace.gates.forEach((v, k) => {
      gates.push({ gate: v, gateID: k });
    });
    return gates;
  }

  @publishDecorator()
  getFile(fileID: FileID): FCSFile {
    return this.currentWorkspace.files.get(fileID);
  }

  @publishDecorator()
  getPlot(plotID: PlotID): PlotData {
    return this.currentWorkspace.plots.get(plotID);
  }

  @publishDecorator()
  getGate(gateID: GateID): Gate {
    return this.currentWorkspace.gates.get(gateID);
  }

  // ======== Destroyers
  @updateWorkspaceDecorator()
  @publishDecorator()
  removePlotFromWorkspace(plotID: PlotID) {
    if (!this.currentWorkspace.plots.has(plotID)) {
      throw Error("Removing non-existent plot");
    }
    this.plotRenderers.delete(plotID);
    this.currentWorkspace.plots.delete(plotID);
  }

  @updateWorkspaceDecorator()
  @publishDecorator()
  removeGateFromWorkspace(gateID: GateID) {
    if (!this.currentWorkspace.gates.has(gateID)) {
      throw Error("Removing non-existent gate");
    }
    for (const plot of this.getAllPlots()) {
      if (plot.plot.population.map((e: any) => e.gate.id).includes(gateID)) {
        this.removePlotFromWorkspace(plot.plotID);
        continue;
      }
      if (plot.plot.gates.map((e: any) => e.gate.id).includes(gateID)) {
        this.unlinkGateFromPlot(plot.plotID, gateID);
      }
    }
    this.currentWorkspace.gates.delete(gateID);
  }

  @updateWorkspaceDecorator()
  @publishDecorator()
  removeFileFromWorkspace(fileID: FileID) {
    if (!this.currentWorkspace.files.has(fileID)) {
      throw Error("Removing non-existent gate");
    }
    this.currentWorkspace.plots.forEach((e) => {
      if (e.file.id === fileID) {
        throw Error("Removing file currently in use by workspace.");
      }
    });
    this.currentWorkspace.files.delete(fileID);
  }

  @publishDecorator()
  removeWorkspace() {
    this.plotRenderers.forEach((_, k) => this.plotRenderers.delete(k));
    this.currentWorkspace = null;
  }

  @updateWorkspaceDecorator()
  @publishDecorator()
  clearWorkspace() {
    this.removeWorkspace();
    // Clears local storage
    window.localStorage.removeItem(this.lastLocalStorageSave);
    // Clears link shared
    if (window.location.href.includes("?")) {
      window.history.pushState({}, null, window.location.href.split("?")[0]);
    }
    // Creates brand new workspace
    this.createWorkspace();
    // Informs everyone of the change
    this.updateWorkspace();
  }

  // ======== Workspace management
  @publishDecorator()
  loadWorkspace(workspaceJSON: string) {
    if (this.currentWorkspace === null) {
      this.createWorkspace();
    }
    this.currentWorkspace.import(workspaceJSON);
  }

  @publishDecorator()
  getWorkspaceJSON(): string {
    if (this.currentWorkspace === null) {
      throw Error("Can't parse JSON of null workspace.");
    }
    return this.currentWorkspace.export();
  }

  @publishDecorator()
  saveWorkspaceToLocalStorage() {
    const currentWorkspace = this.getWorkspaceJSON();
    if (this.lastLocalStorageSave != undefined) {
      window.localStorage.removeItem(this.lastLocalStorageSave);
    }
    window.localStorage.setItem(
      this.generateLocalStorageName(),
      this.getWorkspaceJSON()
    );
  }

  loadWorkspaceFromLocalStorage() {
    const workspaceJSON = window.localStorage.getItem(
      this.generateLocalStorageName()
    );
    this.rebuildWorkspaceFromJson(workspaceJSON);
  }

  /* 
  =====
  
  TODO IMPLEMENT THESE 3 BELOW!!!!!!! 
  
  =====
  */
  @publishDecorator()
  saveWorkspaceToRemote(url?: string) {}

  setWorkspacePlotMovement(plotMovement: boolean) {
    /**/
  }

  @publishDecorator()
  setWorkspaceLoading(loading: boolean) {
    this.loading = loading;
  }

  isWorkspaceLoading() {
    return this.loading;
  }

  @publishDecorator()
  setWorkspaceID(remoteWorkspaceID: string) {
    this.remoteWorkspaceID = remoteWorkspaceID;
    this.loadWorkspaceFilesFromRemote();
  }

  isRemoteWorkspace() {
    return this.remoteWorkspaceID !== undefined;
  }

  /* 
  
  
  ================== PRIVATE ==================
  
  
  */
  private static instance: DataManager;
  private loading: boolean = false;
  private remoteWorkspaceID: string;
  private lastLocalStorageSave: string;

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
      DataManager.instance.setStandardObservers();
    }

    return DataManager.instance;
  }

  remoteFiles: any[] = [];
  private loadWorkspaceFilesFromRemote() {
    if (this.remoteWorkspaceID === undefined) {
      throw Error("Cannot load files without a remoteWorkspaceID");
    }
    this.setWorkspaceLoading(true);
    axios
      .get("/api/events/" + this.remoteWorkspaceID)
      .then((e) => {
        this.remoteFiles = [e.data];
        this.setWorkspaceLoading(false);
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Could not load your remote files, please try again",
          "error"
        );
      });
  }

  private setStandardObservers() {}

  plotRenderers: Map<string, Plot> = new Map();
  currentWorkspace: WorkspaceData | null = null;

  private rebuildWorkspaceFromJson(workspaceJSON: string) {
    this.loadWorkspace(workspaceJSON);
    this.currentWorkspace.plots.forEach((v) => {
      const newPlot = new Plot(this.currentWorkspace.plots.get(v.id));
      this.plotRenderers.set(v.id, newPlot);
    });
    this.updateWorkspace();
  }

  private canLoadFromLocalStorage() {
    return (
      window.localStorage.getItem(this.generateLocalStorageName()) !== null
    );
  }

  private generateLocalStorageName() {
    this.lastLocalStorageSave = "currentWorkspace";
    if (this.remoteWorkspaceID != undefined) {
      this.lastLocalStorageSave += "-" + this.remoteWorkspaceID;
    }
    return this.lastLocalStorageSave;
  }
}

export default DataManager.getInstance();
