import { createID } from "graph/utils/id";
import { MINH, MINW } from "graph/components/workspaces/PlotController";
import WorkspaceDispatch from "graph/workspaceRedux2/workspaceDispatcher";
import { Plot2 } from "./types";
import { getFile } from "graph/utils/workspace";

export const createPlot = ({
  fileId,
  gateId,
}: {
  fileId: string;
  gateId?: string;
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
  WorkspaceDispatch.AddPlot(plot);
};
