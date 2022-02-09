import { Plot2, PolygonGate2, Workspace2 } from "graph/resources/types";

export const workspaceActions2 = {
  RESET: "workspace2.RESET",
  ADD_PLOT: "workspace2.ADD_PLOT",
  DELETE_PLOT: "workspace2.DELETE_PLOT",
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
    // RESET
    case workspaceActions2.RESET:
      return {
        plots: {},
        gatingSets: [],
        selectedFile: "",
        experimentId: "",
        isShared: false,
        sharedWorkspace: false,
        editWorkspace: true,
      };
    // PLOTS
    case workspaceActions2.ADD_PLOT:
      const newPlot: Plot2 = action.payload.plot;
      const selectedFileId: string = action.payload.fileId;
      // for the very first plot creation this will execute
      if (selectedFileId) {
        return {
          ...state,
          plots: {
            ...state.plots,
            [newPlot._id]: newPlot,
          },
          selectedFile: selectedFileId,
        };
      }
      // apart from first plot creation this will execute
      return {
        ...state,
        plots: {
          ...state.plots,
          [newPlot._id]: newPlot,
        },
      };
    case workspaceActions2.DELETE_PLOT:
      delete state.plots[action.payload.plotId];
      if (Object.keys(state.plots).length === 0) {
        // Reseting the state as there's no plot left
        return {
          plots: {},
          gatingSets: [],
          selectedFile: "",
          experimentId: "",
          isShared: false,
          sharedWorkspace: false,
          editWorkspace: true,
        };
      } else {
        // updating the state after deleting the plot
        return {
          ...state,
        };
      }
    // GATES
    case workspaceActions2.ADD_GATE:
      const newGate: PolygonGate2 = action.payload.gate;
      if (newGate.parent === "All") {
        state.gatingSets.push([newGate]);
      } else {
        for (let i = 0; i < state.gatingSets.length; i++) {
          for (let j = 0; j < state.gatingSets[i].length; j++) {
            if (newGate.parent === state.gatingSets[i][j].name) {
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
