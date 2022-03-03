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
  workspaceState: any;
  enrichedEvents: any[];
}

class NewPlotController extends React.Component<PlotControllerProps, IState> {
  constructor(props: PlotControllerProps) {
    super(props);

    let copyOfFiles: any[] = JSON.parse(JSON.stringify(Files50));
    console.log("===== state 50 files======");
    console.log(copyOfFiles);
    // let copyOfFiles:any[] = getWorkspace().files;
    console.log("=== current file in server ===== ");
    console.log(getWorkspace().files);
    let enrichedFiles: any[] = superAlgorithm(copyOfFiles, workspaceState);
    console.log("==== current plot workspace =====");
    console.log(getWorkspace().plots);
    console.log("====== state plots =====");
    console.log(workspaceState);
    // let enrichedFiles:any[] = superAlgorithm(copyOfFiles, );

    console.log("agfter super, enrichedFiles is ", enrichedFiles);
    enrichedFiles = this.formatEnrichedFiles(enrichedFiles);
    this.state = {
      sortByChanged: false,
      sortBy: "file",
      isTableRenderCall: false,
      enrichedFiles: enrichedFiles,
      workspaceState: workspaceState,
      enrichedEvents: [],
    };

    this.onChangeChannel = this.onChangeChannel.bind(this);
    this.onEditGate = this.onEditGate.bind(this);
    this.onAddGate = this.onAddGate.bind(this);
  }

  getEnrichedEvents = () => {
    let copyOfFiles = JSON.parse(JSON.stringify(Files50));

    let enrichedEvents = superAlgorithm(copyOfFiles, this.state.workspaceState);

    enrichedEvents = enrichedEvents.map((events: any[]) => {
      return events;
    });

    return enrichedEvents;
  };

  formatEnrichedFiles = (enrichedFiles: any[]) => {
    return enrichedFiles.map((file) => {
      let logicles = file.channels.map((channel: any) => {
        return new MarkLogicle(
          channel.biexponentialMinimum,
          channel.biexponentialMaximum
        );
      });
      console.log("logicles are ", logicles);
      let channels = file.channels.map((channel: any) => {
        return {
          minimum: channel.biexponentialMinimum,
          maximum: channel.biexponentialMaximum,
          name: channel.value,
        };
      });

      return {
        enrichedEvents: file.events,
        channels: channels,
        logicles: logicles,
      };
    });
  };

  onAddGate = (change: any) => {
    console.log("adding gate, change is ", change);

    let gatedPlot = JSON.parse(JSON.stringify(change.plot));
    let newPlot = JSON.parse(JSON.stringify(change.plot));

    const randomColor = Math.floor(Math.random() * 16777215).toString(16);

    let gate = {
      color: "#" + randomColor,
      gateType: "polygon",
      // need to ask for gate name
      name: "population10",
      points: change.points,
      xAxis: gatedPlot.xAxisIndex,
      yAxis: gatedPlot.yAxis,
      xScaleType: gatedPlot.xScaleType,
      yScaleType: gatedPlot.yScaleType,
      xAxisIndex: gatedPlot.xAxisIndex,
      yAxisIndex: gatedPlot.yAxisIndex,
      xAxisOriginalRanges: [0, 262144],
      yAxisOriginalRanges: [0, 262144],
      parent: gatedPlot.population,
    };

    newPlot.population = gate.name;

    gatedPlot.gate = gate;
    this.state.workspaceState.plots[
      this.state.workspaceState.plots.length - 1
    ] = gatedPlot;
    this.state.workspaceState.plots.push(newPlot);

    let copyOfFiles = JSON.parse(JSON.stringify(Files50));
    let enrichedFiles = superAlgorithm(copyOfFiles, workspaceState);
    enrichedFiles = this.formatEnrichedFiles(enrichedFiles);

    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: this.state.workspaceState,
    });
  };

  onEditGate = (change: any) => {
    console.log("in edit gate and change is ", change);
    this.state.workspaceState.plots[change.plotIndex] = change.plot;

    console.log("this.state.workspaceState is ", this.state.workspaceState);

    this.state.workspaceState.plots = this.state.workspaceState.plots.map(
      (plot2: any) => {
        return plot2;
      }
    );

    let copyOfFiles = JSON.parse(JSON.stringify(Files50));
    let enrichedFiles = superAlgorithm(copyOfFiles, this.state.workspaceState);
    enrichedFiles = this.formatEnrichedFiles(enrichedFiles);

    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: this.state.workspaceState,
    });
  };

  onChangeChannel = (change: any) => {
    if (change.channel == "x") {
      this.state.workspaceState.plots[change.plotIndex].xAxisIndex =
        change.value;
    } else {
      this.state.workspaceState.plots[change.plotIndex].yAxisIndex =
        change.value;
    }

    console.log("2. updating parent state component");
    this.setState({ workspaceState: this.state.workspaceState });
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
          workspaceState={this.state.workspaceState}
          className="workspace"
          onChangeChannel={this.onChangeChannel}
          onAddGate={this.onAddGate}
          onEditGate={this.onEditGate}
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
