import { File, Gate, Plot, Population, Workspace } from "./types";

export const graphActions = {
  RESET: "workspace.RESET",
  LOAD_WORKSPACE: "workspace.LOAD_WORKSPACE",
  ADD_FILE: "workspace.ADD_FILE",
  ADD_POPULATION: "workspace.ADD_POPULATION",
  ADD_PLOT: "workspace.ADD_PLOT",
  ADD_GATE: "workspace.ADD_GATE",
  UPDATE_FILE: "workspace.UPDATE_FILE",
  UPDATE_POPULATION: "workspace.UPDATE_POPULATION",
  UPDATE_PLOT: "workspace.UPDATE_PLOT",
  UPDATE_GATE: "workspace.UPDATE_GATE",
  DELETE_GATE: "workspace.DELETE_GATE",
  DELETE_POPULATION: "workspace.DELETE_POPULATION",
  DELETE_PLOT: "workspace.DELETE_PLOT",
  DELETE_FILE: "workspace.DELETE_FILE",
  RANGE_CHANGE: "workspace.RANGE_CHANGE",
  MOUSE_EVENT: "workspace.MOUSE_EVENT",
  GATE_METADATA_UPDATE: "workspace.GATE_METADATA_UPDATE",
};

const initialState: Workspace = {
  id: "",
  gates: [],
  files: [],
  plots: [],
  populations: [],
  previousStates: [],
  mouseGateState: {
    active: "",
    targetPlot: "",
    polygonGate: {
      xAxis: "",
      yAxis: "",
      isDraggingVertex: 0,
      isDraggingGate: 0,
      gatePivot: { x: 0, y: 0 },
      points: { x: 0, y: 0 },
      targetEditGate: null,
      targetPointIndex: null,
    },
    ovalGate: {
      center: { x: 0, y: 0 },
      primaryP1: { x: 0, y: 0 },
      primaryP2: { x: 0, y: 0 },
      secondaryP1: { x: 0, y: 0 },
      secondaryP2: { x: 0, y: 0 },
      majorToMinorSize: 0,
      lastMousePos: { x: 0, y: 0 },
      ang: 0,
      xAxis: "",
      yAxis: "",
    },
    histogramGate: {},
  },
};

const graphReducers = (state: Workspace = initialState, action: any) => {
  switch (action.type) {
    case graphActions.RESET:
      return initialState;

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

    case graphActions.ADD_GATE:
      const newGate: Gate = action.payload.file;
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

    case graphActions.UPDATE_GATE:
      return {
        ...state,
      };

    case graphActions.DELETE_GATE:
      return {
        ...state,
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

    case graphActions.RANGE_CHANGE:
      return {
        ...state,
      };

    case graphActions.MOUSE_EVENT:
      return {
        ...state,
      };

    case graphActions.GATE_METADATA_UPDATE:
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default graphReducers;
