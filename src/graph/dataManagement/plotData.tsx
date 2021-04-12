/*
  This is supposed to store all data related to a single plot, including
  rendering params, so that it can be constructed, reconstructed and changed 
  easily.
*/

import { ConsoleSqlOutlined } from "@ant-design/icons";
import dataManager from "./dataManager";
import FCSFile from "./fcsFile";
import Gate from "./gate/gate";
import ObserversFunctionality, {
  publishDecorator,
} from "./observersFunctionality";

/* TypeScript does not deal well with decorators. Your linter might
   indicate a problem with this function but it does not exist */
const conditionalUpdateDecorator = () => {
  return function (
    target: PlotData,
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

export interface PlotDataState {
  id: string;
  xRange: [number, number];
  yRange: [number, number];
  file: FCSFile;
  gates: {
    displayOnlyPointsInGate: boolean;
    gate: Gate;
    inverseGating: boolean;
  }[];
  xAxis: string;
  yAxis: string;
  positionInWorkspace: [number, number];
  plotWidth: number;
  plotHeight: number;
  xPlotType: string;
  yPlotType: string;
  histogramAxis: "horizontal" | "vertical";
}

export default class PlotData extends ObserversFunctionality {
  readonly id: string;
  xRange: [number, number] = [0, 0];
  yRange: [number, number] = [0, 0];
  file: FCSFile;
  gates: {
    displayOnlyPointsInGate: boolean;
    inverseGating: boolean;
    gate: Gate;
  }[] = [];
  xAxis: string = "";
  yAxis: string = "";
  positionInWorkspace: [number, number];
  plotWidth: number = 0;
  plotHeight: number = 0;
  plotScale: number = 2;
  xPlotType: string = "lin";
  yPlotType: string = "lin";
  histogramAxis: "horizontal" | "vertical" = "vertical";

  private changed: boolean = false;

  /* PLOT DATA LIFETIME */

  constructor() {
    super();
    this.id = dataManager.createID();
  }

  setupPlot() {
    if (this.xAxis === "") this.xAxis = this.file.axes[0];
    if (this.yAxis === "") this.yAxis = this.file.axes[1];
  }

  export(): string {
    return JSON.stringify(this.getState());
  }

  import(plotJSON: string) {
    const plot = JSON.parse(plotJSON);
    this.setState(plot);
  }

  /* Every new update should result in this function being called,
     this is the function to be observed, as it is called when new
     updates happen. */
  @publishDecorator()
  plotUpdated() {
    this.changed = false;
  }

  private conditionalUpdate() {
    if (this.changed) {
      this.plotUpdated();
    }
  }

  getState(): PlotDataState {
    return {
      id: this.id,
      xRange: this.xRange,
      yRange: this.xRange,
      file: this.file,
      gates: this.gates,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      positionInWorkspace: this.positionInWorkspace,
      plotWidth: this.plotHeight,
      plotHeight: this.plotWidth,
      xPlotType: this.xPlotType,
      yPlotType: this.yPlotType,
      histogramAxis: this.histogramAxis,
    };
  }

  setState(state: PlotDataState) {
    if (state.xRange !== undefined) this.xRange = state.xRange;
    if (state.yRange !== undefined) this.yRange = state.xRange;
    if (state.file !== undefined) this.file = state.file;
    if (state.gates !== undefined) this.gates = state.gates;
    if (state.xAxis !== undefined) this.xAxis = state.xAxis;
    if (state.yAxis !== undefined) this.yAxis = state.yAxis;
    if (state.positionInWorkspace !== undefined)
      this.positionInWorkspace = state.positionInWorkspace;
    if (state.plotWidth !== undefined) this.plotWidth = state.plotHeight;
    if (state.plotHeight !== undefined) this.plotHeight = state.plotWidth;
    if (state.xPlotType !== undefined) this.xPlotType = state.xPlotType;
    if (state.yPlotType !== undefined) this.yPlotType = state.yPlotType;
    if (state.histogramAxis !== undefined)
      this.histogramAxis = state.histogramAxis;
  }

  /* MULTI PLOT INTERACTION */

  createSubpop(inverse: boolean = false) {
    const newGates = this.gates.map((e) => {
      return {
        displayOnlyPointsInGate: true,
        gate: e.gate,
        inverseGating: inverse,
      };
    });
    const newPlotData = new PlotData();
    newPlotData.setState(this.getState());
    newPlotData.gates = newGates;
    return dataManager.addNewPlotToWorkspace(newPlotData);
  }

  /* ALTER PLOT STATE */

  @publishDecorator()
  addGate(gate: Gate, forceGatedPoints: boolean = false) {
    const gateQuery = this.gates.filter((g) => g.gate.id === gate.id);
    if (gateQuery.length > 0) {
      throw Error(
        "Adding the same gate with ID = " + gate.id + " twice to plot"
      );
    }
    this.gates.push({
      gate: gate,
      displayOnlyPointsInGate: forceGatedPoints,
      inverseGating: false,
    });
    this.plotUpdated();
  }

  @publishDecorator()
  removeGate(gate: Gate) {
    const gateQuery = this.gates.filter((g) => g.gate.id === gate.id);
    if (gateQuery.length !== 1) {
      if (gateQuery.length < 1)
        throw Error("Gate with ID = " + gate.id + " was not found");
      if (gateQuery.length > 1) {
        throw Error("Multiple gates with ID = " + gate.id + " were found");
      }
    }
    this.gates = this.gates.filter((g) => g.gate.id !== gate.id);
    this.plotUpdated();
  }

  getGates(): Gate[] {
    return this.gates.map((e) => e.gate);
  }

  @conditionalUpdateDecorator()
  setWidthAndHeight(w: number, h: number) {
    this.changed = this.changed || this.plotWidth != w || this.plotHeight != h;
    this.plotWidth = w;
    this.plotHeight = h;
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

  /* PLOT STATE GETTERS */

  getXAxisName() {
    return this.xAxis;
  }

  getYAxisName() {
    return this.yAxis;
  }

  getXandYData(): { xAxis: number[]; yAxis: number[] } {
    const xAxisName = this.xAxis;
    const yAxisName = this.yAxis;
    const xAxis: number[] = [];
    const yAxis: number[] = [];
    this.getAxesData().forEach((e) => {
      xAxis.push(e[xAxisName]);
      yAxis.push(e[yAxisName]);
    });
    return { xAxis, yAxis };
  }

  getAxesData(filterGating: boolean = true): any[] {
    let dataAxes: any = {};
    let size;
    for (const axis of this.file.axes) {
      dataAxes[axis] = this.getAxisData(axis);
      if (size !== undefined && dataAxes[axis].length !== size) {
        throw Error("Axes of different size were found");
      } else if (size === undefined) size = dataAxes[axis].length;
    }
    let data = Array(size)
      .fill(0)
      .map((_, i) => {
        const obj: any = {};
        for (const axis of this.file.axes) {
          obj[axis] = dataAxes[axis][i];
        }
        return obj;
      });
    if (filterGating) {
      for (const gate of this.gates) {
        if (gate.displayOnlyPointsInGate) {
          const x = gate.gate.xAxis;
          const y = gate.gate.yAxis;
          data = data.filter((e: any) => {
            const inside = gate.gate.isPointInside({ x: e[x], y: e[y] });
            return gate.inverseGating ? !inside : inside;
          });
        }
      }
    }
    return data;
  }
  private getAxisData(axis: string): number[] {
    return this.file.getAxisPoints(axis);
  }
}
