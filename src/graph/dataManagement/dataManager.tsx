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
import { FileService } from "services/FileService";
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

class DataManager extends ObserversFunctionality {
  /* 


    ================== PUBLIC ==================
  
  
    */

  // ======== General

  ready(): boolean {
    if (
      this.currentWorkspace === null ||
      this.currentWorkspace === undefined ||
      this.plotRenderers === undefined ||
      this.plotRenderers === null
    ) {
      return false;
    }
    return true;
  }

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
      if (e.id === file.id) {
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
      if (plotGates[indx].gate.id === gateID) {
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
    if (this.letUpdateBeCalledForAutoSave) this.workspaceUpdated();
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
        this.removePlotFromWorkspace(e.id);
      }
    });
    this.currentWorkspace.files.delete(fileID);
  }

  @publishDecorator()
  removeWorkspace() {
    if (this.plotRenderers !== undefined && this.plotRenderers !== null) {
      this.plotRenderers.forEach((e) => {
        delete e.canvas;
        delete e.plotData;
      });
      delete this.plotRenderers;
      this.plotRenderers = new Map();
    }
    this.getAllPlots().map((e) => delete e.plot);
    this.currentWorkspace.plots.clear();
    this.getAllGates().map((e) => delete e.gate);
    this.currentWorkspace.gates.clear();
    this.getAllFiles().map((e) => delete e.file);
    this.currentWorkspace.files.clear();
    delete this.currentWorkspace;
  }

  @updateWorkspaceDecorator()
  @publishDecorator()
  clearWorkspace(keepFiles: boolean = false) {
    if (!keepFiles) {
      delete this.remoteFiles;
      delete this.remoteWorkspaceID;
    }
    this.downloadingFiles = [];
    this.downloaded = [];
    this.redrawPlotIds = [];
    this.removeWorkspace();
    // Clears local storage
    window.localStorage.removeItem(this.lastLocalStorageSave);
    // Clears link shared
    if (window.location.href.includes("?")) {
      window.history.pushState({}, null, window.location.href.split("?")[0]);
    }
    DataManager.resetInstance();
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
    if (this.lastLocalStorageSave !== undefined) {
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

  letUpdateBeCalledForAutoSave = true;

  @publishDecorator()
  workspaceUpdated() {
    this.letUpdateBeCalledForAutoSave = true;
  }

  isRemoteWorkspace() {
    return this.remoteWorkspaceID !== undefined;
  }

  getRemoteWorkspaceID() {
    return this.remoteWorkspaceID;
  }

  dragLock: boolean = false;
  @publishDecorator()
  workspaceDragLock(dragLock?: boolean) {
    if (dragLock !== undefined) {
      this.dragLock = dragLock;
      if (this.dragLock === true) {
        setTimeout(() => this.workspaceDragLock(false), 1000);
      }
    }
    return this.dragLock;
  }

  /* 
  
  
  ================== PRIVATE ==================
  
  
  */
  private static instance: DataManager;
  private loading: boolean = false;
  private remoteWorkspaceID: string;
  private lastLocalStorageSave: string;
  private workspaceIsShared: boolean = false;
  private experimentId: string = "";
  files: any[] = [];
  downloaded: any[] = [];
  downloadingFiles: Array<string> = [];
  downloadHappening: boolean = false;
  redrawPlotIds: Array<string> = [];

  setWorkspaceIsShared(workspaceIsShared: boolean) {
    this.workspaceIsShared = workspaceIsShared;
  }

  getWorkspaceIsShared() {
    return this.workspaceIsShared;
  }

  setExperimentId(experimentId: string) {
    this.experimentId = experimentId;
  }

  getExperimentId() {
    return this.experimentId;
  }

  async downloadFileMetadata() {
    let response: any = await FileService.downloadFileMetadata(
      this.workspaceIsShared,
      this.experimentId
    );
    this.files = response.data.files;
  }

  async downloadFileEvents(fileIds: Array<string>) {
    let downloadedFileIds = this.downloaded.map((x) => x.id);

    let newFileIds = fileIds.filter(
      (x) =>
        !downloadedFileIds.includes(x) && !this.downloadingFiles.includes(x)
    );

    let newDownloadingFileIds = this.downloadingFiles.concat(newFileIds);

    this.updateDownloadingFiles(newDownloadingFileIds);
  }

  @publishDecorator()
  updateDownloaded(data: any) {
    this.downloaded = this.downloaded.concat(data);
  }

  @publishDecorator()
  updateDownloadingFiles(fileIds: Array<string>) {
    this.downloadingFiles = fileIds;
    if (this.downloadingFiles.length > 0 && !this.downloadHappening) {
      let fileId = this.downloadingFiles[0];
      this.downloadFileEvent(fileId);
    }
  }

  async downloadFileEvent(fileId: string) {
    let response;
    try {
      this.downloadHappening = true;
      response = await FileService.downloadFileEvent(
        this.workspaceIsShared,
        fileId,
        this.experimentId
      );
      if (!this.ready()) {
        this.createWorkspace();
      }
      let file = response[0];
      let newFile = new FCSFile({
        name: file.title,
        id: file.id,
        src: "remote",
        axes: file.channels.map((e: any) => e.value),
        data: file.events,
        plotTypes: file.channels.map((e: any) => e.display),
        remoteData: { ...file, events: [] },
      });
      this.addNewFileToWorkspace(newFile);
      this.updateDownloaded(response);
    } catch (e) {
      if (e?.error) snackbarService.showSnackbar(e.error, "error");
      let file = this.files.find((x) => x.id === fileId);
      snackbarService.showSnackbar(
        `in Error download file ${file.label} please try again`,
        "error"
      );
    } finally {
      this.downloadHappening = false;
      this.downloadingFiles.shift();
      this.updateDownloadingFiles(this.downloadingFiles);
    }
    return response;
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
      DataManager.instance.setStandardObservers();
    }
    window.addEventListener("beforeunload", () =>
      DataManager.instance.clearWorkspace()
    );
    return DataManager.instance;
  }

  private static resetInstance() {
    if (DataManager.instance) {
      delete DataManager.instance;
      DataManager.instance = new DataManager();
      DataManager.instance.setStandardObservers();
    }
  }

  private handleRemoteFiles(files: any[]) {
    // const MAX_EVENTS = 4000;
    // for (let i = 0; i < files.length; i++) {
    //   if (files[i].events.length > MAX_EVENTS) {
    //     for (let j = 0; j < files[i].events.length; j++) {
    //       const nindex = Math.floor(Math.random() * files[i].events.length);
    //       const temp = files[i].events[nindex];
    //       files[i].events[nindex] = files[i].events[j];
    //       files[i].events[j] = temp;
    //     }
    //     files[i].events = files[i].events.slice(0, MAX_EVENTS);
    //   }
    // }
    this.remoteFiles = files;
  }

  remoteFiles: any[] = [];
  private loadWorkspaceFilesFromRemote() {
    if (this.remoteWorkspaceID === undefined) {
      throw Error("Cannot load files without a remoteWorkspaceID");
    }
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
    if (this.remoteWorkspaceID !== undefined) {
      this.lastLocalStorageSave += "-" + this.remoteWorkspaceID;
    }
    return this.lastLocalStorageSave;
  }
}

export default DataManager.getInstance();
