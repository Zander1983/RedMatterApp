import axios from "axios";
import userManager from "Components/users/userManager";
import { ExperimentFilesApiFetchParamCreator } from "api_calls/nodejsback";
import { getFile, getWorkspace } from "graph/utils/workspace";
import { store } from "redux/store";
import { File, Workspace } from "graph/resources/types";
import { createFile } from "graph/resources/files";

export const downloadFileMetadata = async (
  workspaceIsShared: boolean,
  experimentId: string
) => {
  let params;
  if (workspaceIsShared) {
    params = ExperimentFilesApiFetchParamCreator(
      {}
    ).experimentFilesWithoutToken(experimentId);
  } else {
    params = ExperimentFilesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).experimentFiles(
      userManager.getOrganiztionID(),
      experimentId,
      userManager.getToken()
    );
  }
  //@ts-ignore
  const response = await axios.get(params.url, params.options).data["files"];
  const workspace: Workspace = store.getState().workspace;
  for (let newFile of response) {
    let file: any = {};
    file.createdOn = new Date(newFile.createdOn);
    file.name = file.label = newFile.label;
    file.axes = newFile.channels;
    file.experimentId = newFile.experimentId;
    file.fileSize = newFile.fileSize;
    file.eventCount = newFile.eventCount;
    if (newFile.id in workspace.files.map((e: File) => e.id)) {
      file = { ...getFile(newFile.id), ...file };
    }
    store.dispatch({
      action: "workspace.UPDATE_FILE",
      payload: { file },
    });
  }
};

export const downloadFileEvent = async (
  workspaceIsShared: boolean,
  fileId: string,
  experimentId: string
) => {
  const workspace = getWorkspace();
  const fileQuery = workspace.files.filter((e) => e.id === fileId);
  if (fileQuery.length > 0) {
    throw Error("File already downloaded");
  }
  let response;
  if (workspaceIsShared) {
    response = await axios.post(
      "/api/sharedEvents",
      { experimentId: experimentId, fileIds: [fileId] },
      {}
    );
  } else {
    response = await axios.post(
      "/api/event",
      {
        experimentId: experimentId,
        fileId: fileId,
        organisationId: userManager.getOrganiztionID(),
      },
      {
        headers: {
          token: userManager.getToken(),
        },
      }
    );
  }
  const file = response.data;
  //TODO remove
  if (file.events.length > 2000)
    //@ts-ignore
    file.events = file.events.slice(0, 2000);
  let newFile = createFile({
    requestData: file,
    id: fileId,
  });
  newFile = { ...newFile, ...getFile(fileId) };
  newFile.downloaded = true;
  store.dispatch({
    action: "workspace.UPDATE_FILE",
    payload: { file },
  });
};
