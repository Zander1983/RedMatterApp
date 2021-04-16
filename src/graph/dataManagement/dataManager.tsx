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

const uuid = require("uuid");

const workspaceResourcesURL = "https://suckdick.com/workspaces";
const fileResourcesURL = "https://suckdick.com/files";
const gateResourcesURL = "https://suckdick.com/gates";
const plotResourcesURL = "https://suckdick.com/plots";

type PlotID = string;
type WorkspaceID = string;
type FileID = string;
type GateID = string;

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
  addNewFileToWorkspace(file: FCSFile): FileID {
    this.currentWorkspace.files.set(file.id, file);
    return file.id;
  }

  @publishDecorator()
  addNewGateToWorkspace(gate: Gate): GateID {
    this.currentWorkspace.gates.set(gate.id, gate);
    return gate.id;
  }

  @publishDecorator()
  clonePlot(plotID: PlotID, inverse: boolean = false): PlotID {
    return this.createSubpopFromGatesInPlot(plotID, inverse);
  }

  @publishDecorator()
  addNewPlotToWorkspace(plotData: PlotData): PlotID {
    this.currentWorkspace.plots.set(plotData.id, plotData);
    plotData.setupPlot();
    return plotData.id;
  }

  @publishDecorator()
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
    console.log("update workspace");
  }

  @publishDecorator()
  getWorkspace(): { workspace: WorkspaceData; workspaceID: WorkspaceID } {
    if (this.currentWorkspace === null) {
      this.createWorkspace();
      const linkReconstructor = new LinkReconstructor();
      linkReconstructor.retrieve((workspaceJSON) => {
        this.loadWorkspace(workspaceJSON);
        this.currentWorkspace.plots.forEach((v) => {
          const newPlot = new Plot(this.currentWorkspace.plots.get(v.id));
          this.plotRenderers.set(v.id, newPlot);
        });
        this.updateWorkspace();
      });
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
  @publishDecorator()
  removePlotFromWorkspace(plotID: PlotID) {
    if (!this.currentWorkspace.plots.has(plotID)) {
      throw Error("Removing non-existent plot");
    }
    this.plotRenderers.delete(plotID);
    this.currentWorkspace.plots.delete(plotID);
  }

  @publishDecorator()
  removeGateFromWorkspace(gateID: GateID) {}
  @publishDecorator()
  removeFileFromWorkspace(fileID: FileID) {}
  @publishDecorator()
  removeWorkspace() {}

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
  saveWorkspaceToLocalStorage(workspaceID: WorkspaceID) {}

  @publishDecorator()
  saveWorkspaceToRemote(workspace: WorkspaceID, url?: string) {}

  /* 

  
    ================== PRIVATE ==================
  
  
    */
  private static instance: DataManager;

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
      DataManager.instance.setStandardObservers();
    }

    return DataManager.instance;
  }

  private setStandardObservers() {}

  plotRenderers: Map<string, Plot> = new Map();
  currentWorkspace: WorkspaceData | null = null;
}

export default DataManager.getInstance();
