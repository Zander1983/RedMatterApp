import React, { useEffect } from "react";
import { Divider } from "@material-ui/core";

import GateBar from "./plotui/gateBar";
import MainBar from "./plotui/mainBar";
import AxisBar from "./plotui/axisBar";

import CanvasComponent from "../canvas/CanvasComponent";
import Plot from "graph/renderers/plotRender";
import dataManager from "graph/dataManagement/dataManager";

const classes = {
  mainContainer: {
    width: "100%",
    height: "100%",
    padding: 10,
  },
  utilityBar: {
    width: "100%",
  },
  canvasDisplay: {
    borderRadius: 5,
    boxShadow: "1px 3px 4px #bbd",
    backgroundColor: "#dfd",
    flexGrow: 1,
  },
};

const nullOrUndefined = (obj: any) => {
  return obj === null || obj === undefined;
};

function useForceUpdate() {
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

const minDrawInterval = 30;

function PlotComponent(props: { plot: Plot; plotIndex: string }) {
  const [resizeObserver, setResizeObserver] = React.useState(null);
  const [plotSetup, setPlotSetup] = React.useState(false);
  const [lastDrawTimestamp, setlastDrawTimestamp] = React.useState(0);
  const rerender = useForceUpdate();
  const plot = props.plot;

  const displayRef = React.useRef();
  const barRef = React.useRef();

  const updatePlotSize = () => {
    if (displayRef === null || displayRef.current === null) return;
    //@ts-ignore
    const br = displayRef.current.getBoundingClientRect();
    //@ts-ignore
    const bar = barRef.current.getBoundingClientRect();
    plot.plotData.setWidthAndHeight(br.width - 20, br.height - bar.height - 40);
  };

  const plotUpdater = () => {
    updatePlotSize();
    // TODO: THIS SOLUTION IS SO SHIT. PLEASE FIX THIS
    const now = new Date().getTime();
    if (lastDrawTimestamp + minDrawInterval <= now) {
      setlastDrawTimestamp(now);
      plot.draw();
    }
  };

  useEffect(() => {
    if (resizeObserver === null) {
      setResizeObserver(
        setInterval(() => {
          plotUpdater();
        }, 10)
      );
    }
    if (!plotSetup) {
      plot.plotData.addObserver("plotUpdated", () => rerender());
      plot.setup();
      setPlotSetup(true);
    }
  }, []);

  return (
    <div style={classes.mainContainer} ref={displayRef}>
      <div style={classes.utilityBar} ref={barRef}>
        <MainBar plotIndex={props.plotIndex} plot={plot}></MainBar>
        <Divider></Divider>

        <GateBar plot={plot}></GateBar>
        <Divider></Divider>

        <AxisBar plot={plot}></AxisBar>
        <Divider style={{ marginTop: 10, marginBottom: 10 }}></Divider>
      </div>

      <CanvasComponent plot={plot} plotIndex={props.plotIndex} />
    </div>
  );
}

export default PlotComponent;
