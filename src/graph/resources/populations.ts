import { createID } from "graph/utils/id";
import { getFile } from "graph/utils/workspace";
import { store } from "redux/store";
import { getDataset } from "./dataset";
import {
  FileID,
  Gate,
  File,
  GateID,
  Population,
  PopulationGateType,
  PopulationID,
} from "./types";
import * as DatasetResource from "graph/resources/dataset";

export const commitPopulationChange = async (population: Population) => {
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

  if (clonePopulation) newPopulation = { ...clonePopulation };
  else if (subpopFrom) {
    newPopulation = subpopFrom.population;
    newPopulation.gates = [...subpopFrom.population.gates, ...subpopFrom.gates];
  } else if (file) newPopulation.file = file;

  if (id) newPopulation.id = id;
  else newPopulation.id = createID();

  if (!newPopulation?.file) {
    throw Error("Population without file");
  }

  return setupPopulation(newPopulation);
};

export const setupPopulation = (
  pop: Population,
  inpFile?: File
): Population => {
  //@ts-ignore
  const file: File = inpFile ? inpFile : getFile(pop.file);
  const axes = file.axes;
  if (
    axes
      .map((e: string) => e in Object.keys(pop.defaultRanges))
      .every((e: boolean) => e)
  )
    return;
  const axesData = DatasetResource.getDataset(pop.file);

  //@ts-ignore
  axes.forEach((axis: string, i: number) => {
    const axisType = file.plotTypes[i];

    pop.defaultAxisPlotTypes[axis] = axisType;
    const boundaries = findRangeBoundries(axesData[axis]);
    pop.defaultRanges[axis] = boundaries;
  });

  return pop;
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

export const findRangeBoundries = (
  axisData: Float32Array
): [number, number] => {
  let min = axisData[0],
    max = axisData[0];
  for (let i = 0; i < axisData.length; i++) {
    min = Math.min(axisData[i], min);
    max = Math.max(axisData[i], max);
  }
  return [min, max];
};
