/*
  Canvas - A frontend for a canvas component, which includes it's files.
  This exists to facilitate the life of dataManager by removing the
  complexities of logic that has to be fed to each canvas.
*/

import Scatter from "../../../charts/Scatter";
import FCSFile from "../fcsFile";
import Gate from "../gate/gate";
import MouseInteractor from "../mouseInteractors/mouseInteractor";
import HistogramPlotter from "../plotters/histogramPlotter";
import Plotter from "../plotters/plotter";
import ScatterPlotter from "../plotters/scatterPlotter";
import dataManager from "../dataManager";

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
  gates: Array<Gate> = [];

  id: number;
  file: FCSFile;
  mouseInteractor: MouseInteractor;

  // Rendering objects
  plotter: Plotter | null = null;
  scatterPlotter: ScatterPlotter | null = null;
  histogramPlotter: HistogramPlotter | null = null;
  histogramAxis: "vertical" | "horizontal" = "vertical";

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
    this.gates = [];

    this.constructPlotters();
    this.contructMouseInteractor();
  }

  private conditionalUpdate() {
    if (this.changed) {
      this.changed = false;
      if (this.plotRender === null || this.canvasRender === null) {
        throw Error("Null renderer for Canvas");
      }
      if (this.xAxis == this.yAxis) {
        this.plotter = this.histogramPlotter;
      } else {
        this.plotter = this.scatterPlotter;
      }
      this.updateAndRenderPlotter();
      this.plotRender();
      this.mouseInteractor.updateAxis(this.xAxis, this.yAxis);
    }
  }

  updateAndRenderPlotter() {
    this.plotter.xAxis = this.file.getAxisPoints(this.xAxis);
    this.plotter.yAxis = this.file.getAxisPoints(this.yAxis);
    this.plotter.width = this.width;
    this.plotter.height = this.height;
    this.plotter.setGates(this.gates);
    if (this.plotter instanceof ScatterPlotter) {
      this.plotter.xAxisName = this.xAxis;
      this.plotter.yAxisName = this.yAxis;
    } else if (this.plotter instanceof HistogramPlotter) {
      this.plotter.axis = this.histogramAxis;
    }
    this.canvasRender();
  }

  setRerender(plotRender: Function) {
    this.plotRender = plotRender;
  }

  setRerenderInterval(rerenderInterval: Function) {
    this.mouseInteractor.setRerenderInterval(rerenderInterval);
  }

  constructPlotters() {
    this.scatterPlotter = new ScatterPlotter({
      xAxis: this.file.getAxisPoints(this.xAxis),
      yAxis: this.file.getAxisPoints(this.yAxis),
      width: this.width,
      height: this.height,
      scale: this.scale,
      heatmap: true,
      xAxisName: this.xAxis,
      yAxisName: this.yAxis,
    });

    this.histogramPlotter = new HistogramPlotter({
      xAxis: this.file.getAxisPoints(this.xAxis),
      yAxis: this.file.getAxisPoints(this.yAxis),
      width: this.width,
      height: this.height,
      scale: this.scale,
    });

    // By default, it's a scatter
    this.plotter = this.histogramPlotter;
  }

  addGate(gate: Gate) {
    console.log("MAKE GATE CALLED!!!!");
    const subpopfile = this.file.duplicateWithSubpop([gate, ...this.gates]);
    this.gates.push(gate);
    dataManager.addFile(subpopfile);

    this.updateAndRenderPlotter();
  }

  contructMouseInteractor() {
    this.mouseInteractor = new MouseInteractor(this.scatterPlotter, this.id);
    this.mouseInteractor.updateAxis(this.xAxis, this.yAxis);
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
      const p = this.scatterPlotter.convertToAbstractPoint(x, y);
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
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
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
    this.histogramAxis = "vertical";
  }

  @conditionalUpdateDecorator()
  yAxisToHistogram() {
    this.changed = this.changed || this.yAxis !== this.xAxis;
    this.xAxis = this.yAxis;
    this.histogramAxis = "horizontal";
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
