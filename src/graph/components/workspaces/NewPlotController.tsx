import React from "react";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";
import PlotComponent from "../plots/PlotComponent";
import _ from "lodash";

import { Divider, MenuItem, Select } from "@material-ui/core";
import {
  getFile,
  getGate,
  getPopulation,
  getWorkspace,
} from "graph/utils/workspace";
import {
  Gate,
  Plot,
  PlotID,
  PlotSpecificWorkspaceData,
  Workspace,
} from "graph/resources/types";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import { getPlotFile } from "graph/resources/plots";
import * as PlotResource from "graph/resources/plots";
import { deleteAllPlotsAndPopulationOfNonControlFile } from "graph/components/plots/MainBar";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Grid from "@material-ui/core/Grid";
import PlotTableComponent from "../plots/PlotTableComponent";
import PlotTable from "../static/menus/Table";

const ResponsiveGridLayout = WidthProvider(Responsive);

const classes = {
  itemOuterDiv: {
    flex: 1,
    backgroundColor: "#eef",
    border: "solid 0.5px #bbb",
    boxShadow: "1px 3px 4px #bbd",
    borderRadius: 5,
    // minWidth: 370,
    paddingBottom: "2rem",
  },
  itemInnerDiv: {
    width: "100%",
    height: "100%",
  },
};

let method = "file"; // TODO: sorry for this will be fixed later

export interface PlotGroup {
  name: string;
  plots: Plot[];
  id: string;
}

export const getPlotGroups = (plots: Plot[]): PlotGroup[] => {
  let plotGroups: PlotGroup[] = [];

  const plotByFileMap: { [index: string]: Plot[] } = {};
  for (const plot of plots) {
    try {
      const file = getPlotFile(plot);
      if (file.id in plotByFileMap) {
        plotByFileMap[file.id].push(plot);
      } else {
        plotByFileMap[file.id] = [plot];
      }
    } catch {
      console.error(
        "[PlotController] Plot has not been rendered due to population not found"
      );
    }
  }

  plotGroups = Object.keys(plotByFileMap).map((e) => {
    return {
      name: getFile(e).name,
      id: getFile(e).id,
      plots: plotByFileMap[e],
    } as PlotGroup;
  });

  return plotGroups;
};

export const getTargetLayoutPlots = (protoPlot: any): Plot[] => {
  let plotGroups: PlotGroup[] = getPlotGroups(getWorkspace().plots);
  try {
    const pop = getPopulation(protoPlot.population);
    switch (method) {
      case "file":
        const file = getFile(pop.file);
        return plotGroups.find((e) => e.name === file.name).plots;
      case "gate":
        let group = "No gates";
        //@ts-ignore
        if (pop.gates.length > 0) group = pop.gates[0].id;
        return plotGroups.find((e) => e.name === group).plots;
      case "all":
        return plotGroups[0].plots;
      default:
        throw Error("wtf?");
    }
  } catch {
    return [];
  }
};

export const MINW = 9;
export const MINH = 10;

export const resetPlotSizes = (id?: string) => {
  let tPlots = getWorkspace().plots.map((e) => e.id);
  if (id) tPlots = [id];
  for (const id of tPlots) {
    let docIdRef = document.getElementById(`canvas-${id}`);
    let docDisplayRef: any = document.getElementById(`display-ref-${id}`);
    let docBarRef: any = document.getElementById(`bar-ref-${id}`);

    if (docBarRef && docDisplayRef && docIdRef) {
      let width = docDisplayRef.offsetWidth - 55;
      let height = docDisplayRef.offsetHeight - docBarRef.offsetHeight - 40;
      docIdRef.setAttribute("style", `width:${width}px;height:${height}px;`);
    }
  }
};

export const setCanvasSize = (
  save: boolean = false,
  isAsync: boolean = false
) => {
  const plots = getWorkspace().plots;
  const updateList: Plot[] = [];
  for (let plot of plots) {
    let id = `canvas-${plot.id}`;
    let displayRef = `display-ref-${plot.id}`;
    let barRef = `bar-ref-${plot.id}`;

    let docIdRef = document.getElementById(id);
    let docDisplayRef: any = document.getElementById(displayRef);
    let docBarRef: any = document.getElementById(barRef);

    if (docBarRef && docDisplayRef && docIdRef) {
      let width = docDisplayRef.offsetWidth - 50;
      let height = docDisplayRef.offsetHeight - docBarRef.offsetHeight - 40;
      plot.plotHeight = height;
      plot.plotWidth = width;

      docIdRef.setAttribute("style", `width:${width}px;height:${height}px;`);
      updateList.push(plot);
    }
  }
  if (save && plots.length > 0) {
    if (isAsync)
      _.debounce(() => WorkspaceDispatch.UpdatePlots(updateList), 100);
    else WorkspaceDispatch.UpdatePlots(updateList); //setTimeout( () => , 10);
  }
};

export const standardGridPlotItem = (
  index: number,
  plotData: any,
  plots: Plot[],
  editWorkspace: boolean
) => {
  return {
    x: plotData.positions.x,
    y: plotData.positions.y,
    w: plotData.dimensions.w,
    h: plotData.dimensions.h,
    minW: MINW,
    minH: MINH,
    static: !editWorkspace,
  };
};

interface PlotControllerProps {
  sharedWorkspace: boolean;
  experimentId: string;
  workspace: Workspace;
  workspaceLoading: boolean;
  customPlotRerender: PlotID[];
  plotMoving?: boolean;
  // arrowFunc: Function;
}

interface IState {
  sortByChanged: boolean;
  sortBy: string;
  isTableRenderCall: boolean;
}

class NewPlotController extends React.Component<PlotControllerProps, IState> {

  constructor(props: PlotControllerProps) {
    super(props);
    this.state = {
      sortByChanged: false,
      sortBy: "file",
      isTableRenderCall: false,
    };
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.workspace.plots.length > this.props.workspace.plots.length) {
      setTimeout(() => setCanvasSize(true), 50);
    }
    // this.setState(nextProps);
  }

  componentDidMount() {
    // window.addEventListener("mouseup", (event) => {
    //   _.debounce(() => {
    //     resetPlotSizes();
    //     setCanvasSize(true, true);
    //   }, 100);
    // });
    // window.addEventListener(
    //   "resize",
    //   _.debounce(() => {
    //     resetPlotSizes();
    //     setCanvasSize(true, false);
    //   }, 300)
    // );
    resetPlotSizes();
    setCanvasSize(true);
    setTimeout(() => this.setState({ isTableRenderCall: true }), 1000);
  }


  getArrowArray = () => {
    let arr: any[] = [];
    let plots = this.props.workspace.plots;
    for (let i = 0; i < plots.length; i++) {
      let plot = plots[i];
      let populationId = plot.population;
      let childPopulationIds = this.props.workspace.populations
        .filter((x) => x.parentPopulationId == populationId)
        .map((x) => x.id);
      let childPlots = this.props.workspace.plots.filter((x) =>
        childPopulationIds.includes(x.population)
      );

      let plotId = plot.id;

      for (let j = 0; j < childPlots.length; j++) {
        arr.push({
          start: `workspace-outter-${plotId}`,
          end: `workspace-outter-${childPlots[j].id}`,
        });
      }
    }
    return arr;
  };

  renderTable = () => {
    if (
      this.props.workspace.selectedFile &&
      this.props.workspace?.files[0]?.downloaded &&
      this.state.sortBy === "file" &&
      this.state.isTableRenderCall
    ) {
      return (
        <PlotTableComponent
          workspace={this.props.workspace}
          sharedWorkspace={this.props.sharedWorkspace}
          experimentId={this.props.experimentId}
          workspaceLoading={this.props.workspaceLoading}
          customPlotRerender={this.props.customPlotRerender}
        />
      );
    } else return null;
  };

  render() {
    if (this.props.workspace.plots.length > 0) {
      const plotGroups = getPlotGroups(this.props.workspace.plots);
      return (
        <div>
          <Xwrapper>
            {this.props.workspace.editWorkspace ? (
              <div
                style={{
                  position: "fixed",
                  right: 0,
                  backgroundColor: "#fff",
                  borderLeft: "solid 1px #ddd",
                  borderBottom: "solid 1px #ddd",
                  borderBottomLeftRadius: 5,
                  padding: 3,
                  zIndex: 1000,
                }}
              >
                Sort by:
                <Select
                  style={{ marginLeft: 10 }}
                  value={this.state.sortBy !== "" ? this.state.sortBy : ""}
                  onChange={(e) => {
                    this.setState({
                      sortByChanged: true,
                    });
                    let value: any = e.target.value;
                    method = value;
                    if (value === "file") {
                      deleteAllPlotsAndPopulationOfNonControlFile();
                    }
                    this.setState({
                      sortBy: value,
                    });
                    PlotResource.updatePositions();
                    setTimeout(() => {
                      this.setState({
                        sortByChanged: false,
                      });
                    }, 0);
                  }}
                >
                  <MenuItem value={"all"}>No sorting</MenuItem>
                  <MenuItem value={"file"}>File</MenuItem>
                </Select>
              </div>
            ) : null}

            {/* <Divider /> */}

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
              this.renderTable()
            )}
            {this.state.isTableRenderCall &&
              this.getArrowArray().map((obj, i) => {
                return (
                  <Xarrow key={i} start={obj.start} end={obj.end} path={"straight"} />
                );
              })}
          </Xwrapper>
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
