import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";
import Plotter from "../../classes/plotters/plotter";

import dataManager from "../../classes/dataManager";
import canvasManager from "../../classes/canvas/canvasManager";

const ResponsiveGridLayout = WidthProvider(Responsive);

const classes = {
  itemOuterDiv: {
    backgroundColor: "#dde",
  },
  itemInnerDiv: {
    padding: 10,
  },
};

const standardGridPlotItem = (x, y) => {
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
  plots: Plotter[] = [];

  constructor(props: any) {
    super(props);
    dataManager.setRerendererCallback(() => {
      this.forceUpdate();
    });
  }

  componentDidUpdate() {
    this.setState({});
  }

  /* This function has to be carefully controlled ensure that the plots will
     not re re-rendered unecessarely, which could slow down app's perfomance
     significatively */
  render() {
    console.log("render called");
    return (
      <ResponsiveGridLayout
        className="layout"
        breakpoints={{ lg: 1200 }}
        cols={{ lg: 20 }}
        rows={{ lg: 30 }}
        rowHeight={30}
      >
        {
          <div
            key={this.plot}
            style={classes.itemOuterDiv}
            data-grid={standardGridPlotItem(0, 0)}
          >
            <div style={classes.itemInnerDiv}>{}</div>
          </div>
        }
      </ResponsiveGridLayout>
    );
  }
}

export default Workspace;
