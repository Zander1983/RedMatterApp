const actionTypes = {
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

const initialState: any = {
  gates: [],
  files: [],
  plots: [],
  populations: [],
  previousStates: [],
  remoteID: null,
  mouseGateState: null,
};

const graphReducers = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.RESET:
      return initialState;
    case actionTypes.LOAD_WORKSPACE:
      return {
        ...state,
      };
    case actionTypes.SET_EXPERIMENT_METADATA:
      return {
        ...state,
      };
    case actionTypes.ADD_FILE:
      return {
        ...state,
        files: [action.payload.file, ...state.files],
      };
    case actionTypes.ADD_PLOT:
      return {
        ...state,
      };
    case actionTypes.ADD_GATE:
      return {
        ...state,
      };
    case actionTypes.DUPLICATE_PLOT:
      return {
        ...state,
      };
    case actionTypes.DUPLICATE_GATE:
      return {
        ...state,
      };
    case actionTypes.SUBPOP_FROM_GATE:
      return {
        ...state,
      };
    case actionTypes.ADD_GATE_TO_ALL_FILES:
      return {
        ...state,
      };
    case actionTypes.LINK_GATE_TO_PLOT:
      return {
        ...state,
      };
    case actionTypes.UNLINK_GATE_TO_PLOT:
      return {
        ...state,
      };
    case actionTypes.REMOVE_GATE_FROM_WORKSPACE:
      return {
        ...state,
      };
    case actionTypes.REMOVE_PLOT_FROM_WORKSPACE:
      return {
        ...state,
      };
    case actionTypes.REMOVE_FILE_FROM_WORKSPACE:
      return {
        ...state,
      };
    case actionTypes.RANGE_CHANGE:
      return {
        ...state,
      };
    case actionTypes.MOUSE_EVENT:
      return {
        ...state,
      };
    case actionTypes.GATE_METADATA_UPDATE:
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default graphReducers;
