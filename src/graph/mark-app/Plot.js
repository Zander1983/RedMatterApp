import { useEffect, useState, useRef, useCallback } from "react";
import {
  isPointInPolygon,
  drawText,
  getAxisLabels,
  getBins,
  getGateName,
  getGateNameFriendly,
  getCenter,
  getGateNameBoundingBox,
  getGatesOnPlot,
} from "./Helper";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "@material-ui/core";
import {
  getRealPointFromCanvasPoints,
  getPointOnCanvas,
  getRealXAxisValueFromCanvasPointOnLinearScale,
  getRealYAxisValueFromCanvasPointOnLinearScale,
  getRealXAxisValueFromCanvasPointOnLogicleScale,
  getRealYAxisValueFromCanvasPointOnLogicleScale,
  isMousePointNearScatterPoints,
  getMoveValue,
  getGateValue,
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

let isMouseDown = false;
let polygonComplete = false;
let resizeStartPoints;
let interval = null;

function Plot(props) {
  let [dragPointIndex, setDragPointIndex] = useState(null);
  let [startPointsReal, setStartPointsReal] = useState(null);
  let [isInsideGate, setIsInsideGate] = useState(null);
  let [isInsideGateName, setIsInsideGateName] = useState(null);
  let [isNearPoint, setIsNearPoint] = useState(null);
  let [nameOfGateCursorIsInside, setNameOfGateCursorIsInside] = useState(null);
  let [newPoints, setNewPoints] = useState([]);
  let [gateNameOffset, setGateNameOffset] = useState(null);
  let [newGateNamePosition, setNewGateNamePosition] = useState([]);
  const [localPlot, setLocalPlot] = useState(props.plot);
  let [showMenu, setShowMenu] = useState(null);
  let [isEditingGate, setIsEditingGate] = useState(null);
  let [menuPosition, setMenuPosition] = useState([]);
  let [newGatePointsCanvas, setNewGatePointsCanvas] = useState([]);
  let [gateNameLengths, setGateNameLengths] = useState([]);
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
    context.fillStyle = "white";

    // draw here
    if (newPoints.length > 0) {
      if (context) {
        let gates = getGatesOnPlot(props.plot);
        gates.map((gate) => {
          let points =
            gate.name == nameOfGateCursorIsInside ? newPoints : gate.points;

          drawGateLine(
            getContext("covering-canvas-" + props.plotIndex),
            props.plot,
            gate.name == nameOfGateCursorIsInside ? newPoints : gate.points,
            null,
            gate
          );
        });

        //drawTemporaryGateLine(context, props.plot);
      }
    } else {
      let context = getContext("covering-canvas-" + props.plotIndex);
      context.clearRect(0, 0, props.plot.width, props.plot.height);
      context.fillStyle = "white";
    }
  }, [newPoints]);

  useEffect(() => {
    if (newGateNamePosition.length > 0) {
      let context = getContext("covering-canvas-" + props.plotIndex);
      context.clearRect(0, 0, localPlot.width, localPlot.height);
      context.fillStyle = "white";

      if (context) {
        let gates = getGatesOnPlot(props.plot);
        gates.map((gate) => {
          drawGateLine(
            getContext("covering-canvas-" + props.plotIndex),
            props.plot,
            gate.points,
            nameOfGateCursorIsInside == gate.name
              ? newGateNamePosition
              : gate.gateNamePosition,
            gate
          );
        });
      }
    }
  }, [newGateNamePosition]);

  useEffect(() => {
    if (newGatePointsCanvas && newGatePointsCanvas.length < 1) {
      let context = getContext("covering-canvas-" + props.plotIndex);
      context.clearRect(0, 0, localPlot.width, localPlot.height);

      let gates = getGatesOnPlot(props.plot);

      gates.map((gate) => {
        drawGateLine(
          getContext("covering-canvas-" + props.plotIndex),
          props.plot,
          gate.points,
          null,
          gate
        );
      });

      setShowMenu(false);
    }
  }, [newGatePointsCanvas]);

  useEffect(() => {
    let context = getContext("covering-canvas-" + props.plotIndex);
    context.clearRect(0, 0, localPlot.width, localPlot.height);

    setLocalPlot(props.plot);
  }, [props.plot]);

  useEffect(() => {
    let context = getContext("covering-canvas-" + props.plotIndex);
    context.clearRect(0, 0, localPlot.width, localPlot.height);

    setNewGatePointsCanvas([]);

    let gates = getGatesOnPlot(props.plot);

    gates.map((gate) => {
      drawGateLine(
        getContext("covering-canvas-" + props.plotIndex),
        props.plot,
        gate.points,
        null,
        gate
      );
    });

    setShowMenu(false);
  }, [props.clearAnyPoints]);

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
        getFormattedEvents(enrichedEvent, props.plot).forEach(
          (formattedEvent) => {
            context.fillStyle = formattedEvent.color;
            context.fillRect(formattedEvent[0], formattedEvent[1], 1, 1);
            if (
              formattedEvent[0] >= props.plot.width ||
              formattedEvent[0] < 2 ||
              formattedEvent[1] >= props.plot.height ||
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

    let gates = getGatesOnPlot(props.plot);
    gates.map((gate) => {
      drawGateLine(
        getContext("covering-canvas-" + props.plotIndex),
        props.plot,
        gate.points,
        null,
        gate
      );
    });
  }, [
    props.plot,
    props.enrichedFile.channels,
    // props.workspaceState.files[props.enrichedFile.fileId]?.plots[
    //   props.plotIndex.split("-")[1]
    // ],
    // props.workspaceState.plots[props.plotIndex.split("-")[1]],
    // props.workspaceState.plots[props.plotIndex.split("-")[1]].gates &&
    //   props.workspaceState.plots[props.plotIndex.split("-")[1]].gates[0].points,
    props.plot.reRender,
    props.workspaceState.openFile,
    props.workspaceState.plots.length,
  ]);

  const drawGateLine = (
    context,
    plot,
    realPoints,
    newGateNamePosition,
    gate
  ) => {
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

    let center = newGateNamePosition
      ? newGateNamePosition
      : gate.gateNamePosition;

    context.font = "12px Arial";

    var metrics = context.measureText(getGateNameFriendly(gate.name));

    // context.rect(center[0], center[1], metrics.width, 17);
    context.fillStyle = "#fff";
    // context.fillStyle = "#FF0000";
    context.fillRect(center[0] - 2, center[1] - 13, metrics.width + 3, 17);
    context.stroke();
    // context.font = "bold 20pt Calibri";
    // context.textAlign = "center";

    let gateNameLengthsCopy = gateNameLengths;
    gateNameLengthsCopy[gate.name] = metrics.width;
    setGateNameLengths(gateNameLengthsCopy);

    context.fillStyle = gate.color;
    context.fillText(getGateNameFriendly(gate.name), center[0], center[1]);
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
      population: props.plot.population,
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
      population: props.plot.population,
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

    let newGate = {
      color: gateColor,
      gateType: "polygon",
      // need to ask for gate name
      name: getGateName(gateName.name),
      points: pointsReal,
      gateNamePosition: getCenter(newGatePointsCanvas),
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

    //plot.gate = gate;

    let change = {
      type: "AddGate",
      plot: props.plot,
      newGate: newGate,
      plotIndex: plotIndex,
      gateName: gateName.name,
      fileId: props.enrichedFile.fileId,
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

  const hasGates = () => {
    return !!props.plot.gates;
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
      props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
      props.enrichedFile.channels[props.plot.xAxisIndex].maximum,
    ];

    let yRange = [
      props.enrichedFile.channels[props.plot.yAxisIndex].minimum,
      props.enrichedFile.channels[props.plot.yAxisIndex].maximum,
    ];

    let [horizontalBinCount, verticalBinCount] = getBins(
      props.plot.width,
      props.plot.height,
      props.plot.plotScale
    );

    let xLabels = getAxisLabels(
      props.plot.xScaleType,
      xRange,
      props.enrichedFile.logicles[props.plot.xAxisIndex],
      horizontalBinCount
    );

    let contextX = document
      .getElementById("canvas-" + props.plotIndex + "-xAxis")
      .getContext("2d");

    contextX.clearRect(0, 0, props.plot.width + 20, 20);

    let prevLabelPos = null;

    for (let i = 0; i < xLabels.length; i++) {
      let [xPos, yPos] = getPointOnCanvas(
        props.enrichedFile.channels,
        xLabels[i].pos,
        null,
        props.plot,
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
      props.plot.yScaleType,
      yRange,
      props.enrichedFile.logicles[props.plot.yAxisIndex],
      verticalBinCount
    );

    let contextY = document
      .getElementById("canvas-" + props.plotIndex + "-yAxis")
      .getContext("2d");

    contextY.clearRect(0, 0, 25, props.plot.height);
    prevLabelPos = null;
    //let shiftUp = Math.abs(yRange[0]) / xDivisor;
    for (let i = 0; i < yLabels.length; i++) {
      let [xPos, yPos] = getPointOnCanvas(
        props.enrichedFile.channels,
        null,
        yLabels[i].pos,
        props.plot,
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
    if (showMenu) {
      setShowMenu(false);
      setNewGatePointsCanvas([]);
      return false;
    }

    event.stopPropagation();
    if (resizing) return;

    isMouseDown = true;

    // check if in gateName

    if (hasGates()) {
      //&& isInsideGateName()
      for (var i = 0; i < localPlot.gates.length; i++) {
        let gate = localPlot.gates[i];
        // check if on point
        // convert real points to canvas points and check if within 5 points of canvas points

        let isInside = isPointInPolygon(
          event.offsetX,
          event.offsetY,
          getGateNameBoundingBox(
            gateNameLengths,
            gate.name,
            gate.gateNamePosition
          )
        );

        if (isInside) {
          let offset = event.offsetX - gate.gateNamePosition[0];
          setGateNameOffset(offset);
          setIsInsideGateName(true);
          setNameOfGateCursorIsInside(gate.name);

          return;
        }
      }
    }

    if (hasGates()) {
      //if (!getGatesOnPlot(localPlot)) return;

      for (var i = 0; i < localPlot.gates.length; i++) {
        let gate = localPlot.gates[i];
        // check if on point
        // convert real points to canvas points and check if within 5 points of canvas points
        let gateCanvasPoints = gate.points.map((point) => {
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

        let isNearPointIndex = isMousePointNearScatterPoints(
          gateCanvasPoints,
          event.offsetX,
          event.offsetY
        );

        let isInside = false;
        if (!isNearPointIndex.isNear) {
          let newPointsReal = getRealPointFromCanvasPoints(
            props.enrichedFile.channels,
            localPlot,
            [event.offsetX, event.offsetY],
            props.enrichedFile.logicles
          );
          isInside = isPointInPolygon(
            newPointsReal[0],
            newPointsReal[1],
            gate.points
          );
        }

        if (isInside) {
          setNameOfGateCursorIsInside(gate.name);

          if (event.button == 2) {
            setShowMenu(true);
            setMenuPosition([event.offsetX, event.offsetY]);

            event.stopPropagation();
            event.preventDefault();
            return false;
          }
        }

        setIsNearPoint(isNearPointIndex.isNear);
        setIsInsideGate(isInside);

        if (isNearPointIndex.isNear) {
          setNameOfGateCursorIsInside(gate.name);
          setDragPointIndex(isNearPointIndex.pointIndex);
        }

        if (isInside || isNearPointIndex.isNear) {
          setStartPointsReal(
            getRealPointFromCanvasPoints(
              props.enrichedFile.channels,
              localPlot,
              [event.offsetX, event.offsetY],
              props.enrichedFile.logicles
            )
          );
          break;
        }
      }
    }
  };

  const handleMouseMove = (event) => {
    if (event.button == 2) {
      event.stopPropagation();
      event.preventDefault();
      return false;
    }

    if (isMouseDown && hasGates() && getGatesOnPlot(localPlot).length > 0) {
      let newPointsCanvas = [event.offsetX, event.offsetY];

      if (isInsideGateName) {
        setNewGateNamePosition([event.offsetX - gateNameOffset, event.offsetY]);
        return;
      } else if (isInsideGate || isNearPoint) {
        // this code will run when a user will drag the entire polygon gate

        let moveX = getMoveValue(
          props.plot,
          props.enrichedFile.channels,
          props.enrichedFile.logicles,
          startPointsReal[0],
          newPointsCanvas[0],
          localPlot.xScaleType,
          localPlot.xAxisIndex,
          "x"
        );

        let moveY = getMoveValue(
          props.plot,
          props.enrichedFile.channels,
          props.enrichedFile.logicles,
          startPointsReal[1],
          newPointsCanvas[1],
          localPlot.yScaleType,
          localPlot.yAxisIndex,
          "y"
        );

        for (var i = 0; i < localPlot.gates.length; i++) {
          let gate = localPlot.gates[i];
          if (gate.name == nameOfGateCursorIsInside) {
            let points = gate.points.map((point, index) => {
              if (typeof dragPointIndex == "number") {
                // TODO too much code repetition here
                if (dragPointIndex == index) {
                  let newGateValueRealX = getGateValue(
                    props.enrichedFile.logicles,
                    point[0],
                    localPlot.xScaleType,
                    localPlot.xAxisIndex,
                    localPlot.width,
                    moveX
                  );

                  let newGateValueRealY = getGateValue(
                    props.enrichedFile.logicles,
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
                  props.enrichedFile.logicles,
                  point[0],
                  localPlot.xScaleType,
                  localPlot.xAxisIndex,
                  localPlot.width,
                  moveX
                );

                let newGateValueRealY = getGateValue(
                  props.enrichedFile.logicles,
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

            gate.xAxisOriginalRanges = xRange;
            gate.yAxisOriginalRanges = yRange;

            setNewPoints(points);
          }
        }
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

  const handleMouseUp = (event) => {
    if (event.button == 2) {
      event.stopPropagation();
      event.preventDefault();
      return false;
    }

    event.stopPropagation();

    if (resizing) return;
    if (!isMouseDown) return;

    isMouseDown = true;

    if (isInsideGateName) {
      let gate = props.plot.gates.find(
        (gate) => gate.name == nameOfGateCursorIsInside
      );

      let change = {
        type: "EditGateNamePosition",
        gateName: nameOfGateCursorIsInside,
        gateNamePosition: JSON.parse(JSON.stringify(newGateNamePosition)),
        plotIndex: props.plotIndex.split("-")[1],
      };

      props.onEditGateNamePosition(change);

      setNewGateNamePosition([]);
      setIsInsideGateName(false);
      setNameOfGateCursorIsInside(null);
      setGateNameOffset(false);

      // let change = {
      //   type: "EditGate",
      //   plot: localPlot,
      //   gate: gate,
      //   plotIndex: props.plotIndex.split("-")[1],
      //   fileId: props.enrichedFile.fileId,
      // };
      // props.onEditGateNamePosition(change);
      //NewGateNamePoints
    } else if (isInsideGate || isNearPoint) {
      for (var i = 0; i < localPlot.gates.length; i++) {
        let gate = JSON.parse(JSON.stringify(localPlot.gates[i]));
        if (gate.name == nameOfGateCursorIsInside) {
          setIsInsideGate(false);
          setIsNearPoint(false);
          setDragPointIndex(false);
          setNameOfGateCursorIsInside(null);

          if (newGateNamePosition && newGateNamePosition.length > 0) {
          } else if (newPoints && newPoints.length > 1) {
            gate.points = newPoints;

            setNewPoints([]);

            let change = {
              type: "EditGate",
              plot: localPlot,
              gate: gate,
              plotIndex: props.plotIndex.split("-")[1],
              fileId: props.enrichedFile.fileId,
            };
            props.onEditGate(change);
          }
        }
      }
    } else {
      // so its a new gate
      // only if the file is controlled file then it is allowed to create a new gate
      //if (props.enrichedFile.fileId === props.workspaceState.controlFileId) {
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

          setGateColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
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
        let newGatePointsCanvasCopy = newGatePointsCanvas;
        newGatePointsCanvasCopy.push([event.offsetX, event.offsetY]);
        setNewGatePointsCanvas(newGatePointsCanvasCopy);
      }
      redraw();
      //}
    }
  };

  const handleCursorProperty = (event) => {
    if (
      hasGates() &&
      getGatesOnPlot(localPlot).length > 0
      //&& props?.plot?.gate?.gateType === "polygon"
    ) {
      for (var i = 0; i < localPlot.gates.length; i++) {
        let gate = localPlot.gates[i];

        let isInsideGateName = isPointInPolygon(
          event.offsetX,
          event.offsetY,
          getGateNameBoundingBox(
            gateNameLengths,
            gate.name,
            gate.gateNamePosition
          )
        );

        if (isInsideGateName) {
          document.body.style.cursor = "grab";
          return;
        }

        let newPointsReal = getRealPointFromCanvasPoints(
          props.enrichedFile.channels,
          localPlot,
          [event.offsetX, event.offsetY],
          props.enrichedFile.logicles
        );

        let isInside = isPointInPolygon(
          newPointsReal[0],
          newPointsReal[1],
          gate.points
        );

        let gateCanvasPoints = gate.points.map((point) => {
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
        let isNear = isMousePointNearScatterPoints(
          gateCanvasPoints,
          event.offsetX,
          event.offsetY
        ).isNear;

        document.body.style.cursor = isNear
          ? "move"
          : isInside
          ? "grab"
          : "crosshair";

        if (isNear || isInside) {
          break;
        }
      }
    } else {
      document.body.style.cursor = "crosshair";
      // props.enrichedFile.fileId === props.workspaceState.controlFileId &&
      // !localPlot?.gate
      //   ? "crosshair"
      //   : "auto";
    }
  };

  const onSetGateName = () => {
    //setGateColor

    if (isEditingGate) {
      let gateNameHasChanged = false;
      let gateColorHasChanged = false;

      const gate = props.plot.gates.find((gate) => {
        return gate.name == nameOfGateCursorIsInside;
      });

      if (gate.color != gateColor) {
        gateColorHasChanged = true;
      }

      if (getGateNameFriendly(gate.name) != gateName.name) {
        gateNameHasChanged = true;
      }

      if (gateColorHasChanged || gateNameHasChanged) {
        props.onChangeGateName(
          props.plot,
          JSON.parse(JSON.stringify(gate)),
          gateNameHasChanged,
          getGateName(gateName.name),
          gateColorHasChanged,
          gateColor
        );
      }

      setIsEditingGate(false);
      setModalIsOpen(false);
      setShowMenu(false);
      setNewGatePointsCanvas([]);
      polygonComplete = false;
      return;
    }

    onAddGate(localPlot, props.plotIndex);
    setModalIsOpen(false);
    setNewGatePointsCanvas([]);
    polygonComplete = false;
  };

  const onCancelGateName = () => {
    setShowMenu(false);
    setIsEditingGate(false);
    setModalIsOpen(false);
    setNewGatePointsCanvas([]);
    polygonComplete = false;
    //setNewPoints([]);
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

  const deleteGate = () => {
    if (nameOfGateCursorIsInside) {
      props.onDeleteGate(nameOfGateCursorIsInside);
    }
    setShowMenu(false);
  };

  const onEditGateNameColor = () => {
    if (nameOfGateCursorIsInside) {
      //GateColor

      setIsEditingGate(true);

      const gate = props.plot.gates.find((gate) => {
        return gate.name == nameOfGateCursorIsInside;
      });

      setGateName({
        name: getGateNameFriendly(gate.name),
      });

      setGateColor(gate.color);

      setModalIsOpen(true);

      //props.onDeleteGate(nameOfGateCursorIsInside);
    }

    //setModalIsOpen(true);
  };

  return (
    <>
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

              //newGatePointsCanvas
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
          channels={props.enrichedFile.channels}
          plotIndex={props.plotIndex}
          onDeleteGate={props.onDeleteGate}
          handleResizeMouseDown={handleResizeMouseDown}
          handleResizeMouseMove={handleResizeMouseMove}
          handleResizeMouseUp={handleResizeMouseUp}
          downloadPlotAsImage={props.downloadPlotAsImage}
          onRangeChange={props.onRangeChange}
          canvasComponent={
            <div
              style={{ display: "flex", flexDirection: "column", zIndex: 1 }}
            >
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
                    // resize: "both",
                    // overflow: "hidden",
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
                      e.preventDefault();
                      let nativeEvent = e.nativeEvent;
                      handleMouseDown(nativeEvent);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
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

                  {showMenu ? (
                    <div
                      id="menu"
                      style={{
                        top: menuPosition[1] + 3,
                        left: menuPosition[0] + 3,
                        position: "absolute",
                        backgroundColor: "#fafafa",
                        width: "170px",
                        border: "1px solid lightgrey",
                        zIndex: 1,
                      }}
                    >
                      <div>
                        <div
                          onClick={() => deleteGate()}
                          // className={classes.topButton}
                          style={{
                            backgroundColor: "#fafafa",
                            color: "#1890ff",
                            fontWeight: 900,
                            margin: "auto",
                            textAlign: "center",
                            cursor: "pointer",
                          }}
                          //disabled={!hasGate}
                        >
                          Delete Gate
                        </div>
                        <div
                          onClick={() => onEditGateNameColor()}
                          style={{
                            backgroundColor: "#fafafa",
                            color: "#1890ff",
                            fontWeight: 900,
                            margin: "auto",
                            textAlign: "center",
                            borderTop: "1px solid lightgrey",
                            cursor: "pointer",
                          }}
                        >
                          Edit Gate Name/Color
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              {/* X-axis */}
              <canvas
                width={localPlot.width + 25}
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
