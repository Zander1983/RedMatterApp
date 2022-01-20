import { store } from "redux/store";
import { graphActions } from "./graphReduxActions";
import {
  File,
  Gate,
  Notification,
  Plot,
  Population,
  Workspace,
} from "graph/resources/types";

const WorkspaceDispatch = {
  ResetWorkspace: () => {
    return store.dispatch({
      type: graphActions.RESET,
    });
  },
  ResetWorkspaceExceptFiles: () => {
    return store.dispatch({
      type: graphActions.RESET_EVERYTHING_BUT_FILES,
    });
  },
  LoadWorkspace: (workspace: Workspace) => {
    return store.dispatch({
      type: graphActions.LOAD_WORKSPACE,
      payload: { workspace },
    });
  },
  SetFiles: (files: File[]) => {
    return store.dispatch({
      type: graphActions.SET_FILES,
      payload: { files },
    });
  },
  AddFile: (file: File) => {
    return store.dispatch({
      type: graphActions.ADD_FILE,
      payload: { file },
    });
  },
  AddPopulation: (population: Population) => {
    return store.dispatch({
      type: graphActions.ADD_POPULATION,
      payload: { population },
    });
  },
  AddPlot: (plot: Plot) => {
    return store.dispatch({
      type: graphActions.ADD_PLOT,
      payload: { plot },
    });
  },
  AddPlots: (plots: Plot[]) => {
    return store.dispatch({
      type: graphActions.ADD_PLOTS,
      payload: { plots },
    });
  },
  AddPlotsAndPopulations: (plots: Plot[], populations: Population[]) => {
    return store.dispatch({
      type: graphActions.ADD_PLOTS_AND_POPULATIONS,
      payload: { plots, populations },
    });
  },
  DeletePlotsAndPopulations: (
    plots: string[],
    populations: string[],
    gates?: string[]
  ) => {
    return store.dispatch({
      type: graphActions.DELETE_PLOTS_GATES_AND_POPULATIONS,
      payload: { plots, populations, gates },
    });
  },
  AddGate: (gate: Gate) => {
    return store.dispatch({
      type: graphActions.ADD_GATE,
      payload: { gate },
    });
  },
  UpdateFile: (file: File) => {
    return store.dispatch({
      type: graphActions.UPDATE_FILE,
      payload: { file },
    });
  },
  UpdatePopulation: (population: Population) => {
    return store.dispatch({
      type: graphActions.UPDATE_POPULATION,
      payload: { population },
    });
  },
  UpdatePlot: (plot: Plot) => {
    return store.dispatch({
      type: graphActions.UPDATE_PLOT,
      payload: { plot },
    });
  },
  UpdatePlots: (plots: Plot[]) => {
    return store.dispatch({
      type: graphActions.UPDATE_PLOTS,
      payload: { plots },
    });
  },
  UpdateGate: (gate: Gate) => {
    return store.dispatch({
      type: graphActions.UPDATE_GATE,
      payload: { gate },
    });
  },
  DeleteFile: (file: File) => {
    return store.dispatch({
      type: graphActions.DELETE_FILE,
      payload: { file },
    });
  },
  DeletePopulation: (population: Population) => {
    return store.dispatch({
      type: graphActions.DELETE_POPULATION,
      payload: { population },
    });
  },
  DeletePlot: (plot: Plot) => {
    return store.dispatch({
      type: graphActions.DELETE_PLOT,
      payload: { plot },
    });
  },
  DeleteGate: (gate: Gate) => {
    return store.dispatch({
      type: graphActions.DELETE_GATE,
      payload: { gate },
    });
  },
  DeleteGateOnly: (gate: string) => {
    return store.dispatch({
      type: graphActions.DELETE_GATE_ONLY,
      payload: { gate },
    });
  },
  SetWorkspaceShared: (sharedWorkspace: boolean) => {
    return store.dispatch({
      type: graphActions.SET_WORKSPACE_SHARED,
      payload: { sharedWorkspace },
    });
  },
  AddNotification: (notification: Notification) => {
    return store.dispatch({
      type: graphActions.ADD_NOTIFICATION,
      payload: { notification },
    });
  },
  DeleteNotification: (notification: Notification) => {
    return store.dispatch({
      type: "workspace.DELETE_NOTIFICATION" || graphActions?.DELETE_NOTIFICATION,
      payload: { notification },
    });
  },
  SetEditWorkspace: (editWorkspace: boolean) => {
    return store.dispatch({
      type: graphActions.SET_EDIT_WORKSPACE,
      payload: { editWorkspace },
    });
  },
  UpdateSelectedFile: (fileName: string) => {
    return store.dispatch({
      type: graphActions.UPDATE_SELECTED_FILE,
      payload: { fileName },
    });
  },
};

export default WorkspaceDispatch;
