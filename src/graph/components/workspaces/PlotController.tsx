import React from "react";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";
import PlotComponent from "../plots/PlotComponent";

import { Divider } from "@material-ui/core";
import {
  getFile,
  getPlot,
  getPopulation,
  getWorkspace,
} from "graph/utils/workspace";
import { store } from "redux/store";
import { Plot, Workspace } from "graph/resources/types";

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

  resizeCanvas(layouts: any) {
    for (let i = 0; i < layouts.length; i++) {
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

  setPlotsSize(layouts: any) {
    for (let i = 0; i < layouts.length; i++) {
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
        const plot = getPlot(plotId);
        plot.plotHeight = height;
        plot.plotHeight = width;
        store.dispatch({
          type: "workspace.UPDATE_PLOT",
          payload: { plot },
        });
      }
    }
  }

  savePlotPosition(layouts: any) {
    let plots = getWorkspace().plots;
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
        plotChanges.push(plotId);
      }
    }
    store.dispatch({
      type: "workspace.UPDATE_PLOTS",
      payload: { plots: plotChanges },
    });
  }

  render() {
    console.log(
      `Workspace rendered for the ${++PlotController.renderCalls} time`
    );
    let plotGroups: any = {};
    for (const plot of this.props.workspace.plots) {
      try {
        const population = this.props.workspace.populations.find(
          (e) => e.id === plot.population
        );
        const file = this.props.workspace.files.find(
          (e) => e.id === population.file
        );
        if (file.id in plotGroups) {
          plotGroups[file.id].push(plot);
        } else {
          plotGroups[file.id] = [plot];
        }
      } catch {
        console.error(
          "[PlotController] Plot has not been rendered due to population not found"
        );
      }
    }
    const fileIdKeys = Object.keys(plotGroups);
    if (this.props.workspace.plots.length > 0) {
      return (
        <div>
          <Divider></Divider>
          {fileIdKeys.map((fileId: string) => {
            const fileName = getFile(fileId).name;
            const plots: Plot[] = plotGroups[fileId];
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
                    {fileName}
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
                      this.setPlotsSize(layout);
                    }}
                  >
                    {
                      //@ts-ignore
                      plots.map((plot, i) => {
                        return (
                          <div
                            key={plot.id}
                            style={classes.itemOuterDiv}
                            data-grid={standardGridPlotItem(i, plot)}
                            id={`workspace-outter-${plot.id}`}
                          >
                            <div id="inner" style={classes.itemInnerDiv}>
                              <PlotComponent
                                plot={plot}
                                plots={this.props.workspace.plots.filter(
                                  (x) => x.id !== plot.id
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

export default PlotController;
