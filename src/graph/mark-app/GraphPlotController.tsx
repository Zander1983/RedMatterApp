import React from "react";
// import "./react-grid-layout-styles.css";
import { getWorkspace } from "graph/utils/workspace";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Grid from "@material-ui/core/Grid";
import PlotTableComponent from "./Table";
import Files50 from "./Files50.json";
import Files from "./Files.json";
import SmallFiles from "./SmallFiles.json";
import workspaceState from "./WorkspaceState.json";
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

class NewPlotController extends React.Component<PlotControllerProps, IState> {
  constructor(props: PlotControllerProps) {
    super(props);

    let copyOfFiles: any[] = JSON.parse(JSON.stringify(Files));
    console.log("copyOfFiles is ", copyOfFiles);

    let enrichedFiles: any[] = superAlgorithm(copyOfFiles, workspaceState);

    console.log("after superAlgorithm: " + enrichedFiles);

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
    this.onResize = this.onResize.bind(this);

    // if (workspaceState[controlFile]) {
    //   workspaceState[controlFile].plots[
    //     workspaceState[controlFile].plots.length - 1
    //   ] = gatedPlot;
    // }
  }

  getEnrichedEvents = () => {
    let copyOfFiles = JSON.parse(JSON.stringify(Files));

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

      let controlFile = workspaceState.controlFile;

      let plots = workspaceState.files[file.id]
        ? JSON.parse(JSON.stringify(workspaceState.files[file.id].plots))
        : JSON.parse(JSON.stringify(workspaceState.files[controlFile].plots));

      return {
        enrichedEvents: file.events,
        channels: channels,
        logicles: logicles,
        gateStats: file.gateStats,
        plots: plots,
        fileId: file.id,
      };
    });
  };

  onAddGate = (change: any) => {
    console.log("adding gate, change is ", change);

    // create a new plot from the plot that has just been gated, but remove
    // its gate and set population to be the gate.name
    let newPlot = JSON.parse(JSON.stringify(change.plot));
    delete newPlot.gate;
    newPlot.population = change.plot.gate.name;

    // set the passed up plot to be in the state
    let gatedPlot = JSON.parse(JSON.stringify(change.plot));

    //gatedPlot.gate = gate;
    let controlFile: string = workspaceState.controlFile;

    console.log(">>>>>>>>>>>>>>>>>>>>> controlFile is ", controlFile);

    (workspaceState as any).files[controlFile].plots[
      (workspaceState as any).files[controlFile].plots.length - 1
    ] = gatedPlot;

    //workspaceState[controlFile].plots.push(newPlot);

    let copyOfFiles = JSON.parse(JSON.stringify(Files));
    let enrichedFiles = superAlgorithm(copyOfFiles, workspaceState);
    enrichedFiles = this.formatEnrichedFiles(enrichedFiles, workspaceState);

    console.log(">>>>> enrichedFiles is ", enrichedFiles);

    this.setState({
      enrichedFiles: enrichedFiles,
      // workspaceState: this.state.workspaceState,
    });
  };

  onEditGate = (change: any) => {
    console.log("change is ", change);
    let fileKey = change.fileId;
    if (!(workspaceState as any)[fileKey]) {
      // so its a non-control gate being edited, copy plots from control
      (workspaceState as any).files[fileKey] = {
        plots: JSON.parse(
          JSON.stringify(
            (workspaceState as any).files[workspaceState.controlFile].plots
          )
        ),
      };
    }

    (workspaceState as any).files[fileKey].plots[change.plotIndex] = JSON.parse(
      JSON.stringify(change.plot)
    );

    console.log("=========== change.plot is ", change.plot);

    console.log(
      ">>>>>>>>>>>>>>>>> files UPDATE is ",
      (workspaceState as any).files
    );

    // if its control file - change for all
    if (fileKey == workspaceState.controlFile) {
      console.log("CONTROL FILE EDITED!!!!!");
      const filesIds = Object.keys((workspaceState as any).files);
      filesIds.forEach((fileId, index) => {
        (workspaceState as any).files[fileId].plots[
          change.plotIndex
        ] = JSON.parse(JSON.stringify(change.plot));

        // gateStats[gateCount.replace("_count", "_percentage")] = (
        //   (gateStats[gateCount] * 100) /
        //   Files[fileIndex].events.length
        // ).toFixed(2);
      });
    }

    let copyOfFiles = JSON.parse(JSON.stringify(Files));
    let enrichedFiles = superAlgorithm(copyOfFiles, workspaceState);

    console.log("AFTER SUPER ALGHO enrichedFiles is ", enrichedFiles);

    enrichedFiles = this.formatEnrichedFiles(enrichedFiles, workspaceState);

    console.log("END of EDIT gate enrichedFiles is ", enrichedFiles);

    this.setState({
      enrichedFiles: enrichedFiles,
    });
  };

  onChangeChannel = (change: any) => {
    // if (change.axis == "x") {
    //   console.log("in x!!!!!");
    //   this.state.workspaceState.plots[change.plotIndex].xAxisIndex =
    //     change.axisIndex;
    //   this.state.workspaceState.plots[change.plotIndex].xAxisLabel =
    //     change.axisLabel;
    //   this.state.workspaceState.plots[change.plotIndex].xScaleType =
    //     change.scaleType;
    // } else {
    //   this.state.workspaceState.plots[change.plotIndex].yAxisIndex =
    //     change.axisIndex;
    //   this.state.workspaceState.plots[change.plotIndex].yAxisLabel =
    //     change.axisLabel;
    //   this.state.workspaceState.plots[change.plotIndex].yScaleType =
    //     change.scaleType;
    // }
    // this.setState({
    //   workspaceState: JSON.parse(JSON.stringify(this.state.workspaceState)),
    // });
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
      console.log(
        ">>>>>>>>>>>> this.state.enrichedFiles is ",
        this.state.enrichedFiles
      );
      return (
        <PlotTableComponent
          enrichedFiles={this.state.enrichedFiles}
          //workspaceState={this.state.workspaceState}
          className="workspace"
          onChangeChannel={this.onChangeChannel}
          onAddGate={this.onAddGate}
          onEditGate={this.onEditGate}
          onResize={this.onResize}
          testParam={this.state.testParam}
        />
      );
    } else return null;
  };

  render() {
    if (getWorkspace().plots.length > 0) {
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
