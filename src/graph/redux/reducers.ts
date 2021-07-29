import { actionTypes } from "./actionTypes";

const initialState: any = {
  gates: [],
  files: [],
  plots: [],
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
