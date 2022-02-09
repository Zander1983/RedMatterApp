import { createID } from "graph/utils/id";
import { MINH, MINW } from "graph/components/workspaces/PlotController";
import WorkspaceDispatch from "graph/workspaceRedux2/workspaceDispatcher";
import { Plot2 } from "./types";
import { getWorkspace2 } from "graph/utils/workspace2";
import { getFile } from "graph/utils/workspace";

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
    plotWidth: 380,
    plotHeight: 380,
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
