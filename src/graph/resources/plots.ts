import { ColorSchema, generateColor } from "graph/utils/color";
import FCSServices from "services/FCSServices/FCSServices";
import {
  AxisName,
  Plot,
  PlotID,
  PlotType,
  PopulationGateType,
  GateID,
  File,
  Population,
  HistogramOverlay,
  FileID,
  HistogramAxisType,
} from "./types";
import { createID } from "graph/utils/id";
import {
  getFile,
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
import { MINH, MINW } from "graph/components/workspaces/PlotController";
import WorkspaceDispatch from "./dispatchers";

export const createPlot = ({
  clonePlot,
  id,
  population,
}: {
  clonePlot?: Plot;
  id?: PlotID;
  population?: Population;
}): Plot => {
  let newPlot = createEmptyPlot();
  if (clonePlot) newPlot = { ...clonePlot };
  if (id) newPlot.id = id;
  else newPlot.id = createID();
  if (population) {
    newPlot.ranges = { ...population?.defaultRanges };
    newPlot.axisPlotTypes = { ...population?.defaultAxisPlotTypes };
    newPlot.population =
      typeof population === "string" ? population : population.id;
  }
  if (clonePlot) {
    newPlot.ranges = { ...clonePlot.ranges };
    newPlot.axisPlotTypes = { ...clonePlot.axisPlotTypes };
    newPlot.xPlotType = clonePlot.xPlotType;
    newPlot.yPlotType = clonePlot.yPlotType;
  }
  if (newPlot.population === "") {
    throw Error("Plot without population");
  }
  return setupPlot(newPlot);
};

export const createEmptyPlot = (): Plot => {
  let newPlot: Plot = {
    id: "",
    ranges: {},
    axisPlotTypes: {},
    gates: [],
    histogramOverlays: [],
    population: "",
    xAxis: "",
    yAxis: "",
    positionInWorkspace: [0, 0],
    plotWidth: 380,
    plotHeight: 380,
    plotScale: 2,
    xPlotType: "lin",
    yPlotType: "lin",
    histogramAxis: "",
    label: "",
    dimensions: { w: MINW, h: MINH },
    positions: { x: 0, y: 0 },
    parentPlotId: "",
    gatingActive: "",
  };

  return newPlot;
};

export const setupPlot = (plot: Plot, incPopulation?: Population): Plot => {
  const population = incPopulation
    ? incPopulation
    : getPopulation(plot.population);
  const file = getFile(population.file);
  const axes = file.axes;

  if (plot.xAxis.length === 0 && plot.yAxis.length === 0) {
    if (Object.keys(plot.axisPlotTypes).length > 0) {
      try {
        const fscssc = getFSCandSSCAxisOnAxesList(file.axes);
        if (plot.xAxis === "" && plot.yAxis === "") {
          plot.xAxis = fscssc.fsc;
          plot.yAxis = fscssc.ssc;
        }
      } catch {
        if (plot.xAxis === "") plot.xAxis = axes[0];
        if (plot.yAxis === "") plot.yAxis = axes[1];
      }
    }
  }
  if (plot.xAxis === "") plot.xAxis = axes[0];
  if (plot.yAxis === "") plot.yAxis = axes[1];
  if (!plot.xPlotType) plot.xPlotType = getPlotType(plot, plot.xAxis);
  if (!plot.yPlotType) plot.yPlotType = getPlotType(plot, plot.yAxis);

  console.log();

  return plot;
};

const getPlotType = (plot: Plot, plotAxis: string) => {
  if (Object.keys(plot.axisPlotTypes).length > 0) {
    return plot.axisPlotTypes[plotAxis];
  } else {
    return plotAxis.toLowerCase().includes("fsc") ||
      plotAxis.toLowerCase().includes("ssc")
      ? "lin"
      : "bi";
  }
};

export const getPlotOverlays = (plot: Plot) => {
  return plot.histogramOverlays.map((e: any) => {
    return {
      plot: getPlot(e.plot),
      color: e.color,
    };
  });
};

export const addOverlay = async (
  plot: Plot,
  {
    fromFile,
    fromPlot,
  }: {
    fromFile?: FileID;
    fromPlot?: PlotID;
  }
) => {
  if (fromPlot) {
    throw Error("Plot overlays not implemented");
  } else if (fromFile) {
    let population: Population = populations.createPopulation({
      file: fromFile,
    });
    population.gates = population.gates.concat(
      getPopulation(plot.population).gates
    );
    await WorkspaceDispatch.AddPopulation(population);
    const newHistogramOverlay: HistogramOverlay = {
      id: createID(),
      color: generateColor(),
      dataSource: "file",
      overlayType: "line",
      file: fromFile,
      population: population.id,
    };
    plot.histogramOverlays.push(newHistogramOverlay);
  } else {
    throw Error("No overlay source found");
  }
  WorkspaceDispatch.UpdatePlot(plot);
};

// export const changeOverlayType = (
//   plot: Plot,
//   targetPlotId: String,
//   fileId: String,
//   newType: PlotType,
//   oldType: PlotType
// ) => {
//   let overlay: HistogramOverlay = plot.histogramOverlays.find(
//     (e) =>
//       e.plotId === targetPlotId || e.fileId === fileId || e.plotType === oldType
//   );
//   overlay.plotType = newType;
//   WorkspaceDispatch.UpdatePlot(plot);
// };

export const removeOverlay = (
  plot: Plot,
  histogramOverlay: HistogramOverlay
) => {
  plot.histogramOverlays = plot.histogramOverlays.filter(
    (e) => e.id !== histogramOverlay.id
  );
  WorkspaceDispatch.UpdatePlot(plot);
};

export const createNewPlotFromPlot = async (
  plot: Plot,
  inverse: boolean = false
) => {
  let newPlot = createPlot({ clonePlot: plot });
  let newPopulation = populations.createPopulation({
    clonePopulation: getPopulation(plot.population),
  });
  await WorkspaceDispatch.AddPopulation(newPopulation);
  newPlot.population = newPopulation.id;
  newPlot.parentPlotId = plot.id;
  newPlot.positions = {
    x: -1,
    y: -1,
  };
  newPlot.dimensions = {
    w: MINW,
    h: MINH,
  };
  await WorkspaceDispatch.AddPlot(newPlot);
};

export const addGate = (plot: Plot, gate: GateID) => {
  plot.gates.push(gate);
  WorkspaceDispatch.UpdatePlot(plot);
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
  WorkspaceDispatch.UpdatePlot(plot);
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
  WorkspaceDispatch.UpdatePlot(plot);
};

export const setXAxisPlotType = (plot: Plot, plotType: PlotType) => {
  plot.gatingActive = "";
  plot.xPlotType = plotType;
  plot.axisPlotTypes[plot.xAxis] = plotType;
  WorkspaceDispatch.UpdatePlot(plot);
};

export const setYAxisPlotType = (plot: Plot, plotType: PlotType) => {
  plot.gatingActive = "";
  plot.yPlotType = plotType;
  plot.axisPlotTypes[plot.yAxis] = plotType;
  WorkspaceDispatch.UpdatePlot(plot);
};

export const xAxisToHistogram = (plot: Plot) => {
  plot.gatingActive = "";
  plot.yAxis = plot.xAxis;
  plot.histogramAxis = "vertical";
  WorkspaceDispatch.UpdatePlot(plot);
};

export const setXAxis = (plot: Plot, xAxis: string) => {
  plot.gatingActive = "";
  plot.xAxis = xAxis;
  plot.xPlotType = plot.axisPlotTypes[xAxis];
  WorkspaceDispatch.UpdatePlot(plot);
};

export const setYAxis = (plot: Plot, yAxis: string) => {
  plot.gatingActive = "";
  plot.yAxis = yAxis;
  plot.yPlotType = plot.axisPlotTypes[yAxis];
  WorkspaceDispatch.UpdatePlot(plot);
};

export const setHistogramAxis = (
  plot: Plot,
  histogramAxis: HistogramAxisType
) => {
  plot.histogramAxis = histogramAxis;
  WorkspaceDispatch.UpdatePlot(plot);
};

export const disableHistogram = (plot: Plot) => {
  plot.gatingActive = "";
  plot.histogramAxis = "";
  WorkspaceDispatch.UpdatePlot(plot);
};

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

export const getHistogramBins = (
  plot: Plot,
  binCount: number,
  targetAxis: string
) => {
  binCount = Math.round(binCount);
  const axisName =
    targetAxis === undefined
      ? plot.histogramAxis === "vertical"
        ? plot.xAxis
        : plot.yAxis
      : targetAxis;
  let range = plot.ranges[axisName];
  let axis = getHistogramAxisData(plot);
  if (plot.xAxis === axisName && plot.xPlotType === "bi") {
    const fcsServices = new FCSServices();
    const linearRange = plot.ranges[axisName];
    axis = new Float32Array(
      fcsServices.logicleMarkTransformer(axis, linearRange[0], linearRange[1])
    );
    range = [0, 1];
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

export const resetOriginalRanges = (plot: Plot, axis?: "x" | "y") => {
  const population = getPopulation(plot.population);
  if (axis) {
    const axisName = axis === "x" ? plot.xAxis : plot.yAxis;
    plot.ranges[axisName] = population.defaultRanges[axisName];
  } else {
    plot.ranges = population.defaultRanges;
  }
  WorkspaceDispatch.UpdatePlot(plot);
};

export const getXandYData = (plot: Plot): [Float32Array, Float32Array] => {
  const file = getPlotFile(plot);
  const dataset = getDataset(file.id);
  const population = getPopulation(plot.population);
  const filteredPoints = getDatasetFilteredPoints(dataset, population.gates);
  return [filteredPoints[plot.xAxis], filteredPoints[plot.yAxis]];
};

export const getHistogramAxisData = (plot: Plot): Float32Array => {
  const file = getPlotFile(plot);
  const dataset = getDataset(file.id);
  const population = getPopulation(plot.population);
  const filteredPoints = getDatasetFilteredPoints(dataset, population.gates);
  return filteredPoints[
    plot.histogramAxis === "vertical" ? plot.xAxis : plot.yAxis
  ];
};

export const getXandYDataAndColors = (
  plot: Plot
): { points: [Float32Array, Float32Array]; colors: ColorSchema } => {
  const file = getPlotFile(plot);
  const dataset = getDataset(file.id);
  const population = getPopulation(plot.population);
  const filteredPoints = getDatasetFilteredPoints(dataset, population.gates);
  const colors = getDatasetColors(
    filteredPoints,
    population.gates,
    plot.gates,
    "#000"
  );
  return {
    points: [filteredPoints[plot.xAxis], filteredPoints[plot.yAxis]],
    colors,
  };
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
  const plotGates = plot.gates;
  const populationGates = getPopulation(plot.population).gates;
  return getDatasetColors(dataset, populationGates, plotGates, "#000");
};

export const createNewPlotFromFile = async (file: File, clonePlot?: Plot) => {
  let population: Population;
  population = populations.createPopulation({
    file: file.id,
  });
  await WorkspaceDispatch.AddPopulation(population);
  const plot = createPlot({ population, clonePlot });
  await WorkspaceDispatch.AddPlot(plot);
  await setupPlot(plot, population);
  return plot.id;
};

export const createSubpopPlot = async (
  plot: Plot,
  additionalGates?: PopulationGateType[]
) => {
  const oldPop = getPopulation(plot.population);
  const newPlotId = await createNewPlotFromFile(getFile(oldPop.file), {
    ...plot,
    gates: [],
  });
  let newPlot = getPlot(newPlotId);
  let pop = getPopulation(newPlot.population);
  if (additionalGates) {
    pop.gates = pop.gates.concat(additionalGates);
  }
  pop.gates = pop.gates.concat(oldPop.gates);
  const promises: Promise<any>[] = [];
  promises.push(WorkspaceDispatch.UpdatePopulation(pop));
  const popGates = pop.gates.map((e) => e.gate);
  for (const gate of newPlot.gates) {
    if (popGates.includes(gate)) {
      newPlot.gates.filter((e) => e !== gate);
    }
  }
  promises.push(WorkspaceDispatch.UpdatePopulation(pop));
  await Promise.all(promises);
};
