/*
  dataManager - Singleton class reponsible for controlling the flow of all data
  on graphs, providing this data to each file and reloading visualization
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
