import axios from "axios";
import userManager from "Components/users/userManager";
import { ExperimentFilesApiFetchParamCreator } from "api_calls/nodejsback";

export class FileService {
  static async downloadFileMetadata(
    workspaceIsShared: boolean,
    experimentId: string
  ) {
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
    const response = await axios.get(params.url, params.options);
    return response;
  }

  static async downloadFileEvent(
    workspaceIsShared: boolean,
    fileId: string,
    experimentId: string
  ) {
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
    const files = response.data;
    for (const file of files) {
      //@ts-ignore
      if (file.events.length > 2000)
        //@ts-ignore
        file.events = file.events.slice(0, 2000);
    }
    return files;
  }
}

export default FileService;
