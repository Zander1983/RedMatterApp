/*
  Plot - A frontend for a canvas component, which includes it's files.
  This exists to facilitate the life of dataManager by removing the
  complexities of logic that has to be fed to each canvas.
*/

import FCSFile from "graph/dataManagement/fcsFile";
import Gate from "graph/dataManagement/gate/gate";
import MouseInteractor from "graph/renderers/gateMouseInteractors/gateMouseInteractor";
import GraphPlotter from "graph/renderers/plotters/graphPlotter";
import HistogramPlotter from "graph/renderers/plotters/histogramPlotter";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";
import dataManager from "graph/dataManagement/dataManager";
import Canvas from "graph/plotManagement/canvas";
import PlotterFactory from "graph/renderers/plotters/plotterFactory";
import GateMouseInteractorFactory from "graph/renderers/gateMouseInteractors/gateMouseInteractorFactory";
import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";

const plotterFactory = new PlotterFactory();
const mouseInteractorFactory = new GateMouseInteractorFactory();

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
  width: number = 0;
  height: number = 0;
  scale: number = 2;

  // Plot essentials
  id: string;
  canvas: Canvas;
  file: FCSFile;
  mouseInteractor: MouseInteractor | null = null;
  mouseInteractorPlugin: GatePlotterPlugin | null = null;

  // Rendering objects
  plotter: GraphPlotter | null = null;
  scatterPlotter: ScatterPlotter | null = null;
  histogramPlotter: HistogramPlotter | null = null;
  histogramAxis: "vertical" | "horizontal" = "vertical";

  // Rendering methods
  // Calling plot render means the component plot will be redrawn
  plotRender: Function | null = null;

  /*
    This class has a constructor because a plot is individual to a file.
    Existance of a plot can only be on the presence of a file. 
  */
  constructor(file: FCSFile, id: string) {
    this.id = id;
    this.file = file;

    this.canvas = new Canvas();
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

  setup() {
    // By default, get the first and second axis as X and Y axis
    this.xAxis = this.file.axes[0];
    this.yAxis = this.file.axes[1];
    this.gates = [];

    this.constructPlotters();
    this.plotter = this.scatterPlotter;

    this.setPlotterState();
    this.histogramPlotter.setup(this.canvas.getContext());
    this.scatterPlotter.setup(this.canvas.getContext());

    this.updatePlotter();

    setTimeout(() => this.draw(), 100);
  }

  draw() {
    this.setCanvasState();
    this.setPlotterState();

    this.updatePlotter();
    this.canvasRender();

    this.plotter.draw();
    this.plotRender();
  }

  canvasRender() {
    this.canvas.canvasRender();
  }

  private conditionalUpdate() {
    if (this.changed) {
      this.changed = false;
      if (this.plotRender === null || this.canvas.canvasRender === null) {
        throw Error("Null renderer for Canvas");
      }
      if (this.xAxis == this.yAxis) {
        this.plotter = this.histogramPlotter;
      } else {
        this.plotter = this.scatterPlotter;
      }
      this.draw();
    }
  }

  setRerender(plotRender: Function) {
    this.plotRender = plotRender;
  }

  addGate(gate: Gate, createSubpop: boolean = false) {
    this.gates.push(gate);
    if (createSubpop) {
      this.createSubpop();
    }
    this.updatePlotter();
  }

  createSubpop(inverse: boolean = false) {
    const subpopfile = this.file.duplicateWithSubpop(this.gates, inverse);
    dataManager.addFile(subpopfile);
  }

  removeGate(gateID: string) {
    this.gates = this.gates.filter((gate) => gate.id !== gateID);
    this.updatePlotter();
  }

  setOvalGating(value: boolean) {
    value ? this.mouseInteractor.start() : this.mouseInteractor.end();
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

  getFile() {
    return this.file;
  }

  private registerMouseEvent(type: string, x: number, y: number) {
    if (this.mouseInteractor === null || this.mouseInteractor === undefined)
      return;

    this.mouseInteractor.registerMouseEvent(type, x, y);
  }

  private setCanvasState() {
    this.canvas.setCanvasState({
      id: this.id,
      width: this.width,
      height: this.height,
      scale: this.scale,
      mouseEventRegister: this.registerMouseEvent,
    });
  }

  private constructPlotters() {
    //@ts-ignore
    this.scatterPlotter = plotterFactory.makePlotter("scatter", ["heatmap"]);
    //@ts-ignore
    this.histogramPlotter = plotterFactory.makePlotter("histogram", []);
  }

  private updatePlotter() {
    this.plotter.update();
  }

  private setPlotterState() {
    /*
      Fills up data to feed all plotters. It's the resposability of a plotter to
      pick only what it needs.
    */
    const plotterState = {
      xAxis: this.file.getAxisPoints(this.xAxis),
      yAxis: this.file.getAxisPoints(this.yAxis),
      xAxisName: this.xAxis,
      yAxisName: this.yAxis,
      width: this.width,
      height: this.height,
      scale: this.scale,
      gates: this.gates,
      direction: this.histogramAxis,
    };
    this.plotter.setPlotterState(plotterState);
  }

  private contructMouseInteractor(type: string) {
    const {
      mouseInteractor,
      plotterPlugin,
    } = mouseInteractorFactory.makeGateMouseInteractor(type);
    this.mouseInteractor = mouseInteractor;
    this.mouseInteractorPlugin = plotterPlugin;
  }

  private setupMouseInteraction(type: string) {
    this.contructMouseInteractor(type);
    /* add the correct plugin */
    /* intialize everything */
  }
}
