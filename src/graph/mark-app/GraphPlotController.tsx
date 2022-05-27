import React from "react";
import { getWorkspace, getFiles } from "graph/utils/workspace";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import PlotTableComponent from "./Table";
import { snackbarService } from "uno-material-ui";
import * as htmlToImage from "html-to-image";
import FCSServices from "./FCSServices/FCSServices";
import { store } from "redux/store";
import { Grid, Button, TextField } from "@material-ui/core";
import {
  superAlgorithm,
  createDefaultPlotSnapShot,
  getPlotChannelAndPosition,
  formatEnrichedFiles,
  DSC_SORT,
  ASC_SORT,
} from "./Helper";
import WorkspaceDispatch from "../workspaceRedux/workspaceDispatchers";

interface PlotControllerProps {
  sharedWorkspace: boolean;
  experimentId: string;
  workspaceLoading: boolean;
  plotMoving?: boolean;
  // arrowFunc: Function;
}

interface IState {
  sortByChanged: boolean;
  sortBy: string;
  isTableRenderCall: boolean;
  enrichedFiles: any[];
  workspaceState: any;
  enrichedEvents: any[];
  testParam: string;
  controlFileId: string;
  activePipelineId: string;
  parsedFiles: any[];
  uploadingFiles: any[];
  currentParsingFile: string;
  controlFileSpillover: {};
  showSpillover: boolean;
}

class NewPlotController extends React.Component<PlotControllerProps, IState> {
  constructor(props: PlotControllerProps) {
    super(props);

    this.state = {
      sortByChanged: false,
      sortBy: "file",
      isTableRenderCall: false,
      enrichedFiles: [],
      workspaceState: {},
      enrichedEvents: [],
      testParam: "some value",
      controlFileId: "",
      activePipelineId: "",
      parsedFiles: [],
      uploadingFiles: [],
      currentParsingFile: "",
      controlFileSpillover: {},
      showSpillover: false,
    };

    this.onChangeChannel = this.onChangeChannel.bind(this);
    this.onEditGate = this.onEditGate.bind(this);
    this.onAddGate = this.onAddGate.bind(this);
    this.onDeleteGate = this.onDeleteGate.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onInitState = this.onInitState.bind(this);
    this.onResetToControl = this.onResetToControl.bind(this);
    this.downloadPlotAsImage = this.downloadPlotAsImage.bind(this);
    this.setNewSpillover = this.setNewSpillover.bind(this);
    this.inputFile = React.createRef();
  }

  inputFile = {
    current: {
      click: function () {},
    },
  };

  // const [uploadingFiles, setUploadingFiles] = useState(Object);

  // const [currentParsingFile, setcurrentParsingFile] = useState<string>("");
  // const [parsedFiles, setParsedFiles] = useState([]);

  onInitState = () => {
    //console.log("init====");
    let workspaceState = getWorkspace().workspaceState;

    // @ts-ignore
    const plots = workspaceState
      ? // @ts-ignore
        workspaceState?.files?.[getWorkspace()?.selectedFile]?.plots
      : [];
    let isSnapShotCreated = false;

    // @ts-ignore
    let copyOfLocalFiles: any[] = getFiles();

    console.log("copyOfLocalFiles is ", copyOfLocalFiles);
    console.log("workspaceState is ", workspaceState);

    let defaultFile = null;
    let pipeline = null;
    if (plots?.length === 0 && getWorkspace()?.pipelines?.length > 0) {
      // const defaultFile = copyOfLocalFiles?.[0];
      defaultFile = getWorkspace()?.selectedFile
        ? copyOfLocalFiles?.filter(
            (file) => file.id === getWorkspace()?.selectedFile
          )?.[0]
        : copyOfLocalFiles?.[0];
      // @ts-ignore
      pipeline =
        getWorkspace()?.pipelines?.length > 0
          ? getWorkspace()?.pipelines?.filter(
              (pipeline: any) =>
                pipeline.controlFileId === getWorkspace()?.selectedFile
            )?.[0]
          : null;

      const {
        xAxisLabel,
        yAxisLabel,
        xAxisIndex,
        yAxisIndex,
        xAxisScaleType,
        yAxisScaleType,
      } = getPlotChannelAndPosition(defaultFile);

      workspaceState = createDefaultPlotSnapShot(
        defaultFile?.name,
        this.props.experimentId,
        xAxisLabel,
        yAxisLabel,
        xAxisIndex,
        yAxisIndex,
        pipeline._id,
        pipeline.name
      );
      isSnapShotCreated = true;
    }

    // @ts-ignore
    if (workspaceState?.length > 0 || plots?.length > 0) {
      let enrichedFiles: any[] = superAlgorithm(
        copyOfLocalFiles,
        workspaceState
      );

      enrichedFiles = formatEnrichedFiles(enrichedFiles, workspaceState);

      let controlEnrichedFile = enrichedFiles.find(
        (enrichedFile) => enrichedFile.isControlFile
      );

      if (isSnapShotCreated) {
        WorkspaceDispatch.UpdatePlotStates(workspaceState);
        if (defaultFile) WorkspaceDispatch.UpdateSelectedFile(defaultFile?.id);
      }

      console.log(
        ">>>>> controlEnrichedFile.spilloverObj is ",
        controlEnrichedFile.spilloverObj
      );
      this.setState({
        controlFileSpillover: controlEnrichedFile.spilloverObj,
        enrichedFiles: enrichedFiles,
        workspaceState: workspaceState,
        controlFileId:
          isSnapShotCreated && defaultFile
            ? defaultFile?.id
            : getWorkspace()?.selectedFile,
        // @ts-ignore
        activePipelineId:
          isSnapShotCreated && pipeline
            ? // @ts-ignore
              pipeline._id
            : getWorkspace()?.activePipelineId,
      });
    }
  };

  getEnrichedEvents = () => {
    let copyOfLocalFiles: any[] = getFiles();
    let enrichedEvents = superAlgorithm(
      copyOfLocalFiles,
      this.state.workspaceState
    );
    enrichedEvents = enrichedEvents.map((events: any[]) => {
      return events;
    });
    return enrichedEvents;
  };

  onAddGate = (change: any) => {
    // create a new plot from the plot that has just been gated, but remove
    // its gate and set population to be the gate.name
    let newPlot = JSON.parse(JSON.stringify(change.plot));
    delete newPlot.gate;
    newPlot.population = change.plot.gate.name;
    // for histograms
    newPlot.color = change.plot.gate.color;
    newPlot.width = 200;
    newPlot.height = 200;
    // set the passed up plot to be in the state
    let gatedPlot = JSON.parse(JSON.stringify(change.plot));

    //@ts-ignore
    let newWorkspaceState: any = this.state.workspaceState;

    //@ts-ignore
    let controlFileId: string = newWorkspaceState.controlFileId;

    // this is setting the last plot to be the gated plot on the contorl
    (newWorkspaceState as any).files[controlFileId].plots[
      (newWorkspaceState as any).files[controlFileId].plots.length - 1
    ] = gatedPlot;

    // this is adding a new plot to the end of the plots array on the control
    (newWorkspaceState as any).files[controlFileId].plots.push(newPlot);

    // new plots are only added on the control file,
    // so loop through the other fileIds - which have adjusted gates
    // and make sure to keep them
    let fileIds = Object.keys((newWorkspaceState as any).files);
    fileIds.forEach((fileId) => {
      if (fileId != controlFileId) {
        (newWorkspaceState as any).files[fileId].plots[
          (newWorkspaceState as any).files[fileId].plots.length - 1
        ] = JSON.parse(JSON.stringify(gatedPlot));

        (newWorkspaceState as any).files[fileId].plots.push(
          JSON.parse(JSON.stringify(newPlot))
        );
      }
    });

    let copyOfLocalFiles: any[] = getFiles();
    // let copyOfLocalFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    // set new gate to redux
    setTimeout(() => {
      WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    }, 10);

    //set state
    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  onDeleteGate = (plot: any) => {
    //@ts-ignore
    let newWorkspaceState: any = this.state.workspaceState;
    let controlFileId: string = newWorkspaceState.controlFileId;

    // deleting the children of the gate
    const plotIndex = (newWorkspaceState as any).files[
      controlFileId
    ].plots.findIndex((plt: any) => plt.population === plot.population);
    const fileIds = Object.keys((newWorkspaceState as any).files) || [];
    for (let i = 0; i < fileIds.length; i++) {
      (newWorkspaceState as any).files[fileIds[i]].plots.length = plotIndex + 1;
    }

    // deleting the gate from the parent plot
    for (let i = 0; i < fileIds.length; i++) {
      (newWorkspaceState as any).files[
        fileIds[i]
      ].plots = (newWorkspaceState as any).files[fileIds[i]].plots.map(
        (plt: any) => {
          if (plt.population === plot.population) {
            const { gate, ...plotWithOutGate } = plt;
            return plotWithOutGate;
          } else {
            return plt;
          }
        }
      );
    }

    let copyOfLocalFiles: any[] = getFiles();

    // let copyOfLocalFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    // set new gate to redux
    setTimeout(() => {
      WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    }, 10);

    //set state
    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  setPlotsOfAllFilesToBeSameAsControl = (plotIndex: any) => {
    let controlEnrichedFile = this.state.enrichedFiles.find(
      (enrichedFile) => enrichedFile.isControlFile
    );
    const filesIds = Object.keys((this.state.workspaceState as any).files);
    filesIds.forEach((fileId, index) => {
      (this.state.workspaceState as any).files[fileId].plots[
        plotIndex
      ] = JSON.parse(JSON.stringify(controlEnrichedFile.plots[plotIndex]));
    });
  };

  onEditGate = (change: any) => {
    let fileKey = change.fileId;
    let newWorkspaceState: any = this.state.workspaceState;
    if (!(newWorkspaceState as any).files[fileKey]) {
      // so its a non-control gate being edited, copy plots from control
      (newWorkspaceState as any).files[fileKey] = {
        //@ts-ignore
        plots: JSON.parse(
          JSON.stringify(
            (newWorkspaceState as any).files[newWorkspaceState.controlFileId]
              .plots
          )
        ),
      };
    }

    // now change the specific plot for specific file
    (newWorkspaceState as any).files[fileKey].plots[
      change.plotIndex
    ] = JSON.parse(JSON.stringify(change.plot));

    let copyOfLocalFiles: any[] = getFiles();
    // let copyOfLocalFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);

    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    //WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    setTimeout(() => {
      WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    }, 10);

    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
      isTableRenderCall: true,
    });
  };

  downloadPlotAsImage = async (plot: any, plotIndex: any) => {
    // downloading functionality
    const plotElement = document.getElementById(`entire-canvas-${plotIndex}`);
    const dataUrl = await htmlToImage.toSvg(plotElement);
    var link = document.createElement("a");
    link.download = `${plot.population}`;
    link.href = dataUrl;
    link.click();
  };

  onResetToControl = (fileId: string) => {
    let newWorkspaceState: any = JSON.parse(
      JSON.stringify(getWorkspace().workspaceState)
    );
    delete newWorkspaceState.files[fileId];
    let copyOfLocalFiles: any[] = getFiles();
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);
    WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  addOverlay = (
    fileId: string,
    addFileId: string,
    plotIndex: number,
    checked: boolean
  ) => {
    let workspace = getWorkspace();
    let newWorkspaceState: any = JSON.parse(
      JSON.stringify(workspace.workspaceState)
    );

    let foundEnrichedFile = this.state.enrichedFiles.find(
      (x: any) => x.fileId == fileId
    );

    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    if (!newWorkspaceState.files[fileId]) {
      newWorkspaceState.files[fileId] = { plots: foundEnrichedFile.plots };
    }

    let workspaceStatePlot = newWorkspaceState.files[fileId].plots[plotIndex];
    if (!workspaceStatePlot?.overlays) {
      workspaceStatePlot.overlays = [];
    }

    if (color in workspaceStatePlot && color == workspaceStatePlot.color) {
      color = "FFF" + color.substring(0, 3);
    } else if (!(color in workspaceStatePlot) && color == "#000000") {
      color = "FFF" + color.substring(0, 3);
    }

    if (checked)
      workspaceStatePlot.overlays.push({ id: addFileId, color: color });
    else {
      let deleteIndex = workspaceStatePlot.overlays.findIndex(
        (x: any) => x.id == addFileId
      );
      workspaceStatePlot.overlays.splice(deleteIndex, 1);
    }

    let copyOfLocalFiles: any[] = getFiles();
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  onChangeChannel = (change: any) => {
    let type = change.type;
    let fileKey = change.fileId;
    let plotIndex = change.plotIndex;
    //let filesIds;
    let newWorkspaceState: any = this.state.workspaceState;
    if (!(newWorkspaceState as any).files[fileKey]) {
      // so its a non-control gate being edited, copy plots from control
      //@ts-ignore
      (newWorkspaceState as any).files[fileKey] = {
        plots: JSON.parse(
          JSON.stringify(
            (newWorkspaceState as any).files[newWorkspaceState.controlFileId]
              .plots
          )
        ),
      };
    }

    switch (type) {
      case "ChannelIndexChange":
        // //@ts-ignore
        // workspaceState.files[fileKey].plots[plotIndex].plotType =

        Object.keys((newWorkspaceState as any).files).forEach(
          (fileId, index) => {
            // if the file being changed is the control file, change for all
            // otherwise just change for it

            if (fileId === fileKey) {
              if (change.axis == "x") {
                newWorkspaceState = this.updateWorkspaceStateChannels(
                  "x",
                  newWorkspaceState,
                  fileId,
                  plotIndex,
                  change.axisIndex,
                  change.axisLabel,
                  change.scaleType,
                  change.plotType
                );
              } else {
                newWorkspaceState = this.updateWorkspaceStateChannels(
                  "y",
                  newWorkspaceState,
                  fileId,
                  plotIndex,
                  change.axisIndex,
                  change.axisLabel,
                  change.scaleType,
                  change.plotType
                );
              }
            }
          }
        );

        break;
      case "ChangePlotType":
        Object.keys((newWorkspaceState as any).files).forEach(
          (fileId, index) => {
            if (fileId == fileKey) {
              //@ts-ignore
              newWorkspaceState.files[fileId].plots[plotIndex].plotType =
                change.plotType;
            }
          }
        );

        break;

      case "ChangePlotScale":
        if (change.axis === "x") {
          newWorkspaceState.files[fileKey].plots[plotIndex].xScaleType =
            change.scale;
        } else {
          newWorkspaceState.files[fileKey].plots[plotIndex].yScaleType =
            change.scale;
        }
        break;
    }

    // let copyOfLocalFiles = JSON.parse(JSON.stringify(Files21));
    let copyOfLocalFiles: any[] = getFiles();
    // TODO dont need to run Super algoithm
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    setTimeout(() => {
      WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    }, 10);

    this.setState({
      workspaceState: newWorkspaceState,
      enrichedFiles: enrichedFiles,
    });
  };

  //@ts-ignore
  updateWorkspaceStateChannels = (
    axis: any,
    workspaceState: any,
    fileKeyBeingChanged: any,
    plotIndexBeingChanged: any,
    axisIndex: any,
    axisLabel: any,
    scaleType: any,
    plotType: any
  ) => {
    let plot = (workspaceState as any).files[fileKeyBeingChanged].plots[
      plotIndexBeingChanged
    ];
    if (axis == "x") {
      plot.xAxisIndex = axisIndex;
      plot.xAxisLabel = axisLabel;
      plot.xScaleType = scaleType;
      plot.plotType = plotType;
    } else {
      plot.yAxisIndex = axisIndex;
      plot.yAxisLabel = axisLabel;
      plot.yScaleType = scaleType;
      plot.plotType = plotType;
    }

    return JSON.parse(JSON.stringify(workspaceState));
  };

  sortByGate = (gateName: any, sortType: any) => {
    let enrichedFiles = this.state.enrichedFiles;
    let controlEnrichedFile = enrichedFiles.find(
      (enrichedFile) => enrichedFile.isControlFile
    );

    enrichedFiles.sort((enrichedFile1: any, enrichedFile2: any) => {
      const gateStat1 = enrichedFile1.gateStats.find(
        (gateStat: any) => gateStat.gateName == gateName
      );

      const gateStat2 = enrichedFile2.gateStats.find(
        (gateStat: any) => gateStat.gateName == gateName
      );

      // TODO sometimes gateStat1 or gateStat2 are null - why?
      if (!gateStat1) {
        return 1;
      }

      if (!gateStat2) {
        return 0;
      }

      if (sortType === ASC_SORT) {
        if (
          parseFloat(gateStat1.percentage) > parseFloat(gateStat2.percentage)
        ) {
          return 1;
        } else if (
          parseFloat(gateStat1.percentage) < parseFloat(gateStat2.percentage)
        ) {
          return -1;
        } else {
          return 0;
        }
      } else {
        // do desc
        if (
          parseFloat(gateStat1.percentage) < parseFloat(gateStat2.percentage)
        ) {
          return 1;
        } else if (
          parseFloat(gateStat1.percentage) > parseFloat(gateStat2.percentage)
        ) {
          return -1;
        } else {
          return 0;
        }
      }
    });

    let originalFiles: any[] = getFiles();
    let sortedFiles = [];

    for (
      let sortedFileIndex = 0;
      sortedFileIndex < enrichedFiles.length;
      sortedFileIndex++
    ) {
      for (
        let originalFileIndex = 0;
        originalFileIndex < originalFiles.length;
        originalFileIndex++
      ) {
        if (
          originalFiles[originalFileIndex].id ===
          enrichedFiles[sortedFileIndex].fileId
        ) {
          sortedFiles.push(originalFiles[originalFileIndex]);
          break;
        }
      }
    }
    WorkspaceDispatch.SetSortingState(sortType, gateName);
    WorkspaceDispatch.SetFiles(sortedFiles);
    this.setState({
      enrichedFiles: enrichedFiles,
    });
  };

  onResize = (change: any) => {
    let newWorkspaceState: any = this.state.workspaceState;

    if (!(newWorkspaceState as any).files[change.fileId]) {
      // so its a non-control gate being edited, copy plots from control
      //@ts-ignore
      (newWorkspaceState as any).files[change.fileId] = {
        plots: JSON.parse(
          JSON.stringify(
            (newWorkspaceState as any).files[newWorkspaceState.controlFileId]
              .plots
          )
        ),
      };
    }

    Object.keys((newWorkspaceState as any).files).forEach((fileId, index) => {
      if (fileId == change.fileId) {
        //@ts-ignore
        newWorkspaceState.files[fileId].plots[change.plotIndex].width =
          change.width;
        newWorkspaceState.files[fileId].plots[change.plotIndex].height =
          change.height;
      }
    });

    let copyOfLocalFiles: any[] = getFiles();
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);
    WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  uploadFiles = async (files: FileList) => {
    const fileList: { tempId: string; file: File }[] = [];
    const allowedExtensions = ["fcs", "lmd"];

    let listSize = 0;
    for (const file of Array.from(files)) {
      listSize += file.size;
      if (
        !allowedExtensions.includes(file.name.split(".").pop().toLowerCase())
      ) {
        snackbarService.showSnackbar(
          file.name.substring(0, 20) +
            (file.name.length > 20 ? "..." : "") +
            '"' +
            'Is not a .fcs or .lmd file: "',
          "error"
        );
        continue;
      }
      const id = Math.random().toString(36).substring(7);
      fileList.push({ tempId: id, file });
    }

    // let filesUpload = uploadingFiles
    //   ? uploadingFiles.concat(
    //       fileList.map((e) => {
    //         return { name: e.file.name, id: e.tempId };
    //       })
    //     )
    //   : fileList.map((e) => {
    //       return { name: e.file.name, id: e.tempId };
    //     });
    // setUploadingFiles(filesUpload);
    // console.log(">>> filesUpload is ", filesUpload);
    let filesUpload = [];
    const fcsservice = new FCSServices();
    let channelSet = new Set();
    let finalFileList = [];
    for (const file of fileList) {
      this.setState({
        ...this.state,
        currentParsingFile: file.file.name,
      });

      //setcurrentParsingFile(file.file.name);

      //fileTempIdMap[file.tempId] = "";
      let fcsFile = await file.file.arrayBuffer().then(async (e) => {
        const buf = Buffer.from(e);
        return await fcsservice.loadFileMetadata(buf).then((e) => {
          return e;
        });
      });
      fcsFile.name = file.file.name;
      fcsFile.fileId = file.file.name;
      //@ts-ignore
      fcsFile.id = file.file.name;
      //@ts-ignore
      fcsFile.label = file.file.label;

      // filesUpload.push({
      //   name: file.file.name,
      //   eventCount: fcsFile.jsonEventCount,
      //   uploading: true
      // });

      let currentParsedFiles = this.state.parsedFiles || [];
      currentParsedFiles.push({
        name: file.file.name,
        eventCount: fcsFile.jsonEventCount,
      });

      this.setState({
        ...this.state,
        parsedFiles: JSON.parse(JSON.stringify(currentParsedFiles)),
      });

      this.setState({
        ...this.state,
        currentParsingFile: "",
      });

      store.dispatch({
        type: "ADD_FCS_FILE",
        payload: fcsFile,
      });
    }
  };

  componentDidUpdate(
    prevProps: Readonly<PlotControllerProps>,
    prevState: Readonly<IState>,
    snapshot?: any
  ): void {
    //console.log("did update ===");
    let workspaceState = this.state.workspaceState;
    // @ts-ignore
    const newPlots =
      workspaceState &&
      // @ts-ignore
      workspaceState?.files?.[getWorkspace()?.selectedFile]?.plots;
    const oldPlots =
      prevState.workspaceState?.files?.[getWorkspace()?.selectedFile]?.plots;
    // if(!this.state.isTableRenderCall || JSON.stringify(oldPlots)?.length !== JSON.stringify(newPlots)?.length){

    if (
      getWorkspace()?.selectedFile !== prevState.controlFileId ||
      getWorkspace()?.activePipelineId !== prevState?.activePipelineId ||
      JSON.stringify(prevState.workspaceState)?.length !==
        JSON.stringify(workspaceState)?.length
    ) {
      this.onInitState();
    } else {
    }
  }

  componentDidMount() {
    this.onInitState();
    setTimeout(() => {
      this.setState({ isTableRenderCall: true });
    }, 1000);
  }

  setNewSpillover = (rowI, colI, newColumnData) => {
    console.log("in update spillover, ", rowI, colI, newColumnData);
    this.state.controlFileSpillover.invertedMatrix.data[rowI][
      colI
    ] = newColumnData;

    console.log(
      ">>>>>>> ",
      this.state.controlFileSpillover.invertedMatrix.data[rowI][colI]
    );

    this.setState({
      ...this.state,
      controlFileSpillover: this.state.controlFileSpillover,
    });
  };

  updateSpillover = () => {
    console.log(
      ">>>>>>> ",
      this.state.controlFileSpillover.invertedMatrix.data
    );
  };

  renderTable = () => {
    if (this.state.isTableRenderCall && this.state.enrichedFiles?.length > 0) {
      return (
        <>
          <div>
            <Button
              variant="outlined"
              style={{
                // backgroundColor: "#6666AA",
                marginLeft: 5,
                marginBottom: 3,
                // color: "white",
              }}
              onClick={(e) =>
                this.setState({
                  ...this.state,
                  showSpillover: !this.state.showSpillover,
                })
              }
            >
              Compensation
            </Button>

            {this.state.showSpillover && (
              <>
                <table
                  style={{
                    color: "#000",
                    //backgroundColor: "#ffff99",
                    textAlign: "center",
                    fontWeight: "bold",
                    marginBottom: 5,
                    border: "1px solid #e0e0eb",
                  }}
                >
                  <tbody>
                    <tr>
                      <th></th>
                      {this.state.controlFileSpillover?.spilloverParamLabels.map(
                        (label, i) => {
                          return <th key={`th--${i}`}>{label}</th>;
                        }
                      )}
                    </tr>
                    {this.state.controlFileSpillover?.invertedMatrix.data.map(
                      (rowData: any, rowI: number) => {
                        return (
                          <tr key={`tr--${rowI}`}>
                            <td
                              key={`td--${rowI}`}
                              style={{
                                border: "1px solid #e0e0eb",
                                padding: 15,
                              }}
                            >
                              {
                                this.state.controlFileSpillover
                                  ?.spilloverParamLabels[rowI]
                              }
                            </td>

                            {rowData.map((columnData: any, colI: number) => {
                              console.log(">> columnData is ", columnData);
                              return (
                                <td
                                  key={`th-${rowI}-${colI}`}
                                  style={{
                                    border: "1px solid #e0e0eb",
                                    padding: 15,
                                  }}
                                >
                                  <TextField
                                    style={
                                      {
                                        //width: "20%",
                                      }
                                    }
                                    value={columnData}
                                    onChange={(newColumnData: any) => {
                                      console.log(
                                        "newName.target.value is ",
                                        newColumnData.target.value
                                      );

                                      this.setNewSpillover(
                                        rowI,
                                        colI,
                                        newColumnData.target.value
                                      );
                                    }}
                                  />

                                  {/* <TextField
                                  style={{
                                    width: "20%",
                                  }}
                                  value={{ columnData }}
                                  onChange={(newColumnData: any) => {
                                    console.log(
                                      "newColumnData is ",
                                      newColumnData
                                    );
                                  }}
                                />

                                <button
                                  onClick={(val) => {}}
                                  style={{
                                    border: "none",
                                    cursor: "pointer",
                                    color: "white",
                                    fontWeight: 500,
                                    padding: "2px 5px",
                                    background: "#66a",
                                    width: 50,
                                    margin: "0px 8px",
                                    borderRadius: 5,
                                  }}
                                >
                                  {"Save"}
                                </button>

                                <button
                                  onClick={() => {
                                    //setEditingFileName(null);
                                  }}
                                  style={{
                                    border: "none",
                                    cursor: "pointer",
                                    color: "white",
                                    fontWeight: 500,
                                    padding: "2px 5px",
                                    background: "#66a",
                                    width: 70,
                                    borderRadius: 5,
                                  }}
                                >
                                  {"Cancel"}
                                </button> */}

                                  {/* {columnData} */}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>

                <Button
                  variant="outlined"
                  style={{
                    // backgroundColor: "#6666AA",
                    marginLeft: 5,
                    marginBottom: 3,
                    // color: "white",
                  }}
                  onClick={(e) => this.updateSpillover()}
                >
                  Update
                </Button>
              </>
            )}
          </div>
          <PlotTableComponent
            enrichedFiles={this.state.enrichedFiles}
            className="workspace"
            onChangeChannel={this.onChangeChannel}
            addOverlay={this.addOverlay}
            onAddGate={this.onAddGate}
            onDeleteGate={this.onDeleteGate}
            onEditGate={this.onEditGate}
            onResize={this.onResize}
            sortByGate={this.sortByGate}
            downloadPlotAsImage={this.downloadPlotAsImage}
            onResetToControl={this.onResetToControl}
            testParam={this.state.testParam}
          />
        </>
      );
    } else return null;
  };

  render() {
    const workState = getWorkspace().workspaceState;
    // @ts-ignoreconst
    const plots =
      // @ts-ignore
      workState && workState?.files?.[getWorkspace().selectedFile]?.plots;
    if (getWorkspace()?.selectedFile && plots?.length > 0) {
      // const plotGroups = getPlotGroups(getWorkspace().plots);
      return (
        <div>
          {!this.state.isTableRenderCall ? (
            <Grid
              container
              style={{
                height: 100,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                textAlign: "center",
              }}
              justify="center"
              alignItems="center"
              alignContent="center"
            >
              <CircularProgress style={{ padding: "10px" }} />
              <span>Wait Loading...</span>
            </Grid>
          ) : (
            getWorkspace().selectedFile !== "" && this.renderTable()
          )}
        </div>
      );
    } else {
      return (
        <div
          style={{
            textAlign: "center",
          }}
        >
          {this.state.currentParsingFile?.length > 0 ? (
            <>
              <Grid
                item
                xs={12}
                style={{
                  textAlign: "left",
                  marginTop: 15,
                  marginLeft: 10,
                }}
              >
                <h3>
                  <b
                    style={{
                      backgroundColor: "#ff8080",
                      border: "solid 1px #ddd",
                      borderRadius: 5,
                      padding: 5,
                      marginRight: 10,
                    }}
                  >
                    Parsing file, please wait....
                  </b>
                  {this.state.currentParsingFile}
                  <div className="fancy-spinner">
                    <div className="ring"></div>
                    <div className="ring"></div>
                    <div className="dot"></div>
                  </div>
                </h3>
              </Grid>
            </>
          ) : null}
          {this.state.parsedFiles &&
            this.state.parsedFiles?.map((e: any, i: number) => {
              return (
                <div key={`uploadingFiles-${i}`}>
                  <Grid
                    item
                    xs={12}
                    style={{
                      textAlign: "left",
                      marginTop: 15,
                      marginLeft: 10,
                    }}
                  >
                    <h3>
                      <b
                        style={{
                          backgroundColor: "#dfd",
                          border: "solid 1px #ddd",
                          borderRadius: 5,
                          padding: 5,
                          marginRight: 10,
                        }}
                      >
                        file
                      </b>
                      {e.name}
                      {"   "}•{"   "}{" "}
                      <b
                        style={{
                          fontSize: 15,
                          fontWeight: 500,
                          color: "#777",
                        }}
                      >
                        {e.eventCount + " events"}
                      </b>
                    </h3>
                  </Grid>
                </div>
              );
            })}
          {getFiles()?.length < 1 ? (
            <span>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "#6666AA",
                  maxHeight: 50,
                  marginTop: 20,
                  marginBottom: 25,
                  color: "white",
                }}
                onClick={() => {
                  this.inputFile.current.click();
                }}
              >
                <input
                  type="file"
                  id="file"
                  //@ts-ignore
                  ref={this.inputFile}
                  multiple
                  accept=".fcs, .lmd"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    this.uploadFiles(e.target.files);
                  }}
                />
                Upload Files
              </Button>
            </span>
          ) : (
            <span>
              <h3 style={{ marginTop: 100, marginBottom: 10 }}>
                Begin analysis by clicking on "NEW GATE PIPELINE" in the top
                left
              </h3>
              <h4 style={{ marginBottom: 70, color: "#777" }}>
                You can add as many gate pipelines as you want
              </h4>
            </span>
          )}
        </div>
      );
    }
  }
}

export default NewPlotController;
