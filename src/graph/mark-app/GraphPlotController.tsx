import React from "react";
// import "./react-grid-layout-styles.css";
import { getWorkspace } from "graph/utils/workspace";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Grid from "@material-ui/core/Grid";
import PlotTableComponent from "./Table";
import Files51 from "./Files51.json";
// import Files90 from "./Files90.json";
import Files from "./Files.json";
import Files21 from "./Files21.json";
import SmallFiles from "./SmallFiles.json";
import WorkspaceState from "./WorkspaceState.json";
import HistogramState from "./HistogramState.json";
import WorkspaceState4Plots from "./WorkspaceState4Plots.json";
import { superAlgorithm } from "./Helper";
import MarkLogicle from "./logicleMark";

interface PlotControllerProps {
  sharedWorkspace: boolean;
  experimentId: string;
  // workspace: Workspace;
  workspaceLoading: boolean;
  // customPlotRerender: PlotID[];
  plotMoving?: boolean;
  // arrowFunc: Function;
}

interface IState {
  sortByChanged: boolean;
  sortBy: string;
  isTableRenderCall: boolean;
  enrichedFiles: any[];
  //workspaceState: any;
  enrichedEvents: any[];
  testParam: string;
}

let workspaceState = {
  controlFileId: "",
};

class NewPlotController extends React.Component<PlotControllerProps, IState> {
  constructor(props: PlotControllerProps) {
    super(props);

    workspaceState = JSON.parse(JSON.stringify(WorkspaceState));

    console.log("workspaceState is ", workspaceState);

    let copyOfFiles: any[] = JSON.parse(JSON.stringify(Files21));

    let enrichedFiles: any[] = superAlgorithm(copyOfFiles, workspaceState);

    enrichedFiles = this.formatEnrichedFiles(enrichedFiles, workspaceState);
    this.state = {
      sortByChanged: false,
      sortBy: "file",
      isTableRenderCall: false,
      enrichedFiles: enrichedFiles,
      //workspaceState: workspaceState,
      enrichedEvents: [],
      testParam: "some value",
    };

    this.onChangeChannel = this.onChangeChannel.bind(this);
    this.onEditGate = this.onEditGate.bind(this);
    this.onAddGate = this.onAddGate.bind(this);
    this.onDeleteGate = this.onDeleteGate.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  getEnrichedEvents = () => {
    let copyOfFiles = JSON.parse(JSON.stringify(Files21));

    let enrichedEvents = superAlgorithm(copyOfFiles, workspaceState);

    enrichedEvents = enrichedEvents.map((events: any[]) => {
      return events;
    });

    return enrichedEvents;
  };

  formatEnrichedFiles = (enrichedFiles: any[], workspaceState: any) => {
    return enrichedFiles.map((file) => {
      let logicles = file.channels.map((channel: any) => {
        return new MarkLogicle(
          channel.biexponentialMinimum,
          channel.biexponentialMaximum
        );
      });

      let channels = file.channels.map((channel: any) => {
        return {
          minimum: channel.biexponentialMinimum,
          maximum: channel.biexponentialMaximum,
          name: channel.value,
          defaultScale: channel.display,
        };
      });

      let controlFileId = workspaceState.controlFileId;

      let plots = workspaceState.files[file.id]
        ? JSON.parse(JSON.stringify(workspaceState.files[file.id].plots))
        : JSON.parse(JSON.stringify(workspaceState.files[controlFileId].plots));

      return {
        enrichedEvents: file.events,
        channels: channels,
        logicles: logicles,
        gateStats: file.gateStats,
        plots: plots,
        fileId: file.id,
        isControlFile: file.id == controlFileId ? 1 : 0,
        label: file.label,
      };
    });
  };

  onAddGate = (change: any) => {
    // create a new plot from the plot that has just been gated, but remove
    // its gate and set population to be the gate.name
    let newPlot = JSON.parse(JSON.stringify(change.plot));
    delete newPlot.gate;
    newPlot.population = change.plot.gate.name;

    // set the passed up plot to be in the state
    let gatedPlot = JSON.parse(JSON.stringify(change.plot));

    //@ts-ignore
    let controlFileId: string = workspaceState.controlFileId;

    // this is setting the last plot to be the gated plot on the contorl
    (workspaceState as any).files[controlFileId].plots[
      (workspaceState as any).files[controlFileId].plots.length - 1
    ] = gatedPlot;

    // this is adding a new plot to the end of the plots array on the control
    (workspaceState as any).files[controlFileId].plots.push(newPlot);

    // new plots are only added on the control file,
    // so loop through the other fileIds - which have adjusted gates
    // and make sure to keep them
    let fileIds = Object.keys((workspaceState as any).files);
    fileIds.forEach((fileId) => {
      if (fileId != controlFileId) {
        (workspaceState as any).files[fileId].plots[
          (workspaceState as any).files[fileId].plots.length - 1
        ] = JSON.parse(JSON.stringify(gatedPlot));

        (workspaceState as any).files[fileId].plots.push(
          JSON.parse(JSON.stringify(newPlot))
        );
      }
    });

    let copyOfFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfFiles, workspaceState);
    enrichedFiles = this.formatEnrichedFiles(enrichedFiles, workspaceState);

    console.log("in add gate, enrichedFiles is now ", enrichedFiles);

    this.setState({
      enrichedFiles: enrichedFiles,
      // workspaceState: this.state.workspaceState,
    });
  };

  onDeleteGate = (plot:any) =>{
    if(plot.population === "All"){
      console.log("Delete Everything")
      return;
    }

    let controlFileId: string = workspaceState.controlFileId;

    // deleting the plot of the gate 
    (workspaceState as any).files[controlFileId].plots = (workspaceState as any).files[controlFileId].plots.filter((plt:any) => plt.population !== plot.population);

    // deleting the gate from the parent plot
    const parentPlot =  (workspaceState as any).files[controlFileId].plots.find((plt:any) => plot.population === plt?.gate?.name);
    (workspaceState as any).files[controlFileId].plots = (workspaceState as any).files[controlFileId].plots.map((plt:any) => {
      if(plt.population === parentPlot.population){
        const { gate, ...plotWithOutGate } = parentPlot;
        return plotWithOutGate;
      }else {
        return plt;
      }
    });

    let copyOfFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfFiles, workspaceState);
    enrichedFiles = this.formatEnrichedFiles(enrichedFiles, workspaceState);
    this.setState({
      enrichedFiles: enrichedFiles,
    });

  }

  setPlotsOfAllFilesToBeSameAsControl = (plotIndex: any) => {
    let controlEnrichedFile = this.state.enrichedFiles.find(
      (enrichedFile) => enrichedFile.isControlFile
    );
    console.log(">>> controlEnrichedFile is ", controlEnrichedFile);
    const filesIds = Object.keys((workspaceState as any).files);
    filesIds.forEach((fileId, index) => {
      (workspaceState as any).files[fileId].plots[plotIndex] = JSON.parse(
        JSON.stringify(controlEnrichedFile.plots[plotIndex])
      );
    });
  };

  onEditGate = (change: any) => {
    let fileKey = change.fileId;
    if (!(workspaceState as any).files[fileKey]) {
      // so its a non-control gate being edited, copy plots from control
      (workspaceState as any).files[fileKey] = {
        //@ts-ignore
        plots: JSON.parse(
          JSON.stringify(
            (workspaceState as any).files[workspaceState.controlFileId].plots
          )
        ),
      };
    }

    // now change the specific plot for specific file
    (workspaceState as any).files[fileKey].plots[change.plotIndex] = JSON.parse(
      JSON.stringify(change.plot)
    );

    let copyOfFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfFiles, workspaceState);

    enrichedFiles = this.formatEnrichedFiles(enrichedFiles, workspaceState);

    this.setState({
      enrichedFiles: enrichedFiles,
    });
  };

  onChangeChannel = (change: any) => {
    console.log(workspaceState);
    let type = change.type;
    let fileKey = change.fileId;
    let plotIndex = change.plotIndex;
    //let filesIds;
    console.log(">>>>> type is ", type);
    if (!(workspaceState as any).files[fileKey]) {
      // so its a non-control gate being edited, copy plots from control
      //@ts-ignore
      (workspaceState as any).files[fileKey] = {
        plots: JSON.parse(
          JSON.stringify(
            (workspaceState as any).files[workspaceState.controlFileId].plots
          )
        ),
      };
    }

    switch (type) {
      case "ChannelIndexChange":
        // //@ts-ignore
        // workspaceState.files[fileKey].plots[plotIndex].plotType =
        //   change.plotType;

        Object.keys((workspaceState as any).files).forEach((fileId, index) => {
          // if the file being changed is the control file, change for all
          // otherwise just change for it
          if (fileId == fileKey) {
            if (change.axis == "x") {
              workspaceState = this.updateWorkspaceStateChannels(
                "x",
                workspaceState,
                fileId,
                plotIndex,
                change.axisIndex,
                change.axisLabel,
                change.scaleType,
                change.plotType
              );
            } else {
              workspaceState = this.updateWorkspaceStateChannels(
                "y",
                workspaceState,
                fileId,
                plotIndex,
                change.axisIndex,
                change.axisLabel,
                change.scaleType,
                change.plotType
              );
            }
          }
        });

        break;
      case "ChangePlotType":
        console.log("in change plot and fileKey is ", fileKey);
        Object.keys((workspaceState as any).files).forEach((fileId, index) => {
          console.log("fileId is ", fileId);
          if (fileId == fileKey) {
            console.log("in the if....so change");
            //@ts-ignore
            workspaceState.files[fileId].plots[plotIndex].plotType =
              change.plotType;
          }
        });

        break;
    }

    let copyOfFiles = JSON.parse(JSON.stringify(Files21));
    // TODO dont need to run Super algoithm
    let enrichedFiles = superAlgorithm(copyOfFiles, workspaceState);
    enrichedFiles = this.formatEnrichedFiles(enrichedFiles, workspaceState);

    this.setState({
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

    console.log("in sortByGate, control file is ", controlEnrichedFile);

    let gateStats = controlEnrichedFile.gateStats;

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

      if (sortType == "asc") {
        if (gateStat1.percentage > gateStat2.percentage) {
          return 1;
        } else if (gateStat1.percentage < gateStat2.percentage) {
          return -1;
        } else {
          return 0;
        }
      } else {
        // do desc
        if (gateStat1.percentage < gateStat2.percentage) {
          return 1;
        } else if (gateStat1.percentage > gateStat2.percentage) {
          return -1;
        } else {
          return 0;
        }
      }
    });

    this.setState({
      enrichedFiles: enrichedFiles,
    });
  };

  onResize = (change: any) => {
    // console.log("in resize, change is ", change);
    // this.state.workspaceState.plots[change.plotIndex].width = change.width;
    // this.state.workspaceState.plots[change.plotIndex].height = change.height;
    // this.setState({
    //   workspaceState: JSON.parse(JSON.stringify(this.state.workspaceState)),
    // });
  };

  componentDidMount() {
    setTimeout(() => this.setState({ isTableRenderCall: true }), 1000);
  }

  renderTable = () => {
    if (
      getWorkspace().selectedFile &&
      getWorkspace().plots.length > 0 &&
      getWorkspace()?.files[0]?.downloaded &&
      this.state.sortBy === "file" &&
      this.state.isTableRenderCall
    ) {
      return (
        <PlotTableComponent
          enrichedFiles={this.state.enrichedFiles}
          //workspaceState={this.state.workspaceState}
          className="workspace"
          onChangeChannel={this.onChangeChannel}
          onAddGate={this.onAddGate}
          onDeleteGate={this.onDeleteGate}
          onEditGate={this.onEditGate}
          onResize={this.onResize}
          sortByGate={this.sortByGate}
          testParam={this.state.testParam}
        />
      );
    } else return null;
  };

  render() {
    if (getWorkspace().plots.length > 0) {
      // const plotGroups = getPlotGroups(getWorkspace().plots);
      return (
        <div
          style={{
            padding: 20,
          }}
        >
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
                Click on "Plot sample" to visualize
              </h3>
              <h4 style={{ marginBottom: 70, color: "#777" }}>
                Create a plot from one of your samples to start your analysis
              </h4>
            </span>
          )}
        </div>
      );
    }
  }
}

export default NewPlotController;
