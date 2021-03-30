import { combineReducers } from "redux";
import Canvas from "../classes/canvas/canvas";
import FCSFile from "../classes/fcsFile";
import Gate from "../classes/gate/gate";

const FCSFileList = (state: FCSFile[] = [], action: any) => {
  switch (action.type) {
    case "ADD_FCS_FILE":
      return [...state, action.newFile];
    default:
      return state;
  }
};

const GateList = (state: Gate[] = [], action: any) => {
  switch (action.type) {
    case "ADD_GATE":
      return [...state, action.newFile];
    default:
      return state;
  }
};

const CanvasList = (state: Canvas[] = [], action: any) => {
  switch (action.type) {
    case "ADD_CANVAS":
      return [...state, action.newFile];
    default:
      return state;
  }
};

export default combineReducers({
  FCSFileList,
  GateList,
  CanvasList,
});
