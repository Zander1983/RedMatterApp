import React, { useRef } from "react";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";
import PlotComponent from "../plots/PlotComponent";

import dataManager from "../../dataManagement/dataManager";
import { data } from "jquery";
import WorkspaceData from "graph/dataManagement/workspaceData";
import Plot from "graph/renderers/plotRender";
import PlotData from "graph/dataManagement/plotData";
import { Dbouncer } from "services/Dbouncer";
const ResponsiveGridLayout = WidthProvider(Responsive);

const classes = {
  itemOuterDiv: {
    flex: 1,
    backgroundColor: "#eef",
    border: "solid 0.5px #bbb",
    boxShadow: "1px 3px 4px #bbd",
    borderRadius: 5,
  },
  itemInnerDiv: {
    width: "100%",
    height: "100%",
  },
};

const MINW = 10;
const MINH = 18;
const STDW = 15;

const standardGridPlotItem = (index: number, plotData: any) => {
  let x = plotData.positions.x;
  let y = plotData.positions.y;
  let w = plotData.dimensions.w;
  let h = plotData.dimensions.h;
  return {
    x: x < 0 ? (index * STDW) % 30 : x,
    y: y ? y : 100,
    w: w,
    h: h,
    minW: MINW,
    minH: MINH,
    // static: true,
  };
};

interface WorkspaceProps {
  sharedWorkspace: boolean;
  experimentId: string;
}

class Workspace extends React.Component<WorkspaceProps> {
  private static renderCalls = 0;
  workspace: WorkspaceData;
  plots: {
    plotData: PlotData;
    plotRender: Plot;
  }[] = [];
  plotMoving: boolean = true;
  workspaceLoaded = false;
  constructor(props: WorkspaceProps) {
    super(props);
    this.workspace = dataManager.getWorkspace().workspace;

    this.update();

    dataManager.addObserver("addNewPlotToWorkspace", () => this.update());
    dataManager.addObserver("removePlotFromWorkspace", () => this.update());
    dataManager.addObserver("updateWorkspace", () => this.update());
    dataManager.addObserver("workspaceDragLock", () =>
      this.updatePlotMovement()
    );

    this.state = {
      plots: [],
    };
    this.workspaceLoaded = true;
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
    this.plotMoving = !dataManager.dragLock;
    this.forceUpdate();
  }

  savePlotPosition(layouts: any) {
    for (let i = 0; i < layouts.length; i++) {
      let layout = layouts[i];
      let plotId = layouts[i].i;

      let plot = this.plots.find((x) => x.plotData.id == plotId);

      plot.plotData.dimensions = {
        h: layout.h,
        w: layout.w,
      };

      plot.plotData.positions = {
        x: layout.x,
        y: layout.y,
      };

      dataManager.workspaceUpdated();
    }
  }
  /* This function has to be carefully controlled ensure that the plots will
     not re re-rendered unecessarely, which could slow down app's perfomance
     significatively */
  render() {
    console.log(`Workspace rendered for the ${++Workspace.renderCalls} time`);
    //@ts-ignore
    if (this.plots.length > 0) {
      return (
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{ lg: 1200 }}
          cols={{ lg: 30 }}
          rows={{ lg: 30 }}
          rowHeight={30}
          isDraggable={this.plotMoving}
          onLayoutChange={(layout: any) => {
            this.savePlotPosition(layout);
          }}
        >
          {
            //@ts-ignore
            this.plots.map((e, i) => {
              return (
                <div
                  key={e.plotData.id}
                  style={classes.itemOuterDiv}
                  data-grid={standardGridPlotItem(i, e.plotData)}
                  id={`workspace-outter-${e.plotData.id}`}
                >
                  <div id="inner" style={classes.itemInnerDiv}>
                    <PlotComponent
                      plot={e.plotRender}
                      plotIndex={e.plotData.id}
                      plotFileId={e.plotData.file.id}
                      plots={this.plots.filter(
                        (x) => x.plotData.id != e.plotData.id
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
