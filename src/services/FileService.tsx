import axios from "axios";
import userManager from "Components/users/userManager";
import { ExperimentFilesApiFetchParamCreator } from "api_calls/nodejsback";
import { getFile, getWorkspace } from "graph/utils/workspace";
import { store } from "redux/store";
import { File, FileID, Workspace } from "graph/resources/types";
import { createFile } from "graph/resources/files";

export const downloadFileMetadata = async (
  workspaceIsShared: boolean,
  experimentId: string
): Promise<FileID[]> => {
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
  const response = await axios.get(params.url, params.options);
  const files = response.data.files;
  const workspace: Workspace = store.getState().workspace;
  let newFilesIds: FileID[] = [];
  for (let newFile of files) {
    let file: any = {};
    file.createdOn = new Date(newFile.createdOn);
    file.name = file.label = newFile.label;
    file.experimentId = newFile.experimentId;
    file.fileSize = newFile.fileSize;
    file.eventCount = newFile.eventCount;
    if (newFile.id in workspace.files.map((e: File) => e.id)) {
      file = { ...getFile(newFile.id), ...file };
      store.dispatch({
        type: "workspace.UPDATE_FILE",
        payload: { file },
      });
    } else {
      file.downloaded = false;
      file.id = newFile.id;
      store.dispatch({
        type: "workspace.ADD_FILE",
        payload: { file },
      });
    }
    newFilesIds.push(file.id);
  }
  return newFilesIds;
};

export const downloadFileEvent = async (
  workspaceIsShared: boolean,
  fileId: string,
  experimentId: string
): Promise<FileID> => {
  const workspace = getWorkspace();
  const fileQuery = workspace.files.filter((e) => e.id === fileId);
  if (fileQuery.length > 1) {
    throw Error("Multiple files with the same ID present in workspace");
  }
  if (fileQuery.length > 0 && fileQuery[0].downloaded) {
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
  const file = response.data[0];
  let newFile = await createFile({
    requestData: file,
    id: fileId,
  });
  newFile = { ...newFile, ...getFile(fileId) };
  newFile.downloaded = true;
  store.dispatch({
    type: "workspace.UPDATE_FILE",
    payload: { file: newFile },
  });
  return file.id;
};

export const dowloadAllFileEvents = async (
  workspaceIsShared?: boolean,
  experimentId?: string
) => {
  if (!workspaceIsShared) workspaceIsShared = false;
  if (!experimentId)
    experimentId = store.getState().user.experiment.experimentId;
  const workspace = getWorkspace();
  const files = workspace.files
    .filter((e) => e.downloaded === false)
    .map((e) => e.id);
  const promises: Promise<any>[] = [];
  for (const file of files) {
    promises.push(downloadFileEvent(workspaceIsShared, file, experimentId));
  }
  await Promise.all(promises);
};
