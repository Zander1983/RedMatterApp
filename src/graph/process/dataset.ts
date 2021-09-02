import { DatasetMetadata, File } from "./types";
const ObjectHash = require("object-hash");

/*
    Public
*/

export type DatasetID = string;

export const createDataset = (
  data: number[][],
  file: File,
  metadata?: DatasetMetadata
): DatasetID => {
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

  let dataset: Dataset;
  for (const list of axes) {
    dataset.push(new Int32Array(list));
  }

  if (!metadata) {
    metadata = {
      file,
      requestedPop: [],
      requestedAxes: file.axes,
      requestedPlotTypes: [],
    };
  }

  const storage = new DatasetStorage();
  const id = storage.store({ metadata, dataset });
  return id;
};

export const deleteDataset = (id: DatasetID) => {
  const storage = new DatasetStorage();
  storage.delete(id);
};

export const getDataset = (metadata: DatasetMetadata): Dataset => {
  const hash = hashMetadata(metadata);
  const storage = new DatasetStorage();
  const { dataset } = storage.retrieve(hash);
  return dataset;
};

/*
    Private
*/

type Dataset = Int32Array[];

const hashMetadata = (metadata: DatasetMetadata): DatasetID => {
  return ObjectHash(metadata);
};

type DatasetStorageType = {
  dataset: Dataset;
  metadata: DatasetMetadata;
};
class DatasetStorage {
  static instance: DatasetStorage | null = null;
  datasets: Map<DatasetID, DatasetStorageType> = new Map();

  constructor() {
    if (DatasetStorage.instance) {
      return DatasetStorage.instance;
    }
    DatasetStorage.instance = this;
  }

  retrieve(id: DatasetID): DatasetStorageType {
    if (!this.datasets.has(id)) {
      throw Error("Dataset not found");
    }
    return this.datasets.get(id);
  }

  store(datasetObj: DatasetStorageType): DatasetID {
    const id = hashMetadata(datasetObj.metadata);
    this.datasets.set(id, datasetObj);
    return id;
  }

  delete(id: DatasetID) {
    if (!this.datasets.has(id)) {
      throw Error("Dataset not found");
    }
    return this.datasets.delete(id);
  }
}
