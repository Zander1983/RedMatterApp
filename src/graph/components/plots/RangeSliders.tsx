import React from "react";
import Plot from "graph/renderers/plotRender";
import dataManager from "graph/dataManagement/dataManager";
import RangeResizeModal from "../modals/rangeResizeModal";

/*
  This guy is responsible for range sliding and range modal. 
  He, however, is not visible. It's supposed to be used right into
  a PlotComponent right before CanvasRender
*/

const SLIDE_POWER = 5e-3;

function RangeSliders(props: { plot: Plot }) {
  const plot = props.plot;

  const [rangeResizeModalOpen, setRangeResizeModalOpen] = React.useState(false);
  const [rangeResizeModalAxis, setRangeResizeModalAxis] = React.useState("");
  const [rangeResizeModalTargetMin, setRangeResizeModalTargetMin] =
    React.useState(0);
  const [rangeResizeModalTargetMax, setRangeResizeModalTargetMax] =
    React.useState(0);

  const handleClose = (func: Function) => {
    func(false);
  };

  const isPlotHistogram = () => {
    return plot.plotData.xAxis === plot.plotData.yAxis;
  };

  const [lastUpdate, setLastUpdate] = React.useState(null);
  const setAxisRange = (min: number, max: number, axis: string) => {
    if (min === 69 && max === 420) props.plot.plotData.resetOriginalRanges();
    else props.plot.plotData.ranges.set(axis, [min, max]);
    if (lastUpdate + 40 < new Date().getTime()) {
      dataManager.updateWorkspace();
      setLastUpdate(new Date().getTime());
    }
  };

  const [mouseDownPos, setMouseDownPos] = React.useState({ x: 0, y: 0 });
  const [oldPos, setOldPos] = React.useState(69420);
  const calculateDragRangeChange = (
    min: number,
    max: number,
    dragValue: number,
    closerToMin: boolean
  ) => {
    const diff = dragValue - oldPos;
    setOldPos(dragValue);
    const absolute = max - min;
    if (closerToMin) {
      if (diff < 0) min += absolute * SLIDE_POWER;
      else min -= absolute * SLIDE_POWER;
    } else {
      if (diff < 0) max -= absolute * SLIDE_POWER;
      else max += absolute * SLIDE_POWER;
    }
    return [min, max];
  };

  return (
    <div
      className="pc-x"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingRight: 0,
      }}
    >
      <RangeResizeModal
        open={rangeResizeModalOpen}
        closeCall={{
          f: handleClose,
          ref: setRangeResizeModalOpen,
        }}
        inits={{
          axis: rangeResizeModalAxis,
          min: rangeResizeModalTargetMin,
          max: rangeResizeModalTargetMax,
        }}
        callback={setAxisRange}
      ></RangeResizeModal>
      <div
        draggable="true"
        onMouseDown={(e) => {
          e.stopPropagation();
          setMouseDownPos({
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          });
        }}
        style={{
          backgroundColor: "rgba(0,0,0,0.0)",
          width: isPlotHistogram()
            ? props.plot.plotData.histogramAxis === "vertical"
              ? 0
              : 50
            : 50,
          height: plot.plotData.plotHeight - 100,
          // cursor: "s-resize",
          cursor: "pointer",
          position: "absolute",
          zIndex: 10000,
          left: 65,
          bottom: 100,
        }}
        onClick={() => {
          const ranges = plot.plotData.ranges.get(plot.plotData.yAxis);
          setRangeResizeModalTargetMin(ranges[0]);
          setRangeResizeModalTargetMax(ranges[1]);
          setRangeResizeModalOpen(true);
          setRangeResizeModalAxis(plot.plotData.yAxis + " (Y Axis)");
        }}
        // onDrag={(e) => {
        //   if (e.clientX === 0 && e.clientY === 0) {
        //     return;
        //   }
        //   let [oldMin, oldMax] = plot.plotData.ranges.get(plot.plotData.yAxis);
        //   const dragValue = e.nativeEvent.offsetY;
        //   const closerToMin =
        //     mouseDownPos.y > (plot.plotData.plotHeight - 100) / 2;
        //   const [newMin, newMax] = calculateDragRangeChange(
        //     oldMin,
        //     oldMax,
        //     (closerToMin ? 1 : -1) * dragValue,
        //     closerToMin
        //   );
        //   setAxisRange(newMin, newMax, plot.plotData.yAxis);
        // }}
        // onDragEnd={() => dataManager.updateWorkspace()}
      ></div>
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        style={{
          backgroundColor: "rgba(0,0,0,0.0)",
          width: isPlotHistogram()
            ? props.plot.plotData.histogramAxis === "vertical"
              ? 0
              : 50
            : 50,
          height: (plot.plotData.plotHeight - 100) / 2,
          position: "absolute",
          zIndex: 10000,
          left: 65,
          bottom: 100 + (plot.plotData.plotHeight - 100) / 4,
        }}
      ></div>
      <div
        draggable="true"
        onMouseDown={(e) => {
          e.stopPropagation();
          setMouseDownPos({
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          });
        }}
        style={{
          backgroundColor: "rgba(0,0,0,0.0)",
          width: plot.plotData.plotWidth - 120,
          // cursor: "e-resize",
          cursor: "pointer",
          height: isPlotHistogram()
            ? props.plot.plotData.histogramAxis === "horizontal"
              ? 0
              : 50
            : 50,
          position: "absolute",
          zIndex: 10000,
          left: 115,
          bottom: 50,
        }}
        onClick={() => {
          const ranges = plot.plotData.ranges.get(plot.plotData.xAxis);
          setRangeResizeModalTargetMin(ranges[0]);
          setRangeResizeModalTargetMax(ranges[1]);
          setRangeResizeModalOpen(true);
          setRangeResizeModalAxis(plot.plotData.xAxis + " (X Axis)");
        }}
        // onDrag={(e) => {
        //   if (e.clientX === 0 && e.clientY === 0) {
        //     return;
        //   }
        //   let [oldMin, oldMax] = plot.plotData.ranges.get(plot.plotData.xAxis);
        //   const dragValue = e.nativeEvent.offsetX;
        //   const closerToMin =
        //     mouseDownPos.x < (plot.plotData.plotWidth - 120) / 2;
        //   const [newMin, newMax] = calculateDragRangeChange(
        //     oldMin,
        //     oldMax,
        //     (closerToMin ? -1 : 1) * dragValue,
        //     closerToMin
        //   );
        //   setAxisRange(newMin, newMax, plot.plotData.xAxis);
        // }}
      ></div>
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        style={{
          backgroundColor: "rgba(0,0,0,0.0)",
          width: (plot.plotData.plotWidth - 120) / 2,
          height: isPlotHistogram()
            ? props.plot.plotData.histogramAxis === "horizontal"
              ? 0
              : 50
            : 50,
          position: "absolute",
          zIndex: 10000,
          left: 115 + (plot.plotData.plotWidth - 120) / 4,
          bottom: 50,
        }}
      ></div>
    </div>
  );
}

export default RangeSliders;
