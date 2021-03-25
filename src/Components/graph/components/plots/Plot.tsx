import React, { useEffect } from "react";
import { Divider } from "@material-ui/core";

import GateBar from "./plotui/gateBar";
import MainBar from "./plotui/mainBar";
import AxisBar from "./plotui/axisBar";

import CanvasComponent from "../canvas/CanvasComponent";

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

function useForceUpdate() {
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

function Plot(props: any) {
  const [intervalRef, setIntervalRef] = React.useState(null);
  const canvas = props.canvas;
  const rerender = useForceUpdate();

  const setRerenderInterval = (time: number, kill?: boolean = false) => {
    if (kill) {
      clearInterval(intervalRef);
      setIntervalRef(null);
      return;
    }
    if (intervalRef === null) {
      setIntervalRef(setInterval(() => rerender(), time));
    }
  };

  canvas.setRerender(rerender);
  canvas.setRerenderInterval(setRerenderInterval);

  const displayRef = React.useRef();
  const barRef = React.useRef();

  const updateCanvasSize = () => {
    if (displayRef.current === undefined || displayRef.current === null) return;
    const br = displayRef.current.getBoundingClientRect();
    const bar = barRef.current.getBoundingClientRect();
    canvas.setWidthAndHeight(br.width - 20, br.height - bar.height - 40);
  };

  const [canvasUpdaterInterval, setCanvasUpdaterInterval] = React.useState(
    null
  );

  const setUpdater = () => {
    if (canvasUpdaterInterval !== null) return;
    const interval = setInterval(() => {
      updateCanvasSize();
    }, 500);
    setCanvasUpdaterInterval(interval);
  };
  setTimeout(() => updateCanvasSize(), 150);

  if (canvasUpdaterInterval === null) {
    setUpdater();
  }

  console.log(`Plot with ID = ${props.canvasIndex} rendered`);
  return (
    <div style={classes.mainContainer} ref={displayRef}>
      <div style={classes.utilityBar} ref={barRef}>
        <MainBar canvasIndex={props.canvasIndex} canvas={canvas}></MainBar>
        <Divider></Divider>

        <GateBar></GateBar>
        <Divider></Divider>

        <AxisBar canvas={canvas}></AxisBar>
        <Divider style={{ marginTop: 10, marginBottom: 10 }}></Divider>
      </div>

      <CanvasComponent canvas={props.canvas} />
    </div>
  );
}

export default Plot;
