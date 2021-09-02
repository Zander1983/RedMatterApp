import { Workspace } from "../types";

export const graphActions = {
  RESET: "workspace.RESET",
  LOAD_WORKSPACE: "workspace.LOAD_WORKSPACE",
  SET_EXPERIMENT_METADATA: "workspace.SET_EXPERIMENT_METADATA",
  ADD_FILE: "workspace.ADD_FILE",
  ADD_PLOT: "workspace.ADD_PLOT",
  ADD_GATE: "workspace.ADD_GATE",
  DUPLICATE_PLOT: "workspace.DUPLICATE_PLOT",
  DUPLICATE_GATE: "workspace.DUPLICATE_GATE",
  SUBPOP_FROM_GATE: "workspace.SUBPOP_FROM_GATE",
  ADD_GATE_TO_ALL_FILES: "workspace.ADD_GATE_TO_ALL_FILES",
  LINK_GATE_TO_PLOT: "workspace.LINK_GATE_TO_PLOT",
  UNLINK_GATE_TO_PLOT: "workspace.UNLINK_GATE_TO_PLOT",
  REMOVE_GATE_FROM_WORKSPACE: "workspace.REMOVE_GATE_FROM_WORKSPACE",
  REMOVE_PLOT_FROM_WORKSPACE: "workspace.REMOVE_PLOT_FROM_WORKSPACE",
  REMOVE_FILE_FROM_WORKSPACE: "workspace.REMOVE_FILE_FROM_WORKSPACE",
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

const graphReducers = (state = initialState, action: any) => {
  switch (action.type) {
    case graphActions.RESET:
      return initialState;
    case graphActions.LOAD_WORKSPACE:
      return {
        ...state,
      };
    case graphActions.SET_EXPERIMENT_METADATA:
      return {
        ...state,
      };
    case graphActions.ADD_FILE:
      return {
        ...state,
        files: [action.payload.file, ...state.files],
      };
    case graphActions.ADD_PLOT:
      return {
        ...state,
      };
    case graphActions.ADD_GATE:
      return {
        ...state,
      };
    case graphActions.DUPLICATE_PLOT:
      return {
        ...state,
      };
    case graphActions.DUPLICATE_GATE:
      return {
        ...state,
      };
    case graphActions.SUBPOP_FROM_GATE:
      return {
        ...state,
      };
    case graphActions.ADD_GATE_TO_ALL_FILES:
      return {
        ...state,
      };
    case graphActions.LINK_GATE_TO_PLOT:
      return {
        ...state,
      };
    case graphActions.UNLINK_GATE_TO_PLOT:
      return {
        ...state,
      };
    case graphActions.REMOVE_GATE_FROM_WORKSPACE:
      return {
        ...state,
      };
    case graphActions.REMOVE_PLOT_FROM_WORKSPACE:
      return {
        ...state,
      };
    case graphActions.REMOVE_FILE_FROM_WORKSPACE:
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
