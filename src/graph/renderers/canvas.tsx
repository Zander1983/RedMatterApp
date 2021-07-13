import FCSFile from "graph/dataManagement/fcsFile";
import dataManager from "graph/dataManagement/dataManager";
import Plotter from "graph/renderers/plotters/plotter";
import Plot from "./plotRender";

interface CanvasState {
  id: string;
  width: number;
  height: number;
  scale: number;
  plot: Plot;
}

/*
  Canvas use: 
  1) Instance the canvas
  2) Set canvas state
  3) Call useCanvas() to attach canvas to reference
  4) Call draw()

  You are done!
  
  If you want to update:
  1) Set canvas state
  2) Call draw()
  */
export default class Canvas {
  private context: any | null = null;
  private useCanvasCalled = false;

  canvasRender: Function | null = null;

  id: string;
  width: number = 0;
  height: number = 0;
  scale: number = 2;
  plot: Plot;

  setCanvasState(state: CanvasState) {
    this.id = state.id;
    this.width = state.width;
    this.height = state.height;
    this.scale = state.scale;
    this.plot = state.plot;
  }

  getContext(): any {
    if (this.context === null) {
      throw Error("getContext() can only be called after initialization");
    }
    return this.context;
  }

  render() {}

  setUseCanvasUsed(value: boolean) {
    this.useCanvasCalled = value;
  }

  useCanvas(ref: any) {
    if (this.useCanvasCalled) {
      throw Error(
        "Calling useCanvas twice in the same instance is not allowed."
      );
    }
    this.useCanvasCalled = true;

    const canvas = ref.current;
    const context = canvas.getContext("2d");
    this.context = context;
    let frameCount = 0;
    let animationFrameId = 0;

    const sendMouseInteraction = (event: Event, lock?: boolean) => {
      if (lock !== undefined) dataManager.workspaceDragLock(lock);
      //@ts-ignore
      const x = event.offsetX;
      //@ts-ignore
      const y = event.offsetY;
      const type = event.type;
      this.plot.registerMouseEvent(type, x, y);
    };

    const addCanvasListener = (type: string, func: Function) => {
      if (canvas.getAttribute(`${type}-listener`) !== "true") {
        canvas.addEventListener(type, func);
        canvas.setAttribute(`${type}-listener`, "true");
      }
    };

    addCanvasListener("mousedown", (e: Event) => sendMouseInteraction(e, true));
    addCanvasListener("mouseup", (e: Event) => sendMouseInteraction(e, false));
    addCanvasListener("mousemove", (e: Event) => sendMouseInteraction(e));

    this.canvasRender = () => {
      frameCount++;
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width * this.scale;
        canvas.height = height * this.scale;
      }
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      // canvas is now ready to be drawn on.
      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    };

    this.canvasRender();

    return ref;
  }
}
