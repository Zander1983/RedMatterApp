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
  downloadHappening: boolean = false;
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
    
    let newFileIds = fileIds.filter(
      (x) =>
        !downloadedFileIds.includes(x) && !this.downloadingFiles.includes(x)
    );
    
    let newDownloadingFileIds = this.downloadingFiles.concat(newFileIds);

    this.updateDownloadingFiles(workspaceIsShared, newDownloadingFileIds, experimentId);
  }

  @publishDecorator()
  updateDownloaded(data: any) {
    this.downloaded = this.downloaded.concat(data);
  }

  @publishDecorator()
  updateDownloadingFiles(
    workspaceIsShared: boolean,
    fileIds: Array<string>,
    experimentId: string
  ) {
    this.downloadingFiles = fileIds;
    if (this.downloadingFiles.length > 0 && !this.downloadHappening) {
      let fileId = this.downloadingFiles[0];
      this.downloadFileEvent(
        workspaceIsShared,
        fileId,
        experimentId
      );
    }
  }

  async downloadFileEvent(
    workspaceIsShared: boolean,
    fileId: string,
    experimentId: string
  ) {
    let response;
    try {
      this.downloadHappening = true;
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
      this.updateDownloaded(response.data);
    } catch (e) {

    } finally {
      this.downloadHappening = false;
      this.downloadingFiles.shift();
      this.updateDownloadingFiles(
        workspaceIsShared,
        this.downloadingFiles,
        experimentId
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
