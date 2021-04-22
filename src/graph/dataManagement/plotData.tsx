/*
  This is supposed to store all data related to a single plot, including
  rendering params, so that it can be constructed, reconstructed and changed 
  easily.
*/

import staticFileReader from "graph/components/modals/staticFCSFiles/staticFileReader";
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

const DEFAULT_COLOR = "#000";

export interface PlotDataState {
  id: string;
  ranges: Map<string, [number, number]>;
  file: FCSFile;
  gates: {
    gate: Gate;
    displayOnlyPointsInGate: boolean;
    inverseGating: boolean;
  }[];
  population: {
    gate: Gate;
    inverseGating: boolean;
  }[];
  xAxis: string;
  yAxis: string;
  positionInWorkspace: [number, number];
  plotWidth: number;
  plotHeight: number;
  plotScale: number;
  xPlotType: string;
  yPlotType: string;
  histogramAxis: "horizontal" | "vertical";
}

export default class PlotData extends ObserversFunctionality {
  readonly id: string;
  ranges: Map<string, [number, number]> = new Map();
  file: FCSFile;
  gates: {
    displayOnlyPointsInGate: boolean;
    inverseGating: boolean;
    gate: Gate;
  }[] = [];
  population: {
    gate: Gate;
    inverseGating: boolean;
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
    // this.findAllRanges();
    this.updateGateObservers();
  }

  export(): string {
    const state: any = this.getState();
    state.file = "local://" + state.file.name;
    return JSON.stringify(state);
  }

  import(plotJSON: string) {
    const plot = JSON.parse(plotJSON);
    if (plot.file.split("://")[0] === "local") {
      const file = staticFileReader(plot.file.split("://")[1]);
      const id = dataManager.addNewFileToWorkspace(file);
      plot.file = dataManager.getFile(id);
    }
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
      ranges: this.ranges,
      file: this.file,
      gates: this.gates,
      population: this.population,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      positionInWorkspace: this.positionInWorkspace,
      plotWidth: this.plotHeight,
      plotHeight: this.plotWidth,
      plotScale: this.plotScale,
      xPlotType: this.xPlotType,
      yPlotType: this.yPlotType,
      histogramAxis: this.histogramAxis,
    };
  }

  setState(state: PlotDataState) {
    if (state.ranges !== undefined) this.ranges = state.ranges;
    if (state.file !== undefined) this.file = state.file;
    if (state.gates !== undefined) this.gates = state.gates;
    if (state.xAxis !== undefined) this.xAxis = state.xAxis;
    if (state.yAxis !== undefined) this.yAxis = state.yAxis;
    if (state.positionInWorkspace !== undefined)
      this.positionInWorkspace = state.positionInWorkspace;
    if (state.plotWidth !== undefined) this.plotWidth = state.plotHeight;
    if (state.plotHeight !== undefined) this.plotHeight = state.plotHeight;
    if (state.plotScale !== undefined) this.plotScale = state.plotScale;
    if (state.xPlotType !== undefined) this.xPlotType = state.xPlotType;
    if (state.yPlotType !== undefined) this.yPlotType = state.yPlotType;
    if (state.histogramAxis !== undefined)
      this.histogramAxis = state.histogramAxis;
  }

  /* MULTI PLOT INTERACTION */

  createSubpop(inverse: boolean = false) {
    const newGates = this.gates.map((e) => {
      return {
        gate: e.gate,
        inverseGating: inverse,
      };
    });
    const newPlotData = new PlotData();
    newPlotData.setState(this.getState());
    newPlotData.population = [...newGates, ...this.population];
    newPlotData.gates = [];
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

    this.updateGateObservers();
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

    this.updateGateObservers();
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

  getPointColors() {
    const allData = this.getAxesData(false);
    const colors: string[] = [];
    const isPointInside = (gate: any, point: number[]): boolean => {
      const p = {
        x: point[gate.gate.xAxis],
        y: point[gate.gate.yAxis],
      };
      return gate.gate.isPointInside(p)
        ? !gate.inverseGating
        : gate.inverseGating;
    };
    const gateDFS = (
      point: number[],
      gate: any,
      currentDepth: number
    ): { depth: number; color: string | null } => {
      if (!isPointInside(gate, point)) {
        return { depth: 0, color: null };
      }
      let ans = { depth: currentDepth, color: gate.gate.color };
      for (const child of gate.gate.children) {
        const cAns = gateDFS(
          point,
          { gate: child, inverseGating: false },
          currentDepth + 1
        );
        if (cAns.color !== null && cAns.depth > ans.depth) {
          ans = cAns;
        }
      }
      return ans;
    };
    for (let i = 0; i < allData.length; i++) {
      let ans = { depth: 0, color: DEFAULT_COLOR };
      for (const gate of this.gates) {
        const cAns = gateDFS(allData[i], gate, 1);
        if (cAns.color !== null && cAns.depth > ans.depth) {
          ans = cAns;
        }
      }
      colors.push(ans.color);
    }
    return colors;
  }

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

  getXandYRanges(): { x: [number, number]; y: [number, number] } {
    if (
      this.ranges.constructor.name !== "Map" ||
      !this.ranges.has(this.xAxis) ||
      !this.ranges.has(this.yAxis)
    ) {
      this.findAllRanges();
    }
    return { x: this.ranges.get(this.xAxis), y: this.ranges.get(this.yAxis) };
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
    for (const gate of this.population) {
      const x = gate.gate.xAxis;
      const y = gate.gate.yAxis;
      data = data.filter((e: any) => {
        const inside = gate.gate.isPointInside({ x: e[x], y: e[y] });
        return gate.inverseGating ? !inside : inside;
      });
    }
    return data;
  }

  private gateObservers: { observerID: string; targetGateID: string }[] = [];
  private updateGateObservers() {
    this.updateGateObserversFromList(this.gates);
    this.updateGateObserversFromList(this.population);
  }

  private updateGateObserversFromList(targetList: any[]) {
    const gateIds = targetList.map((obj) => obj.gate.id);
    const obsIds = this.gateObservers.map((obj) => obj.targetGateID);
    const toAdd = gateIds.filter((g) => !obsIds.includes(g));
    const toRemove = obsIds.filter((g) => !gateIds.includes(g));
    toAdd.forEach((e) => {
      const obsID = dataManager.getGate(e).addObserver("update", () => {
        this.plotUpdated();
      });
      this.gateObservers.push({ observerID: obsID, targetGateID: e });
    });
    toRemove.forEach((e) => {
      dataManager
        .getGate(e)
        .removeObserver(
          "update",
          this.gateObservers.filter((g) => g.targetGateID === e)[0].observerID
        );
      this.gateObservers = this.gateObservers.filter(
        (g) => g.targetGateID === e
      );
    });
  }

  private getAxisData(axis: string): number[] {
    return this.file.getAxisPoints(axis);
  }

  private findAllRanges() {
    if (typeof this.ranges === "object") {
      this.ranges = new Map();
    }
    if (this.file.name == "erica1") {
      this.ranges.set("FSC-A", [0, 262144]);
      this.ranges.set("SSC", [0, 262144]);
      this.ranges.set("Comp-FITC-A - CD7", [0, 1]);
      this.ranges.set("Comp-PE-A - CD3", [0, 1]);
      this.ranges.set("Comp-APC-A - CD45", [0, 1]);
      this.ranges.set("Time", [0, 1]);
      return;
    }
    const axesData = this.getAxesData();
    for (const axis of this.file.axes) {
      if (this.ranges.has(axis)) continue;
      const data = axesData.map((e) => e[axis]);
      this.ranges.set(axis, this.findRangeBoundries(data));
    }
  }

  private findRangeBoundries(axisData: number[]): [number, number] {
    let min = axisData[0],
      max = axisData[0];
    for (const p of axisData) {
      min = Math.min(p, min);
      max = Math.max(p, max);
    }
    const d = Math.max(max - min, 1e-10);
    return [min, max];
  }
}
