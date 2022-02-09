import { workspaceActions2 } from "./workspaceActions";
import { store } from "redux/store";
import { Plot2, PolygonGate2 } from "graph/resources/types";

const Workspace2Dispatch = {
  AddPlot: (plot: Plot2, fileId?: string) => {
    return store.dispatch({
      type: workspaceActions2.ADD_PLOT,
      payload: { plot, fileId },
    });
  },
  DeletePlot: (plotId: string) => {
    return store.dispatch({
      type: workspaceActions2.DELETE_PLOT,
      payload: { plotId },
    });
  },
  AddGate: (gate: PolygonGate2) => {
    return store.dispatch({
      type: workspaceActions2.ADD_GATE,
      payload: { gate },
    });
  },
  UpdateGate: (gate: PolygonGate2) => {
    return store.dispatch({
      type: workspaceActions2.UPDATE_GATE,
      payload: { gate },
    });
  },
};

export default Workspace2Dispatch;
