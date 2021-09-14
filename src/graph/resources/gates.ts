import { generateColor } from "graph/utils/color";
import { createID } from "graph/utils/id";
import { getGate } from "graph/utils/workspace";
import { Gate, GateID, HistogramGate, OvalGate, PolygonGate } from "./types";
import { store } from "redux/store";

export const createGate = ({
  cloneGate,
  id,
}: {
  cloneGate?: PolygonGate;
  id?: GateID;
}): PolygonGate => {
  let newGate: PolygonGate = {
    id: "",
    gateType: "polygon",
    name: "",
    color: "",
    parents: [],
    xAxis: "",
    xAxisType: "",
    xAxisOriginalRanges: [0, 0],
    yAxis: "",
    yAxisType: "",
    yAxisOriginalRanges: [0, 0],
    points: [],
    children: [],
  };
  if (cloneGate) newGate = { ...cloneGate };
  if (id) newGate.id = id;
  else newGate.id = createID();
  newGate.color = generateColor();
  if (cloneGate) newGate.parents = [...cloneGate.parents, cloneGate.id];
  else newGate.parents = [];
  return newGate;
};

export const commitGateChange = async (gate: Gate) => {
  store.dispatch({
    type: "workspace.UPDATE_GATE",
    payload: { gate },
  });
};

export const isPointInsideGate = (
  gate: Gate,
  point: { x: number; y: number }
): boolean => {
  for (const parentId of gate.parents) {
    const parentGate = getGate(parentId);
    if (!isPointInsideGate(parentGate, point)) {
      return false;
    }
  }
  switch (gate.gateType) {
    case "polygon":
      return isPointInsidePolygonGate(gate as PolygonGate, point);
    case "histogram":
      return isPointInsideHistogramGate(gate as HistogramGate, point);
    case "oval":
      return isPointInsideOvalGate(gate as OvalGate, point);
    default:
      throw Error("Gate type " + gate.gateType + " doesn't exist");
  }
};

const isPointInsidePolygonGate = (
  gate: PolygonGate,
  point: { x: number; y: number }
): boolean => {
  // ...
  return true;
};

const isPointInsideOvalGate = (
  gate: OvalGate,
  point: { x: number; y: number }
): boolean => {
  // ...
  return true;
};
const isPointInsideHistogramGate = (
  gate: HistogramGate,
  point: { x: number; y: number }
): boolean => {
  // ...
  return true;
};
