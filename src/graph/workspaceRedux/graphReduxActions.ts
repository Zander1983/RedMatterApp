import { getWorkspace } from "graph/utils/workspace";
import { store } from "redux/store";
import WorkspaceDispatch from "./workspaceDispatchers";
import {
  File,
  Gate,
  Notification,
  Plot,
  Population,
  Workspace,
  GateBuilder,
} from "graph/resources/types";

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
  ADD_NOTIFICATION: "workspace.ADD_NOTIFICATION",
  DELETE_NOTIFICATION: "workspace.DELETE_NOTIFICATION",
  SET_EDIT_WORKSPACE: "workspace.SET_EDIT_WORKSPACE",
  ADD_FILEID_TO_GATEBUILDER: "workspace.ADD_FILEID_TO_GATEBUILDER",
  UPDATE_FILE_IN_GATEBUILDER: "workspace.UPDATE_FILE_IN_GATEBUILDER",
  ADD_POPULATION_TO_GATEBUILDER: "workspace.ADD_POPULATION_TO_GATEBUILDER",
  ADD_PLOT_TO_GATEBUILDER: "workspace.ADD_PLOT_TO_GATEBUILDER",
};

export const initialState: Workspace = {
  id: "",
  notifications: [],
  gates: [],
  files: [],
  plots: [],
  populations: [],
  previousStates: [],
  sharedWorkspace: false,
  editWorkspace: true,
  gateBuilder: [],
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
      let failed = false;
      newPlots.forEach((newPlot) => {
        if (state.plots.find((e) => e.id === newPlot.id)) {
          failed = true;
          console.error("[workspace.ADD_PLOTS] Plot already in workspace");
        }
      });
      if (failed) return state;
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
      state.gates = state.gates.map((e) => {
        e.children = e.children.filter((e) => e !== deleteGate.id);
        e.parents = e.parents.filter((e) => e !== deleteGate.id);
        return e;
      });
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
    case graphActions.SET_EDIT_WORKSPACE:
      return {
        ...state,
        editWorkspace: action.payload.editWorkspace,
      };
    case graphActions.ADD_NOTIFICATION:
      const newNotification: Notification = action.payload.notification;
      if (state.notifications.find((e) => e.id === newNotification.id)) {
        console.error(
          "[workspace.ADD_NOTIFICATION] Notification already exists"
        );
      }
      return {
        ...state,
        notifications: [...state.notifications, newNotification],
      };

    case graphActions.DELETE_NOTIFICATION:
      const deleteNotification: Notification = action.payload.notification;
      if (!state.notifications.find((e) => e.id === deleteNotification.id)) {
        console.error(
          "[workspace.DELETE_NOTIFICATION] Notification doesn't exist"
        );
      }
      return {
        ...state,
        notifications: state.notifications.filter(
          (e) => e.id !== deleteNotification.id
        ),
      };

    case graphActions.ADD_FILEID_TO_GATEBUILDER:
      const fileId: string = action.payload.fileId;
      const unique = state.gateBuilder.find((item) => item.fileId === fileId);
      if (!unique) {
        const newGateBuilder: GateBuilder = {
          fileId,
          files: [],
          gates: [],
          plots: [],
          populations: [],
        };
        return {
          ...state,
          gateBuilder: [...state.gateBuilder, newGateBuilder],
        };
      } else {
        return {
          ...state,
        };
      }
    case graphActions.UPDATE_FILE_IN_GATEBUILDER:
      const idForFile: string = action.payload.fileId;
      const file: File = action.payload.file;
      state.gateBuilder.map((item: GateBuilder) => {
        if (item.fileId === idForFile) {
          let found = false;

          item.files.map((item) => {
            // If the file already exist then just replacing it with the updated one
            if (item.id === fileId) {
              found = true;
              item = file;
            }
            return item;
          });
          // if the file is not found then pushing the new file in the list
          !found && item.files.push(file);
        }
        return item;
      });
      return {
        ...state,
        gateBuilder: state.gateBuilder,
      };

    case graphActions.ADD_POPULATION_TO_GATEBUILDER:
      const idForPopulation: string = action.payload.fileId;
      const population: Population = action.payload.population;

      state.gateBuilder.map((item) => {
        if (item.fileId === idForPopulation) {
          item.populations.push(population);
        }
      });

      return {
        ...state,
        gateBuilder: state.gateBuilder,
      };

    case graphActions.ADD_PLOT_TO_GATEBUILDER:
      const idForPlot: string = action.payload.fileId;
      const plot: Plot = action.payload.plot;

      state.gateBuilder.map((item) => {
        if (item.fileId === idForPlot) {
          item.plots.push(plot);
        }
      });

      return {
        ...state,
        gateBuilder: state.gateBuilder,
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
  await WorkspaceDispatch.LoadWorkspace(workspace);
};
