import { GateID, WorkspaceEventGateNaming } from "graph/resources/types";
import { store } from "redux/store";

export const getWorkspaceQueue = () => {
  return store.getState().workspaceEventQueue.queue;
};

export const checkIfGateNamingQueue = (gateId: GateID) => {
  if (!gateId) return false;
  let workspaceQueue = getWorkspaceQueue();
  let events = workspaceQueue.filter(
    (x: WorkspaceEventGateNaming) => x.gateID === gateId
  );
  return events.length > 0 ? true : false;
};
