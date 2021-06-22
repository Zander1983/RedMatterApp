import dataManager from "graph/dataManagement/dataManager";
import FCSFile from "graph/dataManagement/fcsFile";
import { snackbarService } from "uno-material-ui";
import PlotData from "graph/dataManagement/plotData";
import staticFileReader from "../components/modals/staticFCSFiles/staticFileReader";

export interface WorkspaceStateReloadObj {
  name: string;
  files: Array<any>;
  gates: Array<any>;
  plots: Array<any>;
}

export class WorkspaceStateReload {
  state: WorkspaceStateReloadObj;

  constructor(state: WorkspaceStateReloadObj) {
    this.state = state;
  }

  loadWorkspace(files: Array<any>) {
    let filesLength = this.state.files.length;
    for (let i = 0; i < filesLength; i++) {
      let fileId = this.state.files[i].split("://")[1];
      let file = files.find((file) => file.id == fileId);
      this.addFile(file);
    }

    let plotLength = this.state.plots.length;
    for (let i = 0; i < plotLength; i++) {
      const plot = new PlotData();
      plot.file = dataManager.getFile(this.state.plots[i].file);
      dataManager.addNewPlotToWorkspace(plot);
    }
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

export default WorkspaceStateReload;
