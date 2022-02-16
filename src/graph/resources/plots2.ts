import { createID } from "graph/utils/id";
import { MINH, MINW } from "graph/components/workspaces/PlotController";
import WorkspaceDispatch from "graph/workspaceRedux2/workspaceDispatcher";
import EventQueueDispatch from "graph/workspaceRedux2/eventQueue2Dispatcher";
import { Plot2, File, PlotType, PlotsRerender } from "./types";
import { getWorkspace2, getFileById2 } from "graph/utils/workspace2";
import { getFile } from "graph/utils/workspace";
import { getDataset } from "./dataset";
import FCSServices from "services/FCSServices/FCSServices";

export const createPlot = ({
  fileId,
  gateId,
  updateSelectedFile,
}: {
  fileId: string;
  gateId?: string;
  updateSelectedFile?: boolean;
}) => {
  const id = createID();
  const { axes } = getFile(fileId);

  const plot: Plot2 = {
    _id: id,
    file: fileId,
    gateId: gateId ? gateId : "All",
    gatingActive: "",
    dimensions: { w: MINW, h: MINH },
    histogramAxis: "",
    plotWidth: 319,
    plotHeight: 204,
    plotScale: 2,
    xAxis: axes[0],
    yAxis: axes[1],
    positions: { x: 0, y: 0 },
    xPlotType: "lin",
    yPlotType: "lin",
  };
  if (updateSelectedFile) {
    // creates a plot and updates selected file
    WorkspaceDispatch.AddPlot(plot, fileId);
  } else {
    // only creates a plot
    WorkspaceDispatch.AddPlot(plot);
  }
};

export const getPlot2 = (plotId: string): Plot2 | undefined => {
  const workspace = getWorkspace2();
  return workspace.plots[plotId];
};

export const updateAxis = (axis: string, value: string, plot: Plot2) => {
  plot.gatingActive = "";
  const file: File = getFileById2(plot.file);
  if (file) {
    plot.gatingActive = "";
    if (axis === "x") {
      plot.xAxis = value;
      plot.xPlotType = file.defaultAxisPlotTypes[value];
    } else if (axis === "y") {
      plot.yAxis = value;
      plot.yPlotType = file.defaultAxisPlotTypes[value];
    }
    WorkspaceDispatch.UpdatePlot(plot);
  }
};

export const setPlotType = (axis: "x" | "y", plot: Plot2, value: PlotType) => {
  plot.gatingActive = "";
  if (axis === "x") {
    plot.xPlotType = value;
  } else {
    plot.yPlotType = value;
  }
};

// historam
export const updateHistogramAxis = (plot: Plot2, axisName?: string) => {
  const file: File = getFileById2(plot.file);
  if (plot.histogramAxis === "") {
    // Set yAxis to xAxis
    // set histogramAxis === "verticle"
    plot.histogramAxis = "vertical";
    plot.yAxis = plot.xAxis;
    plot.yPlotType = file.defaultAxisPlotTypes[plot.xAxis];
  } else {
    // set histogramAxis === ""
    // Set yAxis to new value
    plot.histogramAxis = "";
    plot.yAxis = axisName;
    plot.yPlotType = file.defaultAxisPlotTypes[axisName];
  }
  WorkspaceDispatch.UpdatePlot(plot);
};

export const getHistogramBins = (plot: Plot2, binCount: number) => {
  const file: File = getFileById2(plot.file);
  binCount = Math.round(binCount);
  let range = file.defaultRanges[plot.xAxis + "-" + plot.xPlotType];

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

export const getHistogramAxisData = (plot: Plot2) => {
  const file: File = getFileById2(plot.file);
  const dataset = getDataset(file.id);
  return dataset[plot.xAxis];
};

export const updateGatingActive = (plot: Plot2) => {
  if (plot.gatingActive) {
    plot.gatingActive = "";
    let plotsRerenderQueueItem: PlotsRerender = {
      id: "",
      used: false,
      type: "plotsRerender",
      plotIDs: [plot._id],
    };
    EventQueueDispatch.AddQueueItem(plotsRerenderQueueItem);
  } else {
    plot.gatingActive = plot.histogramAxis ? "histogram" : "polygon";
  }
  WorkspaceDispatch.UpdatePlot(plot);
};
