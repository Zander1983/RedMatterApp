import { createID } from "graph/utils/id";
import { FileID, Gate, Population, PopulationGateType, PopulationID } from "./types";


export const createPopulation = ({
  clonePopulation,
  id,
  file,
  subpopFrom
}: {
  clonePopulation?: Population,
  id?: PopulationID,
  file?: FileID,
  subpopFrom?: {
    population: Population,
    gates: PopulationGateType[]
  }
}): Population => {
  let newPopulation: Population = {
    id: "",
    label: "",
    file: "",
    defaultRanges: {},
    defaultAxisPlotTypes: {},
    gates: [],
  };
  
  if (clonePopulation) newPopulation = clonePopulation;
  else if (subpopFrom) {
    newPopulation = subpopFrom.population
    newPopulation.gates = [...subpopFrom.population.gates, ...subpopFrom.gates]
  }
  else if (file) newPopulation.file = file;

  if (id) newPopulation.id = id;
  else newPopulation.id = createID();
  
  if (!newPopulation?.file) {
    throw Error('Population without file')
  }
  return newPopulation;
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
