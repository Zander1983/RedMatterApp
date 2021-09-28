import { validateType } from "ts-validate-type";
import {
  File,
  FileID,
  Gate,
  GateID,
  HistogramGate,
  Plot,
  PlotID,
  PolygonGate,
  Population,
  PopulationID,
  Workspace,
} from "./types";

const gateValidator = (gate: Gate): boolean => {
  switch (gate.gateType) {
    case "polygon":
      try {
        validateType<PolygonGate>(gate);
      } catch {
        return false;
      }
      return true;
    case "histogram":
      try {
        validateType<HistogramGate>(gate);
      } catch {
        return false;
      }
      return true;
    default:
      return false;
  }
};

const plotValidator = (plot: Plot): boolean => {
  try {
    validateType<Plot>(plot);
  } catch {
    return false;
  }
  return true;
};

const fileValidator = (file: File): boolean => {};

const populationValidator = (population: Population): boolean => {};

export const workspaceValidator = (
  workspace: Workspace
): {
  errors: string[];
  valid: boolean;
} => {
  const errors: string[] = [];

  try {
    const existingGates: Gate[] = workspace.gates;
    const existingPlots: Plot[] = workspace.plots;
    const existingPops: Population[] = workspace.populations;
    const existingFiles: File[] = workspace.files;

    // validate objs
    if (!existingFiles.reduce((l, c) => l && fileValidator(c), true)) {
      errors.push(`An invalid file object was found`);
    }
    if (!existingGates.reduce((l, c) => l && gateValidator(c), true)) {
      errors.push(`An invalid gate object was found`);
    }
    if (!existingPlots.reduce((l, c) => l && plotValidator(c), true)) {
      errors.push(`An invalid plot object was found`);
    }
    if (!existingPops.reduce((l, c) => l && populationValidator(c), true)) {
      errors.push(`An invalid population object was found`);
    }

    // check missing gate ref
    let usedGateIds: GateID[] = [];
    for (const gate of existingGates) {
      usedGateIds = usedGateIds.concat(gate.children);
      usedGateIds = usedGateIds.concat(gate.parents);
    }
    for (const pop of existingPops) {
      usedGateIds = usedGateIds.concat(pop.gates.map((e) => e.gate));
    }
    for (const plot of existingPlots) {
      usedGateIds = usedGateIds.concat(plot.gates);
    }
    for (const id of usedGateIds) {
      if (!existingGates.map((e) => e.id).includes(id)) {
        errors.push(`GateID ${id} not found in workspace gates`);
      }
    }

    // check missing file ref
    let usedFileIds: FileID[] = [];
    for (const pop of existingPops) {
      usedFileIds.concat(pop.file);
    }
    for (const id of usedFileIds) {
      if (!existingFiles.map((e) => e.id).includes(id)) {
        errors.push(`FileID ${id} not found in workspace files`);
      }
    }

    // check missing plot ref
    let usedPlotIds: PlotID[] = [];
    for (const plot of existingPlots) {
      usedPlotIds.concat(plot.parentPlotId);
    }
    for (const id of usedPlotIds) {
      if (!existingPlots.map((e) => e.id).includes(id)) {
        errors.push(`PlotID ${id} not found in workspace plots`);
      }
    }

    // check missing population ref
    let usedPopIds: PopulationID[] = [];
    for (const plot of existingPlots) {
      usedPopIds.concat(plot.population);
    }
    for (const id of usedPopIds) {
      if (!existingPops.map((e) => e.id).includes(id)) {
        errors.push(`PopulationID ${id} not found in workspace populations`);
      }
    }

    // check populations without plot
    for (const pop of existingPops) {
      let found = false;
      for (const plot of existingPlots) {
        if (plot.population === pop.id) found = true;
      }
      if (!found) {
        errors.push(`Population ${pop.id} unused by any plot`);
      }
    }
  } catch {
    return {
      valid: false,
      errors: [
        ...errors,
        "An unpredictable error has occurred, aborted validation",
      ],
    };
  }
  return {
    valid: errors.length === 0,
    errors,
  };
};
