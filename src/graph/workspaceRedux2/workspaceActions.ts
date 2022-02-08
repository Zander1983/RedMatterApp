import { Plot2, PolygonGate2, Workspace2 } from "graph/resources/types";

export const workspaceActions2 = {
  ADD_PLOT: "workspace2.ADD_PLOT",
  ADD_GATE: "workspace2.ADD_GATE",
  UPDATE_GATE: "workspace2.UPDATE_GATE",
};

const initialState: Workspace2 = {
  plots: {},
  gatingSets: [],
  selectedFile: "",
  experimentId: "",
  isShared: false,
  sharedWorkspace: false,
  editWorkspace: true,
};

const workspaceReducers = (state: Workspace2 = initialState, action: any) => {
  switch (action.type) {
    case workspaceActions2.ADD_PLOT:
      const newPlot: Plot2 = action.payload.plot;
      return {
        ...state,
        plots: {
          ...state.plots,
          [newPlot._id]: newPlot,
        },
      };
    case workspaceActions2.ADD_GATE:
      const newGate: PolygonGate2 = action.payload.gate;
      if (newGate.parent === "All") {
        state.gatingSets.push([newGate]);
      } else {
        for (let i = 0; i < state.gatingSets.length; i++) {
          for (let j = 0; j < state.gatingSets[i].length; j++) {
            if (newGate.parent === state.gatingSets[i][j].name) {
              console.log("Hi....");
              state.gatingSets[i].push(newGate);
              break;
            }
          }
        }
      }
      return {
        ...state,
      };
    case workspaceActions2.UPDATE_GATE:
      const updatedGate: PolygonGate2 = action.payload.gate;

      state.gatingSets = state.gatingSets.map((set) => {
        return set.map((gate) => {
          if (gate.id === updatedGate.id) {
            return updatedGate;
          } else {
            return gate;
          }
        });
      });
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default workspaceReducers;
