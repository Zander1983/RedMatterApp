import React from "react";
import { getWorkspace } from "graph/utils/workspace";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Grid from "@material-ui/core/Grid";
import PlotTableComponent from "./Table";
//import WorkspaceState4Plots from "./WorkspaceState4Plots.json";
import * as htmlToImage from "html-to-image";
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
}

class NewPlotController extends React.Component<PlotControllerProps, IState> {
  constructor(props: PlotControllerProps) {
    super(props);
    // let copyOfFiles: any[] = JSON.parse(JSON.stringify(Files21));
    // console.log(JSON.parse(JSON.stringify(Files21)));
    // console.log("== work space file ====");
    // let copyOfFiles: any[] = getWorkspace().files;
    // console.log(copyOfFiles);
    // console.log("===== get from server =====");
    // console.log(getWorkspace().workspaceState);
    // let workspaceState = initTemporaryDynamicPlot(copyOfFiles[0]);
    // WorkspaceDispatch.UpdatePlotStates(workspaceState);
    // console.log(enrichedFiles);
    //   let workspaceState = getWorkspace().workspaceState;
    //   // @ts-ignore
    //   const plots =
    //       workspaceState &&
    //       // @ts-ignore
    //       workspaceState?.files?.[getWorkspace()?.selectedFile]?.plots;
    //   let isSnapShotCreated = false;
    //   let copyOfFiles: any[] = getWorkspace().files;
    //   if (plots === null || plots === undefined) {
    //       const defaultFile = copyOfFiles?.[0];
    //       const { xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex, xAxisScaleType, yAxisScaleType } =
    //           getPlotChannelAndPosition(defaultFile);
    //       workspaceState = createDefaultPlotSnapShot(
    //           defaultFile?.id,
    //           this.props.experimentId,
    //           xAxisLabel,
    //           yAxisLabel,
    //           xAxisIndex,
    //           yAxisIndex
    //       );
    //       isSnapShotCreated = true;
    //   }
    //
    //   let enrichedFiles: any[] = superAlgorithm(copyOfFiles, workspaceState);
    //
    //   enrichedFiles = this.formatEnrichedFiles(enrichedFiles, workspaceState);
    //
    //   if (isSnapShotCreated) WorkspaceDispatch.UpdatePlotStates(workspaceState);

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
    };

    this.onChangeChannel = this.onChangeChannel.bind(this);
    this.onEditGate = this.onEditGate.bind(this);
    this.onAddGate = this.onAddGate.bind(this);
    this.onDeleteGate = this.onDeleteGate.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onInitState = this.onInitState.bind(this);
    this.onResetToControl = this.onResetToControl.bind(this);
    this.downloadPlotAsImage = this.downloadPlotAsImage.bind(this);
  }

  onInitState = () => {
    //console.log("init====");
    let workspaceState = getWorkspace().workspaceState;
    // @ts-ignore
    const plots = workspaceState
      ? // @ts-ignore
        workspaceState?.files?.[getWorkspace()?.selectedFile]?.plots
      : [];
    let isSnapShotCreated = false;
    let copyOfFiles: any[] = getWorkspace().files;

    let defaultFile = null;
    let pipeline = null;
    if (plots?.length === 0 && getWorkspace()?.pipelines?.length > 0) {
      // const defaultFile = copyOfFiles?.[0];
      defaultFile = getWorkspace()?.selectedFile
        ? copyOfFiles?.filter(
            (file) => file.id === getWorkspace()?.selectedFile
          )?.[0]
        : copyOfFiles?.[0];
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
        defaultFile?.id,
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
      let enrichedFiles: any[] = superAlgorithm(copyOfFiles, workspaceState);

      enrichedFiles = formatEnrichedFiles(enrichedFiles, workspaceState);

      if (isSnapShotCreated) {
        WorkspaceDispatch.UpdatePlotStates(workspaceState);
        if (defaultFile) WorkspaceDispatch.UpdateSelectedFile(defaultFile?.id);
      }

      this.setState({
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
    let copyOfFiles: any[] = getWorkspace().files;
    let enrichedEvents = superAlgorithm(copyOfFiles, this.state.workspaceState);
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

    let copyOfFiles: any[] = getWorkspace().files;
    // let copyOfFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfFiles, newWorkspaceState);
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
      (newWorkspaceState as any).files[fileIds[i]].plots = (
        newWorkspaceState as any
      ).files[fileIds[i]].plots.map((plt: any) => {
        if (plt.population === plot.population) {
          const { gate, ...plotWithOutGate } = plt;
          return plotWithOutGate;
        } else {
          return plt;
        }
      });
    }

    let copyOfFiles: any[] = getWorkspace().files;
    // let copyOfFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfFiles, newWorkspaceState);
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
      (this.state.workspaceState as any).files[fileId].plots[plotIndex] =
        JSON.parse(JSON.stringify(controlEnrichedFile.plots[plotIndex]));
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
    (newWorkspaceState as any).files[fileKey].plots[change.plotIndex] =
      JSON.parse(JSON.stringify(change.plot));

    let copyOfFiles: any[] = getWorkspace().files;
    // let copyOfFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfFiles, newWorkspaceState);

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
    // selecting the canvas from dom
    const canvas: HTMLCanvasElement = document.getElementById(
      "canvas-" + plotIndex
    ) as HTMLCanvasElement;

    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.fillStyle = "blue";
    // x-axis
    context.fillStyle = "white";
    context.fillRect(20, 185, plot.xAxisLabel.length * 7, 10);
    context.font = "12px Roboto";
    context.fillStyle = "black";
    context.fillText(`${plot.xAxisLabel}`, 20, 195);

    context.fillStyle = "white";
    context.fillRect(150, 185, 40, 10);
    context.font = "12px Roboto";
    context.fillStyle = "black";
    context.fillText(
      `${plot.xScaleType === "lin" ? "Linear" : "Logicle"}`,
      150,
      195
    );
    // plot name
    context.fillStyle = "white";
    context.fillRect(50, 10, (plot.population.length + 9) * 7, 10);
    context.font = "12px Roboto";
    context.fillStyle = "black";
    context.fillText(`Plot Name: ${plot.population}`, 50, 20);
    context.save();

    // y-axis
    context.translate(10, 50);
    context.rotate(-0.5 * Math.PI);
    context.fillStyle = "white";
    context.fillRect(0, -10, 40, 10);
    context.font = "12px Roboto";
    context.fillStyle = "black";
    context.fillText(
      `${plot.yScaleType === "lin" ? "Linear" : "Logicle"}`,
      0,
      0
    );
    context.restore();
    context.save();
    context.translate(10, 180);
    context.rotate(-0.5 * Math.PI);
    context.fillStyle = "white";
    context.fillRect(0, -10, plot.yAxisLabel.length * 7, 10);
    context.font = "12px Roboto";
    context.fillStyle = "black";
    context.fillText(`${plot.yAxisLabel}`, 0, 0);
    context.restore();

    // downloading functionality
    const dataUrl = await htmlToImage.toPng(
      document.getElementById(`entire-canvas-${plotIndex}`)
    );
    var link = document.createElement("a");
    link.download = `${plot.population}`;
    link.href = dataUrl;
    link.click();

    // re-draw
    let newWorkspaceState: any = this.state.workspaceState;
    let copyOfFiles: any[] = getWorkspace().files;
    let enrichedFiles = superAlgorithm(copyOfFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);
    WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  onResetToControl = (fileId: string) => {
    let newWorkspaceState: any = JSON.parse(
      JSON.stringify(getWorkspace().workspaceState)
    );
    delete newWorkspaceState.files[fileId];
    let copyOfFiles: any[] = getWorkspace().files;
    let enrichedFiles = superAlgorithm(copyOfFiles, newWorkspaceState);
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

    let copyOfFiles: any[] = getWorkspace().files;
    let enrichedFiles = superAlgorithm(copyOfFiles, newWorkspaceState);
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

    // let copyOfFiles = JSON.parse(JSON.stringify(Files21));
    let copyOfFiles: any[] = getWorkspace().files;
    // TODO dont need to run Super algoithm
    let enrichedFiles = superAlgorithm(copyOfFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    setTimeout(() => {
      WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    }, 10);

    console.log(">>> newWorkspaceState is ", newWorkspaceState);

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

    let originalFiles: any[] = getWorkspace().files;
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

    let copyOfFiles: any[] = getWorkspace().files;
    let enrichedFiles = superAlgorithm(copyOfFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);
    WorkspaceDispatch.SetPlotStates(newWorkspaceState);
    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  // shouldComponentUpdate(nextProps: Readonly<PlotControllerProps>, nextState: Readonly<IState>, nextContext: any): boolean {
  //       if(!this.state.isTableRenderCall) return true;
  //       return false;
  //       // else {
  //       //     let workspaceState = this.state.workspaceState;
  //       //     // @ts-ignore
  //       //     const newPlots =
  //       //         workspaceState &&
  //       //         // @ts-ignore
  //       //         workspaceState?.files?.[getWorkspace()?.selectedFile]?.plots;
  //       //     const oldPlots = nextState.workspaceState;
  //       //
  //       //     console.log(JSON.stringify(oldPlots)?.length, JSON.stringify(workspaceState)?.length);
  //       //
  //       //     if(JSON.stringify(oldPlots)?.length !== JSON.stringify(workspaceState)?.length){
  //       //         console.log("shuld true=======");
  //       //         return true;
  //       //     }else {
  //       //         console.log("shuld false=======");
  //       //         return false;
  //       //     }
  //       // }
  //   }

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
      //console.log(" did update true=======");
      this.onInitState();
    } else {
      //console.log("did update false=======");
    }
  }

  componentDidMount() {
    this.onInitState();
    setTimeout(() => {
      this.setState({ isTableRenderCall: true });
    }, 1000);
  }

  renderTable = () => {
    if (this.state.isTableRenderCall && this.state.enrichedFiles?.length > 0) {
      //console.log("== call table ==");
      return (
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
        <div style={{ padding: 10 }}>
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
          {this.props.sharedWorkspace ? (
            <span>
              <h4 style={{ marginBottom: 70, marginTop: 100, color: "#777" }}>
                If nothing is loaded, either this experiment is not shared or it
                doesn't exist.
              </h4>
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
