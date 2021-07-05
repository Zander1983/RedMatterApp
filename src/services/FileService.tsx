import axios from "axios";
import userManager from "Components/users/userManager";
import { ExperimentFilesApiFetchParamCreator } from "api_calls/nodejsback";

export class FileService {
  fileEvents: any[] = [];
  private files: any[] = [];
  experimentId: string = "";

  constructor(experimentId: string) {
    this.experimentId = experimentId;
  }

  async downloadFileMetadata(workspaceIsShared: boolean) {
    let params;
    if (workspaceIsShared) {
      params = ExperimentFilesApiFetchParamCreator(
        {}
      ).experimentFilesWithoutToken(this.experimentId);
    } else {
      params = ExperimentFilesApiFetchParamCreator({
        accessToken: userManager.getToken(),
      }).experimentFiles(
        userManager.getOrganiztionID(),
        this.experimentId,
        userManager.getToken()
      );
    }
    let response = await axios.get(params.url, params.options);
    this.files = this.files.concat(response.data.files);
  }

  async downloadFileEvents(workspaceIsShared: boolean, fileIds: Array<string>) {
    let response;
    if (workspaceIsShared) {
      response = await axios.post(
        "/api/sharedEvents",
        { experimentId: this.experimentId, fileIds: fileIds },
        {}
      );
    } else {
      response = await axios.post(
        "/api/events",
        {
          experimentId: this.experimentId,
          fileIds: fileIds,
          organisationId: userManager.getOrganiztionID(),
        },
        {
          headers: {
            token: userManager.getToken(),
          },
        }
      );
    }

    this.fileEvents = this.fileEvents.concat(response.data);

    return response.data;
  }

  getFileEvent(fileId: string) {
    return this.fileEvents.find((x) => x.id === fileId);
  }

  getFiles() {
      return this.files;
  }
}
