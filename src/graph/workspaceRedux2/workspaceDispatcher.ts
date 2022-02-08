import { workspaceActions2 } from "./workspaceActions";
import { store } from "redux/store";
import { Plot2, PolygonGate2 } from "graph/resources/types";

const WorkspaceDispatch = {
  AddPlot: (plot: Plot2) => {
    return store.dispatch({
      type: workspaceActions2.ADD_PLOT,
      payload: { plot },
    });
  },
  AddGate: (gate: PolygonGate2) => {
    return store.dispatch({
      type: workspaceActions2.ADD_GATE,
      payload: { gate },
    });
  },
  UpdateGateName: (gate: PolygonGate2) => {
    return store.dispatch({
      type: workspaceActions2.UPDATE_GATE,
      payload: { gate },
    });
  },
};

export default WorkspaceDispatch;
