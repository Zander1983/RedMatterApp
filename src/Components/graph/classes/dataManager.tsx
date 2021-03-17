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

class DataManager {
  private static instance: DataManager;

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }

    return DataManager.instance;
  }

  private static objId: number = 0;
  files = new Map();
  rerender: Function = () => {};

  setRerendererCallback(rerenderer: Function) {
    this.rerender = rerenderer;
  }

  addFile(file: FCSFile): number {
    const fileId = DataManager.objId;
    console.log("new file with id = ", fileId);
    DataManager.objId++;
    this.files.set(fileId, file);
    this.rerender();
    return fileId;
  }

  removeFile(fileId: number) {
    console.log("delete file with id = ", fileId);
    if (this.files.has(fileId)) {
      this.files.delete(fileId);
      this.rerender();
      return;
    }
    throw Error("File " + fileId.toString() + " was not found");
  }

  getFiles() {
    const files: { file: FCSFile; id: number }[] = [];
    this.files.forEach((v, k) => {
      files.push({ file: v, id: k });
    });
    return files;
  }

  getFile(id: number) {
    return this.files.get(id);
  }
}

export default DataManager.getInstance();
