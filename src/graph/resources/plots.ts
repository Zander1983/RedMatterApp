import { ColorSchema, generateColor } from "graph/utils/color";
import FCSServices from "graph/mark-app/FCSServices/FCSServices";
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
  getAllPlots,
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
import {
  MINH,
  MINW,
  getTargetLayoutPlots,
  getPlotGroups,
} from "graph/components/workspaces/PlotController";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";

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
    const file = getFile(population.file);
    newPlot.ranges = { ...file.defaultRanges };
    newPlot.axisPlotTypes = { ...file.defaultAxisPlotTypes };
    newPlot.population =
      typeof population === "string" ? population : population.id;
  }
  if (clonePlot) {
    newPlot.ranges = { ...clonePlot.ranges };
    newPlot.axisPlotTypes = { ...clonePlot.axisPlotTypes };
    newPlot.xPlotType = clonePlot.xPlotType;
    newPlot.yPlotType = clonePlot.yPlotType;
    newPlot.parentPlotId = clonePlot.id;
  }
  if (newPlot.population === "") {
    throw Error("Plot without population");
  }
  newPlot.dimensions = { w: MINW, h: MINH };
  let plots = getTargetLayoutPlots(newPlot);
  if (plots.length > 0) {
    newPlot.positions = standardGridPlotItem(plots.length, newPlot, plots);
  }
  // let plots = getTargetLayoutPlots(newPlot);
  // if (plots.length > 0) {
  // if (getWorkspace().selectedFile === population.file) {
  //   const fileLength = getWorkspace().populations.filter(
  //     (pop) => pop.file === getFile(getPopulation(newPlot.population).file).id
  //   ).length;
  //   newPlot.positions = standardGridPlotItem2(fileLength);
  // }
  // newPlot.positions = standardGridPlotItem(plots.length, newPlot, plots);
  // }

  return setupPlot(newPlot, population);
};

const standardGridPlotItem2 = (plotNumber: number) => {
  const widthMultiplier = (plotNumber - 1) % 3;
  const heightMultiplier =
    plotNumber % 3 === 0 ? plotNumber / 3 - 1 : Math.floor(plotNumber / 3);
  return {
    x: widthMultiplier * 13,
    y: heightMultiplier * 11,
  };
};

export const updatePositions = () => {
  let plots = getAllPlots();
  let plotGroups = getPlotGroups(plots);
  let keys = Object.keys(plotGroups);
  let updatePlots: Plot[] = [];
  for (let i = 0; i < keys.length; i++) {
    let key: number = parseInt(keys[i]);
    let plots = plotGroups[key].plots;
    for (let j = 0; j < plots.length; j++) {
      let newPosition = standardGridPlotItem(j, plots[j], plots);
      plots[j].positions.x = newPosition.x;
      plots[j].positions.y = newPosition.y;
    }
    updatePlots = updatePlots.concat(plots);
  }
  WorkspaceDispatch.UpdatePlots(updatePlots);
};

const standardGridPlotItem = (index: number, plotData: any, plots: Plot[]) => {
  let maxWidth = MINW * 4;
  let maxHeight = 0;
  let x = plotData.positions.x;
  let y = plotData.positions.y;
  let newy = y;
  let newX = x;

  let nPlots = plots.filter((x: Plot) => x.id != plotData.id);
  nPlots.sort(function (a: Plot, b: Plot) {
    return a.positions.x - b.positions.x && a.positions.y - b.positions.y;
  });
  let prevLineWidth = 0;
  for (let i = 0; i < index; i++) {
    let plot = nPlots[i];
    if (
      i != 0 &&
      !(
        plot.positions.y >= nPlots[i - 1].positions.y &&
        plot.positions.y <
          nPlots[i - 1].positions.y + nPlots[i - 1].dimensions.h
      )
    ) {
      prevLineWidth = newX;
    }
    if (prevLineWidth) {
      if (maxWidth - prevLineWidth > MINW) {
        newX = prevLineWidth;
        break;
      }
      prevLineWidth = 0;
    }
    if (
      i != 0 &&
      plot.positions.x -
        (nPlots[i - 1].positions.x + nPlots[i - 1].dimensions.w) >=
        MINW
    ) {
      newX = nPlots[i - 1].dimensions.w + nPlots[i - 1].positions.x;
      break;
    }
    newX = plot.dimensions.w + plot.positions.x;

    // 311 is the size of the plotWidth on creation
    if (plot.plotWidth > 311) {
      let plotWidth = plot.plotWidth - 311;
      // converting plotWith to the scale of positions
      // 380 / 9 ~~~ 40
      plotWidth = plotWidth / 40;
      newX += plotWidth;
    }

    if (maxHeight < plot.dimensions.h) maxHeight = plot.dimensions.h;
    if (newX + MINW > maxWidth) {
      prevLineWidth = newX;
      newX = 0;
      newy = newy + maxHeight;
      maxHeight = 0;
    }
  }

  if (index == 0) {
    newX = 0;
    newy = 0;
  }

  return {
    x: newX > 0 ? newX + 3 : newX,
    y: newy === 0 ? newy : newy + 1,
  };
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
    plotWidth: 319,
    plotHeight: 204,
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
  const { axes } = file;

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
  plot.xPlotType = getPlotType(plot, plot.xAxis);
  plot.yPlotType = getPlotType(plot, plot.yAxis);

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
  const plots: Plot[] = [];
  if (fromPlot) {
    throw Error("Plot overlays not implemented");
  } else if (fromFile) {
    let population: Population = populations.createPopulation({
      file: fromFile,
      parentPopulationId: plot.population,
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

    const workspace = getWorkspace();
    if (
      getFile(getPopulation(plot.population).file).id === workspace.selectedFile
    ) {
      let selectedFilePlotLength = 0;
      workspace.plots.map((plot) => {
        if (
          getFile(getPopulation(plot.population).file).id ===
          workspace.selectedFile
        ) {
          selectedFilePlotLength += 1;
        }
      });

      const index = workspace.plots.findIndex((plt) => plt.id === plot.id);
      for (
        let i = index;
        i < workspace.plots.length;
        i += selectedFilePlotLength
      ) {
        if (fromFile === getPopulation(workspace.plots[i].population).file)
          continue;
        workspace.plots[i].histogramOverlays.push(newHistogramOverlay);
        plots.push(workspace.plots[i]);
      }
    }
  } else {
    throw Error("No overlay source found");
  }
  WorkspaceDispatch.UpdatePlots(plots);
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
  const workspace = getWorkspace();
  const plots: Plot[] = [];
  if (
    getFile(getPopulation(plot.population).file).id === workspace.selectedFile
  ) {
    let selectedFilePlotLength = 0;
    workspace.plots.map((plot) => {
      if (
        getFile(getPopulation(plot.population).file).id ===
        workspace.selectedFile
      ) {
        selectedFilePlotLength += 1;
      }
    });

    const index = workspace.plots.findIndex((plt) => plt.id === plot.id);
    for (
      let i = index;
      i < workspace.plots.length;
      i += selectedFilePlotLength
    ) {
      workspace.plots[i].histogramOverlays = workspace.plots[
        i
      ].histogramOverlays.filter((e) => e.id !== histogramOverlay.id);

      plots.push(workspace.plots[i]);
    }
  }
  plot.histogramOverlays = plot.histogramOverlays.filter(
    (e) => e.id !== histogramOverlay.id
  );
  plots.push(plot);
  WorkspaceDispatch.UpdatePlots(plots);
};

export const createNewPlotFromPlot = async (
  plot: Plot,
  inverse: boolean = false
) => {
  let newPlot = createPlot({ clonePlot: plot });
  let newPopulation = populations.createPopulation({
    clonePopulation: getPopulation(plot.population),
    parentPopulationId: plot.population,
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
  const workspace = getWorkspace();
  const plots: Plot[] = [];
  if (
    getFile(getPopulation(plot.population).file).id === workspace.selectedFile
  ) {
    let selectedFilePlotLength = 0;
    workspace.plots.map((plot) => {
      if (
        getFile(getPopulation(plot.population).file).id ===
        workspace.selectedFile
      ) {
        selectedFilePlotLength += 1;
      }
    });

    const index = workspace.plots.findIndex((plt) => plt.id === plot.id);
    for (
      let i = index;
      i < workspace.plots.length;
      i += selectedFilePlotLength
    ) {
      workspace.plots[i].gatingActive = "";
      workspace.plots[i].xPlotType = plotType;
      workspace.plots[i].axisPlotTypes[plot.xAxis] = plotType;

      plots.push(workspace.plots[i]);
    }
  }

  plot.gatingActive = "";
  plot.xPlotType = plotType;
  plot.axisPlotTypes[plot.xAxis] = plotType;
  plots.push(plot);

  // updating the plot
  WorkspaceDispatch.UpdatePlots(plots);
};

export const setYAxisPlotType = (plot: Plot, plotType: PlotType) => {
  const workspace = getWorkspace();
  const plots: Plot[] = [];
  if (
    getFile(getPopulation(plot.population).file).id === workspace.selectedFile
  ) {
    let selectedFilePlotLength = 0;
    workspace.plots.map((plot) => {
      if (
        getFile(getPopulation(plot.population).file).id ===
        workspace.selectedFile
      ) {
        selectedFilePlotLength += 1;
      }
    });

    const index = workspace.plots.findIndex((plt) => plt.id === plot.id);
    for (
      let i = index;
      i < workspace.plots.length;
      i += selectedFilePlotLength
    ) {
      workspace.plots[i].gatingActive = "";
      workspace.plots[i].yPlotType = plotType;
      workspace.plots[i].axisPlotTypes[plot.yAxis] = plotType;

      plots.push(workspace.plots[i]);
    }
  }

  plot.gatingActive = "";
  plot.yPlotType = plotType;
  plot.axisPlotTypes[plot.yAxis] = plotType;
  plots.push(plot);

  // updating the plot
  WorkspaceDispatch.UpdatePlots(plots);
};

export const xAxisToHistogram = (plot: Plot) => {
  const workspace = getWorkspace();
  const plots: Plot[] = [];
  if (
    getFile(getPopulation(plot.population).file).id === workspace.selectedFile
  ) {
    let selectedFilePlotLength = 0;
    workspace.plots.map((plot) => {
      if (
        getFile(getPopulation(plot.population).file).id ===
        workspace.selectedFile
      ) {
        selectedFilePlotLength += 1;
      }
    });

    const index = workspace.plots.findIndex((plt) => plt.id === plot.id);
    for (
      let i = index;
      i < workspace.plots.length;
      i += selectedFilePlotLength
    ) {
      workspace.plots[i].gatingActive = "";
      workspace.plots[i].yAxis = plot.xAxis;
      workspace.plots[i].histogramAxis = "vertical";

      plots.push(workspace.plots[i]);
    }
  }
  plot.gatingActive = "";
  plot.yAxis = plot.xAxis;
  plot.histogramAxis = "vertical";
  plots.push(plot);

  WorkspaceDispatch.UpdatePlots(plots);
};

export const setXAxis = (plot: Plot, xAxis: string) => {
  // setting up xAxis
  const workspace = getWorkspace();
  const plots: Plot[] = [];
  if (
    getFile(getPopulation(plot.population).file).id === workspace.selectedFile
  ) {
    let selectedFilePlotLength = 0;
    workspace.plots.map((plot) => {
      if (
        getFile(getPopulation(plot.population).file).id ===
        workspace.selectedFile
      ) {
        selectedFilePlotLength += 1;
      }
    });

    const index = workspace.plots.findIndex((plt) => plt.id === plot.id);
    for (
      let i = index;
      i < workspace.plots.length;
      i += selectedFilePlotLength
    ) {
      workspace.plots[i].gatingActive = "";
      workspace.plots[i].xAxis = xAxis;
      workspace.plots[i].xPlotType = workspace.plots[i].axisPlotTypes[xAxis];

      plots.push(workspace.plots[i]);
    }
  }
  plot.gatingActive = "";
  plot.xAxis = xAxis;
  plot.xPlotType = plot.axisPlotTypes[xAxis];
  plots.push(plot);

  // updating the plot
  WorkspaceDispatch.UpdatePlots(plots);
};

export const setYAxis = (plot: Plot, yAxis: string) => {
  // setting up yAxis
  const workspace = getWorkspace();
  const plots: Plot[] = [];
  if (
    getFile(getPopulation(plot.population).file).id === workspace.selectedFile
  ) {
    let selectedFilePlotLength = 0;
    workspace.plots.map((plot) => {
      if (
        getFile(getPopulation(plot.population).file).id ===
        workspace.selectedFile
      ) {
        selectedFilePlotLength += 1;
      }
    });

    const index = workspace.plots.findIndex((plt) => plt.id === plot.id);
    for (
      let i = index;
      i < workspace.plots.length;
      i += selectedFilePlotLength
    ) {
      workspace.plots[i].gatingActive = "";
      workspace.plots[i].yAxis = yAxis;
      workspace.plots[i].yPlotType = workspace.plots[i].axisPlotTypes[yAxis];

      plots.push(workspace.plots[i]);
    }
  }
  plot.gatingActive = "";
  plot.yAxis = yAxis;
  plot.yPlotType = plot.axisPlotTypes[yAxis];
  plots.push(plot);

  // updating the plot
  WorkspaceDispatch.UpdatePlots(plots);
};

export const setHistogramAxis = (
  plot: Plot,
  histogramAxis: HistogramAxisType
) => {
  plot.histogramAxis = histogramAxis;
  WorkspaceDispatch.UpdatePlot(plot);
};

export const disableHistogram = (plot: Plot) => {
  const workspace = getWorkspace();
  const plots: Plot[] = [];
  if (
    getFile(getPopulation(plot.population).file).id === workspace.selectedFile
  ) {
    let selectedFilePlotLength = 0;
    workspace.plots.map((plot) => {
      if (
        getFile(getPopulation(plot.population).file).id ===
        workspace.selectedFile
      ) {
        selectedFilePlotLength += 1;
      }
    });

    const index = workspace.plots.findIndex((plt) => plt.id === plot.id);
    for (
      let i = index;
      i < workspace.plots.length;
      i += selectedFilePlotLength
    ) {
      workspace.plots[i].gatingActive = "";
      workspace.plots[i].histogramAxis = "";
      plots.push(workspace.plots[i]);
    }
  }
  plot.gatingActive = "";
  plot.histogramAxis = "";
  plots.push(plot);
  WorkspaceDispatch.UpdatePlots(plots);
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
  return {
    x: plot.ranges[getPlotAxisRangeString(plot, "x")],
    y: plot.ranges[getPlotAxisRangeString(plot, "y")],
  };
};

export const getHistogramBins = (
  plot: Plot,
  binCount: number,
  targetAxis: string
) => {
  binCount = Math.round(binCount);
  let range = plot.ranges[getPlotAxisRangeString(plot, "x")];
  let axis = getHistogramAxisData(plot);
  if (plot.xPlotType === "bi") {
    const fcsServices = new FCSServices();
    axis = new Float32Array(
      fcsServices.logicleMarkTransformer(axis, range[0], range[1])
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
  const file = getPlotFile(plot);
  if (axis) {
    const rangeString = getPlotAxisRangeString(
      plot,
      axis === "x" ? plot.xAxis : plot.yAxis
    );
    plot.ranges[rangeString] = file.defaultRanges[rangeString];
  } else {
    plot.ranges = file.defaultRanges;
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

export const getXandYDataWithFiles = (
  file: File,
  population: PopulationGateType[],
  xAxis: string,
  yAxis: string
) => {
  const dataset = getDataset(file.id);
  const filteredPoints = getDatasetFilteredPoints(dataset, population);
  return [filteredPoints[xAxis], filteredPoints[yAxis]];
};

export const getHistogramAxisData = (plot: Plot): Float32Array => {
  const file = getPlotFile(plot);
  const dataset = getDataset(file.id);
  const population = getPopulation(plot.population);
  const filteredPoints = getDatasetFilteredPoints(dataset, population.gates);
  return filteredPoints[plot.xAxis];
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
    parentPopulationId: clonePlot?.population,
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
    let gateId = additionalGates[0].gate;
    pop.label = getGate(gateId).name;
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

export const getPlotAxisRangeString = (
  plot: Plot,
  axis: AxisName | "x" | "y"
) => {
  if (axis === "x") axis = plot.xAxis;
  if (axis === "y") axis = plot.yAxis;
  return axis + "-" + plot.axisPlotTypes[axis];
};
