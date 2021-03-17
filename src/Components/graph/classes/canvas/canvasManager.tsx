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

  /* Returns true if any change to general state is detected */
  getCanvas(): Map<number, object> {
    const files = dataManager.getFiles();
    const present: number[] = [];

    for (const file of files) {
      const id = file.id;
      present.push(id);
      if (!this.canvasIsPresent(id)) {
        this.canvasMap.set(id, this.instanceNewCanvas(id));
      }
    }

    this.canvasMap.forEach((v, k) => {
      if (!present.includes(k)) {
        this.canvasMap.delete(k);
      }
    });

    return this.canvasMap;
  }

  private instanceNewCanvas(id: number): JSX.Element {
    const canvas = <Canvas canvasIndex={id} />;
    return canvas;
  }

  private canvasIsPresent(id: number): boolean {
    return this.canvasMap.has(id);
  }
}

export default CanvasManager.getInstance();
