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
import Canvas from "../classes/canvas/canvas";
import Gate from "../classes/gate/gate";

const uuid = require("uuid");

class DataManager {
  private static instance: DataManager;

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }

    return DataManager.instance;
  }

  files: Map<string, FCSFile> = new Map();
  canvas: Map<string, Canvas> = new Map();
  gates: Map<string, Gate> = new Map();

  rerender: Function = () => {};
  loading = false;

  getInstanceIDOfNewObject(): string {
    const newObjectInstaceID = uuid.v4();
    return newObjectInstaceID;
  }

  setRerendererCallback(rerenderer: Function) {
    this.rerender = rerenderer;
  }

  addFile(file: FCSFile): string {
    const fileId = this.getInstanceIDOfNewObject();
    this.files.set(fileId, file);
    this.rerender();
    return fileId;
  }

  removeFile(fileId: string) {
    if (this.files.has(fileId)) {
      this.files.delete(fileId);
      this.rerender();
      return;
    }
    throw Error("File " + fileId + " was not found");
  }

  getFiles() {
    const files: { file: FCSFile; id: string }[] = [];
    this.files.forEach((v, k) => {
      files.push({ file: v, id: k });
    });
    return files;
  }

  getFile(fileID: string) {
    return this.files.get(fileID);
  }

  addCanvas(fileID: string) {}

  getAllCanvas(): Map<string, Canvas> {
    const files = this.getFiles();
    const present: string[] = [];

    for (const file of files) {
      present.push(file.id);
      if (!this.canvasIsPresent(file.id)) {
        this.canvas.set(file.id, new Canvas(file.file, file.id));
      }
    }

    this.canvas.forEach((_, k) => {
      if (!present.includes(k)) {
        this.canvas.delete(k);
      }
    });

    return this.canvas;
  }

  getAllGates(): Map<string, Gate> {
    return this.gates;
  }

  addGateToCanvas(gateID: string, canvasID: string) {
    console.log("adding gate ", gateID, " to canvas ", canvasID);
    if (!this.canvasIsPresent(canvasID)) {
      throw Error("Adding gate to non-existent canvas");
    }
    if (!this.gateIsPresent(gateID)) {
      throw Error("Adding non-existent gate to canvas");
    }
    const ccanvas = this.canvas.get(canvasID);
    ccanvas.addGate(this.gates.get(gateID));
  }

  addGate(gate: Gate): string {
    const gateID = this.getInstanceIDOfNewObject();
    gate.setID(gateID);
    this.gates.set(gateID, gate);
    return gateID;
  }

  private canvasIsPresent(id: string): boolean {
    return this.canvas.has(id);
  }

  private gateIsPresent(id: string): boolean {
    return this.gates.has(id);
  }
}

export default DataManager.getInstance();
