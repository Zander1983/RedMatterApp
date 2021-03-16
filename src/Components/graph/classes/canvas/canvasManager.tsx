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

  canvas: JSX.Element[] = [];
  rerender: Function = () => {};
}

export default CanvasManager.getInstance();
