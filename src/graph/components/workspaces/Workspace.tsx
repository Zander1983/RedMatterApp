import React from "react";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";
import PlotComponent from "../plots/PlotComponent";

import dataManager from "../../dataManagement/dataManager";
import WorkspaceData from "graph/dataManagement/workspaceData";
import Plot from "graph/renderers/plotRender";
import PlotData from "graph/dataManagement/plotData";

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

const standardGridPlotItem = (x: number, y: number) => {
  return {
    x: x,
    y: y,
    w: STDW,
    h: MINH,
    minW: MINW,
    minH: MINH,
    // static: true,
  };
};

class Workspace extends React.Component {
  private static renderCalls = 0;
  workspace: WorkspaceData;
  plots: {
    plotData: PlotData;
    plotRender: Plot;
  }[] = [];

  constructor(props: any) {
    super(props);

    this.workspace = dataManager.getWorkspace().workspace;

    this.update();

    dataManager.addObserver("addNewPlotToWorkspace", () => this.update());
    dataManager.addObserver("removePlotFromWorkspace", () => this.update());
    dataManager.addObserver("updateWorkspace", () => this.update());

    this.state = {
      plots: [],
    };
  }

  update() {
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
        >
          {
            //@ts-ignore
            this.plots.map((e, i) => {
              return (
                <div
                  key={e.plotData.id}
                  style={classes.itemOuterDiv}
                  data-grid={standardGridPlotItem((i * STDW) % 30, 100)}
                  id={`workspace-outter-${e.plotData.id}`}
                >
                  <div id="inner" style={classes.itemInnerDiv}>
                    <PlotComponent
                      plot={e.plotRender}
                      plotIndex={e.plotData.id}
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
