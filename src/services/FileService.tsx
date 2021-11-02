import axios from "axios";
import userManager from "Components/users/userManager";
import { ExperimentFilesApiFetchParamCreator } from "api_calls/nodejsback";
import { getFile, getWorkspace } from "graph/utils/workspace";
import { store } from "redux/store";
import { File, FileID, Workspace } from "graph/resources/types";
import { createFile } from "graph/resources/files";
import { Notification } from "graph/resources/notifications";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";

const EVENTS_LIMIT = 4000;

export const downloadFileMetadata = async (
  workspaceIsShared: boolean,
  experimentId: string
): Promise<FileID[]> => {
  let params;
  if (workspaceIsShared) {
    params = ExperimentFilesApiFetchParamCreator({}).experimentFilesWithoutToken(experimentId);
  } else {
    params = ExperimentFilesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).experimentFiles(userManager.getOrganiztionID(), experimentId, userManager.getToken());
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
      WorkspaceDispatch.UpdateFile(file);
    } else {
      file.downloaded = false;
      file.id = newFile.id;
      WorkspaceDispatch.AddFile(file);
    }
    newFilesIds.push(file.id);
  }
  return newFilesIds;
};

export const downloadFileEvent = async (
  workspaceIsShared: boolean,
  targetFiles: string | string[],
  experimentId: string,
  showNotifications: boolean = true,
  retry: number = 3
): Promise<FileID | FileID[]> => {
  let notification: Notification;
  if (showNotifications) {
    notification = new Notification(
      "Dowloading file" + (typeof targetFiles === "string" ? "" : "s")
    );
  }
  try {
    let files: FileID[] = [];
    if (typeof targetFiles === "string") {
      files = [targetFiles];
    } else {
      files = targetFiles;
    }

    const workspace = getWorkspace();

    for (const fileId of files) {
      const fileQuery = workspace.files.filter((e) => e.id === fileId);
      if (fileQuery.length > 1) {
        throw Error("Multiple files with the same ID present in workspace");
      }
      if (fileQuery.length > 0 && fileQuery[0].downloaded) {
        throw Error("File already downloaded");
      }
    }

    let downloadingFiles: File[] = files.map((e) => getFile(e));
    downloadingFiles.forEach((e) => {
      e.downloading = true;
      WorkspaceDispatch.UpdateFile(e);
    });

    let response;
    let payload: {
      experimentId: string;
      fileIds: string[];
      isShared?: boolean;
      organisationId?: string;
    } = {
      experimentId: experimentId,
      fileIds: files,
    };

    if (workspaceIsShared) {
      payload = { ...payload, isShared: true };
    } else {
      payload = {
        ...payload,
        organisationId: userManager.getOrganiztionID(),
      };
    }

    let token = null;
    try {
      token = userManager.getToken();
    } catch {}

    let headers = {};
    if (token) headers = { token };

    response = await axios.post("/api/events", payload, {
      headers,
    });

    response.data = response.data.map((e: any) => {
      if (e.events.length > EVENTS_LIMIT) {
        e.events = e.events.slice(0, EVENTS_LIMIT);
      }
      return e;
    });

    for (const file of response.data) {
      let newFile = await createFile({
        //@ts-ignore
        requestData: file,
        //@ts-ignore
        id: file.id,
      });
      //@ts-ignore
      newFile = { ...newFile, ...getFile(file.id) };
      newFile.downloaded = true;
      newFile.downloading = false;
      WorkspaceDispatch.UpdateFile(newFile);
    }

    if (typeof targetFiles === "string") {
      return targetFiles;
    } else {
      return files;
    }
  } catch (err) {
    if (showNotifications) {
        notification.killNotification();
      }
    if (retry > 0) {
      downloadFileEvent(
        workspaceIsShared,
        targetFiles,
        experimentId,
        (showNotifications = true),
        retry - 1
      );
    } else {
      
      throw new Error("File was not downloaded");
    }
  }
  if (showNotifications) {
    notification.killNotification();
  }
};

export const dowloadAllFileEvents = async (
  workspaceIsShared?: boolean,
  experimentId?: string,
  batch?: string[]
) => {
  if (!workspaceIsShared) workspaceIsShared = false;
  if (!experimentId) experimentId = store.getState().user.experiment.experimentId;
  let files: string[] = [];
  if (batch) {
    const workspace = getWorkspace();
    files = workspace.files
      .filter((e) => e.downloaded === false && batch.includes(e.id))
      .map((e) => e.id);
  } else {
    const workspace = getWorkspace();
    files = workspace.files.filter((e) => e.downloaded === false).map((e) => e.id);
  }
  if(files.length>0)
  await downloadFileEvent(workspaceIsShared, files, experimentId);
};
