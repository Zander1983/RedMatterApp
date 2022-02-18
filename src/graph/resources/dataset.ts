import { getGate } from "graph/utils/workspace";
import { getPlotFile } from "./plots";
import {
  Color,
  Dataset,
  File,
  FileID,
  Gate,
  Gate2D,
  GateID,
  HistogramGate,
  Point,
  PolygonGate,
  PolygonGate2,
  PopulationGateType,
} from "./types";
import { getWorkspace2 } from "graph/utils/workspace2";
import {
  pointInsidePolygon,
  pointInsidePolygon2,
} from "graph/utils/euclidianPlane";
import FCSServices from "services/FCSServices/FCSServices";
import { ColorSchema } from "graph/utils/color";

/*
    Public
*/

export const createDataset = (data: number[][], file: File): FileID => {
  if (data.length === 0 || data[0].length === 0) {
    throw Error("Empty dataset");
  }
  let axisCount = data.length;
  let dataCount = data[0].length;
  let axes: number[][] = [];
  if (dataCount < axisCount) {
    let temp = axisCount;
    axisCount = dataCount;
    dataCount = temp;
    while (axes.length < axisCount) axes.push([]);
    for (let i = 0; i < dataCount; i++) {
      for (let j = 0; j < axisCount; j++) {
        axes[j].push(data[i][j]);
      }
    }
  } else {
    while (axes.length < axisCount) axes.push([]);
    for (let i = 0; i < dataCount; i++) {
      for (let j = 0; j < axisCount; j++) {
        axes[i].push(data[i][j]);
      }
    }
  }

  let dataset: Dataset = {};
  let i = 0;
  for (const list of axes) {
    dataset[file.axes[i++]] = new Float32Array(list);
  }

  const storage = new DatasetStorage();
  const id = storage.store(file.id, dataset);
  return id;
};

export const deleteDataset = (id: FileID) => {
  const storage = new DatasetStorage();
  storage.delete(id);
};

export const getDataset = (fileId: FileID): Dataset => {
  const storage = new DatasetStorage();
  return storage.retrieve(fileId);
};

/*
    Private
*/

class DatasetStorage {
  static instance: DatasetStorage | null = null;
  datasets: Map<FileID, Dataset> = new Map();

  constructor() {
    if (DatasetStorage.instance) {
      return DatasetStorage.instance;
    }
    DatasetStorage.instance = this;
  }

  retrieve(id: FileID): Dataset {
    if (!this.datasets.has(id)) {
      throw Error("Dataset not found");
    }
    return this.datasets.get(id);
  }

  store(id: string, dataset: Dataset): FileID {
    this.datasets.set(id, dataset);
    return id;
  }

  delete(id: FileID) {
    if (!this.datasets.has(id)) {
      throw Error("Dataset not found");
    }
    return this.datasets.delete(id);
  }
}

/*
    Transformations
*/

export const memResetDatasetCache = () => {
  resetGate2BiConverterCache();
  resetPoint2BiConverterCache();
  resetGetDatasetFilteredPointsCache();
};

const fcsServices = new FCSServices();
let axesLookup: { [index: string]: number } = {};

export const isPointInside = (
  gate: { gate: Gate; inverseGating: boolean },
  point: number[]
): boolean => {
  let pointInside = false;
  if (gate.gate.gateType === "polygon") {
    const cGate = gate.gate as PolygonGate;
    const p = {
      x: point[axesLookup[cGate.xAxis]],
      y: point[axesLookup[cGate.yAxis]],
    };
    pointInside = pointInsidePolygon(p, cGate.points);
  } else if (gate.gate.gateType === "histogram") {
    const cGate = gate.gate as HistogramGate;
    const p = point[axesLookup[cGate.axis]];
    pointInside = p >= cGate.points[0] && p <= cGate.points[1];
  } else {
    throw Error("gate type not supported");
  }
  return pointInside ? !gate.inverseGating : gate.inverseGating;
};

export const isPointInside2 = (
  gate: PolygonGate2,
  point: number[]
): boolean => {
  console.log("I'm called");
  let pointInside = false;
  if (gate.gateType === "polygon") {
    const p = {
      x: point[axesLookup[gate.xAxis]],
      y: point[axesLookup[gate.yAxis]],
    };
    pointInside = pointInsidePolygon2(p, gate.points[0].points);
  }
  // else if (gate.gate.gateType === "histogram") {
  //   const cGate = gate.gate as HistogramGate;
  //   const p = point[axesLookup[cGate.axis]];
  //   pointInside = p >= cGate.points[0] && p <= cGate.points[1];
  // } else {
  //   throw Error("gate type not supported");
  // }
  return pointInside;
};

const gateDFS = (
  point: number[],
  gate: PopulationGateType,
  currentDepth: number
): { depth: number; color: string | null } => {
  const cGate = gate2BiConverter(gate);
  if (!isPointInside(cGate, point)) {
    return { depth: 0, color: null };
  }
  let ans = { depth: currentDepth, color: cGate.gate.color };
  for (let child of cGate.gate.children) {
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

export const getDatasetColors = (
  dataset: Dataset,
  populationGates: PopulationGateType[],
  plotGates: GateID[],
  stdColor: Color = "#000"
): ColorSchema => {
  if (populationGates.length === 0 && plotGates.length === 0) {
    return new ColorSchema([stdColor]);
  }
  if (populationGates.length === 1 && plotGates.length === 0) {
    return new ColorSchema([getGate(populationGates[0].gate).color]);
  }
  const nPlotGates = plotGates.map((e) => {
    return { gate: e, inverseGating: false } as PopulationGateType;
  });
  const colors: string[] = [];
  const axes = Object.keys(dataset);
  axesLookup = {};
  axes.forEach((e, i) => (axesLookup[e] = i));
  const dataLength = dataset[axes[0]].length;
  const gates = [...populationGates, ...nPlotGates];

  for (let i = 0; i < dataLength; i++) {
    let ans = { depth: 0, color: stdColor };
    const x: number[] = [];
    for (const key of axes) {
      x.push(dataset[key][i]);
    }

    for (const gate of gates) {
      let newX = point2BiConverter(x, gate2BiConverter(gate));
      if (!getGate(gate.gate)) continue;
      const cAns = gateDFS(newX, gate, 1);
      if (cAns.color !== null && cAns.depth > ans.depth) {
        ans = cAns;
      }
    }
    colors.push(ans.color);
  }
  const colorSchema = new ColorSchema(colors);
  return colorSchema;
};

const getDatasetFilteredPointsCache = new Map<
  {
    dataset: Dataset;
    gateName: string;
  },
  Dataset
>();
const resetGetDatasetFilteredPointsCache = () => gate2BiConverterCache.clear();

export const getFilteredPointsFromDataset = (
  dataset: Dataset,
  gateName: string
) => {
  if (
    getDatasetFilteredPointsCache.has({
      dataset,
      gateName,
    })
  ) {
    console.log("PeyeGesi");
    return getDatasetFilteredPointsCache.get({
      dataset,
      gateName,
    });
  }
  const gatingSets = getWorkspace2().gatingSets;
  let gate: PolygonGate2;
  for (let i = 0; i < gatingSets.length; i++) {
    for (let j = 0; j < gatingSets[i].length; j++) {
      if (gatingSets[i][j].name === gateName) {
        gate = gatingSets[i][j];
      }
    }
  }
  if (!gate) return dataset;
  const axes = Object.keys(dataset);
  axesLookup = {};
  axes.forEach((e, i) => (axesLookup[e] = i));
  const size = dataset[axes[0]].length;
  for (const axis of Object.keys(dataset)) {
    if (dataset[axis].length !== size)
      throw Error("Axes of different size were found");
  }
  const transformedDataset: Dataset = {};
  const addIndexes: number[] = [];
  let dontAdd = false;
  console.log(size, gateName);
  for (let i = 0; i < size; i++) {
    dontAdd = false;
    const x: number[] = [];
    for (const axis of axes) {
      x.push(dataset[axis][i]);
    }

    let newX = point2BiConverter2(x, gate);

    const inside = isPointInside2(gate, newX);
    if (!inside) {
      dontAdd = true;
      break;
    }

    if (dontAdd) continue;
    addIndexes.push(i);
  }

  for (const axis of axes)
    transformedDataset[axis] = new Float32Array(addIndexes.length);

  for (let i = 0; i < addIndexes.length; i++)
    for (const axis of axes)
      transformedDataset[axis][i] = dataset[axis][addIndexes[i]];

  getDatasetFilteredPointsCache.set({ dataset, gateName }, transformedDataset);

  return transformedDataset;
};

export const getDatasetFilteredPoints = (
  dataset: Dataset,
  targets: PopulationGateType[]
): Dataset => {
  // if (
  //   getDatasetFilteredPointsCache.has({
  //     dataset,
  //     targets,
  //   })
  // ) {
  //   return getDatasetFilteredPointsCache.get({
  //     dataset,
  //     targets,
  //   });
  // }
  resetGate2BiConverterCache();
  const gates = targets.map((e) => gate2BiConverter(e));
  const axes = Object.keys(dataset);
  axesLookup = {};
  axes.forEach((e, i) => (axesLookup[e] = i));
  const size = dataset[axes[0]].length;
  for (const axis of Object.keys(dataset)) {
    if (dataset[axis].length !== size)
      throw Error("Axes of different size were found");
  }
  const transformedDataset: Dataset = {};
  const addIndexes: number[] = [];
  let dontAdd = false;
  for (let i = 0; i < size; i++) {
    dontAdd = false;
    const x: number[] = [];
    for (const axis of axes) {
      x.push(dataset[axis][i]);
    }
    for (const gate of gates) {
      let newX = point2BiConverter(x, gate);
      const inside = isPointInside(gate, newX);
      if (!inside) {
        dontAdd = true;
        break;
      }
    }
    if (dontAdd) continue;
    addIndexes.push(i);
  }

  for (const axis of axes)
    transformedDataset[axis] = new Float32Array(addIndexes.length);

  for (let i = 0; i < addIndexes.length; i++)
    for (const axis of axes)
      transformedDataset[axis][i] = dataset[axis][addIndexes[i]];

  // getDatasetFilteredPointsCache.set({ dataset, targets }, transformedDataset);
  return transformedDataset;
};

export const isPointInsideWithLogicle = (
  gate: { gate: PolygonGate; inverseGating: boolean },
  point: Point,
  forceRaw: boolean = false
): boolean => {
  let points = gate.gate.points.map((e) => {
    return { ...e };
  });
  if (forceRaw) {
    return pointInsidePolygon(point, points);
  }
  const ranges = [gate.gate.xAxisOriginalRanges, gate.gate.yAxisOriginalRanges];
  const convert = (e: { x: number; y: number }) => {
    if (gate.gate.xAxisType === "bi")
      e.x = fcsServices.logicleMarkTransformer(
        [e.x],
        ranges[0][0],
        ranges[0][1]
      )[0];
    if (gate.gate.yAxisType === "bi")
      e.y = fcsServices.logicleMarkTransformer(
        [e.y],
        ranges[1][0],
        ranges[1][1]
      )[0];
    return e;
  };
  const rawConvert = (e: { x: number; y: number }) => {
    if (gate.gate.xAxisType === "bi")
      e.x = (e.x - ranges[0][0]) / (ranges[0][1] - ranges[0][0]);
    if (gate.gate.yAxisType === "bi")
      e.y = (e.y - ranges[1][0]) / (ranges[1][1] - ranges[1][0]);
    return e;
  };
  points = points.map((e) => rawConvert(e));
  point = convert(point);
  return pointInsidePolygon(point, points);
};

export const isPointInsideInterval = (
  gate: { gate: HistogramGate; inverseGating: boolean },
  point: Point,
  forceRaw: boolean = false
): boolean => {
  let points = [...gate.gate.points];
  let targetPoint = point.x;
  if (forceRaw) {
    return (
      targetPoint <= Math.max(gate.gate.points[0], gate.gate.points[1]) &&
      targetPoint >= Math.min(gate.gate.points[0], gate.gate.points[1])
    );
  }
  const range = gate.gate.axisOriginalRanges;
  const convert = (e: number) => {
    if (gate.gate.axisType === "bi")
      e = fcsServices.logicleMarkTransformer([e], range[0], range[1])[0];
    return e;
  };
  const rawConvert = (e: number) => {
    if (gate.gate.axisType === "bi") e = (e - range[0]) / (range[1] - range[0]);
    return e;
  };
  points = points.map((e) => rawConvert(e));
  targetPoint = convert(targetPoint);
  return (
    targetPoint <= Math.max(points[0], points[1]) &&
    targetPoint >= Math.min(points[0], points[1])
  );
};

const gate2BiConverterCache = new Map<
  {
    gate: Gate;
    inverseGating: boolean;
  },
  {
    gate: Gate;
    inverseGating: boolean;
  }
>();
const resetGate2BiConverterCache = () => gate2BiConverterCache.clear();

const gate2BiConverter = (e: PopulationGateType) => {
  if (
    gate2BiConverterCache.has({
      gate: getGate(e.gate),
      inverseGating: e.inverseGating,
    })
  ) {
    return gate2BiConverterCache.get({
      gate: getGate(e.gate),
      inverseGating: e.inverseGating,
    });
  }
  const gate = getGate(e.gate);
  if (gate?.gateType === "polygon") {
    const newGate = {
      //@ts-ignore
      gate: { ...(gate as PolygonGate) },
      inverseGating: e.inverseGating,
    };
    newGate.gate.points = [
      ...newGate.gate.points.map((e) => {
        return { ...e };
      }),
    ];
    if (newGate.gate.xAxisType === "bi") {
      const xRange = newGate.gate.xAxisOriginalRanges;
      newGate.gate.points = newGate.gate.points.map((e, i) => {
        const newX = (e.x - xRange[0]) / (xRange[1] - xRange[0]);
        return { x: newX, y: e.y };
      });
    }
    if (newGate.gate.yAxisType === "bi") {
      const yRange = newGate.gate.yAxisOriginalRanges;
      newGate.gate.points = newGate.gate.points.map((e, i) => {
        const newY = (e.y - yRange[0]) / (yRange[1] - yRange[0]);
        return { x: e.x, y: newY };
      });
    }
    gate2BiConverterCache.set(
      {
        gate: getGate(e.gate),
        inverseGating: e.inverseGating,
      },
      newGate
    );
    return newGate;
  }
  if (gate.gateType === "histogram") {
    let newGate = {
      gate: { ...(gate as HistogramGate) },
      inverseGating: e.inverseGating,
    };
    newGate.gate.points = [...newGate.gate.points];
    if (newGate.gate.axisType === "bi") {
      const range = newGate.gate.axisOriginalRanges;
      newGate.gate.points = newGate.gate.points.map((e, i) => {
        return (e - range[0]) / (range[1] - range[0]);
      }) as [number, number];
    }
    gate2BiConverterCache.set(
      {
        gate: getGate(e.gate),
        inverseGating: e.inverseGating,
      },
      newGate
    );
    return newGate;
  }
  throw new Error("Gate type not found");
};

const point2BiConverterCache = new Map<number, number>();
const resetPoint2BiConverterCache = () => point2BiConverterCache.clear();

const point2BiConverter = (
  x: number[],
  gate: { gate: Gate; inverseGating: boolean }
) => {
  const newX = [...x];
  if (gate.gate.gateType === "polygon") {
    const cGate = gate.gate as PolygonGate;
    if (cGate.xAxisType === "bi") {
      newX[axesLookup[cGate.xAxis]] = fcsServices.logicleMarkTransformer(
        [newX[axesLookup[cGate.xAxis]]],
        cGate.xAxisOriginalRanges[0],
        cGate.xAxisOriginalRanges[1]
      )[0];
    }
    if (cGate.yAxisType === "bi") {
      newX[axesLookup[cGate.yAxis]] = fcsServices.logicleMarkTransformer(
        [newX[axesLookup[cGate.yAxis]]],
        cGate.yAxisOriginalRanges[0],
        cGate.yAxisOriginalRanges[1]
      )[0];
    }
    return newX;
  }
  if (gate.gate.gateType === "histogram") {
    const cGate = gate.gate as HistogramGate;
    if (cGate.axisType === "bi") {
      newX[axesLookup[cGate.axis]] = fcsServices.logicleMarkTransformer(
        [newX[axesLookup[cGate.axis]]],
        cGate.axisOriginalRanges[0],
        cGate.axisOriginalRanges[1]
      )[0];
    }
    return newX;
  }
  throw new Error("Gate type not found");
};

const point2BiConverter2 = (x: number[], gate: PolygonGate2) => {
  const newX = [...x];
  if (gate.gateType === "polygon") {
    if (gate.xAxisType === "bi") {
      newX[axesLookup[gate.xAxis]] = fcsServices.logicleMarkTransformer(
        [newX[axesLookup[gate.xAxis]]],
        gate.xAxisOriginalRanges[0],
        gate.xAxisOriginalRanges[1]
      )[0];
    }
    if (gate.yAxisType === "bi") {
      newX[axesLookup[gate.yAxis]] = fcsServices.logicleMarkTransformer(
        [newX[axesLookup[gate.yAxis]]],
        gate.yAxisOriginalRanges[0],
        gate.yAxisOriginalRanges[1]
      )[0];
    }
    return newX;
  }
  // if (gate.gate.gateType === "histogram") {
  //   const cGate = gate.gate as HistogramGate;
  //   if (cGate.axisType === "bi") {
  //     newX[axesLookup[cGate.axis]] = fcsServices.logicleMarkTransformer(
  //       [newX[axesLookup[cGate.axis]]],
  //       cGate.axisOriginalRanges[0],
  //       cGate.axisOriginalRanges[1]
  //     )[0];
  //   }
  //   return newX;
  // }
  throw new Error("Gate type not found");
};
