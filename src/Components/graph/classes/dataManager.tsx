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
  files: { file: FCSFile; id: number }[] = [];
  rerender: Function = () => {};

  setRerendererCallback(rerenderer: Function) {
    this.rerender = rerenderer;
  }

  addFile(file: FCSFile): number {
    const fileId = DataManager.objId;
    DataManager.objId++;
    this.files.push({ file: file, id: fileId });
    this.rerender();
    console.log("Added file: ", file, " with id: ", fileId);
    return fileId;
  }

  removeFile(fileId: number) {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].id == fileId) {
        this.files.splice(i, 1);
        this.rerender();
      }
    }
    throw Error("File " + fileId.toString() + " was not found");
  }

  getFiles() {
    return this.files;
  }
}

export default DataManager.getInstance();
