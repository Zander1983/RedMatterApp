import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";
import Plot from "../plots/Plot";

import dataManager from "../../classes/dataManager";
import plotFactory from "../plots/plotFactory";

const ResponsiveGridLayout = WidthProvider(Responsive);

const classes = {
  itemOuterDiv: {
    backgroundColor: "#dde",
  },
  itemInnerDiv: {
    padding: 10,
  },
};

const standardGridPlotItem = (x: number, y: number) => {
  return {
    x: x,
    y: y,
    w: 6,
    h: 7,
    minW: 6,
    minH: 7,
  };
};

class Workspace extends React.Component {
  private static renderCalls = 0;
  plots: JSX.Element[] = [];

  constructor(props: any) {
    super(props);
    dataManager.setRerendererCallback(() => {
      this.update();
    });
  }

  update() {
    this.plots = plotFactory();
    this.forceUpdate();
  }

  // renderPlot(plotElement: { canvas: typeof Canvas; id: number }) {
  //   return (
  //     <div
  //       key={this.plot}
  //       style={classes.itemOuterDiv}
  //       data-grid={standardGridPlotItem(0, 0)}
  //     >
  //       <div style={classes.itemInnerDiv}>{}</div>
  //     </div>
  //   );
  // }

  /* This function has to be carefully controlled ensure that the plots will
     not re re-rendered unecessarely, which could slow down app's perfomance
     significatively */
  render() {
    console.log("render count: ", ++Workspace.renderCalls);
    return (
      <ResponsiveGridLayout
        className="layout"
        breakpoints={{ lg: 1200 }}
        cols={{ lg: 20 }}
        rows={{ lg: 30 }}
        rowHeight={30}
      >
        {this.plots.map((e) => e)}
      </ResponsiveGridLayout>
    );
  }
}

export default Workspace;
