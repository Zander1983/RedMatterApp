import { useEffect, useState, useRef, useCallback } from "react";
import { isPointInPolygon, drawText, getAxisLabels, getBins } from "./Helper";
import { useResizeDetector } from "react-resize-detector";

import {
  getRealPointFromCanvasPoints,
  getPointOnCanvas,
  getRealXAxisValueFromCanvasPointOnLinearScale,
  getRealYAxisValueFromCanvasPointOnLinearScale,
  getRealXAxisValueFromCanvasPointOnLogicleScale,
  getRealYAxisValueFromCanvasPointOnLogicleScale,
} from "./PlotHelper";
import Modal from "react-modal";
import { isGateShowing } from "./Helper";
import SideSelector from "./PlotEntities/SideSelector";
import { CompactPicker } from "react-color";

export const leftPadding = 55;
export const rightPadding = 20;
export const topPadding = 40;
export const bottomPadding = 5;

const getContext = (id) => {
  const canvas = document.getElementById(id);
  if (canvas) {
    const context = canvas.getContext("2d");

    return context;
  } else {
    return null;
  }
};

const shouldDrawGate = (plot) => {
  if (
    plot.xAxisIndex === plot.gate.xAxisIndex &&
    plot.yAxisIndex === plot.gate.yAxisIndex &&
    plot.xScaleType === plot.gate.xScaleType &&
    plot.yScaleType === plot.gate.yScaleType
  ) {
    return true;
  } else {
    return false;
  }
};

let isMouseDown = false;
let dragPointIndex = false;
let newGatePointsCanvas = [];
let polygonComplete = false;
let resizeStartPoints;
let interval = null;

function Plot(props) {
  console.log("props is ", props);

  let [startPointsReal, setStartPointsReal] = useState(null);
  let [isInsideGate, setIsInsideGate] = useState(null);
  let [newPoints, setNewPoints] = useState([]);
  const [localPlot, setLocalPlot] = useState(props.plot);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [
    eventsOutOfCanvasPercentage,
    setEventsOutOfCanvasPercentage,
  ] = useState(0);

  const [gateName, setGateName] = useState({
    name: "",
    error: false,
  });
  const [gateColor, setGateColor] = useState(
    `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );
  const plotNames = props.enrichedFile.plots.map((plt) => plt.population);

  const [resizing, setResizing] = useState(false);

  const onResizeDiv = useCallback(
    (w, h) => {
      if (w == props.plot.width && h == props.plot.height) return;
      drawLabel();
      setResizing(true);
      isMouseDown = false;
      if (interval) clearTimeout(interval);
      interval = setTimeout(() => {
        let tempPlot = { ...props.plot, ...{ width: w, height: h } };
        let change = {
          type: tempPlot.plotType,
          height: tempPlot.height,
          width: tempPlot.width,
          plotIndex: props.plotIndex.split("-")[1],
          fileId: props.enrichedFile.fileId,
        };
        props.onResize(change);
      }, 200);
    },
    [props.plot]
  );

  const { ref } = useResizeDetector({
    onResize: onResizeDiv,
    skipOnMount: true,
  });

  let pointsOutsideCanvasCount = 0;

  useEffect(() => {
    let context = getContext("covering-canvas-" + props.plotIndex);
    context.clearRect(0, 0, localPlot.width, localPlot.height);

    // draw here
    if (localPlot && localPlot.gate && newPoints.length > 0) {
      if (context) {
        drawGateLine(context, localPlot, newPoints);

        //drawTemporaryGateLine(context, props.plot);
      }
    } else {
      let context = getContext("covering-canvas-" + props.plotIndex);
      context.clearRect(0, 0, props.plot.width, props.plot.height);
      context.fillStyle = "white";
    }
  }, [newPoints, localPlot]);

  useEffect(() => {
    setLocalPlot(props.plot);
  }, [props.plot]);

  useEffect(() => {
    return () => {
      clearTimeout(interval);
    };
  }, []);

  useEffect(() => {
    if (resizing) setResizing(false);
    var arr = new Array(props.plot.length); // create an empty array of length `M`
    for (var i = 0; i < props.plot.width; i++) {
      arr[i] = new Array(props.plot.width); // make each element an array
    }
    var most = 0;
    let pointHitUnique = 0,
      pointHitTotal = 0;

    const context = getContext("canvas-" + props.plotIndex);

    context.clearRect(0, 0, localPlot.width, localPlot.height);
    context.fillStyle = "white";

    if (context) {
      props.enrichedFile.enrichedEvents.forEach((enrichedEvent, index) => {
        getFormattedEvents(enrichedEvent, localPlot).forEach(
          (formattedEvent) => {
            context.fillStyle = formattedEvent.color;
            context.fillRect(formattedEvent[0], formattedEvent[1], 1, 1);
            if (
              formattedEvent[0] >= localPlot.width ||
              formattedEvent[0] < 2 ||
              formattedEvent[1] >= localPlot.height ||
              formattedEvent[1] < 2
            ) {
              pointsOutsideCanvasCount++;
            } else {
              if (arr[formattedEvent[0]][formattedEvent[1]] == undefined) {
                arr[formattedEvent[0]][formattedEvent[1]] = 1;
                pointHitUnique = pointHitUnique + 1;
              } else {
                arr[formattedEvent[0]][formattedEvent[1]] =
                  arr[formattedEvent[0]][formattedEvent[1]] + 1;

                if (arr[formattedEvent[0]][formattedEvent[1]] > most) {
                  most++;
                }
              }

              pointHitTotal = pointHitTotal + 1;
            }
          }
        );
      });

      if (props.plot.population === "All") {
        let mean = pointHitTotal / pointHitUnique;
        for (let i = 0; i < arr.length; i++) {
          for (let x = 0; x < arr[i].length; x++) {
            if (arr[i][x] >= Math.round(mean * 4)) {
              context.fillStyle = "red";
              context.fillRect(i, x, 1, 1);
            } else if (arr[i][x] >= Math.round(mean * 2)) {
              context.fillStyle = "yellow";
              context.fillRect(i, x, 1, 1);
            } else if (arr[i][x] >= Math.round(mean)) {
              context.fillStyle = "green";
              context.fillRect(i, x, 1, 1);
            }
          } // make each element an array
        }
      }
    }

    drawLabel();

    if (localPlot.gate && shouldDrawGate(localPlot)) {
      drawGateLine(
        getContext("covering-canvas-" + props.plotIndex),
        localPlot,
        localPlot.gate.points
      );
    }
  }, [localPlot]);

  const drawGateLine = (context, plot, realPoints) => {
    context.strokeStyle = "CornflowerBlue";
    context.lineWidth = 1;
    context.beginPath();

    let pointsOnCanvas = realPoints.map((point) => {
      return getPointOnCanvas(
        props.enrichedFile.channels,
        point[0],
        point[1],
        plot,
        props.enrichedFile.logicles
      );
    });

    // draw the first point of the gate
    context.moveTo(pointsOnCanvas[0][0], pointsOnCanvas[0][1]);

    pointsOnCanvas.forEach((pointOnCanvas) => {
      context.lineTo(pointOnCanvas[0], pointOnCanvas[1]);
    });

    context.closePath();
    context.stroke();

    // draw polygon gate points
    for (const point of pointsOnCanvas) {
      context.beginPath();
      context.arc(point[0], point[1], 2, 0, 2 * Math.PI, false);
      context.fillStyle = "CornflowerBlue";
      context.fill();
      context.stroke();
    }
  };

  const getFormattedEvents = (enrichedEvent, plot) => {
    const events = [];

    // if population is not "All", isInGate{gateName} is true. Remember, plot.population is the same as the gate name
    if (
      plot.population === "All" ||
      enrichedEvent["isInGate" + plot.population]
    ) {
      let pointOnCanvas = getPointOnCanvas(
        props.enrichedFile.channels,
        enrichedEvent[plot.xAxisIndex],
        enrichedEvent[plot.yAxisIndex],
        plot,
        props.enrichedFile.logicles
      );

      pointOnCanvas.color = enrichedEvent["color"];

      events.push(pointOnCanvas);
    }

    return events;
  };

  const onChangeScale = (e, axis, plotIndex) => {
    let change = {
      type: "ChangePlotScale",
      plotIndex: plotIndex,
      axis: axis,
      scale: e.scale,
      fileId: props.enrichedFile.fileId,
    };
    props.onChangeChannel(change);
  };

  const onChangeChannel = (e, axis, plotIndex) => {
    let change = {};
    let newPlotType = localPlot.plotType;
    let channelLabel = "";
    let channeIndex = e.value;
    if (axis == "y") {
      if (e.value == "histogram") {
        newPlotType = "histogram";
        channelLabel = localPlot.yAxisLabel;
        channeIndex = localPlot.yAxisIndex;
      } else {
        channelLabel = channelOptions.find((x) => x.value == channeIndex).label;
        newPlotType = "scatter";
      }
    } else {
      channelLabel = channelOptions.find((x) => x.value == channeIndex).label;
    }

    change = {
      type:
        newPlotType == "histogram" ? "ChangePlotType" : "ChannelIndexChange",
      plotIndex: plotIndex,
      axis: axis,
      axisIndex: channeIndex,
      axisLabel: channelLabel,
      plotType: newPlotType,
      scaleType: props.enrichedFile.channels[channeIndex].defaultScale,
      fileId: props.enrichedFile.fileId,
    };

    props.onChangeChannel(change);
  };

  const onClickGateButton = (plot, plotIndex) => {};

  const onAddGate = (plot, plotIndex) => {
    let pointsReal = JSON.parse(JSON.stringify(newGatePointsCanvas));

    pointsReal.forEach((point) => {
      // the scale the gate is created on is important hear - linear very different to logicle
      if (localPlot.xScaleType === "lin") {
        // if linear, convert to the "real" value
        point[0] = getRealXAxisValueFromCanvasPointOnLinearScale(
          props.enrichedFile.channels,
          plot.xAxisIndex,
          plot.width,
          point[0]
        );
      } else {
        // if logicle, get the logicle transform, convert the canvas point to logicle (between 0 and 1), and then to real value
        point[0] = getRealXAxisValueFromCanvasPointOnLogicleScale(
          props.enrichedFile.logicles,
          plot,
          point[0]
        );
      }

      if (plot.yScaleType === "lin") {
        point[1] = getRealYAxisValueFromCanvasPointOnLinearScale(
          props.enrichedFile.channels,
          plot.yAxisIndex,
          plot.height,
          point[1]
        );
      } else {
        point[1] = getRealYAxisValueFromCanvasPointOnLogicleScale(
          props.enrichedFile.logicles,
          plot,
          point[1]
        );
      }
    });

    let xRange = [
      props.enrichedFile.channels[plot.xAxisIndex].minimum,
      props.enrichedFile.channels[plot.xAxisIndex].maximum,
    ];

    let yRange = [
      props.enrichedFile.channels[plot.yAxisIndex].minimum,
      props.enrichedFile.channels[plot.yAxisIndex].maximum,
    ];

    let gate = {
      color: gateColor,
      gateType: "polygon",
      // need to ask for gate name
      name: gateName.name,
      points: pointsReal,
      xAxisLabel: plot.xAxisLabel,
      yAxisLabel: plot.yAxisLabel,
      xScaleType: plot.xScaleType,
      yScaleType: plot.yScaleType,
      xAxisIndex: plot.xAxisIndex,
      yAxisIndex: plot.yAxisIndex,
      xAxisOriginalRanges: xRange,
      yAxisOriginalRanges: yRange,
      parent: plot.population,
    };

    plot.gate = gate;

    let change = {
      type: "AddGate",
      plot: plot,
      plotIndex: plotIndex,
      gateName: gateName.name,
    };

    props.onAddGate(change);
  };

  const channelOptions = props.enrichedFile.channels.map((channel, index) => {
    return {
      value: index,
      label: channel.name,
      defaultScale: channel.defaultScale,
    };
  });

  const getMoveValue = (
    startValueReal,
    newValueCanvas,
    scale,
    axisIndex,
    axis
  ) => {
    if (scale == "bi") {
      // For logicle
      // convert startPointsReal to canvas pixels
      // offsetX and offsetY are what the user has moved by in canvas pixels (newPointsCanvas)
      // get the amount of pixels to move by newPointsCanvas - startPointsInCanvas
      // convert the currect gate points (which are Real) to canvas pixels by logicle.scale() then multiply by width
      // add the amount to move (moveX, moveY) to the current converted gate points
      // then, convert all points back to real points by dividing by width or heigh and then logicle.inverse()

      newValueCanvas =
        axis == "y" ? localPlot.height - newValueCanvas : newValueCanvas;

      let logicle = props.enrichedFile.logicles[axisIndex];
      let startValueScaled = logicle.scale(startValueReal);

      let startValueCanvas =
        axis == "x"
          ? startValueScaled * localPlot.width
          : startValueScaled * localPlot.height;

      return newValueCanvas - startValueCanvas;
    } else {
      // For Linear
      // get the Real values from
      // convert startPointsReal to canvas pixels from offsetX, offsetY
      // subtract startPointsReal from newPointsReal to get moveX, moveY
      // add to the points

      let newValueReal =
        axis == "x"
          ? getRealXAxisValueFromCanvasPointOnLinearScale(
              props.enrichedFile.channels,
              localPlot.xAxisIndex,
              localPlot.width,
              newValueCanvas
            )
          : getRealYAxisValueFromCanvasPointOnLinearScale(
              props.enrichedFile.channels,
              localPlot.yAxisIndex,
              localPlot.height,
              newValueCanvas
            );

      return newValueReal - startValueReal;
    }
  };

  const hasGate = () => {
    return !!props.plot.gate;
  };

  const getGateValue = (value, scale, axisIndex, length, moveBy) => {
    if (scale == "bi") {
      let logicle = props.enrichedFile.logicles[axisIndex];
      let canvasX = logicle.scale(value) * length;

      let newValueCanvas = canvasX + moveBy;
      let newValueLogicle = newValueCanvas / length;
      let newValueReal = logicle.inverse(newValueLogicle);
      return newValueReal;
    } else {
      return value + moveBy;
    }
  };

  const redraw = () => {
    drawPolygon();
    drawPoints();
  };

  const drawPolygon = () => {
    let context = getContext("covering-canvas-" + props.plotIndex);
    //context.fillStyle = "rgba(100,100,100,0.5)";
    context.strokeStyle = "CornflowerBlue";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(newGatePointsCanvas[0][0], newGatePointsCanvas[0][1]);
    for (var i = 1; i < newGatePointsCanvas.length; i++) {
      context.lineTo(newGatePointsCanvas[i][0], newGatePointsCanvas[i][1]);
    }
    if (polygonComplete) {
      context.closePath();
    }
    context.stroke();
  };

  const drawLabel = () => {
    let xRange = [
      props.enrichedFile.channels[localPlot.xAxisIndex].minimum,
      props.enrichedFile.channels[localPlot.xAxisIndex].maximum,
    ];

    let yRange = [
      props.enrichedFile.channels[localPlot.yAxisIndex].minimum,
      props.enrichedFile.channels[localPlot.yAxisIndex].maximum,
    ];

    let [horizontalBinCount, verticalBinCount] = getBins(
      localPlot.width,
      localPlot.height,
      localPlot.plotScale
    );

    let xLabels = getAxisLabels(
      localPlot.xScaleType,
      xRange,
      props.enrichedFile.logicles[localPlot.xAxisIndex],
      horizontalBinCount
    );

    let contextX = document
      .getElementById("canvas-" + props.plotIndex + "-xAxis")
      .getContext("2d");

    contextX.clearRect(0, 0, localPlot.width + 50, 20);

    let prevLabelPos = null;

    for (let i = 0; i < xLabels.length; i++) {
      let [xPos, yPos] = getPointOnCanvas(
        props.enrichedFile.channels,
        xLabels[i].pos,
        null,
        localPlot,
        props.enrichedFile.logicles
      );

      if (prevLabelPos != null && i != 0 && prevLabelPos >= xPos - 10) {
        continue;
      }

      prevLabelPos = xPos;
      drawText(
        {
          x: xPos,
          y: 12,
          text: xLabels[i].name,
          font: "10px Arial",
          fillColor: "black",
        },
        contextX
      );
    }

    let yLabels = getAxisLabels(
      localPlot.yScaleType,
      yRange,
      props.enrichedFile.logicles[localPlot.yAxisIndex],
      verticalBinCount
    );

    let contextY = document
      .getElementById("canvas-" + props.plotIndex + "-yAxis")
      .getContext("2d");

    contextY.clearRect(0, 0, 25, localPlot.height);
    prevLabelPos = null;
    //let shiftUp = Math.abs(yRange[0]) / xDivisor;
    for (let i = 0; i < yLabels.length; i++) {
      let [xPos, yPos] = getPointOnCanvas(
        props.enrichedFile.channels,
        null,
        yLabels[i].pos,
        localPlot,
        props.enrichedFile.logicles
      );

      if (i == yLabels.length - 1) {
        yPos = yPos + 9;
      }

      if (prevLabelPos != null && i != 0 && prevLabelPos <= yPos + 5) {
        continue;
      }
      prevLabelPos = yPos;
      drawText(
        {
          x: 0,
          y: yPos,
          text: yLabels[i].name,
          font: "10px Arial",
          fillColor: "black",
        },
        contextY
      );
    }
  };

  const drawPoints = () => {
    //"covering-canvas-" + props.plotIndex
    let context = getContext("covering-canvas-" + props.plotIndex);

    context.strokeStyle = "CornflowerBlue";
    context.lineJoin = "round";
    context.lineWidth = 5;

    for (var i = 0; i < newGatePointsCanvas.length; i++) {
      context.beginPath();
      context.arc(
        newGatePointsCanvas[i][0],
        newGatePointsCanvas[i][1],
        3,
        0,
        2 * Math.PI,
        false
      );
      context.fillStyle = "#000";
      context.fill();
      context.lineWidth = 5;
      context.stroke();
    }
  };

  const inRange = (x, min, max) => {
    return (x - min) * (x - max) <= 0;
  };

  /*********************MOUSE EVENTS FOR RESIZING********************************/
  const handleResizeMouseDown = (event) => {
    isMouseDown = true;

    resizeStartPoints = [event.offsetX, event.offsetY];
  };

  const handleResizeMouseUp = (event) => {
    isMouseDown = false;

    let change = {
      height: localPlot.height,
      width: localPlot.width,
      plotIndex: props.plotIndex.split("-")[1],
    };

    props.onResize(change);
  };

  const handleResizeMouseMove = (event) => {
    if (isMouseDown) {
      let moveX = event.offsetX - resizeStartPoints[0];
      let moveY = event.offsetY - resizeStartPoints[1];

      localPlot.width = localPlot.width + moveX;
      localPlot.height = localPlot.height + moveY;

      resizeStartPoints = [event.offsetX, event.offsetY];

      setLocalPlot(JSON.parse(JSON.stringify(localPlot)));
    }
  };

  /*********************MOUSE EVENTS FOR GATES********************************/
  const handleMouseDown = (event) => {
    if (resizing) return;

    if (hasGate()) {
      if (!shouldDrawGate(localPlot)) return;

      isMouseDown = true;
      // check if on point
      // convert real points to canvas points and check if within 5 points of canvas points
      let gateCanvasPoints = localPlot.gate.points.map((point) => {
        let canvasPoint = getPointOnCanvas(
          props.enrichedFile.channels,
          point[0],
          point[1],
          // TODO make sure can only change gate when on correct channels
          // this is important, make sure they can only edit gate when the gate channels match prop channels
          localPlot,
          props.enrichedFile.logicles
        );

        return canvasPoint;
      });

      let isNearAPoint = false;
      gateCanvasPoints.find((point, index) => {
        let isNear =
          point[0] + 5 >= event.offsetX &&
          point[0] - 5 <= event.offsetX &&
          point[1] + 5 >= event.offsetY &&
          point[1] - 5 <= event.offsetY;
        if (isNear) {
          dragPointIndex = index;
          isNearAPoint = true;
        }
        return isNear;
      });

      let newPointsReal = getRealPointFromCanvasPoints(
        props.enrichedFile.channels,
        localPlot,
        [event.offsetX, event.offsetY],
        props.enrichedFile.logicles
      );
      const isInside = isPointInPolygon(
        newPointsReal[0],
        newPointsReal[1],
        localPlot.gate.points
      );

      setIsInsideGate(isInside);

      if (isInside || isNearAPoint) {
        setStartPointsReal(
          getRealPointFromCanvasPoints(
            props.enrichedFile.channels,
            localPlot,
            [event.offsetX, event.offsetY],
            props.enrichedFile.logicles
          )
        );
      }
    } else {
      isMouseDown = true;
    }
  };

  const handleMouseUp = (event) => {
    if (resizing) return;
    if (!isMouseDown) return;

    isMouseDown = false;
    dragPointIndex = false;
    if (hasGate()) {
      let newPointsReal = getRealPointFromCanvasPoints(
        props.enrichedFile.channels,
        localPlot,
        [event.offsetX, event.offsetY],
        props.enrichedFile.logicles
      );

      const isInside = isPointInPolygon(
        newPointsReal[0],
        newPointsReal[1],
        localPlot.gate.points
      );

      setIsInsideGate(isInside);

      if (newPoints && newPoints.length > 1) {
        localPlot.gate.points = JSON.parse(JSON.stringify(newPoints));

        setNewPoints([]);

        let change = {
          type: "EditGate",
          plot: localPlot,
          plotIndex: props.plotIndex.split("-")[1],
          fileId: props.enrichedFile.fileId,
        };
        props.onEditGate(change);
      }
    } else {
      // so its a new gate
      // only if the file is controlled file then it is allowed to create a new gate
      if (props.enrichedFile.fileId === props.workspaceState.controlFileId) {
        newGatePointsCanvas.forEach((newGatePointCanvas) => {
          if (
            inRange(
              event.offsetX,
              newGatePointCanvas[0] - 10,
              newGatePointCanvas[0] + 10
            ) &&
            inRange(
              event.offsetY,
              newGatePointCanvas[1] - 10,
              newGatePointCanvas[1] + 10
            ) &&
            newGatePointsCanvas.length >= 3
          ) {
            const suggestedGateName =
              props.plot.yAxisLabel + ", " + props.plot.xAxisLabel + " subset";
            setGateName({
              name: suggestedGateName,
            });

            setModalIsOpen(true);
            polygonComplete = true;
          }
        });

        // checking if the points are unique or not
        let uniqueGatePoint = true;
        for (const point of newGatePointsCanvas) {
          if (point[0] === event.offsetX && point[1] === event.offsetY) {
            uniqueGatePoint = false;
            break;
          }
        }

        if (!polygonComplete && uniqueGatePoint) {
          newGatePointsCanvas.push([event.offsetX, event.offsetY]);
        }
        redraw();
      }
    }
  };

  const handleMouseMove = (event) => {
    if (isMouseDown && hasGate() && isGateShowing(localPlot)) {
      let newPointsCanvas = [event.offsetX, event.offsetY];

      if (isInsideGate || typeof dragPointIndex == "number") {
        // this code will run when a user will drag the entire polygon gate

        let moveX = getMoveValue(
          startPointsReal[0],
          newPointsCanvas[0],
          localPlot.xScaleType,
          localPlot.xAxisIndex,
          "x"
        );

        let moveY = getMoveValue(
          startPointsReal[1],
          newPointsCanvas[1],
          localPlot.yScaleType,
          localPlot.yAxisIndex,
          "y"
        );

        let points = localPlot.gate.points.map((point, index) => {
          if (typeof dragPointIndex == "number") {
            // TODO too much code repetition here
            if (dragPointIndex == index) {
              let newGateValueRealX = getGateValue(
                point[0],
                localPlot.xScaleType,
                localPlot.xAxisIndex,
                localPlot.width,
                moveX
              );

              let newGateValueRealY = getGateValue(
                point[1],
                localPlot.yScaleType,
                localPlot.yAxisIndex,
                localPlot.height,
                moveY
              );

              return [newGateValueRealX, newGateValueRealY];
            } else {
              return [point[0], point[1]];
            }
          } else {
            let newGateValueRealX = getGateValue(
              point[0],
              localPlot.xScaleType,
              localPlot.xAxisIndex,
              localPlot.width,
              moveX
            );

            let newGateValueRealY = getGateValue(
              point[1],
              localPlot.yScaleType,
              localPlot.yAxisIndex,
              localPlot.height,
              moveY
            );

            return [newGateValueRealX, newGateValueRealY];
          }
        });

        let xRange = [
          props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
          props.enrichedFile.channels[props.plot.xAxisIndex].maximum,
        ];

        let yRange = [
          props.enrichedFile.channels[props.plot.yAxisIndex].minimum,
          props.enrichedFile.channels[props.plot.yAxisIndex].maximum,
        ];

        localPlot.gate.xAxisOriginalRanges = xRange;
        localPlot.gate.yAxisOriginalRanges = yRange;

        setNewPoints(points);
        // setLocalPlot({
        //   ...localPlot,
        //   gate: { ...localPlot.gate, points: points },
        // });

        // IMPORTANT - reset start points
        // setStartPointsReal(
        //   getRealPointFromCanvasPoints(
        //     props.enrichedFile.channels,
        //     localPlot,
        //     [event.offsetX, event.offsetY],
        //     props.enrichedFile.logicles
        //   )
        // );
      }
    }
  };

  const handleCursorProperty = (event) => {
    if (
      hasGate() &&
      isGateShowing(localPlot) &&
      props?.plot?.gate?.gateType === "polygon"
    ) {
      let newPointsReal = getRealPointFromCanvasPoints(
        props.enrichedFile.channels,
        localPlot,
        [event.offsetX, event.offsetY],
        props.enrichedFile.logicles
      );
      let isInside = isPointInPolygon(
        newPointsReal[0],
        newPointsReal[1],
        localPlot.gate.points
      );

      let gateCanvasPoints = localPlot.gate.points.map((point) => {
        let canvasPoint = getPointOnCanvas(
          props.enrichedFile.channels,
          point[0],
          point[1],
          // TODO make sure can only change gate when on correct channels
          // this is important, make sure they can only edit gate when the gate channels match prop channels
          localPlot,
          props.enrichedFile.logicles
        );

        return canvasPoint;
      });
      let near = false;
      gateCanvasPoints.find((point) => {
        let isNear =
          point[0] + 5 >= event.offsetX &&
          point[0] - 5 <= event.offsetX &&
          point[1] + 5 >= event.offsetY &&
          point[1] - 5 <= event.offsetY;
        if (isNear) near = isNear;
        return isNear;
      });

      document.body.style.cursor = near ? "move" : isInside ? "grab" : "auto";
    } else {
      document.body.style.cursor =
        props.enrichedFile.fileId === props.workspaceState.controlFileId &&
        !localPlot?.gate
          ? "crosshair"
          : "auto";
    }
  };

  const onSetGateName = () => {
    onAddGate(localPlot, props.plotIndex);
    setModalIsOpen(false);
    newGatePointsCanvas = [];
    polygonComplete = false;
  };

  const onCancelGateName = () => {
    setModalIsOpen(false);
    newGatePointsCanvas = [];
    polygonComplete = false;
    setLocalPlot(JSON.parse(JSON.stringify(localPlot)));
  };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#F0AA89",
    },
  };

  const handleChangeComplete = (color) => {
    setGateColor(color.hex);
  };

  const gateNameHandler = (name) => {
    setGateName({
      name: name,
      error: plotNames.includes(name) ? true : false,
    });
  };

  return (
    <>
      {" "}
      <div
        key={props.plotIndex}
        style={
          {
            // padding: "20px",
          }
        }
      >
        <Modal
          isOpen={modalIsOpen}
          appElement={document.getElementById("root") || undefined}
          style={customStyles}
        >
          <div
            style={{
              // position: "relative",
              // zIndex: 2000,
              display: "flex",
              flexDirection: "column",
              alignItems: "cneter",
              justifyContent: "center",
            }}
          >
            <label>
              Gate Name:
              <input
                type="text"
                value={gateName.name}
                style={{
                  width: 200,
                  marginLeft: 5,
                  border: "none",
                  borderRadius: 5,
                  outline: "none",
                }}
                onChange={(e) => gateNameHandler(e.target.value)}
              />
            </label>
            <p style={{ height: 16, textAlign: "center", paddingTop: 2.5 }}>
              {gateName.error && "A unique gate name is required"}
            </p>
            <div
              style={{
                padding: 10,
                alignSelf: "center",
                paddingTop: 0,
                paddingBottom: 25,
              }}
            >
              <CompactPicker
                onChangeComplete={handleChangeComplete}
                color={gateColor}
              />
            </div>
            <div style={{ margin: "auto" }}>
              <button
                style={{
                  marginRight: 5,
                  backgroundColor:
                    gateName.error || !gateName.name ? "#f3f3f3" : "white",
                  borderRadius: 5,
                  border: "none",
                  cursor: gateName.error || !gateName.name ? "auto" : "pointer",
                  color: gateName.error || !gateName.name ? "gray" : "black",
                }}
                disabled={gateName.error || !gateName.name}
                onClick={() => onSetGateName()}
              >
                Ok
              </button>
              <button
                style={{
                  backgroundColor: "white",
                  borderRadius: 5,
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => onCancelGateName()}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
        <SideSelector
          channelOptions={channelOptions}
          onChange={onChangeChannel}
          onChangeScale={onChangeScale}
          plot={localPlot}
          plotIndex={props.plotIndex}
          onDeleteGate={props.onDeleteGate}
          handleResizeMouseDown={handleResizeMouseDown}
          handleResizeMouseMove={handleResizeMouseMove}
          handleResizeMouseUp={handleResizeMouseUp}
          downloadPlotAsImage={props.downloadPlotAsImage}
          canvasComponent={
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex" }}>
                {/* Y-axis */}
                <canvas
                  height={localPlot.height}
                  id={`canvas-${props.plotIndex}-yAxis`}
                  width={25}
                />
                {/* main canvas */}
                <div
                  style={{
                    border: "1px solid #32a1ce",
                    minHeight: 200,
                    minWidth: 200,
                    width: `${props.plot.width + 2}px`,
                    height: `${props.plot.height + 2}px`,
                    resize: "both",
                    overflow: "hidden",
                    position: "relative",
                  }}
                  ref={ref}
                >
                  <canvas
                    className="canvas"
                    id={`canvas-${props.plotIndex}`}
                    width={props.plot.width}
                    height={props.plot.height}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                    // onMouseDown={(e) => {
                    //   let nativeEvent = e.nativeEvent;
                    //   handleMouseDown(nativeEvent);
                    // }}
                    // onMouseMove={(e) => {
                    //   let nativeEvent = e.nativeEvent;
                    //   handleCursorProperty(nativeEvent);
                    //   handleMouseMove(nativeEvent);
                    // }}
                    // onMouseUp={(e) => {
                    //   let nativeEvent = e.nativeEvent;
                    //   handleMouseUp(nativeEvent);
                    // }}
                    // onMouseLeave={(e) => {
                    //   document.body.style.cursor = "auto";
                    // }}
                  />

                  <canvas
                    id={`covering-canvas-${props.plotIndex}`}
                    width={props.plot.width}
                    height={props.plot.height}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      // display: "block" : "none",
                    }}
                    onMouseDown={(e) => {
                      let nativeEvent = e.nativeEvent;
                      handleMouseDown(nativeEvent);
                    }}
                    onMouseMove={(e) => {
                      let nativeEvent = e.nativeEvent;
                      handleCursorProperty(nativeEvent);
                      handleMouseMove(nativeEvent);
                    }}
                    onMouseUp={(e) => {
                      let nativeEvent = e.nativeEvent;
                      handleMouseUp(nativeEvent);
                    }}
                    onMouseLeave={(e) => {
                      document.body.style.cursor = "auto";
                    }}
                  />
                </div>
              </div>
              {/* X-axis */}
              <canvas
                width={localPlot.width + 50}
                id={`canvas-${props.plotIndex}-xAxis`}
                height={20}
                style={{
                  marginLeft: 25,
                }}
              />
            </div>
          }
        />
      </div>
    </>
  );
}

export default Plot;
