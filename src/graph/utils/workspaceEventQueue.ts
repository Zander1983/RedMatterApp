import { WorkspacesApiFetchParamCreator } from "api_calls/nodejsback";
import axios from "axios";
import userManager from "Components/users/userManager";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import {
  File,
  FileID,
  Gate,
  GateID,
  Plot,
  PlotID,
  Population,
  PopulationID,
  Workspace,
  WorkspaceEvent,
  WorkspaceEventGateNaming,
} from "graph/resources/types";
import { store } from "redux/store";
import { dowloadAllFileEvents } from "services/FileService";
import { snackbarService } from "uno-material-ui";

export const getWorkspaceQueue = () => {
  return store.getState().workspaceEventQueue.queue;
};

export const checkIfGateNamingQueue = (gateId: GateID) => {
  let workspaceQueue = getWorkspaceQueue();
  let events = workspaceQueue.filter(
    (x: WorkspaceEventGateNaming) => x.gateID == gateId
  );
  return events.length > 0 ? true : false;
};
