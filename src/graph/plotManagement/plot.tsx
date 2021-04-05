/*
  Plot - A frontend for a canvas component, which includes it's files.
  This exists to facilitate the life of dataManager by removing the
  complexities of logic that has to be fed to each canvas.
*/

import FCSFile from "graph/dataManagement/fcsFile";
import Gate from "graph/dataManagement/gate/gate";
import MouseInteractor from "graph/renderers/gateMouseInteractors/gateMouseInteractor";
import HistogramPlotter from "graph/renderers/plotters/histogramPlotter";
import Plotter from "graph/renderers/plotters/plotter";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";
import dataManager from "graph/dataManagement/dataManager";
import Canvas from "graph/plotManagement/canvas";

/* TypeScript does not deal well with decorators. Your linter might
   indicate a problem with this function but it does not exist */
const conditionalUpdateDecorator = () => {
  return function (
    target: Plot,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      original.apply(this, args);
      //@ts-ignore
      this.conditionalUpdate();
    };
  };
};

export default class Plot {
  // Plot params
  xAxis: string;
  yAxis: string;
  changed: boolean = false;
  xPlotType = "lin";
  yPlotType = "lin";
  gates: Array<Gate> = [];
  canvas: Canvas;

  id: string;
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

  constructor(file: FCSFile, id: string) {
    // By default, get the first and second axis as X and Y axis
    this.xAxis = file.axes[0];
    this.yAxis = file.axes[1];
    this.id = id;
    this.file = file;
    this.plotRender = null;
    this.gates = [];

    this.constructPlotters();
    this.contructMouseInteractor();
  }

  draw() {
    const canvasState = {};
    this.canvas.setCanvasState(canvasState);
    this.canvas.canvasRender();
  }

  /*
  general idea behind component lifetimes
  setup
  -> initializer
  -> set initial state
  -> setup

  upkeep
  -> Set component states
  -> Update components

  discard
  -> Dereference the object and that's it
  */

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
    // @ts-ignore
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

  addGate(gate: Gate, createSubpop: boolean = false) {
    this.gates.push(gate);
    if (createSubpop) {
      this.createSubpop();
    }
    this.updateAndRenderPlotter();
  }

  createSubpop(inverse: boolean = false) {
    const subpopfile = this.file.duplicateWithSubpop(this.gates, inverse);
    dataManager.addFile(subpopfile);
  }

  removeGate(gateID: string) {
    this.gates = this.gates.filter((gate) => gate.id !== gateID);
    this.updateAndRenderPlotter();
  }

  contructMouseInteractor() {
    //@ts-ignore
    this.mouseInteractor = new MouseInteractor(this.scatterPlotter, this.id);
    this.mouseInteractor.updateAxis(this.xAxis, this.yAxis);
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
