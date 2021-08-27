import dataManager from "./dataManager";
import FCSFile from "./fcsFile";
import Gate from "./gate/gate";

const DEFAULT_POINT_COLOR = "#000";

export default class PopulationModel {
  static InstanceCount: number = 0;

  readonly id: string;
  label: string = "";
  file: FCSFile;
  defaultRanges: { [index: string]: [number, number] } = {};
  defaultAxisPlotTypes: { [index: string]: string } = {};
  gates: {
    displayOnlyPointsInGate: boolean;
    inverseGating: boolean;
    gate: Gate;
  }[] = [];
  population: {
    gate: Gate;
    inverseGating: boolean;
  }[] = [];

  constructor(id?: string) {
    this.id = id || dataManager.createID();
    this.label = "Plot " + PopulationModel.InstanceCount++;
  }

  getFSCandSSCAxis(): { fsc: number; ssc: number } {
    let hasFSC: null | number = null;
    let hasSSC: null | number = null;
    for (
      let i = 0;
      i < this.file.axes.length && (hasFSC === null || hasSSC === null);
      i++
    ) {
      const axis = this.file.axes[i];
      if (axis.toUpperCase().indexOf("FSC") !== -1) {
        hasFSC = i;
      } else if (axis.toUpperCase().indexOf("SSC") !== -1) {
        hasSSC = i;
      }
    }
    if (hasSSC === null || hasFSC === null) {
      throw Error("FSC or SSC axis not found");
    }
    return { fsc: hasFSC, ssc: hasSSC };
  }

  getAxes() {
    return this.file.axes;
  }

  getState() {
    return {
      id: this.id,
      label: this.label,
      defaultRanges: this.defaultRanges,
      defaultAxisPlotTypes: this.defaultAxisPlotTypes,
      file: this.file,
      gates: this.gates,
      population: this.population,
    };
  }

  setState(state: any) {
    for (const key of Object.keys(state)) {
      if (key in Object.keys(this)) {
        try {
          //@ts-ignore
          this[key] = state[key];
        } catch {}
      }
    }
  }

  initiateAutoSave() {
    if (dataManager.letUpdateBeCalledForAutoSave)
      dataManager.workspaceUpdated();
  }

  createSubpop(inverse: boolean = false) {
    const newGates = this.gates.map((e) => {
      return {
        gate: e.gate,
        inverseGating: inverse,
      };
    });
    const newPopulationModel = new PopulationModel();
    newPopulationModel.setState(this.getState());
    newPopulationModel.gates = [];
    newPopulationModel.population = [
      newGates[newGates.length - 1],
      ...this.population,
    ];
    newPopulationModel.gates = [];
    return newPopulationModel;
  }

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

    this.axisDataCache = null;
  }

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

    this.axisDataCache = null;
  }

  addPopulation(gate: Gate) {
    const gateQuery = this.population.filter((g) => g.gate.id === gate.id);
    if (gateQuery.length > 0) {
      throw Error(
        "Adding the same gate with ID = " + gate.id + " twice to plot"
      );
    }
    this.population.push({
      gate: gate,
      inverseGating: false,
    });

    this.axisDataCache = null;
  }

  removePopulation(gate: Gate) {
    const gateQuery = this.population.filter((g) => g.gate.id === gate.id);
    if (gateQuery.length !== 1) {
      if (gateQuery.length < 1)
        throw Error("Gate with ID = " + gate.id + " was not found");
      if (gateQuery.length > 1) {
        throw Error("Multiple gates with ID = " + gate.id + " were found");
      }
    }
    this.population = this.population.filter((g) => g.gate.id !== gate.id);

    this.axisDataCache = null;
  }

  getGates(): Gate[] {
    return this.gates.map((e) => e.gate);
  }

  getGatesAndPopulation(): Gate[] {
    return [
      ...this.gates.map((e) => e.gate),
      ...this.population.map((e) => e.gate),
    ];
  }

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
    const defaultColor =
      this.population.length === 0
        ? DEFAULT_POINT_COLOR
        : this.population[0].gate.color;
    for (let i = 0; i < allData.length; i++) {
      let ans = { depth: 0, color: defaultColor };
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

  getXandYData(
    targetXAxis?: string,
    targetYAxis?: string
  ): { xAxis: number[]; yAxis: number[] } {
    let xAxis: number[] = [];
    let yAxis: number[] = [];
    this.getAxesData().forEach((e) => {
      xAxis.push(e[targetXAxis]);
      yAxis.push(e[targetYAxis]);
    });
    return { xAxis, yAxis };
  }

  getAxis(targetAxis: string): number[] {
    const data: number[] = [];
    this.getAxesData().forEach((e) => {
      data.push(e[targetAxis]);
    });
    return data;
  }

  private axisDataCache: null | {
    data: any[];
    filterGating: boolean;
    filterPop: boolean;
  } = null;
  getAxesData(filterGating: boolean = true, filterPop: boolean = true): any[] {
    if (
      this.axisDataCache !== null &&
      this.axisDataCache.filterGating === filterGating &&
      this.axisDataCache.filterPop === filterPop
    )
      return this.axisDataCache.data;
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
    if (filterPop) {
      for (const gate of this.population) {
        const x = gate.gate.xAxis;
        const y = gate.gate.yAxis;
        data = data.filter((e: any) => {
          const inside = gate.gate.isPointInside({ x: e[x], y: e[y] });
          return gate.inverseGating ? !inside : inside;
        });
      }
    }
    //@ts-ignore
    this.axisDataCache = { data, filterGating, filterPop };
    return data;
  }

  getAxisData(axis: string): number[] {
    return this.file.getAxisPoints(axis);
  }

  setDefaultRanges() {
    if (
      this.file.axes
        .map((e: string) => e in Object.keys(this.defaultRanges))
        .every((e: boolean) => e)
    )
      return;
    if (this.file === undefined) throw Error("No file found for plot");
    const axesData = this.getAxesData(false, false);

    //@ts-ignore
    Object.values(this.file.axes).forEach((axis: string, i: number) => {
      const axisType = this.file.plotTypes[i];

      this.defaultAxisPlotTypes[axis] = axisType;
      const data = axesData.map((e) => e[axis]);
      const boundaries = this.findRangeBoundries(data);
      this.defaultRanges[axis] = boundaries;
    });
  }

  findRangeBoundries(axisData: number[]): [number, number] {
    let min = axisData[0],
      max = axisData[0];
    for (const p of axisData) {
      min = Math.min(p, min);
      max = Math.max(p, max);
    }
    return [min, max];
  }
}
