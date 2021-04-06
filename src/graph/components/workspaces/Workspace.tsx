import React, { useRef } from "react";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";
import PlotComponent from "../plots/PlotComponent";

import dataManager from "../../dataManagement/dataManager";

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

const standardGridPlotItem = (x: number, y: number) => {
  return {
    x: x,
    y: y,
    w: MINW,
    h: MINH,
    minW: MINW,
    minH: MINH,
  };
};

class Workspace extends React.Component {
  private static renderCalls = 0;

  constructor(props: any) {
    super(props);
    dataManager.setRerendererCallback(() => {
      this.update();
    });
    this.state = {
      plots: [],
    };
  }

  update() {
    const plotMap = dataManager.getAllPlots();
    const plotList: object[] = [];
    plotMap.forEach((v, k) => plotList.push({ plot: v, key: k }));

    this.setState({
      plots: plotList,
    });
  }

  /* This function has to be carefully controlled ensure that the plots will
     not re re-rendered unecessarely, which could slow down app's perfomance
     significatively */
  render() {
    console.log(`Workspace rendered for the ${++Workspace.renderCalls} time`);
    //@ts-ignore
    if (this.state.plots.length > 0) {
      return (
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{ lg: 1200 }}
          cols={{ lg: 20 }}
          rows={{ lg: 30 }}
          rowHeight={30}
        >
          {
            //@ts-ignore
            this.state.plots.map((e) => {
              return (
                <div
                  key={e.key}
                  style={classes.itemOuterDiv}
                  data-grid={standardGridPlotItem(0, 0)}
                  id={`workspace-outter-${e.key}`}
                >
                  <div id="inner" style={classes.itemInnerDiv}>
                    <PlotComponent plot={e.plot} plotIndex={e.key} />
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
            plots as you see fit!
          </h4>
        </div>
      );
    }
  }
}

export default Workspace;
