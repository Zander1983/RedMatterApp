import { combineReducers } from "redux";
import Canvas from "../classes/canvas/canvas";
import FCSFile from "../classes/fcsFile";
import Gate from "../classes/gate/gate";

const FCSFileList = (state: FCSFile[] = [], action: any) => {
  switch (action.type) {
    case "add":
      return [...state, action.newFile];
    default:
      return state;
  }
};

const GateList = (state: Gate[] = [], action: any) => {};

const CanvasList = (state: Canvas[] = [], action: any) => {};

export default combineReducers({
  FCSFileList,
  GateList,
  CanvasList,
});
