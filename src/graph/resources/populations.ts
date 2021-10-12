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
import WorkspaceDispatch from "./dispatchers";

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
  WorkspaceDispatch.UpdatePopulation(pop);
};

export const removeGate = (pop: Population, gate: GateID) => {
  pop.gates = pop.gates.filter((e) => e.gate !== gate);
  WorkspaceDispatch.UpdatePopulation(pop);
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
