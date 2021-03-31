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

/* TypeScript does not deal well with decorators. Your linter might
   indicate a problem with this function but it does not exist 
   
   This is resposible for publishing any data manager call, basically
   a custom listener for state changes, a lot simpler to use than redux*/
const publishDecorator = () => {
  return function (
    target: DataManager,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const ret = original.apply(this, args);
      //@ts-ignore
      this.publish(key);
      return ret;
    };
  };
};

class DataManager {
  private static instance: DataManager;

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }

    return DataManager.instance;
  }

  observers: Map<string, { id: string; func: Function }[]> = new Map();

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

  addObserver(type: string, callback: Function): string {
    const observerID = this.getInstanceIDOfNewObject();
    const observer = { id: observerID, func: callback };
    if (this.observers.has(type)) {
      this.observers.set(type, [...this.observers.get(type), observer]);
    } else {
      this.observers.set(type, [observer]);
    }
    return observerID;
  }

  removeObserver(type: string, id: string) {
    if (this.observers.has(type)) {
      const list = this.observers.get(type);
      const beforeSize = list.length;
      list.filter((observer) => observer.id != id);
      if (beforeSize === list.length) {
        throw Error("Observer not found");
      }
      this.observers.set(type, list);
    } else {
      throw Error("Removing observer from non-existent observing type");
    }
  }

  private publish(type: string) {
    if (!this.observers.has(type)) return;
    this.observers.get(type).forEach((e) => e.func());
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

  createSubpopFile(canvasID: string, inverse: boolean = false) {
    const ccanvas = this.canvas.get(canvasID);
    ccanvas.createSubpop(inverse);
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

  @publishDecorator()
  addGateToCanvas(
    gateID: string,
    canvasID: string,
    createSubpop: boolean = false
  ) {
    if (!this.canvasIsPresent(canvasID)) {
      throw Error("Adding gate to non-existent canvas");
    }
    if (!this.gateIsPresent(gateID)) {
      throw Error("Adding non-existent gate to canvas");
    }
    const ccanvas = this.canvas.get(canvasID);
    ccanvas.addGate(this.gates.get(gateID), createSubpop);
  }

  @publishDecorator()
  removeGateFromCanvas(gateID: string, canvasID: string) {
    if (!this.canvasIsPresent(canvasID)) {
      throw Error("Removing gate to non-existent canvas");
    }
    if (!this.gateIsPresent(gateID)) {
      throw Error("Removing non-existent gate to canvas");
    }
    const canvasGates = this.canvas.get(canvasID).gates;
    let found = -1;
    for (let indx in canvasGates) {
      if (canvasGates[indx].id == gateID) {
        this.canvas.get(canvasID).removeGate(canvasGates[indx].id);
        return;
      }
    }
    throw Error("Gate " + gateID + " was not found in Canvas " + canvasID);
  }

  @publishDecorator()
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
