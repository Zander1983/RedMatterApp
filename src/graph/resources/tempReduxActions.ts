import { Workspace, WorkspaceID } from "./types";

const maxPreviousWorkspaces = 100;

export const tempGraphActions = {
  RESET: "tempWorkspace.RESET",
  SET_PREVIOUS_WORKSPACES: "tempWorkspace.SET_PREVIOUS_WORKSPACES",
};

export interface TempWorkspace {
  previousStates: WorkspaceID[];
}

export const initialState: TempWorkspace = {
  previousStates: [],
};

const tempGraphReducers = (
  state: TempWorkspace = initialState,
  action: any
) => {
  switch (action.type) {
    case tempGraphActions.RESET:
      return initialState;

    case tempGraphActions.SET_PREVIOUS_WORKSPACES:
      let prevStates: Workspace[] = action.payload.previousStates;
      if (prevStates.length > maxPreviousWorkspaces) {
        prevStates = prevStates.slice(
          prevStates.length - maxPreviousWorkspaces,
          maxPreviousWorkspaces
        );
      }
      return {
        ...state,
        previousStates: prevStates,
      };

    default:
      return state;
  }
};

export default tempGraphReducers;
