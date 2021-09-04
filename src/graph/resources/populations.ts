import { createID } from "graph/utils/id";
import { getFile } from "graph/utils/workspace";
import { store } from "redux/store";
import { getDataset } from "./dataset";
import {
  FileID,
  Gate,
  GateID,
  Population,
  PopulationGateType,
  PopulationID,
} from "./types";

const commitPopulationChange = (population: Population) => {
  store.dispatch({
    type: "workspace.UPDATE_POPULATION",
    payload: { population },
  });
};

export const createPopulation = ({
  clonePopulation,
  id,
  file,
  subpopFrom,
}: {
  clonePopulation?: Population;
  id?: PopulationID;
  file?: FileID;
  subpopFrom?: {
    population: Population;
    gates: PopulationGateType[];
  };
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
    newPopulation = subpopFrom.population;
    newPopulation.gates = [...subpopFrom.population.gates, ...subpopFrom.gates];
  } else if (file) newPopulation.file = file;

  if (id) newPopulation.id = id;
  else newPopulation.id = createID();

  if (!newPopulation?.file) {
    throw Error("Population without file");
  }
  return newPopulation;
};

export const createSubpop = (
  pop: Population,
  newGates: GateID[],
  inverse: boolean = false
) => {
  let newPop = createPopulation({ clonePopulation: pop });
  newPop.gates = [
    ...newPop.gates,
    ...newGates.map((e: GateID) => {
      return {
        //@ts-ignore
        gate: e,
        inverseGating: inverse,
      } as PopulationGateType;
    }),
  ];
  return newPop;
};

export const addGate = (pop: Population, gate: GateID) => {
  pop.gates.push({
    gate: gate,
    inverseGating: false,
  });
  commitPopulationChange(pop);
};

export const removeGate = (pop: Population, gate: GateID) => {
  pop.gates = pop.gates.filter((e) => e.gate !== gate);
  commitPopulationChange(pop);
};

//TODO

// export const getPointColors = (pop: Population) => {
//   const file = getFile(pop.file);
//   const allData = getDataset({
//     file: file,
//     requestedAxes: file.axes,
//     requestedPlotTypes: file.axes.map(() => "lin"),
//     requestedPop: pop.gates,
//   });
//   const colors: string[] = [];
//   const isPointInside = (gate: any, point: number[]): boolean => {
//     const p = {
//       x: point[gate.gate.xAxis],
//       y: point[gate.gate.yAxis],
//     };
//     return gate.gate.isPointInside(p)
//       ? !gate.inverseGating
//       : gate.inverseGating;
//   };
//   const gateDFS = (
//     point: number[],
//     gate: any,
//     currentDepth: number
//   ): { depth: number; color: string | null } => {
//     if (!isPointInside(gate, point)) {
//       return { depth: 0, color: null };
//     }
//     let ans = { depth: currentDepth, color: gate.gate.color };
//     for (const child of gate.gate.children) {
//       const cAns = gateDFS(
//         point,
//         { gate: child, inverseGating: false },
//         currentDepth + 1
//       );
//       if (cAns.color !== null && cAns.depth > ans.depth) {
//         ans = cAns;
//       }
//     }
//     return ans;
//   };
//   const defaultColor =
//     pop.gates.length === 0 ? "#000" : pop.population[0].gate.color;
//   for (let i = 0; i < allData.length; i++) {
//     let ans = { depth: 0, color: defaultColor };
//     for (const gate of pop.gates) {
//       const cAns = gateDFS(allData[i], gate, 1);
//       if (cAns.color !== null && cAns.depth > ans.depth) {
//         ans = cAns;
//       }
//     }
//     colors.push(ans.color);
//   }
//   return colors;
// };

// export const getAxesData = (
//   pop: Population,
//   filterGating: boolean = true,
//   filterPop: boolean = true
// ): any[] => {
//   let dataAxes: any = {};
//   let size;
//   for (const axis of pop.file.axes) {
//     dataAxes[axis] = pop.getAxisData(axis);
//     if (size !== undefined && dataAxes[axis].length !== size) {
//       throw Error("Axes of different size were found");
//     } else if (size === undefined) size = dataAxes[axis].length;
//   }
//   let data = Array(size)
//     .fill(0)
//     .map((_, i) => {
//       const obj: any = {};
//       for (const axis of pop.file.axes) {
//         obj[axis] = dataAxes[axis][i];
//       }
//       return obj;
//     });
//   if (filterGating) {
//     for (const gate of pop.gates) {
//       if (gate.displayOnlyPointsInGate) {
//         const x = gate.gate.xAxis;
//         const y = gate.gate.yAxis;
//         data = data.filter((e: any) => {
//           const inside = gate.gate.isPointInside({ x: e[x], y: e[y] });
//           return gate.inverseGating ? !inside : inside;
//         });
//       }
//     }
//   }
//   if (filterPop) {
//     for (const gate of pop.population) {
//       const x = gate.gate.xAxis;
//       const y = gate.gate.yAxis;
//       data = data.filter((e: any) => {
//         const inside = gate.gate.isPointInside({ x: e[x], y: e[y] });
//         return gate.inverseGating ? !inside : inside;
//       });
//     }
//   }
//   //@ts-ignore
//   pop.axisDataCache = { data, filterGating, filterPop };
//   return data;
// };

// export const setDefaultRanges = () => {
//   if (
//     pop.file.axes
//       .map((e: string) => e in Object.keys(pop.defaultRanges))
//       .every((e: boolean) => e)
//   )
//     return;
//   if (pop.file === undefined) throw Error("No file found for plot");
//   const axesData = pop.getAxesData(false, false);

//   //@ts-ignore
//   Object.values(pop.file.axes).forEach((axis: string, i: number) => {
//     const axisType = pop.file.plotTypes[i];

//     pop.defaultAxisPlotTypes[axis] = axisType;
//     const data = axesData.map((e) => e[axis]);
//     const boundaries = pop.findRangeBoundries(data);
//     pop.defaultRanges[axis] = boundaries;
//   });
// };

// export const findRangeBoundries = (axisData: number[]): [number, number] => {
//   let min = axisData[0],
//     max = axisData[0];
//   for (const p of axisData) {
//     min = Math.min(p, min);
//     max = Math.max(p, max);
//   }
//   return [min, max];
// };
