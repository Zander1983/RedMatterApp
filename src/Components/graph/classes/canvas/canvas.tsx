/*
  Canvas - A frontend for a canvas component, which includes it's files.
  This exists to facilitate the life of CanvasManager by removing the
  complexities of logic that has to be fed to each canvas.
*/

import FCSFile from "../fcsFile";
import Gate from "../gate/gate";
import MouseInteractor from "../mouseInteractors/mouseInteractor";
import Plotter from "../plotters/plotter";
import ScatterPlotter from "../plotters/scatterPlotter";

/* TypeScript does not deal well with decorators. Your linter might
   indicate a problem with this function but it does not exist */
const conditionalUpdateDecorator = () => {
  return function (
    target: Canvas,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      original.apply(this, args);
      this.conditionalUpdate();
    };
  };
};

class Canvas {
  // Plot params
  xAxis: string;
  yAxis: string;
  changed: boolean = false;
  xPlotType = "lin";
  yPlotType = "lin";

  id: number;
  file: FCSFile;
  mouseInteractor: MouseInteractor;

  // Rendering objects
  plotter: Plotter | null = null;

  // Rendering methods
  // Calling canvas render means the canvas will be redrawn
  canvasRender: Function | null = null;
  // Calling plot render means the component plot will be redrawn
  plotRender: Function | null = null;

  width: number = 0;
  height: number = 0;
  scale: number = 2;

  constructor(file: FCSFile, id: number) {
    this.xAxis = file.axes[0];
    this.yAxis = file.axes[1];
    this.id = id;
    this.file = file;
    this.plotRender = null;

    this.constructPlotter();
    this.contructMouseInteractor();
  }

  private conditionalUpdate() {
    if (this.changed) {
      this.changed = false;
      if (this.plotRender === null || this.canvasRender === null) {
        throw Error("Null renderer for Canvas");
      }
      this.updateAndRenderPlotter();
      this.plotRender();
    }
  }

  updateAndRenderPlotter() {
    this.plotter.xAxis = this.file.getAxisPoints(this.xAxis);
    this.plotter.yAxis = this.file.getAxisPoints(this.yAxis);
    this.plotter.width = this.width;
    this.plotter.height = this.height;
    this.canvasRender();
  }

  setRerender(plotRender: Function) {
    this.plotRender = plotRender;
  }

  setRerenderInterval(rerenderInterval: Function) {
    this.mouseInteractor.setRerenderInterval(rerenderInterval);
  }

  constructPlotter() {
    // This is supposed to have the histograms
    this.plotter =
      // this.xAxis == this.yAxis
      new ScatterPlotter({
        xAxis: this.file.getAxisPoints(this.xAxis),
        yAxis: this.file.getAxisPoints(this.yAxis),
        width: this.width,
        height: this.height,
        scale: this.scale,
      });
    // : // Should have been histogram plotter
    //   new ScatterPlotter({
    //     xAxis: data.x,
    //     yAxis: data.y,
    //     width: this.width,
    //     height: this.height,
    //     scale: this.scale,
    //   });
  }

  contructMouseInteractor() {
    this.mouseInteractor = new MouseInteractor(
      this.createGate,
      this.plotter,
      this.setRerenderingInterval
    );
  }

  createGate(gate: Gate) {
    // wtf now?
  }

  useCanvas(ref: any) {
    const canvas = ref.current;
    const context = canvas.getContext("2d");
    let frameCount = 0;
    let animationFrameId = 0;

    const sendMouseInteraction = (event: Event) => {
      const x = event.offsetX;
      const y = event.offsetY;
      const type = event.type;
      const p = this.plotter.convertToAbstractPoint(x, y);
      this.mouseInteractor.registerMouseEvent(type, p.x, p.y);
    };

    const addCanvasListener = (type: string, func: Function) => {
      if (canvas.getAttribute(`${type}-listener`) !== "true") {
        canvas.addEventListener(type, func);
        canvas.setAttribute(`${type}-listener`, "true");
      }
    };

    addCanvasListener("mousedown", sendMouseInteraction);
    addCanvasListener("mouseup", sendMouseInteraction);
    addCanvasListener("mousemove", sendMouseInteraction);

    this.canvasRender = () => {
      frameCount++;
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width * this.scale;
        canvas.height = height * this.scale;
      }
      this.plotter.draw(context, frameCount);
      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    };

    this.mouseInteractor.setCanvasRender(this.canvasRender);

    this.canvasRender();

    return ref;
  }

  setStopGatingParent(f: Function) {
    this.mouseInteractor.setStopGatingParent(f);
  }

  getCanvas() {
    return (
      <canvas
        style={{
          backgroundColor: "#fff",
          textAlign: "center",
          width: this.width,
          height: this.height,
          borderRadius: 5,
          boxShadow: "1px 3px 4px #bbd",
          flexGrow: 1,
        }}
        ref={canvasRef}
      />
    );
  }

  setOvalGating(value: boolean) {
    value
      ? this.mouseInteractor.ovalGateStart()
      : this.mouseInteractor.ovalGateEnd();
  }

  getFile() {
    return this.file;
  }

  @conditionalUpdateDecorator()
  setWidthAndHeight(w: number, h: number) {
    this.changed = this.changed || this.width != w || this.height != h;
    this.width = w;
    this.height = h;
  }

  @conditionalUpdateDecorator()
  setXAxisPlotType(plotType: string) {
    this.changed = this.changed || this.xPlotType !== plotType;
    this.xPlotType = plotType;
  }

  @conditionalUpdateDecorator()
  setYAxisPlotType(plotType: string) {
    this.changed = this.changed || this.yPlotType !== plotType;
    this.yPlotType = plotType;
  }

  @conditionalUpdateDecorator()
  xAxisToHistogram() {
    this.changed = this.changed || this.yAxis !== this.xAxis;
    this.yAxis = this.xAxis;
  }

  @conditionalUpdateDecorator()
  yAxisToHistogram() {
    this.changed = this.changed || this.yAxis !== this.xAxis;
    this.xAxis = this.yAxis;
  }

  @conditionalUpdateDecorator()
  setXAxis(xAxis: string) {
    this.changed = this.changed || xAxis !== this.xAxis;
    this.xAxis = xAxis;
  }

  @conditionalUpdateDecorator()
  setYAxis(yAxis: string) {
    this.changed = this.changed || yAxis !== this.yAxis;
    this.yAxis = yAxis;
  }
}

export default Canvas;
