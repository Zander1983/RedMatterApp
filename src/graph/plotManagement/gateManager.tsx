import FCSFile from "graph/dataManagement/fcsFile";
import Gate from "graph/dataManagement/gate/gate";
import dataManager from "graph/dataManagement/dataManager";
import Plot from "graph/plotManagement/plot";

export default class GateManager {
  gates: Array<Gate> = [];

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
    const plotState = {};
    this.plot.setPlotState(plotState);
    this.plot.plotRender();
  }

  private conditionalUpdate() {
    if (this.changed) {
      this.changed = false;
      if (this.plotRender === null || this.plotRender === null) {
        throw Error("Null renderer for Plot");
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
    this.plotRender();
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
}
