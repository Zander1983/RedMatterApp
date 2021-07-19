import axios from "axios";
import userManager from "Components/users/userManager";
import { ExperimentFilesApiFetchParamCreator } from "api_calls/nodejsback";

export class FileService {
  constructor() {
    
  }

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
    return await axios.get(params.url, params.options);
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
    return response.data;
  }
}

export default FileService;
