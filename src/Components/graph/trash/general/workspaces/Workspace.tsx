import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";

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
  render() {
    return (
      <ResponsiveGridLayout
        className="layout"
        breakpoints={{ lg: 1200 }}
        cols={{ lg: 20 }}
        rows={{ lg: 30 }}
        rowHeight={30}
      >
        <div
          key="1"
          style={classes.itemOuterDiv}
          data-grid={standardGridPlotItem(0, 0)}
        >
          <div style={classes.itemInnerDiv}>
            <h1> 0, 0 </h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum
            </p>
          </div>
        </div>
        <div
          key="2"
          style={classes.itemOuterDiv}
          data-grid={standardGridPlotItem(6, 0)}
        >
          <div style={classes.itemInnerDiv}>
            <h1> 6, 0 </h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum
            </p>
          </div>
        </div>
        <div
          key="3"
          style={classes.itemOuterDiv}
          data-grid={standardGridPlotItem(12, 0)}
        >
          <div style={classes.itemInnerDiv}>
            <h1> 12, 0 </h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum
            </p>
          </div>
        </div>
        <div
          key="4"
          style={classes.itemOuterDiv}
          data-grid={standardGridPlotItem(6, 5)}
        >
          <div style={classes.itemInnerDiv}>
            <h1> 6, 5 </h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum
            </p>
          </div>
        </div>
        <div
          key="5"
          style={classes.itemOuterDiv}
          data-grid={standardGridPlotItem(0, 5)}
        >
          <div style={classes.itemInnerDiv}>
            <h1> 0, 5 </h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum
            </p>
          </div>
        </div>
      </ResponsiveGridLayout>
    );
  }
}

export default Workspace;
