import React from "react";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";
import PlotComponent from "../plots/PlotComponent";

import { Divider } from "@material-ui/core";
import {
  getFile,
  getGate,
  getPopulation,
  getWorkspace,
} from "graph/utils/workspace";
import { store } from "redux/store";
import {
  FileID,
  Gate,
  Plot,
  PlotSpecificWorkspaceData,
  Workspace,
} from "graph/resources/types";
import WorkspaceDispatch from "graph/resources/dispatchers";
import { getPlotFile } from "graph/resources/plots";

const ResponsiveGridLayout = WidthProvider(Responsive);

const classes = {
  itemOuterDiv: {
    flex: 1,
    backgroundColor: "#eef",
    border: "solid 0.5px #bbb",
    boxShadow: "1px 3px 4px #bbd",
    borderRadius: 5,
    paddingBottom: "2rem",
  },
  itemInnerDiv: {
    width: "100%",
    height: "100%",
  },
};

let method = "file"; // TODO: sorry for this will be fixed later

interface PlotGroup {
  name: string;
  plots: Plot[];
}
const getPlotGroups = (plots: Plot[]): PlotGroup[] => {
  let plotGroups: PlotGroup[] = [];
  switch (method) {
    case "file":
      const plotByFileMap: { [index: string]: Plot[] } = {};
      for (const plot of plots) {
        try {
          const file = getPlotFile(plot);
          if (file.id in plotGroups) {
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
          plots: plotByFileMap[e],
        } as PlotGroup;
      });
      break;
    case "gate":
      throw Error("not implemented");
    case "all":
      plotGroups = [{ name: "", plots: plots }];
      break;
    default:
      throw Error("wtf?");
  }
  return plotGroups;
};

// I know this function is terrible, will be fixed too, leave as is
const getTargetLayoutPlots = (plotFileId: FileID): Plot[] => {
  const plots = getWorkspace().plots;
  if (method === "file") {
    return plots.filter((e) => getPlotFile(e).id === plotFileId);
  } else {
    throw Error("wtf?");
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

export const setCanvasSize = (save: boolean = false) => {
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
      let width = docDisplayRef.offsetWidth - 55;
      let height = docDisplayRef.offsetHeight - docBarRef.offsetHeight - 40;
      plot.plotHeight = height;
      plot.plotWidth = width;

      docIdRef.setAttribute("style", `width:${width}px;height:${height}px;`);
      updateList.push(plot);
    }
  }
  if (save && plots.length > 0) WorkspaceDispatch.UpdatePlots(updateList);
};

const standardGridPlotItem = (index: number, plotData: any, plots: Plot[]) => {
  let maxWidth = MINW * 4;
  let maxHeight = 0;
  let x = plotData.positions.x;
  let y = plotData.positions.y;
  let w = plotData.dimensions.w;
  let h = plotData.dimensions.h;
  let newy = y;
  let newX = x;

  if (newy == -1 || newX == -1) {
    if (newX == -1) newX = 0;
    if (newy == -1) newy = 0;
    let nPlots = plots.filter((x: Plot) => x.id != plotData.id);
    nPlots.sort(function (a: Plot, b: Plot) {
      return a.positions.x - b.positions.x && a.positions.y - b.positions.y;
    });
    let prevLineWidth = 0;
    for (let i = 0; i < index; i++) {
      let plot = nPlots[i];
      if (prevLineWidth) {
        if (maxWidth - prevLineWidth >= MINW) {
          newX = prevLineWidth;
          break;
        }
        prevLineWidth = 0;
      }
      if (
        i != 0 &&
        plot.positions.x -
          (nPlots[i - 1].positions.x + nPlots[i - 1].dimensions.w) >=
          MINW
      ) {
        newX = nPlots[i - 1].dimensions.w + nPlots[i - 1].positions.x;
        break;
      }
      newX = plot.dimensions.w + plot.positions.x;
      if (maxHeight < plot.dimensions.h) maxHeight = plot.dimensions.h;
      if (newX + MINW > maxWidth) {
        prevLineWidth = newX;
        newX = 0;
        newy = newy + maxHeight;
        maxHeight = 0;
      }
    }
  }

  return {
    x: newX,
    y: newy,
    w: w,
    h: h,
    minW: MINW,
    minH: MINH,
    static: false,
  };
};

interface PlotControllerProps {
  sharedWorkspace: boolean;
  experimentId: string;
  workspace: Workspace;
  plotMoving?: boolean;
}

class PlotController extends React.Component<PlotControllerProps> {
  private static renderCalls = 0;

  constructor(props: PlotControllerProps) {
    super(props);
    this.state = {
      plots: props.workspace.plots,
      plotMoving: true,
    };
  }

  savePlotPosition(layouts: any) {
    let plots = this.props.workspace.plots;
    let plotChanges = [];
    for (let i = 0; i < layouts.length; i++) {
      let layout = layouts[i];
      let plotId = layouts[i].i;

      let plot = plots.find((x) => x.id === plotId);
      if (!plot) continue;
      if (
        plot.dimensions.h !== layout.h ||
        plot.dimensions.w !== layout.w ||
        plot.positions.x !== layout.x ||
        plot.positions.y !== layout.y
      ) {
        plot.dimensions = {
          h: layout.h,
          w: layout.w,
        };
        plot.positions = {
          x: layout.x,
          y: layout.y,
        };
        plotChanges.push(plot);
      }
    }
    WorkspaceDispatch.UpdatePlots(plotChanges);
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.workspace.plots.length > this.props.workspace.plots.length) {
      setTimeout(() => setCanvasSize(true), 50);
    }
    this.setState(nextProps);
  }

  componentDidMount() {
    window.addEventListener("resize", () => {
      resetPlotSizes();
      setCanvasSize(true);
    });
  }

  getPlotRelevantResources(plot: Plot) {
    const population = getPopulation(plot.population);
    const file = getFile(population.file);
    const gates: Gate[] = [
      ...plot.gates.map((e) => getGate(e)).filter((x) => x),
      ...population.gates.map((e) => getGate(e.gate)),
    ];
    const workspaceForPlot: PlotSpecificWorkspaceData = {
      file,
      gates,
      plot,
      population,
      key: plot.id,
    };
    return workspaceForPlot;
  }

  render() {
    const plotGroups = getPlotGroups(this.props.workspace.plots);
    console.log(getTargetLayoutPlots("d150a170-2216-11ec-add5-47f9bfa70d28"));
    if (this.props.workspace.plots.length > 0) {
      return (
        <div>
          <Divider></Divider>
          {plotGroups.map((plotGroup: PlotGroup) => {
            const name = plotGroup.name;
            const plots = plotGroup.plots;
            return (
              <div key={name}>
                <div
                  style={{
                    backgroundColor: "#6666AA",
                    paddingLeft: 20,
                    paddingBottom: 3,
                    paddingTop: 3,
                  }}
                >
                  <h3 style={{ color: "white", marginBottom: 0 }}>{name}</h3>
                </div>
                <div style={{ marginTop: 3, marginBottom: 10 }}>
                  <ResponsiveGridLayout
                    className="layout"
                    breakpoints={{ lg: 1200 }}
                    cols={{ lg: 36 }}
                    rows={{ lg: 30 }}
                    rowHeight={30}
                    isDraggable={true}
                    onLayoutChange={(layout: any) => {
                      this.savePlotPosition(layout);
                    }}
                    onResize={(layout: any) => {
                      setCanvasSize(false);
                    }}
                    onResizeStop={(layout: any) => {
                      setCanvasSize(true);
                    }}
                  >
                    {
                      //@ts-ignore
                      plots.map((plot, i) => {
                        return (
                          <div
                            key={plot.id}
                            style={classes.itemOuterDiv}
                            data-grid={standardGridPlotItem(i, plot, plots)}
                            id={`workspace-outter-${plot.id}`}
                          >
                            <div id="inner" style={classes.itemInnerDiv}>
                              <PlotComponent
                                plotRelevantResources={this.getPlotRelevantResources(
                                  plot
                                )}
                                sharedWorkspace={this.props.sharedWorkspace}
                                experimentId={this.props.experimentId}
                              />
                            </div>
                          </div>
                        );
                      })
                    }
                  </ResponsiveGridLayout>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div
          style={{
            textAlign: "center",
          }}
        >
          <h3 style={{ marginTop: 100, marginBottom: 10 }}>
            Click on "Plot sample" to visualize
          </h3>
          <h4 style={{ marginBottom: 70, color: "#777" }}>
            Create a plot from one of your samples to start your analysis
          </h4>
        </div>
      );
    }
  }
}

export default PlotController;
