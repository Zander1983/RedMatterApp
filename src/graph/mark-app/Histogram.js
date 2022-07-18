import { histogram } from "./HistogramHelper";
import { useEffect, useState, useCallback } from "react";
import SideSelector from "./PlotEntities/SideSelector";
import Modal from "react-modal";
import { useResizeDetector } from "react-resize-detector";
import {
  getRealPointFromCanvasPoints,
  getPointOnCanvas,
  isMousePointNearHistPoints,
  isMousePointInsideHistPoints,
  getMoveValue,
  getGateValue,
} from "./PlotHelper";
import { CompactPicker } from "react-color";
import { drawText, getAxisLabels, getBins, isGateShowing } from "./Helper";

let isMouseDown = false;
let interval = null;

const isOnGate = (plot) => {
  return plot.gate.xAxisIndex == plot.xAxisIndex;
};

const shouldDrawGate = (plot) => {
  if (
    plot.xAxisIndex === plot.gate.xAxisIndex &&
    plot.xScaleType === plot.gate.xScaleType
  ) {
    return true;
  } else {
    return false;
  }
};

const getContext = (canvasId) => {
  // const findBy = "canvas-" + plot.plotIndex
  const canvas = document.getElementById(canvasId);
  if (canvas) {
    const context = canvas.getContext("2d");
    return context;
  } else {
    return {};
  }
};

const getMultiArrayMinMax = (data, prop) => {
  let min = data[0][prop];
  let max = data[1][prop];

  for (let i = 0; i < data.length; i++) {
    let item = data[i][prop];
    if (item < min) min = item;
    else if (item > max) max = item;
  }

  return {
    min: min,
    max: max,
  };
};

const linspace = (a, b, n) => {
  if (typeof n === "undefined") n = Math.max(Math.round(b - a) + 1, 1);
  if (n < 2) {
    return n === 1 ? [a] : [];
  }
  var i,
    ret = Array(n);
  n--;
  for (i = n; i >= 0; i--) {
    ret[i] = (i * b + (n - i) * a) / n;
  }
  return ret;
};

const paintHist = (
  context,
  hists,
  enrichedFile,
  plot,
  minimum,
  color,
  maxCountPlusTenPercent,
  fill = true
) => {
  // TODO get ratio correctly, function below
  // minimum, maximum, width, scaleType
  const ratio = getAxisRatio(
    enrichedFile.channels[plot.xAxisIndex].minimum,
    enrichedFile.channels[plot.xAxisIndex].maximum,
    plot.width,
    plot.xScaleType
  );

  let ratioY = plot.height / maxCountPlusTenPercent;

  //value, scaleType, ratio, minimum, width, axis
  let firstX = getPointOnCanvasByRatio(
    hists[0].x,
    plot.xScaleType,
    ratio,
    minimum,
    plot.width,
    "x"
  );

  context.strokeStyle = color;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(firstX, plot.height);

  hists.forEach(function (hist, index) {
    let pointX, pointY;

    pointX = getPointOnCanvasByRatio(
      hist.x,
      plot.xScaleType,
      ratio,
      minimum,
      plot.width,
      "x"
    );

    pointY = getPointOnCanvasByRatio(
      hist.y,
      "lin",
      ratioY,
      0,
      plot.height,
      "y"
    );

    context.lineTo(pointX, pointY);
  });

  context.lineTo(plot.width, plot.height);
  context.closePath();
  if (fill) {
    context.fillStyle = color;
    context.fill();
  }
  context.stroke();
};

const getPointOnCanvasByRatio = (
  value,
  scaleType,
  ratio,
  minimum,
  width,
  axis
) => {
  let point;

  if (scaleType === "lin") {
    point = Math.floor(ratio * (value + Math.abs(minimum)));

    if (axis === "y") {
      point = width - point;
    }

    return point;
  } else {
    point = Math.floor(value * width);

    if (axis === "y") {
      return width - point;
    }

    return point;
  }
};

const getAxisRatio = (minimum, maximum, width, scaleType) => {
  if (scaleType === "lin") {
    return width / (maximum - minimum);
  } else {
    return width;
  }
};

function Histogram(props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  let [dragPointIndex, setDragPointIndex] = useState(null);
  let [startPointsReal, setStartPointsReal] = useState(null);
  let [nameOfGateCursorIsInside, setNameOfGateCursorIsInside] = useState(null);
  let [isInsideGate, setIsInsideGate] = useState(null);
  let [isNearPoint, setIsNearPoint] = useState(null);
  let [startCanvasPoint, setStartCanvasPoint] = useState(null);
  let [endCanvasPoint, setEndCanvasPoint] = useState(null);
  let [newPoints, setNewPoints] = useState([]);
  const [gateName, setGateName] = useState({
    name: "",
    error: false,
  });
  const [gateColor, setGateColor] = useState(
    `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );
  const plotNames = props.enrichedFile.plots.map((plt) => plt.population);

  const [
    maxCountPlusTenPercent_Value,
    setMaxCountPlusTenPercent_Value,
  ] = useState();
  const [resizing, setResizing] = useState(false);

  const onResizeDiv = useCallback(
    (w, h) => {
      if (w == props.plot.width && h == props.plot.height) return;
      if (maxCountPlusTenPercent_Value) drawLabel(maxCountPlusTenPercent_Value);
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
      }, 1500);
    },
    [props.plot]
  );

  const { ref } = useResizeDetector({
    onResize: onResizeDiv,
    skipOnMount: true,
  });

  useEffect(() => {
    if (newPoints && newPoints[0] && newPoints[1]) {
      let context = getContext("covering-canvas-" + props.plotIndex);

      if (context) {
        let context = getContext("covering-canvas-" + props.plotIndex);
        context.clearRect(0, 0, props.plot.width, props.plot.height);
        context.fillStyle = "white";

        if (props.plot?.gates) {
          props.plot?.gates?.map((gate) => {
            let points =
              gate.name == nameOfGateCursorIsInside ? newPoints : gate.points;

            drawGateLine(
              getContext("covering-canvas-" + props.plotIndex),
              props.plot,
              points
            );
          });
        }
        drawGateLine(
          getContext("covering-canvas-" + props.plotIndex),
          props.plot,
          newPoints
        );
      }
    } else {
      // let context = getContext("covering-canvas-" + props.plotIndex);
      // context.clearRect(0, 0, props.plot.width, props.plot.height);
      // context.fillStyle = "white";
    }
  }, [newPoints]);

  useEffect(() => {
    //setLocalPlot(props.plot);
    let paintHistArr = [];
    let context = getContext("canvas-" + props.plotIndex);
    context.clearRect(0, 0, props.plot.width, props.plot.height);
    context.fillStyle = "white";

    let color = props.plot.color || "#000";

    let bins;
    if (props.plot.xScaleType === "bi") {
      bins = linspace(0, 1, Math.round(props.plot.width / 4));
    } else {
      bins = linspace(
        props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
        props.enrichedFile.channels[props.plot.xAxisIndex].maximum,
        Math.round(props.plot.width / 4)
      );
    }

    // enrichedFileData will be for the control file
    let enrichedFileData = props.enrichedFile.enrichedEvents.flatMap(
      (enrichedEvent, index) => {
        if (
          props.plot.population == "All" ||
          enrichedEvent["isInGate" + props.plot.population]
        ) {
          if (props.plot.xScaleType == "lin") {
            return enrichedEvent[props.plot.xAxisIndex];
          } else {
            let logicle = props.enrichedFile.logicles[props.plot.xAxisIndex];
            return logicle.scale(enrichedEvent[props.plot.xAxisIndex]);
          }
        } else {
          return [];
        }
      }
    );

    const hists = histogram({
      data: enrichedFileData,
      bins: bins,
    });

    let countYMinMax = getMultiArrayMinMax(hists, "y");

    let maxCountPlusTenPercent = countYMinMax.max * 1.1;

    paintHistArr.push({
      context: context,
      histsObj: hists,
      enrichedFile: props.enrichedFile,
      plot: props.plot,
      minimum: props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
      color: color,
      fill: true,
    });

    // at this point, the histogram for the control file will have been draw on the canvas
    if (props.plot.overlays && props.plot.overlays.length > 0) {
      let overlayFileIndex = 0;

      for (let enrichedOverlayFile of props.enrichedOverlayFiles) {
        let overlayEnrichedFileData = enrichedOverlayFile.enrichedEvents.flatMap(
          (enrichedEvent, index) => {
            if (
              props.plot.population == "All" ||
              enrichedEvent["isInGate" + props.plot.population]
            ) {
              if (props.plot.xScaleType == "lin") {
                return enrichedEvent[props.plot.xAxisIndex];
              } else {
                let logicle =
                  props.enrichedOverlayFiles[overlayFileIndex].logicles[
                    props.plot.xAxisIndex
                  ];
                return logicle.scale(enrichedEvent[props.plot.xAxisIndex]);
              }
            } else {
              return [];
            }
          }
        );

        const overlayHists = histogram({
          data: overlayEnrichedFileData,
          bins: bins,
        });
        let countYMinMax = getMultiArrayMinMax(overlayHists, "y");
        let tempMaxCountPlusTenPercent = countYMinMax.max * 1.1;
        if (tempMaxCountPlusTenPercent > maxCountPlusTenPercent)
          maxCountPlusTenPercent = tempMaxCountPlusTenPercent;
        let overlayColor = props.plot.overlays.find(
          (x) => x.id == enrichedOverlayFile.fileId
        ).color;
        paintHistArr.push({
          context: context,
          histsObj: overlayHists,
          enrichedFile: enrichedOverlayFile,
          plot: props.plot,
          minimum: enrichedOverlayFile.channels[props.plot.xAxisIndex].minimum,
          color: overlayColor,
          fill: false,
        });
        overlayFileIndex = overlayFileIndex + 1;
      }
    }
    drawLabel(maxCountPlusTenPercent);

    for (let i = 0; i < paintHistArr.length; i++) {
      paintHist(
        paintHistArr[i].context,
        paintHistArr[i].histsObj,
        paintHistArr[i].enrichedFile,
        paintHistArr[i].plot,
        paintHistArr[i].minimum,
        paintHistArr[i].color,
        maxCountPlusTenPercent,
        paintHistArr[i].fill
      );
    }

    // if (props.plot.gate && shouldDrawGate(props.plot)) {
    //   drawGateLine(context, props.plot);
    // }

    if (areGatesOnPlot(props.plot)) {
      props.plot.gates.map((gate) => {
        drawGateLine(
          getContext("covering-canvas-" + props.plotIndex),
          props.plot,
          gate.points
        );
      });
    }
  }, [props.plot]);

  const drawGateLine = (context, plot, points) => {
    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.beginPath();

    let leftPointsOnCanvas = getPointOnCanvas(
      props.enrichedFile.channels,
      points[0],
      null,
      plot,
      props.enrichedFile.logicles
    );

    let rightPointsOnCanvas = getPointOnCanvas(
      props.enrichedFile.channels,
      points[1],
      null,
      plot,
      props.enrichedFile.logicles
    );

    context.lineWidth = 2;

    // draw the first point of the gate
    context.moveTo(leftPointsOnCanvas[0], plot.height / 2);
    context.lineTo(rightPointsOnCanvas[0], plot.height / 2);

    context.moveTo(leftPointsOnCanvas[0], plot.height / 2 - 10);
    context.lineTo(leftPointsOnCanvas[0], plot.height / 2 + 10);

    context.moveTo(rightPointsOnCanvas[0], plot.height / 2 - 10);
    context.lineTo(rightPointsOnCanvas[0], plot.height / 2 + 10);

    context.stroke();
  };

  const drawTemporaryGateLine = (context, plot) => {
    context.clearRect(0, 0, props.plot.width, props.plot.height);
    context.fillStyle = "white";

    context.strokeStyle = "pink";
    context.lineWidth = 1;
    context.beginPath();

    context.lineWidth = 2;

    context.moveTo(newPoints[0], plot.height / 2);
    context.lineTo(newPoints[1], plot.height / 2);

    context.moveTo(newPoints[0], 0);
    context.lineTo(newPoints[0], plot.height);

    context.moveTo(newPoints[1], 0);
    context.lineTo(newPoints[1], plot.height);

    context.stroke();
  };

  const drawLabel = (maxCountPlusTenPercent) => {
    let xRange = [
      props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
      props.enrichedFile.channels[props.plot.xAxisIndex].maximum,
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

    contextX.clearRect(0, 0, props.plot.width + 50, 20);

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

    const values = [
      maxCountPlusTenPercent.toFixed(0),
      (maxCountPlusTenPercent * 0.75).toFixed(0),
      (maxCountPlusTenPercent * 0.5).toFixed(0),
      (maxCountPlusTenPercent * 0.25).toFixed(0),
    ];

    let contextY = document
      .getElementById("canvas-" + props.plotIndex + "-yAxis")
      .getContext("2d");

    contextY.clearRect(0, 0, 30, props.plot.height + 20);

    for (let i = 0; i < values.length; i++) {
      const yPos = ((props.plot.height + 20) / 4) * i;
      drawText(
        {
          x: 0,
          y: yPos + 20,
          text: values[i],
          font: "10px Arial",
          fillColor: "black",
        },
        contextY
      );
    }
  };

  // const onChangeScale = (e, axis, plotIndex) => {
  //   let channeIndex = props.plot.xAxisIndex;
  //   let channelLabel = props.plot.xAxisLabel;
  //   let channelScale = e.scale;
  //   if (axis == "y") {
  //     channeIndex = props.plot.yAxisIndex;
  //     channelLabel = props.plot.yAxisLabel;
  //   }

  //   let change = {
  //     type: "ChannelIndexChange",
  //     plotIndex: plotIndex,
  //     axis: axis,
  //     axisIndex: channeIndex,
  //     axisLabel: channelLabel,
  //     scaleType: channelScale,
  //   };

  //   props.onChangeChannel(change);
  // };

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
    let newPlotType = props.plot.plotType;
    let channelLabel = "";
    let channeIndex = e.value;
    if (axis == "y") {
      if (e.value == "histogram") {
        newPlotType = "histogram";
        channelLabel = props.plot.yAxisLabel;
        channeIndex = props.plot.yAxisIndex;
      } else {
        channelLabel = channelOptions.find((x) => x.value == channeIndex).label;
        newPlotType = "scatter";
      }
    } else {
      channelLabel = channelOptions.find((x) => x.value == channeIndex).label;
    }

    change = {
      type: "ChannelIndexChange",
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

  const channelOptions = props.enrichedFile.channels.map((channel, index) => {
    return {
      value: index,
      label: channel.name,
      defaultScale: channel.defaultScale,
    };
  });

  const onAddGate = () => {
    // Here im generating a random gate, which is a triangle

    let points =
      newPoints[1] > newPoints[0]
        ? [newPoints[0], newPoints[1]]
        : [newPoints[1], newPoints[0]];

    let xRange = [
      props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
      props.enrichedFile.channels[props.plot.xAxisIndex].maximum,
    ];

    let yRange = [
      props.enrichedFile.channels[props.plot.yAxisIndex].minimum,
      props.enrichedFile.channels[props.plot.yAxisIndex].maximum,
    ];

    let gate = {
      color: gateColor,
      gateType: "histogram",
      name: gateName.name,
      points: points,
      xAxisLabel: props.plot.xAxisLabel,
      xScaleType: props.plot.xScaleType,
      xAxisIndex: props.plot.xAxisIndex,
      parent: props.plot.population,
      xAxisOriginalRanges: xRange,
      yAxisOriginalRanges: yRange,
    };

    let plot = JSON.parse(JSON.stringify(props.plot));

    let change = {
      type: "AddGate",
      plot: plot,
      newGate: gate,
      plotIndex: props.plotIndex.split("-")[1],
      fileId: props.enrichedFile.fileId,
    };

    props.onAddGate(change);
  };

  const onEditGate = () => {
    let points =
      newPoints[1] > newPoints[0]
        ? [newPoints[0], newPoints[1]]
        : [newPoints[1], newPoints[0]];

    let plot = JSON.parse(JSON.stringify(props.plot));

    let xRange = [
      props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
      props.enrichedFile.channels[props.plot.xAxisIndex].maximum,
    ];

    let yRange = [
      props.enrichedFile.channels[props.plot.yAxisIndex].minimum,
      props.enrichedFile.channels[props.plot.yAxisIndex].maximum,
    ];

    plot.gate.points = points;
    plot.gate.xAxisOriginalRanges = xRange;
    plot.gate.yAxisOriginalRanges = yRange;

    let change = {
      type: "EditGate",
      plot: plot,
      plotIndex: props.plotIndex.split("-")[1],
      fileId: props.enrichedFile.fileId,
    };

    props.onEditGate(change);
  };

  /*********************MOUSE EVENTS FOR GATES********************************/
  // const handleMouseDown = (event) => {
  //   isMouseDown = true;

  //   if (hasGate(props.plot)) {
  //     if (isOnGate(props.plot)) {
  //       console.log("setting startPoint...");
  //       setStartCanvasPoint(event.offsetX);
  //     }
  //   } else {
  //     if (props.enrichedFile.fileId === props.workspaceState.controlFileId) {
  //       console.log("setting startPoint...");
  //       setStartCanvasPoint(event.offsetX);
  //     }
  //   }

  //   // // draw histogram gate only if it is selected file
  //   // if (props.enrichedFile.fileId === props.workspaceState.controlFileId) {
  //   //   if (!props?.plot?.gate) {
  //   //     // if there is no gate
  //   //     setStartCanvasPoint(event.offsetX);
  //   //   } else if (props?.plot?.gate && isGateShowing(props?.plot)) {
  //   //     // if there is gate and same channel and scale
  //   //     setStartCanvasPoint(event.offsetX);
  //   //   }
  //   // }
  // };

  const handleMouseDown = (event) => {
    if (resizing) return;
    isMouseDown = true;
    if (hasGates()) {
      //if (!areGatesOnPlot(props.plot)) return;
      for (var i = 0; i < props.plot.gates.length; i++) {
        let gate = props.plot.gates[i];

        let gateCanvasPoints = [
          getPointOnCanvas(
            props.enrichedFile.channels,
            gate.points[0],
            null,
            // TODO make sure can only change gate when on correct channels
            // this is important, make sure they can only edit gate when the gate channels match prop channels
            props.plot,
            props.enrichedFile.logicles
          )[0],
          getPointOnCanvas(
            props.enrichedFile.channels,
            gate.points[1],
            null,
            // TODO make sure can only change gate when on correct channels
            // this is important, make sure they can only edit gate when the gate channels match prop channels
            props.plot,
            props.enrichedFile.logicles
          )[0],
        ];

        let isNearPointIndex = isMousePointNearHistPoints(
          gateCanvasPoints[0],
          gateCanvasPoints[1],
          event.offsetX
        );

        setIsNearPoint(isNearPointIndex.isNear);

        if (isNearPointIndex.isNear) {
          setNameOfGateCursorIsInside(gate.name);
          setDragPointIndex(isNearPointIndex.pointIndex);
        }

        let isInside = false;
        if (!isNearPointIndex.isNear) {
          isInside = isMousePointInsideHistPoints(
            gateCanvasPoints[0],
            gateCanvasPoints[1],
            event.offsetX
          );

          setIsInsideGate(isInside);
        }

        if (isInside) {
          setNameOfGateCursorIsInside(gate.name);
        }

        if (isInside || isNearPointIndex.isNear) {
          setStartPointsReal(
            getRealPointFromCanvasPoints(
              props.enrichedFile.channels,
              props.plot,
              [event.offsetX, event.offsetY],
              props.enrichedFile.logicles
            )
          );
          break;
        } else {
          // so its a new gate

          let point = getRealPointFromCanvasPoints(
            props.enrichedFile.channels,
            props.plot,
            [event.offsetX, null],
            props.enrichedFile.logicles
          );

          setNewPoints([point[0], point[0]]);
        }
      }
    } else {
      let point = getRealPointFromCanvasPoints(
        props.enrichedFile.channels,
        props.plot,
        [event.offsetX, null],
        props.enrichedFile.logicles
      );

      setNewPoints([point[0], point[0]]);
    }
  };

  const handleMouseMove = (event) => {
    if (!isMouseDown) return;

    let newPointsCanvas = [event.offsetX, event.offsetY];

    if (isInsideGate || isNearPoint) {
      // this code will run when a user will drag the entire polygon gate

      let moveX = getMoveValue(
        props.plot,
        props.enrichedFile.channels,
        props.enrichedFile.logicles,
        startPointsReal[0],
        newPointsCanvas[0],
        props.plot.xScaleType,
        props.plot.xAxisIndex,
        "x"
      );

      for (var i = 0; i < props.plot.gates.length; i++) {
        let gate = props.plot.gates[i];
        let points = [];
        if (gate.name == nameOfGateCursorIsInside) {
          if (typeof dragPointIndex == "number") {
            // TODO too much code repetition here
            if (dragPointIndex === 0) {
              let newGateValueRealX = getGateValue(
                props.enrichedFile.logicles,
                gate.points[0],
                props.plot.xScaleType,
                props.plot.xAxisIndex,
                props.plot.width,
                moveX
              );

              points = [newGateValueRealX, gate.points[1]];
            } else if (dragPointIndex === 1) {
              let newGateValueRealX = getGateValue(
                props.enrichedFile.logicles,
                gate.points[1],
                props.plot.xScaleType,
                props.plot.xAxisIndex,
                props.plot.width,
                moveX
              );

              points = [gate.points[0], newGateValueRealX];
            }
          } else {
            let newLeftRealValue = getGateValue(
              props.enrichedFile.logicles,
              gate.points[0],
              props.plot.xScaleType,
              props.plot.xAxisIndex,
              props.plot.width,
              moveX
            );

            let newRightRealValue = getGateValue(
              props.enrichedFile.logicles,
              gate.points[1],
              props.plot.xScaleType,
              props.plot.xAxisIndex,
              props.plot.width,
              moveX
            );

            points = [newLeftRealValue, newRightRealValue];
          }

          setNewPoints(points);
        }
      }
    } else {
      let point = getRealPointFromCanvasPoints(
        props.enrichedFile.channels,
        props.plot,
        [event.offsetX, null],
        props.enrichedFile.logicles
      );

      setNewPoints([newPoints[0], point[0]]);
    }
  };

  const handleMouseUp = (event) => {
    if (resizing) return;
    if (!isMouseDown) return;

    isMouseDown = false;

    if (isInsideGate || isNearPoint) {
      for (var i = 0; i < props.plot.gates.length; i++) {
        let gate = props.plot.gates[i];
        if (gate.name == nameOfGateCursorIsInside) {
          setIsInsideGate(false);
          setIsNearPoint(false);
          setDragPointIndex(false);
          setNameOfGateCursorIsInside(null);
          setNewPoints([]);

          if (newPoints && newPoints.length > 1) {
            gate.points = JSON.parse(JSON.stringify(newPoints));

            setNewPoints([]);

            let change = {
              type: "EditGate",
              plot: props.plot,
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
      if (newPoints && newPoints.length > 1) {
        const suggestedGateName = props.plot.xAxisLabel + " subset";
        setGateName({
          name: suggestedGateName,
        });

        setModalIsOpen(true);
      }
    }
  };

  // const handleMouseMove = (event) => {
  //   if (isMouseDown) {
  //     setEndCanvasPoint(event.offsetX);
  //   }
  // };

  // const handleCursorProperty = (event) => {
  //   if (props?.plot?.plotType === "histogram" && !props?.plot?.gate) {
  //     document.body.style.cursor =
  //       props.enrichedFile.fileId === props.workspaceState.controlFileId
  //         ? "col-resize"
  //         : "auto";
  //   }
  // };

  const hasGates = () => {
    return !!props.plot.gates;
  };

  const areGatesOnPlot = (plot) => {
    let showGate = false;
    plot?.gates?.map((gate) => {
      if (
        plot.xAxisIndex === gate.xAxisIndex &&
        plot.xScaleType === gate.xScaleType
      ) {
        showGate = true;
      }
    });

    return showGate;
  };

  const handleCursorProperty = (event) => {
    if (
      hasGates() &&
      areGatesOnPlot(props.plot)
      //&& props?.plot?.gate?.gateType === "polygon"
    ) {
      for (var i = 0; i < props.plot.gates.length; i++) {
        let gate = props.plot.gates[i];

        let gateCanvasPoints = [
          getPointOnCanvas(
            props.enrichedFile.channels,
            gate.points[0],
            null,
            // TODO make sure can only change gate when on correct channels
            // this is important, make sure they can only edit gate when the gate channels match prop channels
            props.plot,
            props.enrichedFile.logicles
          )[0],
          getPointOnCanvas(
            props.enrichedFile.channels,
            gate.points[1],
            null,
            // TODO make sure can only change gate when on correct channels
            // this is important, make sure they can only edit gate when the gate channels match prop channels
            props.plot,
            props.enrichedFile.logicles
          )[0],
        ];

        let isNear = false;
        let isInside = false;

        isInside = isMousePointInsideHistPoints(
          gateCanvasPoints[0],
          gateCanvasPoints[1],
          event.offsetX
        );

        if (!isInside) {
          isNear = isMousePointNearHistPoints(
            gateCanvasPoints[0],
            gateCanvasPoints[1],
            event.offsetX
          );
        }

        document.body.style.cursor = isNear
          ? "move"
          : isInside
          ? "grab"
          : "col-resize";

        if (isNear || isInside) {
          break;
        }
      }
    } else {
      document.body.style.cursor =
        props.enrichedFile.fileId === props.workspaceState.controlFileId &&
        !props.plot?.gate
          ? "col-resize"
          : "auto";
    }
  };

  const onSetGateName = () => {
    onAddGate();
    setModalIsOpen(false);
    setIsInsideGate(false);
    setIsNearPoint(false);
    setDragPointIndex(false);
    setNameOfGateCursorIsInside(null);
    setNewPoints([]);
  };

  const onCancelGateName = () => {
    setModalIsOpen(false);
    setStartCanvasPoint(null);
    setEndCanvasPoint(null);
  };

  const gateNameHandler = (name) => {
    setGateName({
      name: name,
      error: plotNames.includes(name) ? true : false,
    });
  };

  const handleChangeComplete = (color) => {
    setGateColor(color.hex);
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

  return (
    <>
      {" "}
      <div>
        <Modal
          isOpen={modalIsOpen}
          appElement={document.getElementById("root") || undefined}
          style={customStyles}
        >
          <div
            style={{
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
          addOverlay={props.addOverlay}
          onDeleteGate={props.onDeleteGate}
          plot={props.plot}
          enrichedFile={props.enrichedFile}
          plotIndex={props.plotIndex}
          allFileMinObj={props.allFileMinObj}
          downloadPlotAsImage={props.downloadPlotAsImage}
          canvasComponent={
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex" }}>
                {/* Y-axis */}

                <canvas
                  height={props.plot.height}
                  id={`canvas-${props.plotIndex}-yAxis`}
                  width={25}
                />
                {/* main canvas */}
                <div
                  style={{
                    position: "relative",
                    width: props.plot.width,
                    height: props.plot.height,
                  }}
                >
                  <canvas
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                    className="canvas"
                    id={`canvas-${props.plotIndex}`}
                    width={props.plot.width}
                    height={props.plot.height}
                  />
                  <canvas
                    id={`covering-canvas-${props.plotIndex}`}
                    width={props.plot.width}
                    height={props.plot.height}
                    style={{
                      border: "1px solid #32a1ce",
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

                  {/* checkbox here with selector of <br />
                  allFileIds OnClick on a fileId,
                  <br />
                  propagate back up to top level <br />
                  component and add to the State eg
                  <br />
                  plots[3].overlay.push(theSelectedFileId) */}
                </div>
              </div>
              {/* X-axis */}
              <canvas
                width={props.plot.width + 50}
                id={`canvas-${props.plotIndex}-xAxis`}
                height={20}
                style={{ marginLeft: 25 }}
              />
            </div>
          }
        />
      </div>
    </>
  );
}

export default Histogram;
