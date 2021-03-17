/*
  canvasManager - Singleton class reponsible for controlling specific
  details of each individual plot, as well as assuring that no plot
  is ever re-rendered for no reason. 
  
  This is responsible for receiving changes to an individual plot 
  and then passing those changes to them.
  Changes could include: 
    plot x or y axis; canvas width or height; scatter to histogram;
    histogram to scatter; axis x or y scale (log, lin, logicel) ...

  This works as a right arm to "DataManager", the difference being
  that this is responsible for the practical details of plotting and
  dealing with changes and DataManager is responsible for dealing with
  pure FCSfiles, Gates and other abstract objects.
*/
import dataManager from "../dataManager";
import Canvas from "./canvas";

class CanvasManager {
  private static instance: CanvasManager;

  static getInstance(): CanvasManager {
    if (!CanvasManager.instance) {
      CanvasManager.instance = new CanvasManager();
    }

    return CanvasManager.instance;
  }

  private static objId: number = 0;

  canvasMap = new Map();

  getAllCanvas(): Map<number, Canvas> {
    const files = dataManager.getFiles();
    const present: number[] = [];

    for (const file of files) {
      present.push(file.id);
      if (!this.canvasIsPresent(file.id)) {
        this.canvasMap.set(
          file.id,
          new Canvas(file.file, file.id, this.rerender)
        );
      }
    }

    this.canvasMap.forEach((_, k) => {
      if (!present.includes(k)) {
        this.canvasMap.delete(k);
      }
    });

    return this.canvasMap;
  }

  rerender() {
    dataManager.rerender();
  }

  private canvasIsPresent(id: number): boolean {
    return this.canvasMap.has(id);
  }
}

export default CanvasManager.getInstance();
