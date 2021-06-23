import dataManager from "graph/dataManagement/dataManager";
import FCSFile from "graph/dataManagement/fcsFile";
import { snackbarService } from "uno-material-ui";
import PlotData from "graph/dataManagement/plotData";
import staticFileReader from "../components/modals/staticFCSFiles/staticFileReader";

export interface WorkspaceStateHelperObj {
  name: string;
  files: Array<any>;
  gates: Array<any>;
  plots: Array<any>;
}

export class WorkspaceStateHelper {
  state: WorkspaceStateHelperObj;

  constructor(state: WorkspaceStateHelperObj) {
    this.state = state;
  }

  getFileIds()
  {
    let filesLength = this.state.files.length;
    let fileIds = [];

    for (let i = 0; i < filesLength; i++) {
       fileIds.push(this.state.files[i].split("://")[1]);
    }

    return fileIds;
  }

  addFile = (file: any) => {
    if (!dataManager.ready()) {
      snackbarService.showSnackbar("Something went wrong, try again!", "error");
      return;
    }
    let newFile: FCSFile;
    if (file?.fromStatic) {
      newFile = staticFileReader(file.fromStatic);
    } else {
      newFile = new FCSFile({
        name: file.title,
        id: file.id,
        src: "remote",
        axes: file.channels.map((e: any) => e.value),
        data: file.events,
        plotTypes: file.channels.map((e: any) => e.display),
        remoteData: file,
      });
    }
    dataManager.addNewFileToWorkspace(newFile);
  };
}

export default WorkspaceStateHelper;
