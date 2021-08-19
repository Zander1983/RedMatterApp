import React from "react";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";
import PlotComponent from "../plots/PlotComponent";

import dataManager from "../../dataManagement/dataManager";
import WorkspaceData from "graph/dataManagement/workspaceData";
import Plot from "graph/renderers/plotRender";
import PlotData from "graph/dataManagement/plotData";
import { Divider } from "@material-ui/core";

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

const MINW = 10;
const MINH = 12;

export const resetPlotSizes = (id?: string) => {
  console.log("reset plot size called");
  let tPlots = dataManager.getAllPlots().map((e) => e.plotID);
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

const standardGridPlotItem = (index: number, plotData: any) => {
  let x = plotData.positions.x;
  let y = plotData.positions.y;
  let w = plotData.dimensions.w;
  let h = plotData.dimensions.h;

  return {
    x: x < 0 ? (index * 10) % 30 : x,
    y: y < 0 ? 100 : y,
    w: w,
    h: h,
    minW: MINW,
    minH: MINH,
    static: false,
  };
};

interface WorkspaceProps {
  sharedWorkspace: boolean;
  experimentId: string;
}
interface IState {
  plotMoving?: boolean;
}
let intervals: any = null;

class Workspace extends React.Component<WorkspaceProps, IState> {
  private static renderCalls = 0;
  workspace: WorkspaceData;
  plots: {
    plotData: PlotData;
    plotRender: Plot;
  }[] = [];
  addPlotLisner: any;
  removePlotLisner: any;
  clearWorkspaceLisner: any;
  workspaceLoaded = false;
  constructor(props: WorkspaceProps) {
    super(props);
    this.state = {
      plotMoving: true,
    };
    this.workspace = dataManager.getWorkspace().workspace;

    this.update();

    this.addPlotLisner = dataManager.addObserver(
      "addNewPlotToWorkspace",
      () => {
        this.update();
        const lastPlotId =
          dataManager.getAllPlots()[dataManager.getAllPlots().length - 1]
            .plotID;
        resetPlotSizes(lastPlotId);
      }
    );
    this.removePlotLisner = dataManager.addObserver(
      "removePlotFromWorkspace",
      () => this.update()
    );
    this.clearWorkspaceLisner = dataManager.addObserver(
      "afterClearWorkspace",
      () => this.update()
    );

    this.workspaceLoaded = true;
  }

  componentWillUnmount() {
    dataManager.removeObserver("addNewPlotToWorkspace", this.addPlotLisner);
    dataManager.removeObserver("removePlotFromWorkspace", this.addPlotLisner);
    dataManager.removeObserver("afterClearWorkspace", this.addPlotLisner);
  }

  update() {
    if (!dataManager.ready()) {
      this.plots = [];
      this.forceUpdate();
    }
    const plotMap = dataManager.getAllPlots();
    const plotList: {
      plotData: PlotData;
      plotRender: Plot;
    }[] = [];
    plotMap.forEach((v) =>
      plotList.push({
        plotData: v.plot,
        plotRender: dataManager.getPlotRendererForPlot(v.plotID),
      })
    );
    this.plots = plotList;
    this.forceUpdate();
  }

  updatePlotMovement() {
    dataManager.updateWorkspace();
    this.setState({
      plotMoving: !dataManager.dragLock,
    });
  }

  resizeCanvas(layouts: any) {
    for (let i = 0; i < layouts.length; i++) {
      let layout = layouts[i];
      let plotId = layouts[i].i;
      let id = `canvas-${plotId}`;
      let displayRef = `display-ref-${plotId}`;
      let barRef = `bar-ref-${plotId}`;

      let docIdRef = document.getElementById(id);
      let docDisplayRef: any = document.getElementById(displayRef);
      let docBarRef: any = document.getElementById(barRef);

      if (docBarRef && docDisplayRef && docIdRef) {
        let width = docDisplayRef.offsetWidth - 55;
        let height = docDisplayRef.offsetHeight - docBarRef.offsetHeight - 40;
        docIdRef.setAttribute("style", `width:${width}px;height:${height}px;`);
      }
    }
  }

  savePlotPosition(layouts: any) {
    for (let i = 0; i < layouts.length; i++) {
      let layout = layouts[i];
      let plotId = layouts[i].i;

      let plot = this.plots.find((x) => x.plotData.id === plotId);
      if (
        plot.plotData.dimensions.h != layout.h ||
        plot.plotData.dimensions.w != layout.w ||
        plot.plotData.positions.x != layout.x ||
        plot.plotData.positions.y != layout.y
      ) {
        if (!dataManager.redrawPlotIds.includes(plot.plotData.id))
          dataManager.redrawPlotIds.push(plot.plotData.id);
        if (
          plot.plotData.parentPlotId &&
          !dataManager.redrawPlotIds.includes(plot.plotData.parentPlotId)
        ) {
          dataManager.redrawPlotIds.push(plot.plotData.parentPlotId);
        }
        plot.plotData.dimensions = {
          h: layout.h,
          w: layout.w,
        };

        plot.plotData.positions = {
          x: layout.x,
          y: layout.y,
        };
      }
    }
    dataManager.updateWorkspace();
  }
  /* This function has to be carefully controlled ensure that the plots will
     not re re-rendered unecessarely, which could slow down app's perfomance
     significatively */
  render() {
    console.log(`Workspace rendered for the ${++Workspace.renderCalls} time`);
    let plotGroups: any = {};
    for (const plot of this.plots) {
      const fileId = plot.plotData.file.id;
      if (fileId in plotGroups) {
        plotGroups[fileId].push(plot);
      } else {
        plotGroups[fileId] = [plot];
      }
    }
    const keys = Object.keys(plotGroups);
    //@ts-ignore
    if (this.plots.length > 0) {
      return (
        <div>
          <Divider></Divider>
          {keys.map((key: string) => {
            const plots: {
              plotData: PlotData;
              plotRender: Plot;
            }[] = plotGroups[key];
            return (
              <div>
                <div
                  style={{
                    backgroundColor: "#6666AA",
                    paddingLeft: 20,
                    paddingBottom: 3,
                    paddingTop: 3,
                  }}
                >
                  <h3 style={{ color: "white", marginBottom: 0 }}>
                    {plots[0].plotData.file.name}
                  </h3>
                </div>
                <div style={{ marginTop: 3, marginBottom: 10 }}>
                  <ResponsiveGridLayout
                    className="layout"
                    breakpoints={{ lg: 1200 }}
                    cols={{ lg: 30 }}
                    rows={{ lg: 30 }}
                    rowHeight={30}
                    isDraggable={true}
                    onLayoutChange={(layout: any) => {
                      this.savePlotPosition(layout);
                    }}
                    onResize={(layout: any) => {
                      this.resizeCanvas(layout);
                    }}
                    onResizeStop={(layout: any) => {
                      this.resizeCanvas(layout);
                    }}
                  >
                    {
                      //@ts-ignore
                      plots.map((e, i) => {
                        return (
                          <div
                            key={e.plotData.id}
                            style={classes.itemOuterDiv}
                            data-grid={standardGridPlotItem(i, e.plotData)}
                            id={`workspace-outter-${e.plotData.id}`}
                          >
                            <div id="inner" style={classes.itemInnerDiv}>
                              <PlotComponent
                                index={i}
                                plot={e.plotRender}
                                plotIndex={e.plotData.id}
                                plotFileId={e.plotData.file.id}
                                plots={this.plots.filter(
                                  (x) => x.plotData.id !== e.plotData.id
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
            Click on "Add new file" to visualize
          </h3>
          <h4 style={{ marginBottom: 90, color: "#777" }}>
            Here you may move around, gate, duplicate, delete or resize your
            plots as you see fit
          </h4>
        </div>
      );
    }
  }
}

export default Workspace;
