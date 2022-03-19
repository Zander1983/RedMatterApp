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
} from "graph/resources/types";
import { store } from "redux/store";
import { dowloadAllFileEvents } from "services/FileService";
import { snackbarService } from "uno-material-ui";
import {createDefaultPlotSnapShot, getPlotChannelAndPosition} from "../mark-app/Helper";

export const getWorkspace = (): Workspace => {
  return store.getState().workspace;
};

export const getFile = (fileID: FileID): File => {
  const workspace = getWorkspace();
  const files = workspace.files.filter((file) => {
    return file.id === fileID;
  });
  if (files?.length === 0) throw Error("File not found");
  if (files?.length > 1) throw Error("Multiple files with ID = " + fileID);
  return files[0];
};

export const getAllFiles = (): Array<File> => {
  const workspace = getWorkspace();
  return workspace.files;
};

export const getPlot = (plotID: PlotID): Plot => {
  const workspace = getWorkspace();
  const plots = workspace.plots.filter((plot) => plot.id === plotID);
  if (plots.length === 0) throw Error("Plot not found");
  if (plots.length > 1) throw Error("Multiple plots with ID = " + plotID);
  return plots[0];
};

export const getAllPlots = (): Array<Plot> => {
  const workspace = getWorkspace();
  return workspace.plots;
};

export const getPopulation = (populationID: PopulationID): Population => {
  const workspace = getWorkspace();
  const populations = workspace.populations.filter(
    (population) => population.id === populationID
  );
  if (populations.length === 0)
    throw Error("Population " + populationID + " not found");
  if (populations.length > 1)
    throw Error("Multiple populations with ID " + populationID);
  return populations[0];
};

export const getPlotFromPopulationId = (gateId: string) => {
  const workspace = getWorkspace();
  const gate = workspace.gates.find((ele) => ele.id === gateId);
  return {
    //@ts-ignore
    xAxis: gate.xAxis ? gate.xAxis : gate.axis,
    //@ts-ignore
    yAxis: gate.yAxis ? gate.yAxis : gate.axis,
  };
};

export const getPopulationFromFileId = (fileId: FileID): Population => {
  const workspace = getWorkspace();
  const populations = workspace.populations.filter(
    (population) => population.file === fileId
  );
  if (populations.length === 0) throw Error("Population not found");

  return populations[0];
};

export const getGate = (gateID: GateID): Gate => {
  const workspace = getWorkspace();
  const gates = workspace.gates.filter((gate) => gate.id === gateID);
  if (gates.length > 1) throw Error("Multiple gates with ID = " + gateID);
  return gates.length > 0 ? gates[0] : null;
};


export const saveWorkspaceStateToServer = async (
    shared: boolean,
    experimentId: string,
    pipelineId: string,
    stateData?:any
): Promise<boolean> => {
  //let stateJson = JSON.stringify(getWorkspace().workspaceState);
  let stateJson = stateData ?  JSON.stringify(stateData) : JSON.stringify(getWorkspace().workspaceState || {});
  const updateWorkSpace = WorkspacesApiFetchParamCreator({
    accessToken: userManager.getToken(),
  }).upsertWorkSpace(userManager.getToken(), {
    experimentId: experimentId,
    pipelineId: pipelineId,
    state: stateJson,
    isShared: shared,
  });

  try {
    const response = await axios.post(
        updateWorkSpace.url,
        updateWorkSpace.options.body,
        updateWorkSpace.options
    );
    console.log(response);
    await WorkspaceDispatch.SetId(response.data.workspaceId);
    return true;
  } catch (err) {
    snackbarService.showSnackbar(
        "Could not save the workspace, reload the page and try again!",
        "error"
    );
  }
  return false;
};

export const saveWorkspaceToRemote = async (
  shared: boolean,
  experimentId: string
): Promise<boolean> => {
  const workspace = getWorkspace();
  const { files, ...rest } = workspace;
  let stateJson = JSON.stringify(rest);

  const updateWorkSpace = WorkspacesApiFetchParamCreator({
    accessToken: userManager.getToken(),
  }).upsertWorkSpace(userManager.getToken(), {
    experimentId: experimentId,
    state: stateJson,
    isShared: shared,
  });

  try {
    await axios.post(
      updateWorkSpace.url,
      updateWorkSpace.options.body,
      updateWorkSpace.options
    );
    return true;
  } catch (err) {
    snackbarService.showSnackbar(
      "Could not save the workspace, reload the page and try again!",
      "error"
    );
  }
  return false;
};

export const loadWorkspaceFromRemoteIfExists = async (
  shared: boolean,
  experimentId: string
): Promise<{
  loaded: boolean;
  requestSuccess: boolean;
}> => {
  let workspaceData;
  try {
    if (shared) {
      workspaceData = await axios.post("/api/verifyWorkspace", {
        experimentId: experimentId,
      });
    } else {
      workspaceData = await axios.post(
        "/api/getWorkspace",
        {
          experimentId,
        },
        {
          headers: {
            token: userManager.getToken(),
          },
        }
      );
    }

    const workspace = workspaceData.data.state;
    if (workspace && Object.keys(workspace).length > 0) {
      await loadSavedWorkspace(workspace, shared, experimentId);
      return { loaded: true, requestSuccess: true };
    }
  } catch (err) {
    throw err;
  }
  return { loaded: false, requestSuccess: true };
};

export const loadIfWorkspaceIsShared = async (
  workspaceId: string,
  experimentId: string
): Promise<boolean> => {
  let workspaceData;
  try {
    workspaceData = await axios.post("/api/verifyWorkspace", {
      workspaceId: workspaceId,
      experimentId: experimentId,
    });
  } catch (e) {
    snackbarService.showSnackbar(
      "You don't have access to this workspace",
      "error"
    );
    return false;
  }
  const isShared = workspaceData.data.isShared;
  const workspace = workspaceData.data.state;
  if (workspace && isShared)
    await loadSavedWorkspace(workspace, true, experimentId);
  return true;
};

const loadSavedWorkspace = async (
  workspace: string,
  shared: boolean,
  experimentId: string
) => {
  const workspaceObj = JSON.parse(workspace || "{}");
  // const files = workspaceObj?.files
  //   ? workspaceObj.files.filter((e: any) => e.downloaded).map((e: any) => e.id)
  //   : [];
  // await dowloadAllFileEvents(shared, experimentId, files);
  const newWorkspace: Workspace = {
    ...workspaceObj,
    files: getWorkspace().files,
    notifications: [],
    sharedWorkspace: shared,
    editWorkspace: !shared,
  };
  await WorkspaceDispatch.LoadWorkspace(newWorkspace);
};


export const getWorkspaceStateFromServer = async (
    shared: boolean,
    experimentId: string
): Promise<{
  loaded: boolean;
  requestSuccess: boolean;
}> => {
  let workspaceData;
  try {
    if (shared) {
      workspaceData = await axios.post("/api/verifyWorkspace", {
        experimentId: experimentId,
      });
    } else {
      workspaceData = await axios.post(
          "/api/getWorkspace",
          {
            experimentId,
          },
          {
            headers: {
              token: userManager.getToken(),
            },
          }
      );
    }
    console.log(workspaceData);
    const workspace = workspaceData.data.state;
    if (workspace && Object.keys(workspace).length > 0) {
      await saveWorkspaceStateToRedux(workspace, workspaceData.data.pipelines);
      return { loaded: true, requestSuccess: true };
    }
  } catch (err) {
    throw err;
  }
  return { loaded: false, requestSuccess: true };
};

const saveWorkspaceStateToRedux = async (
    workspace: string,
    pipelines:any[]
) => {
   const workspaceObj = JSON.parse(workspace || "{}");
  // if(getWorkspace().workspaceState?.length === 0) {
  //   let selectedFileID:any = getWorkspace().selectedFile;
  //   const defaultFile = selectedFileID ? getWorkspace()?.files?.filter(file => file.id === selectedFileID)?.[0] : getWorkspace()?.files?.[0];
  //   const {xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex} = getPlotChannelAndPosition(defaultFile);
  //   const workspaceState = createDefaultPlotSnapShot(selectedFileID, workspaceObj.experimentId, xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex);
  //   const newWorkspace: Workspace = {...workspaceObj, ...workspaceState};
  //   await WorkspaceDispatch.SetPlotStates(newWorkspace);
  //   await WorkspaceDispatch.UpdateSelectedFile(workspaceObj.selectedFile);
  // }else {
    const newWorkspaceState: Workspace = {...workspaceObj};
    await WorkspaceDispatch.SetPipeLines(pipelines);
    await WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    await WorkspaceDispatch.UpdateSelectedFile(workspaceObj.selectedFile);
    await WorkspaceDispatch.UpdatePipelineId(workspaceObj.pipelineId);
  //}

};
