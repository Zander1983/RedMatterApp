/*
  plot is supposed to store all data related to a single plot, including
  rendering params, so that it can be constructed, reconstructed and changed 
  easily.
*/

import { generateColor } from "graph/utils/color";
import FCSServices from "services/FCSServices/FCSServices";
import {
  AxisName,
  Plot,
  PlotID,
  Gate,
  PlotType,
  PopulationGateType,
  PopulationID,
  GateID,
  File,
  Population,
  Gate2D,
} from "./types";
import { createID } from "graph/utils/id";
import {
  getFile,
  getGate,
  getPlot,
  getPopulation,
  getWorkspace,
} from "graph/utils/workspace";
import { getFSCandSSCAxisOnAxesList } from "graph/utils/stringProcessing";
import { store } from "redux/store";
import * as populations from "./populations";
import {
  getDataset,
  getDatasetColors,
  getDatasetFilteredPoints,
} from "./dataset";

export const commitPlotChange = (plot: Plot) => {
  store.dispatch({
    type: "workspace.UPDATE_PLOT",
    payload: { plot },
  });
};

export const createPlot = ({
  clonePlot,
  id,
  population,
}: {
  clonePlot?: Plot;
  id?: PlotID;
  population?: Population;
}): Plot => {
  let newPlot: Plot = {
    id: "",
    ranges: {},
    axisPlotTypes: {},
    gates: [],
    histogramOverlays: [],
    histogramBarOverlays: [],
    population: "",
    xAxis: "",
    yAxis: "",
    positionInWorkspace: [0, 0],
    plotWidth: 380,
    plotHeight: 380,
    plotScale: 2,
    xPlotType: "lin",
    yPlotType: "lin",
    histogramAxis: "horizontal",
    label: "",
    dimensions: { w: 10, h: 12 },
    positions: { x: 0, y: 0 },
    parentPlotId: "",
    gatingActive: "",
  };
  if (clonePlot) newPlot = clonePlot;
  if (id) newPlot.id = id;
  else newPlot.id = createID();
  if (population) {
    newPlot.ranges = population?.defaultRanges;
    newPlot.axisPlotTypes = population?.defaultAxisPlotTypes;
    newPlot.population =
      typeof population === "string" ? population : population.id;
  }
  if (newPlot.population === "") {
    throw Error("Plot without population");
  }
  return setupPlot(newPlot);
};

export const setupPlot = (plot: Plot, incPopulation?: Population): Plot => {
  const population = incPopulation
    ? incPopulation
    : getPopulation(plot.population);
  const file = getFile(population.file);
  const axes = file.axes;
  try {
    const fscssc = getFSCandSSCAxisOnAxesList(file.axes);
    if (plot.xAxis === "" && plot.yAxis === "") {
      plot.xAxis = fscssc.fsc;
      plot.yAxis = fscssc.ssc;
    }
  } catch {}
  if (plot.xAxis === "") plot.xAxis = axes[0];
  if (plot.yAxis === "") plot.yAxis = axes[1];

  plot.xPlotType =
    plot.xAxis.toLowerCase().includes("fsc") ||
    plot.xAxis.toLowerCase().includes("ssc")
      ? "lin"
      : "bi";
  plot.yPlotType =
    plot.yAxis.toLowerCase().includes("fsc") ||
    plot.yAxis.toLowerCase().includes("ssc")
      ? "lin"
      : "bi";
  return plot;
};

export const getPlotOverlays = (plot: Plot) => {
  return plot.histogramOverlays.map((e: any) => {
    return {
      plot: getPlot(e.plot),
      color: e.color,
    };
  });
};

export const addOverlay = (
  plot: Plot,
  color?: string,
  plotId?: string,
  plotSource?: string
) => {
  if (!color) color = generateColor();
  plot.histogramOverlays.push({
    color: color,
    plotId: plotId,
    plotSource: plotSource,
  });
  commitPlotChange(plot);
};

export const addBarOverlay = (
  plot: Plot,
  color?: string,
  plotId?: string,
  plotSource?: string
) => {
  if (!color) color = generateColor();
  plot.histogramBarOverlays.push({
    color: color,
    plotId: plotId,
    plotSource: plotSource,
  });
  commitPlotChange(plot);
};

export const removeBarOverlay = (plot: Plot, overlayPlot: PlotID) => {
  plot.histogramBarOverlays = plot.histogramBarOverlays.filter(
    (x) => x.plotId !== overlayPlot
  );
  commitPlotChange(plot);
};

export const removeAnyOverlay = (plot: Plot, targetPopulation: string) => {
  plot.histogramBarOverlays = plot.histogramBarOverlays.filter(
    (x) => x.plotId !== targetPopulation
  );
  plot.histogramOverlays = plot.histogramOverlays.filter(
    (x) => x.plotId !== targetPopulation
  );
  commitPlotChange(plot);
};

export const removeOverlay = (plot: Plot, targetPlot: string) => {
  plot.histogramOverlays = plot.histogramOverlays.filter(
    (e) => e.plotId !== targetPlot
  );

  commitPlotChange(plot);
};

export const createNewPlotFromPlot = (plot: Plot, inverse: boolean = false) => {
  let newPlot = createPlot({ clonePlot: plot });
  let newPopulation = populations.createPopulation({
    clonePopulation: getPopulation(plot.population),
  });
  store.dispatch({
    type: "workspace.ADD_POPULATION",
    payload: { population: newPopulation },
  });
  newPlot.population = newPopulation.id;
  newPlot.parentPlotId = plot.id;
  newPlot.positions = {
    x: -1,
    y: -1,
  };
  newPlot.dimensions = {
    w: 10,
    h: 12,
  };
  store.dispatch({
    type: "workspace.ADD_PLOT",
    payload: {
      plot: newPlot,
    },
  });
};

export const addGate = (plot: Plot, gate: GateID) => {
  plot.gates.push(gate);
  commitPlotChange(plot);
};

export const removeGate = (plot: Plot, gate: GateID) => {
  const gateQuery = plot.gates.filter((g) => g === gate);
  if (gateQuery.length !== 1) {
    if (gateQuery.length < 1)
      throw Error("Gate with ID = " + gate + " was not found");
    if (gateQuery.length > 1) {
      throw Error("Multiple gates with ID = " + gate + " were found");
    }
  }
  plot.gates = plot.gates.filter((g) => g !== gate);
  commitPlotChange(plot);
};

export const addPopulation = (
  plot: Plot,
  gate: GateID,
  inverse: boolean = false
) => {
  let population = getPopulation(plot.population);
  const gateQuery = population.gates.filter((g) => g.gate === gate);
  if (gateQuery.length > 0) {
    throw Error(
      "Adding the same gate with ID = " + gate + " twice to population"
    );
  }
  populations.addGate(population, gate);
};

export const removePopulation = (plot: Plot, gate: GateID) => {
  let population = getPopulation(plot.population);
  const gateQuery = population.gates.filter((g) => g.gate === gate);
  if (gateQuery.length !== 1) {
    if (gateQuery.length < 1)
      throw Error("Gate with ID = " + gate + " was not found");
    if (gateQuery.length > 1) {
      throw Error("Multiple gates with ID = " + gate + " were found");
    }
  }
  populations.removeGate(population, gate);
};

export const setWidthAndHeight = (plot: Plot, w: number, h: number) => {
  plot.plotWidth = w - 40;
  plot.plotHeight = h - 30;
  commitPlotChange(plot);
};

export const setXAxisPlotType = (plot: Plot, plotType: PlotType) => {
  plot.xPlotType = plotType;
  plot.axisPlotTypes[plot.xAxis] = plotType;
  commitPlotChange(plot);
};

export const setYAxisPlotType = (plot: Plot, plotType: PlotType) => {
  plot.yPlotType = plotType;
  plot.axisPlotTypes[plot.yAxis] = plotType;
  commitPlotChange(plot);
};

export const xAxisToHistogram = (plot: Plot) => {
  plot.yAxis = plot.xAxis;
  plot.histogramAxis = "vertical";
  commitPlotChange(plot);
};

export const yAxisToHistogram = (plot: Plot) => {
  plot.xAxis = plot.yAxis;
  plot.histogramAxis = "horizontal";
  commitPlotChange(plot);
};

export const setXAxis = (plot: Plot, xAxis: string) => {
  plot.xAxis = xAxis;
  plot.xPlotType = plot.axisPlotTypes[xAxis];
  commitPlotChange(plot);
};

export const setYAxis = (plot: Plot, yAxis: string) => {
  plot.yAxis = yAxis;
  plot.yPlotType = plot.axisPlotTypes[yAxis];
  commitPlotChange(plot);
};

export const disableHistogram = (plot: Plot) => {
  plot.histogramAxis = "";
  commitPlotChange(plot);
};

// export const getPointColors = (plot: Plot,) =>  {
//   const allData = plot.getAxesData(false);
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
//   const default_color =
//     plot.population.length === 0
//       ? DEFAULT_COLOR
//       : plot.population[0].gate.color;
//   for (let i = 0; i < allData.length; i++) {
//     let ans = { depth: 0, color: default_color };
//     for (const gate of plot.gates) {
//       const cAns = gateDFS(allData[i], gate, 1);
//       if (cAns.color !== null && cAns.depth > ans.depth) {
//         ans = cAns;
//       }
//     }
//     colors.push(ans.color);
//   }
//   return colors;
// }

export const getXAxisName = (plot: Plot) => {
  return plot.xAxis;
};

export const getYAxisName = (plot: Plot) => {
  return plot.yAxis;
};

export const getAxis = (plot: Plot, targetAxis: AxisName): Float32Array => {
  const file = getPlotFile(plot);
  const data = getDataset(file.id);
  return data[targetAxis];
};

export const getXandYRanges = (
  plot: Plot,
  targetXAxis?: string,
  targetYAxis?: string
): { x: [number, number]; y: [number, number] } => {
  if (!targetXAxis) targetXAxis = plot.xAxis;
  if (!targetYAxis) targetYAxis = plot.yAxis;
  return { x: plot.ranges[targetXAxis], y: plot.ranges[targetYAxis] };
};

export const getBins = (plot: Plot, binCount?: number, targetAxis?: string) => {
  binCount = binCount === undefined ? getBinCount(plot) : binCount;
  const axisName =
    targetAxis === undefined
      ? plot.histogramAxis === "vertical"
        ? plot.xAxis
        : plot.yAxis
      : targetAxis;
  let range = plot.ranges[axisName];
  let axis = getAxis(plot, axisName);
  if (
    (plot.xAxis === axisName && plot.xPlotType === "bi") ||
    (plot.yAxis === axisName && plot.yPlotType === "bi")
  ) {
    const fcsServices = new FCSServices();
    const linearRange = plot.ranges[axisName];
    axis = new Float32Array(
      fcsServices.logicleMarkTransformer(axis, linearRange[0], linearRange[1])
    );
    range = [0.5, 1];
  }
  const binCounts = Array(binCount).fill(0);
  const step = (range[1] - range[0]) / binCount;
  let mx = 0;
  for (let i = 0; i < axis.length; i++) {
    const index = Math.floor((axis[i] - range[0]) / step);
    binCounts[index]++;
    if (binCounts[index] > mx) mx = binCounts[index];
  }
  return { list: binCounts, max: mx };
};

const STD_BIN_SIZE = 50;
export const getBinCount = (plot: Plot) => {
  return plot.histogramAxis === "horizontal"
    ? plot.plotWidth / STD_BIN_SIZE
    : plot.plotHeight / STD_BIN_SIZE;
};

export const resetOriginalRanges = (plot: Plot, axis?: "x" | "y") => {
  const population = getPopulation(plot.population);
  if (axis) {
    const axisName = axis === "x" ? plot.xAxis : plot.yAxis;
    plot.ranges[axisName] = population.defaultRanges[axisName];
  } else {
    plot.ranges = population.defaultRanges;
  }
  commitPlotChange(plot);
};

export const getXandYData = (plot: Plot): [Float32Array, Float32Array] => {
  const file = getPlotFile(plot);
  const dataset = getDataset(file.id);
  const population = getPopulation(plot.population);
  const filteredPoints = getDatasetFilteredPoints(dataset, population.gates);
  return [filteredPoints[plot.xAxis], filteredPoints[plot.yAxis]];
};

export const findRangeBoundries = (
  plot: Plot,
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

export const getPlotFile = (plot: Plot): File => {
  const population = getPopulation(plot.population);
  return getFile(population.file);
};

export const getPointColors = (plot: Plot) => {
  const dataset = getDataset(getPlotFile(plot).id);
  const gates = plot.gates.map((e) => {
    return { gate: e, inverseGating: false } as PopulationGateType;
  });
  const populationGates = getPopulation(plot.population).gates.map((e) =>
    getGate(e.gate)
  );
  const stdColor =
    populationGates.length > 0
      ? populationGates[populationGates.length - 1].color
      : "#000";
  return getDatasetColors(dataset, gates, stdColor);
};

export const createNewPlotFromFile = async (file: File) => {
  const workspace = getWorkspace();
  const popQuery = workspace.populations.filter(
    (e) => e.file === file.id && e.gates.length === 0
  );
  let population: Population;
  if (popQuery.length > 0 && false) {
    population = popQuery[0];
  } else {
    population = populations.createPopulation({
      file: file.id,
    });
    await store.dispatch({
      type: "workspace.ADD_POPULATION",
      payload: { population },
    });
  }
  const plot = createPlot({ population });
  await store.dispatch({
    type: "workspace.ADD_PLOT",
    payload: { plot },
  });
  await setupPlot(plot, population);
  return plot.id;
};

export const createSubpopPlot = async (
  plot: Plot,
  additionalGates?: Gate[]
) => {
  const newPlotId = await createNewPlotFromFile(
    getFile(getPopulation(plot.population).file)
  );
  let pop = getPopulation(getPlot(newPlotId).population);
  pop.gates = [
    ...pop.gates,
    ...additionalGates.map((e) => {
      return { gate: e.id, inverseGating: false } as PopulationGateType;
    }),
  ];
  await store.dispatch({
    type: "workspace.UPDATE_POPULATION",
    payload: {
      population: pop,
    },
  });
};

export const getXandYDataAndColors = (plot: Plot) => {
  const file = getPlotFile(plot);
  const dataset = getDataset(file.id);
  const population = getPopulation(plot.population);
  const filteredPoints = getDatasetFilteredPoints(dataset, population.gates);
  const plotGates = plot.gates.map((e) => {
    return { gate: e, inverseGating: false } as PopulationGateType;
  });
  const colors = getDatasetColors(dataset, plotGates);
  return { points: filteredPoints, colors };
};
