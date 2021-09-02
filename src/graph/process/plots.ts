/*
  plot is supposed to store all data related to a single plot, including
  rendering params, so that it can be constructed, reconstructed and changed 
  easily.
*/

import Gate from "../dataManagement/gate/gate";
import { generateColor } from "graph/utils/color";
import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import FCSServices from "services/FCSServices/FCSServices";
import PopulationModel from "graph/process/populationModel";
import {
  AxisName,
  Dimension,
  HistogramAxisType,
  Plot,
  PlotID,
  PlotType,
  Point2D,
  PopulationID,
  Range,
  Workspace,
} from "./types";
import { createID } from "graph/utils/id";
import { getFile, getPlot, getPopulation } from "graph/utils/workspace";
import { getFSCandSSCAxisOnAxesList } from "graph/utils/stringProcessing";
import { store } from "redux/store";


const commitPlotChange = (plot: Plot) => {
  store.dispatch({
    action: 'UPDATE_PLOT',
    payload: { plot }
  })
}

// It's up to the caller to decide when he commits this new plot
// this is why redux is not called.
export const createPlot = (clonePlot?: Plot, params?: {
  id?: PlotID,
  population?: PopulationID
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
    dimensions: {w:0, h:0},
    positions: {x:0,y:0},
    parentPlotId: "",
  };
  if (clonePlot) newPlot = clonePlot;
  if (params?.id) newPlot.id = params.id;
  else newPlot.id = createID();
  setupPlot(newPlot);
  return newPlot;
}
  
export const setupPlot = (plot: Plot) =>  {
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
    commitPlotChange(plot)
}
  
export const getPlotOverlays = (plot: Plot)  => {
  return plot.histogramOverlays.map((e: any) => {
    return {
      plot: getPlot(e.plot),
      color: e.color,
    };
  });
}
  
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
  commitPlotChange(plot)
}

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
  commitPlotChange(plot)
}

  export const removeBarOverlay = (plot: Plot, overlayPlot: PlotID)  => {
    plot.histogramBarOverlays = plot.histogramBarOverlays.filter(
      (x) => x.plotId !== overlayPlot
    );
    commitPlotChange(plot)
  }

  export const removeAnyOverlay = (plot: Plot,ploDataID: string) =>  {
    plot.histogramBarOverlays = plot.histogramBarOverlays.filter(
      (x) => x.plotId !== ploDataID
    );
    plot.histogramOverlays = plot.histogramOverlays.filter(
      (x) => x.plotId !== ploDataID
    );
    commitPlotChange(plot);
  }

  export const removeOverlay = (plot: Plot, PopulationModelID: string)  => {
    plot.histogramOverlays = plot.histogramOverlays.filter(
      (e) => e.plotId !== PopulationModelID
    );

    commitPlotChange(plot);
  }

  export const createNewPlotFromPlot = (plot: Plot, inverse: boolean = false)  => {
    const newPlot = createPlot(plot);
    newPlot.setState(plot.getState());
    newPlot.populationModel = plot.populationModel.createSubpop(inverse);
    newPlot.parentPlotId = plot.id;
    newPlot.updateGateObservers();
    newPlot.positions = {
      x: -1,
      y: -1,
    };
    newPlot.dimensions = {
      w: 10,
      h: 12,
    };
    newPlot.parentPlotId = plot.id;
    store.dispatch({
      action: 'ADD_PLOT',
      payload: {
        plot: newPlot
      } 
    })
  }

  /* ALTER PLOT STATE */

  export const addGate = (plot: Plot,gate: Gate, forceGatedPoints: boolean = false) =>  {
    plot.populationModel.addGate(gate, forceGatedPoints);
  }

  export const removeGate = plot: Plot,(gate: Gate) =>  {
    const gateQuery = plot.gates.filter((g) => g.gate.id === gate.id);
    if (gateQuery.length !== 1) {
      if (gateQuery.length < 1)
        throw Error("Gate with ID = " + gate.id + " was not found");
      if (gateQuery.length > 1) {
        throw Error("Multiple gates with ID = " + gate.id + " were found");
      }
    }
    plot.gates = plot.gates.filter((g) => g.gate.id !== gate.id);

    plot.axisDataCache = null;
  }

  export const addPopulation = (plot: Plot,gate: Gate) =>  {
    const gateQuery = plot.population.filter((g) => g.gate.id === gate.id);
    if (gateQuery.length > 0) {
      throw Error(
        "Adding the same gate with ID = " + gate.id + " twice to plot"
      );
    }
    plot.population.push({
      gate: gate,
      inverseGating: false,
    });

    plot.axisDataCache = null;
  }

  export const removePopulation = (plot: Plot,gate: Gate)  => {
    const gateQuery = plot.population.filter((g) => g.gate.id === gate.id);
    if (gateQuery.length !== 1) {
      if (gateQuery.length < 1)
        throw Error("Gate with ID = " + gate.id + " was not found");
      if (gateQuery.length > 1) {
        throw Error("Multiple gates with ID = " + gate.id + " were found");
      }
    }
    plot.population = plot.population.filter((g) => g.gate.id !== gate.id);

    plot.axisDataCache = null;
  }

  export const getGates = (plot: Plot): Gate[]  => {
    return plot.gates.map((e) => e.gate);
  }

  export const getGatesAndPopulation = (plot: Plot,): Gate[] =>  {
    return [
      ...plot.gates.map((e) => e.gate),
      ...plot.population.map((e) => e.gate),
    ];
  }

  export const setWidthAndHeight = (plot: Plot,w: number, h: number) =>  {
    plot.changed =
      plot.changed || plot.plotWidth !== w || plot.plotHeight !== h;
    plot.plotWidth = w - 40;
    plot.plotHeight = h - 30;
  }

  export const setXAxisPlotType = (plot: Plot,plotType: string)  => {
    plot.changed = plot.changed || plot.xPlotType !== plotType;
    plot.xPlotType = plotType;
  }

  export const setYAxisPlotType = (plot: Plot,plotType: string)  => {
    plot.changed = plot.changed || plot.yPlotType !== plotType;
    plot.yPlotType = plotType;
  }

  export const xAxisToHistogram = (plot: Plot,)  => {
    plot.changed = plot.changed || plot.yAxis !== plot.xAxis;
    plot.yAxis = plot.xAxis;
    plot.xHistogram = true;
    plot.histogramAxis = "vertical";
  }

  export const yAxisToHistogram = (plot: Plot,)  => {
    plot.changed = plot.changed || plot.yAxis !== plot.xAxis;
    plot.xAxis = plot.yAxis;
    plot.yHistogram = true;
    plot.histogramAxis = "horizontal";
  }

  export const setXAxis = (plot: Plot,xAxis: string)  => {
    plot.changed = plot.changed || xAxis !== plot.xAxis;
    plot.xAxis = xAxis;
    plot.xPlotType = plot.rangePlotType.get(xAxis);
  }

  export const setYAxis = (plot: Plot,yAxis: string)  => {
    plot.changed = plot.changed || yAxis !== plot.yAxis;
    plot.yAxis = yAxis;
    plot.yPlotType = plot.rangePlotType.get(yAxis);
  }

  export const disableHistogram = (plot: Plot,axis: "x" | "y")  => {
    if (axis === "x") plot.xHistogram = false;
    else plot.yHistogram = false;
  }

  /* PLOT STATE GETTERS */

  export const getPointColors = (plot: Plot,) =>  {
    const allData = plot.getAxesData(false);
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
        ? DEFAULT_COLOR
        : plot.population[0].gate.color;
    for (let i = 0; i < allData.length; i++) {
      let ans = { depth: 0, color: default_color };
      for (const gate of plot.gates) {
        const cAns = gateDFS(allData[i], gate, 1);
        if (cAns.color !== null && cAns.depth > ans.depth) {
          ans = cAns;
        }
      }
      colors.push(ans.color);
    }
    return colors;
  }

  export const getXAxisName = (plot: Plot,) =>  {
    return plot.xAxis;
  }

  export const getYAxisName = (plot: Plot,)  => {
    return plot.yAxis;
  }

  export const getXandYData = (
    plot: Plot,
    targetXAxis?: string,
    targetYAxis?: string
  ): { xAxis: number[]; yAxis: number[] }  => {
    const xAxisName = targetXAxis !== undefined ? targetXAxis : plot.xAxis;
    const yAxisName = targetYAxis !== undefined ? targetYAxis : plot.yAxis;
    let xAxis: number[] = [];
    let yAxis: number[] = [];
    plot.getAxesData().forEach((e) => {
      xAxis.push(e[xAxisName]);
      yAxis.push(e[yAxisName]);
    });

    return { xAxis, yAxis };
  }

  export const getAxis = (plot: Plot,targetAxis: string): number[] =>  {
    const data: number[] = [];
    plot.getAxesData().forEach((e) => {
      data.push(e[targetAxis]);
    });
    return data;
  }

  export const getXandYRanges = (
    plot: Plot,
    targetXAxis?: string,
    targetYAxis?: string
  ): { x: [number, number]; y: [number, number] }  => {
    targetXAxis = targetXAxis === undefined ? plot.xAxis : targetXAxis;
    targetYAxis = targetYAxis === undefined ? plot.yAxis : targetYAxis;
    if (
      plot.ranges.constructor.name !== "Map" ||
      !plot.ranges.has(targetXAxis) ||
      !plot.ranges.has(targetYAxis)
    ) {
      plot.findAllRanges();
    }
    return {
      x: plot.ranges.get(targetXAxis),
      y: plot.ranges.get(targetYAxis),
    };
  }

  const STD_BIN_SIZE = 50;
  export const getBins = (plot: Plot,binCount?: number, targetAxis?: string) { => 
    binCount = binCount === undefined ? plot.getBinCount() : binCount;
    const axisName =
      targetAxis === undefined
        ? plot.histogramAxis === "vertical"
          ? plot.xAxis
          : plot.yAxis
        : targetAxis;
    let range = plot.ranges.get(axisName);
    let axis = plot.getAxis(axisName);
    if (
      (plot.xAxis === axisName && plot.xPlotType === "bi") ||
      (plot.yAxis === axisName && plot.yPlotType === "bi")
    ) {
      const fcsServices = new FCSServices();
      const linearRange = plot.ranges.get(axisName);
      axis = fcsServices.logicleMarkTransformer(
        [...axis],
        linearRange[0],
        linearRange[1]
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
  }

  export const getBinCount  =(plot: Plot,)  => {
    return plot.histogramAxis === "horizontal"
      ? plot.plotWidth / plot.STD_BIN_SIZE
      : plot.plotHeight / plot.STD_BIN_SIZE;
  }

  export const resetOriginalRanges =(plot: Plot,)  => {
    if (
      !plot?.file ||
      !plot?.file?.remoteData ||
      !plot.file?.plotTypes ||
      !plot?.file?.remoteData?.paramsAnalysis
    ) {
      throw Error("No original range exists");
    }
    plot.findAllRanges();
  }

  const axisDataCache: null | {
    plot: Plot,
    data: any[];
    filterGating: boolean;
    filterPop: boolean;
  } = null;
  export const getAxesData = (filterGating: boolean = true, filterPop: boolean = true): any[]  => {
    if (
      plot.axisDataCache !== null &&
      plot.axisDataCache.filterGating === filterGating &&
      plot.axisDataCache.filterPop === filterPop
    )
      return plot.axisDataCache.data;
    let dataAxes: any = {};
    let size;
    for (const axis of plot.file.axes) {
      dataAxes[axis] = plot.getAxisData(axis);
      if (size !== undefined && dataAxes[axis].length !== size) {
        throw Error("Axes of different size were found");
      } else if (size === undefined) size = dataAxes[axis].length;
    }
    let data = Array(size)
      .fill(0)
      .map((_, i) => {
        const obj: any = {};
        for (const axis of plot.file.axes) {
          obj[axis] = dataAxes[axis][i];
        }
        return obj;
      });
    if (filterGating) {
      for (const gate of plot.gates) {
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
      for (const gate of plot.population) {
        const x = gate.gate.xAxis;
        const y = gate.gate.yAxis;
        data = data.filter((e: any) => {
          const inside = gate.gate.isPointInside({ x: e[x], y: e[y] });
          return gate.inverseGating ? !inside : inside;
        });
      }
    }
    //@ts-ignore
    plot.axisDataCache = { data, filterGating, filterPop };
    return data;
  }

export const findRangeBoundries = (plot: Plot,axisData: number[]): [number, number] =>  {
    let min = axisData[0],
      max = axisData[0];
    for (const p of axisData) {
      min = Math.min(p, min);
      max = Math.max(p, max);
    }
    return [min, max];
  }