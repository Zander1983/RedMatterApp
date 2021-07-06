import axios from "axios";
import userManager from "Components/users/userManager";
import { ExperimentFilesApiFetchParamCreator } from "api_calls/nodejsback";
import ObserversFunctionality, {
  publishDecorator,
} from "../graph/dataManagement/observersFunctionality";

export class FileService extends ObserversFunctionality {
  files: any[] = [];
  downloaded: any[] = [];
  downloadingFiles: Array<string> = [];
  constructor() {
    super();
  }

  async downloadFileMetadata(workspaceIsShared: boolean, experimentId: string) {
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
    let response = await axios.get(params.url, params.options);
    this.files = this.files.concat(response.data.files);
  }

  async downloadFileEvents(
    workspaceIsShared: boolean,
    fileIds: Array<string>,
    experimentId: string
  ) {
    let downloadedFileIds = this.downloaded.map((x) => x.id);
    let newFileIds = fileIds.filter((x) => !downloadedFileIds.includes(x));
    this.updateDownloadingFiles(newFileIds);

    let data: any[] = [];
    for (let i = 0; i < newFileIds.length; i++) {
      let fileId = newFileIds[i];

      let response = await this.downloadFileEvent(
        workspaceIsShared,
        fileId,
        experimentId
      );
      
      let index = this.downloadingFiles.indexOf(fileId);
      delete this.downloadingFiles[index];  
      this.updateDownloadingFiles(this.downloadingFiles);
      this.updateDownloaded(response);
      data = data.concat(response);
    }

    return data;
  }

  @publishDecorator()
  updateDownloaded(data: any[]) {
    this.downloaded = this.downloaded.concat(data);
  }

  @publishDecorator()
  updateDownloadingFiles(fieldIds: any[]) {
    this.downloadingFiles = fieldIds;
  }

  async downloadFileEvent(
    workspaceIsShared: boolean,
    fileId: string,
    experimentId: string
  ) {
    let response;
    if (workspaceIsShared) {
      response = await axios.post(
        "/api/sharedEvent",
        { experimentId: experimentId, fileId: fileId },
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

  getFileEvent(fileId: string) {
    return this.downloaded.find((x) => x.id === fileId);
  }

  private static instance: FileService;
  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }
}

export default FileService.getInstance();
