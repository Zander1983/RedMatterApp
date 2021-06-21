import React, { useEffect } from "react";
import { Divider, MenuItem, Select } from "@material-ui/core";

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
let interval: any = {};

function PlotComponent(props: { plot: Plot; plotIndex: string }) {
  const [plotSetup, setPlotSetup] = React.useState(false);

  const rerender = useForceUpdate();
  const plot = props.plot;
  const xAxis = plot.plotData.xAxis;
  const yAxis = plot.plotData.yAxis;

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
    if (dataManager.ready()) {
      updatePlotSize();
      plot.draw();
    }
  };

  const tryKillComponent = () => {
    try {
      dataManager.getPlotRendererForPlot(props.plotIndex);
    } catch {
      clearInterval(interval[props.plotIndex]);
      interval[props.plotIndex] = undefined;
    }
  };

  const isAxisDisabled = (axis: "x" | "y") => {
    return false;
  };

  const setAxis = (axis: "x" | "y", value: string) => {
    const otherAxisValue = axis == "x" ? yAxis : xAxis;
    axis == "x"
      ? props.plot.plotData.setXAxis(value)
      : props.plot.plotData.setYAxis(value);
  };

  const [lastSelectEvent, setLastSelectEvent] = React.useState(0);
  const handleSelectEvent = (e: any, axis: "x" | "y", func: Function) => {
    if (lastSelectEvent + 500 < new Date().getTime()) {
      func(e);
      setLastSelectEvent(new Date().getTime());
    }
  };

  useEffect(() => {
    if (interval[props.plotIndex] === undefined) {
      interval[props.plotIndex] = setInterval(() => {
        plotUpdater();
      }, 10);
    }
    if (!plotSetup) {
      plot.plotData.addObserver("plotUpdated", () => rerender());
      dataManager.addObserver("removePlotFromWorkspace", () =>
        tryKillComponent()
      );
      dataManager.addObserver("clearWorkspace", () => {
        clearInterval(interval[props.plotIndex]);
        interval[props.plotIndex] = undefined;
      });
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

      <div className="plot-canvas" style={{display:"flex", justifyContent: 'center', alignItems: 'center'}}>
        <div className="pc-y" style={{ transform: "rotate(270deg)", height: 'min-content', width: '2%' }}>
          <Select
            style={{ width: 100, marginLeft: 10 }}
            onChange={(e) =>
              handleSelectEvent(e, "y", (e: any) =>
                setAxis("y", e.target.value)
              )
            }
            disabled={isAxisDisabled("y")}
            value={yAxis}
          >
            {plot.plotData.file.axes.map((e: any) => (
              <MenuItem value={e}>{e}</MenuItem>
            ))}
          </Select>
        </div>
        <div
          className="pc-x"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CanvasComponent plot={plot} plotIndex={props.plotIndex} />
          <Select
            style={{ width: 100, marginLeft: 10 }}
            onChange={(e) =>
              handleSelectEvent(e, "x", (e: any) =>
                setAxis("x", e.target.value)
              )
            }
            disabled={isAxisDisabled("x")}
            value={xAxis}
          >
            {plot.plotData.file.axes.map((e: any) => (
              <MenuItem value={e}>{e}</MenuItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}

export default PlotComponent;
