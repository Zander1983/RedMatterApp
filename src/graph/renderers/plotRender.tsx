/*
  Plot - Responsible for keeping all rendering state syncronized.
*/

import dataManager from "graph/dataManagement/dataManager";
import PlotData from "graph/dataManagement/plotData";

import PlotterFactory from "graph/renderers/plotters/plotterFactory";
import GraphPlotter from "graph/renderers/plotters/graphPlotter";
import HistogramPlotter from "graph/renderers/plotters/histogramPlotter";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";

import Canvas from "graph/renderers/canvas";

import Gate from "graph/dataManagement/gate/gate";
import PolygonGate from "graph/dataManagement/gate/polygonGate";
import OvalGate from "graph/dataManagement/gate/ovalGate";

import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";

import MouseInteractor from "graph/renderers/gateMouseInteractors/gateMouseInteractor";
import GateMouseInteractorFactory from "graph/renderers/gateMouseInteractors/gateMouseInteractorFactory";
import OvalMouseInteractor from "graph/renderers/gateMouseInteractors/ovalMouseInteractor";
import PolygonMouseInteractor from "graph/renderers/gateMouseInteractors/polygonMouseInteractor";

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
  plotData: PlotData;
  canvas: Canvas;
  plotRender: Function;
  unsetGating: Function;

  // Mouse interaction objects
  mouseInteractor: MouseInteractor | null = null;
  ovalMouseInteractor: OvalMouseInteractor | null = null;
  polygonMouseInteractor: PolygonMouseInteractor | null = null;

  // Rendering objects
  mouseInteractorPlugin: GatePlotterPlugin | null = null;
  plotter: GraphPlotter | null = null;
  scatterPlotter: ScatterPlotter | null = null;
  histogramPlotter: HistogramPlotter | null = null;

  /*
    This class has a constructor because a plot is individual to a file.
    Existance of a plot can only be on the presence of a file. 
  */
  constructor(plotData: PlotData) {
    this.plotData = plotData;
    this.plotData.addObserver("plotUpdated", () => {
      this.update();
    });

    this.canvas = new Canvas();
  }

  /* Whenever plot data gets updated, this should be called to rerender
     what changed */
  update() {
    // Plot type update
    if (this.plotData.xAxis === this.plotData.yAxis) {
      this.plotter = this.histogramPlotter;
    } else {
      this.plotter = this.scatterPlotter;
    }

    this.draw();
  }

  setup() {
    this.constructPlotters();
    this.plotter = this.scatterPlotter;

    this.setPlotterState();
    this.histogramPlotter.setup(this.canvas.getContext());
    this.scatterPlotter.setup(this.canvas.getContext());

    this.updatePlotter();

    this.contructMouseInteractors();

    setTimeout(() => this.draw(), 100);
  }

  draw() {
    if (!this.validateReady()) return;

    this.setCanvasState();
    this.setPlotterState();

    this.updatePlotter();
    this.canvasRender();

    this.plotter.draw();
  }

  canvasRender() {
    this.canvas.canvasRender();
  }

  setPlotRender(plotRender: Function) {
    this.plotRender = plotRender;
  }

  setPlotData(plotData: PlotData) {
    this.plotData = plotData;
  }

  setGating(type: "Oval" | "Histogram" | "Polygon", start: boolean) {
    if (start) {
      if (type === "Oval") {
        this.ovalMouseInteractor.setMouseInteractorState({
          plotRender: () => {},
          plotID: this.plotData.id,
          yAxis: this.plotData.getYAxisName(),
          xAxis: this.plotData.getXAxisName(),
          canvasRender: () => {
            this.canvasRender();
            this.plotter.draw();
          },
        });
        this.ovalMouseInteractor.setup(this.scatterPlotter);
        this.mouseInteractor = this.ovalMouseInteractor;
      }
      if (type == "Polygon") {
        this.polygonMouseInteractor.setMouseInteractorState({
          plotRender: () => {},
          plotID: this.plotData.id,
          yAxis: this.plotData.getYAxisName(),
          xAxis: this.plotData.getXAxisName(),
          canvasRender: () => {
            this.canvasRender();
            this.plotter.draw();
          },
        });
        this.polygonMouseInteractor.setup(this.scatterPlotter);
        this.mouseInteractor = this.polygonMouseInteractor;
      }
    }
    this.mouseInteractor.unsetGating = this.unsetGating;
    start ? this.mouseInteractor.start() : this.mouseInteractor.end();
  }

  registerMouseEvent(type: string, x: number, y: number) {
    if (this.mouseInteractor === null || this.mouseInteractor === undefined)
      return;

    this.mouseInteractor.registerMouseEvent(type, x, y);
  }

  private validateReady(): boolean {
    if (
      this.plotData.plotWidth != 0 &&
      this.plotData.plotHeight != 0 &&
      this.plotData.plotScale != 0 &&
      this.plotter.drawer != null
    ) {
      return true;
    }
    return false;
  }

  private setCanvasState() {
    const canvasState = {
      id: this.plotData.id,
      width: this.plotData.plotWidth,
      height: this.plotData.plotHeight,
      scale: this.plotData.plotScale,
      plot: this,
    };
    this.canvas.setCanvasState(canvasState);
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
    const data = this.plotData.getXandYData();
    const plotterState = {
      xAxis: data.xAxis,
      yAxis: data.yAxis,
      xAxisName: this.plotData.xAxis,
      yAxisName: this.plotData.yAxis,
      width: this.plotData.plotWidth,
      height: this.plotData.plotHeight,
      scale: this.plotData.plotScale,
      gates: this.plotData.getGates(),
      direction: this.plotData.histogramAxis,
    };
    this.plotter.setPlotterState(plotterState);
  }

  private contructMouseInteractors() {
    this.ovalMouseInteractor = new OvalMouseInteractor();
    this.polygonMouseInteractor = new PolygonMouseInteractor();
    // by default
    this.mouseInteractor = this.ovalMouseInteractor;
  }
}
