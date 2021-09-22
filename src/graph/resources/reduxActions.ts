import { getWorkspace } from "graph/utils/workspace";
import { store } from "redux/store";
import { File, Gate, Plot, Population, Workspace } from "./types";

export const graphActions = {
  RESET: "workspace.RESET",
  RESET_EVERYTHING_BUT_FILES: "workspace.RESET_EVERYTHING_BUT_FILES",
  LOAD_WORKSPACE: "workspace.LOAD_WORKSPACE",
  ADD_FILE: "workspace.ADD_FILE",
  ADD_POPULATION: "workspace.ADD_POPULATION",
  ADD_PLOT: "workspace.ADD_PLOT",
  ADD_PLOTS: "workspace.ADD_PLOTS",
  ADD_GATE: "workspace.ADD_GATE",
  UPDATE_FILE: "workspace.UPDATE_FILE",
  UPDATE_POPULATION: "workspace.UPDATE_POPULATION",
  UPDATE_PLOT: "workspace.UPDATE_PLOT",
  UPDATE_PLOTS: "workspace.UPDATE_PLOTS",
  UPDATE_GATE: "workspace.UPDATE_GATE",
  DELETE_GATE: "workspace.DELETE_GATE",
  DELETE_POPULATION: "workspace.DELETE_POPULATION",
  DELETE_PLOT: "workspace.DELETE_PLOT",
  DELETE_FILE: "workspace.DELETE_FILE",
  SET_WORKSPACE_SHARED: "workspace.SET_WORKSPACE_SHARED",
};

const initialState: Workspace = {
  id: "",
  gates: [],
  files: [],
  plots: [],
  populations: [],
  previousStates: [],
  sharedWorkspace: false,
};

const graphReducers = (state: Workspace = initialState, action: any) => {
  switch (action.type) {
    case graphActions.RESET:
      return initialState;

    case graphActions.RESET_EVERYTHING_BUT_FILES:
      return {
        ...initialState,
        files: state.files,
      };

    case graphActions.LOAD_WORKSPACE:
      const newWorkspace: Workspace = action.payload.workspace;
      return newWorkspace;

    case graphActions.ADD_FILE:
      const newFile: File = action.payload.file;
      if (state.files.find((e) => e.id === newFile.id)) {
        console.error("[workspace.ADD_FILE] File already in workspace");
        return state;
      }
      return {
        ...state,
        files: [...state.files, newFile],
      };

    case graphActions.ADD_POPULATION:
      const newPop: Population = action.payload.population;
      if (state.populations.find((e) => e.id === newPop.id)) {
        console.error(
          "[workspace.ADD_POPULATION] Population already in workspace"
        );
        return state;
      }
      return {
        ...state,
        populations: [...state.populations, newPop],
      };

    case graphActions.ADD_PLOT:
      const newPlot: Plot = action.payload.plot;
      if (state.plots.find((e) => e.id === newPlot.id)) {
        console.error("[workspace.ADD_PLOT] Plot already in workspace");
        return state;
      }
      return {
        ...state,
        plots: [...state.plots, newPlot],
      };
    case graphActions.ADD_PLOTS:
      const newPlots: Array<Plot> = action.payload.plots;
      return {
        ...state,
        plots: state.plots.concat(newPlots),
      };
    case graphActions.ADD_GATE:
      const newGate = action.payload.gate;
      if (state.gates.find((e) => e.id === newGate.id)) {
        console.error("[workspace.ADD_GATE] Gate already in workspace");
        return state;
      }
      return {
        ...state,
        gates: [...state.gates, newGate],
      };

    case graphActions.UPDATE_FILE:
      const updateFile: File = action.payload.file;
      if (!state.files.find((e) => e.id === updateFile.id)) {
        console.error("[workspace.UPDATE_FILE] File does not exist");
        return state;
      }
      state.files = state.files.map((e) => {
        if (e.id === updateFile.id) return { ...e, ...updateFile };
        else return e;
      });
      return {
        ...state,
        files: state.files,
      };

    case graphActions.UPDATE_POPULATION:
      return {
        ...state,
      };

    case graphActions.UPDATE_PLOT:
      const updatePlot: Plot = action.payload.plot;
      if (!state.plots.find((e) => e.id === updatePlot.id)) {
        console.error("[workspace.UPDATE_PLOT] Plot does not exist");
        return state;
      }
      state.plots = state.plots.map((e) => {
        if (e.id === updatePlot.id) return { ...e, ...updatePlot };
        else return e;
      });
      return {
        ...state,
        plots: state.plots,
      };

    case graphActions.UPDATE_PLOTS:
      const updatePlots: Plot[] = action.payload.plots;
      for (const plot of updatePlots) {
        if (!state.plots.find((e) => e.id === plot.id)) {
          console.error(
            "[workspace.UPDATE_PLOT] Plot",
            plot.id,
            "does not exist"
          );
          continue;
        }
        state.plots = state.plots.map((e) => {
          if (e.id === plot.id) return { ...e, ...plot };
          else return e;
        });
      }
      return {
        ...state,
        plots: state.plots,
      };

    case graphActions.UPDATE_GATE:
      const updateGate: Gate = action.payload.gate;
      if (!state.gates.find((e) => e.id === updateGate.id)) {
        console.error("[workspace.UPDATE_GATE] Gate does not exist");
        return state;
      }
      state.gates = state.gates.map((e) => {
        if (e.id === updateGate.id) return { ...e, ...updateGate };
        else return e;
      });
      return {
        ...state,
        gates: state.gates,
      };

    case graphActions.DELETE_GATE:
      const deleteGate: Gate = action.payload.gate;
      if (!state.gates.find((e) => e.id === deleteGate.id)) {
        console.error("[workspace.DELETE_GATE] Gate does not exist");
        return state;
      }
      state.gates = state.gates.filter((e) => e.id !== deleteGate.id);
      state.plots = state.plots.map((e) => {
        e.gates = e.gates.filter((e) => e !== deleteGate.id);
        return e;
      });
      state.populations = state.populations.map((e) => {
        e.gates = e.gates.filter((e) => e.gate !== deleteGate.id);
        return e;
      });
      return {
        ...state,
        gates: state.gates,
        populations: state.populations,
        plots: state.plots,
      };

    case graphActions.DELETE_POPULATION:
      return {
        ...state,
      };

    case graphActions.DELETE_PLOT:
      const deletePlot: Plot = action.payload.plot;
      if (!state.plots.find((e) => e.id === deletePlot.id)) {
        console.error("[workspace.DELETE_PLOT] Plot does not exist");
        return state;
      }
      state.plots = state.plots.filter((e) => e.id !== deletePlot.id);
      return {
        ...state,
      };

    case graphActions.DELETE_FILE:
      return {
        ...state,
      };

    case graphActions.SET_WORKSPACE_SHARED:
      return {
        ...state,
        sharedWorkspace: action.payload.sharedWorkspace,
      };

    default:
      return state;
  }
};

export default graphReducers;

export const dispatchBatch = async (operations: any[]) => {
  let workspace = getWorkspace();
  for (const operation of operations) {
    workspace = graphReducers(workspace, operation);
  }
  await store.dispatch({
    action: "workspace.LOAD_WORKSPACE",
    payload: { workspace },
  });
};
