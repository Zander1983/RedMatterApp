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
import { getDataset } from "./dataset";

const commitPlotChange = (plot: Plot) => {
  store.dispatch({
    action: "UPDATE_PLOT",
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
  population?: PopulationID;
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
    plotWidth: 0,
    plotHeight: 0,
    plotScale: 0,
    xPlotType: "lin",
    yPlotType: "lin",
    histogramAxis: "horizontal",
    label: "",
    dimensions: { w: 0, h: 0 },
    positions: { x: 0, y: 0 },
    parentPlotId: "",
  };
  if (clonePlot) newPlot = clonePlot;
  if (id) newPlot.id = id;
  else newPlot.id = createID();
  setupPlot(newPlot);
  return newPlot;
};

export const setupPlot = (plot: Plot) => {
  const population = getPopulation(plot.population);
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
  commitPlotChange(plot);
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
  let newPlot = createPlot(plot);
  let newPopulation = populations.createPopulation({
    clonePopulation: getPopulation(plot.population),
  });
  store.dispatch({
    action: "workspace.ADD_POPULATION",
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
    action: "workspace.ADD_PLOT",
    payload: {
      plot: newPlot,
    },
  });
};

export const addGate = (plot: Plot, gate: GateID) => {
  plot.gates.push(gate);
  commitPlotChange(plot);
};

export const removeGate = (plot: Plot, gate: Gate) => {
  const gateQuery = plot.gates.filter((g) => g === gate.id);
  if (gateQuery.length !== 1) {
    if (gateQuery.length < 1)
      throw Error("Gate with ID = " + gate.id + " was not found");
    if (gateQuery.length > 1) {
      throw Error("Multiple gates with ID = " + gate.id + " were found");
    }
  }
  plot.gates = plot.gates.filter((g) => g !== gate.id);
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

export const getAxis = (plot: Plot, targetAxis: AxisName): Int32Array => {
  const population = getPopulation(plot.population);
  const file = getFile(population.file);
  const data = getDataset({
    file,
    requestedAxes: [targetAxis],
    requestedPlotTypes: [plot.axisPlotTypes[targetAxis]],
    requestedPop: population.gates,
  });
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
    axis = new Int32Array(
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

export const resetOriginalRanges = (plot: Plot) => {
  const population = getPopulation(plot.population);
  plot.ranges = population.defaultRanges;
  commitPlotChange(plot);
};

export const getXandYData = (plot: Plot): [Int32Array, Int32Array] => {
  // if (
  //   plot.axisDataCache !== null &&
  //   plot.axisDataCache.filterGating === filterGating &&
  //   plot.axisDataCache.filterPop === filterPop
  // )
  //   return plot.axisDataCache.data;
  // let dataAxes: any = {};
  // let size;
  // for (const axis of plot.file.axes) {
  //   dataAxes[axis] = plot.getAxisData(axis);
  //   if (size !== undefined && dataAxes[axis].length !== size) {
  //     throw Error("Axes of different size were found");
  //   } else if (size === undefined) size = dataAxes[axis].length;
  // }
  // let data = Array(size)
  //   .fill(0)
  //   .map((_, i) => {
  //     const obj: any = {};
  //     for (const axis of plot.file.axes) {
  //       obj[axis] = dataAxes[axis][i];
  //     }
  //     return obj;
  //   });
  // if (filterGating) {
  //   for (const gate of plot.gates) {
  //     if (gate.displayOnlyPointsInGate) {
  //       const x = gate.gate.xAxis;
  //       const y = gate.gate.yAxis;
  //       data = data.filter((e: any) => {
  //         const inside = gate.gate.isPointInside({ x: e[x], y: e[y] });
  //         return gate.inverseGating ? !inside : inside;
  //       });
  //     }
  //   }
  // }
  // if (filterPop) {
  //   for (const gate of plot.population) {
  //     const x = gate.gate.xAxis;
  //     const y = gate.gate.yAxis;
  //     data = data.filter((e: any) => {
  //       const inside = gate.gate.isPointInside({ x: e[x], y: e[y] });
  //       return gate.inverseGating ? !inside : inside;
  //     });
  //   }
  // }

  return [getAxis(plot, plot.xAxis), getAxis(plot, plot.yAxis)];
};

export const findRangeBoundries = (
  plot: Plot,
  axisData: number[]
): [number, number] => {
  let min = axisData[0],
    max = axisData[0];
  for (const p of axisData) {
    min = Math.min(p, min);
    max = Math.max(p, max);
  }
  return [min, max];
};

export const getPointColors = (plot: Plot) => {
  const population = getPopulation(plot.population);
  const file = getFile(population.file);
  const gates = plot.gates
    .map((gate) => {
      return { gate, inverseGating: false } as PopulationGateType;
    })
    .concat(population.gates);
  const data = getDataset({
    file,
    requestedAxes: file.axes,
    requestedPlotTypes: file.axes.map((e) => plot.axisPlotTypes[e]),
    requestedPop: population.gates,
  });

  const allGates = getWorkspace().gates;
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

  const default_color =
    plot.population.length === 0
      ? "#000"
      : getGate(population.gates[0].gate).color;
  const popSize = data[file.axes[0]].length;
  const points: number[][] = [];
  const axes = Object.keys(data);
  for (let i = 0; i < popSize; i++) {
    points.push(axes.map((e) => data[e][i]));
  }
  for (let i = 0; i < popSize; i++) {
    let ans = { depth: 0, color: default_color };
    for (const gate of plot.gates) {
      const cAns = gateDFS(points[i], gate, 1);
      if (cAns.color !== null && cAns.depth > ans.depth) {
        ans = cAns;
      }
    }
    colors.push(ans.color);
  }
  return colors;
};
