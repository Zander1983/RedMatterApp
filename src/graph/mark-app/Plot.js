import { useEffect, useState, useRef } from "react";
import { isPointInPolygon, drawText, getAxisLabels, getBins } from "./Helper";

import {
  getRealPointFromCanvasPoints,
  getPointOnCanvas,
  getRealXAxisValueFromCanvasPointOnLinearScale,
  getRealYAxisValueFromCanvasPointOnLinearScale,
  getRealXAxisValueFromCanvasPointOnLogicleScale,
  getRealYAxisValueFromCanvasPointOnLogicleScale,
  // isCursorNearAPolygonPoint
} from "./PlotHelper";
import Modal from "react-modal";
import SideSelector from "./PlotEntities/SideSelector";
import { CompactPicker } from "react-color";
import { getWorkspace } from "graph/utils/workspace";

export const leftPadding = 55;
export const rightPadding = 20;
export const topPadding = 40;
export const bottomPadding = 5;

const getContext = (plotIndex) => {
  const canvas = document.getElementById("canvas-" + plotIndex);
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
let startPointsReal;
let dragPointIndex = false;
let newGatePointsCanvas = [];
let polygonComplete = false;
let resizeStartPoints;

// useful function to trace what props reacting is updating
// use with useTraceUpdate({...props, localPlot}); in function Plot.js(){}
function useTraceUpdate(props) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce(
      (lookup, [key, value]) => {
        if (prev.current[key] !== value) {
          lookup[key] = [prev.current[key], value];
        }
        return lookup;
      },
      {}
    );
    if (Object.keys(changedProps).length > 0) {
      console.log("Changed props:", Object.keys(changedProps));
    }
    prev.current = props;
  });
}

function Plot(props) {
  const [localPlot, setLocalPlot] = useState(props.plot);

  //useTraceUpdate({ ...props, localPlot });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [gateName, setGateName] = useState({
    name: "",
    error: false,
  });
  const [gateColor, setGateColor] = useState(
    `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );
  const plotNames = props.enrichedFile.plots.map((plt) => plt.population);

  useEffect(() => {
    setLocalPlot(props.plot);
  }, [props.plot]);

  useEffect(() => {
    console.log(
      ">>>>> in the second useEffect where heavy calculation for plotIndex ",
      props.plotIndex
    );
    const context = getContext(props.plotIndex);
    context.clearRect(0, 0, localPlot.width, localPlot.height);
    context.fillStyle = "white";

    props.enrichedFile.enrichedEvents.forEach((enrichedEvent, index) => {
      if (context) {
        getFormattedEvents(enrichedEvent, localPlot).forEach(
          (formattedEvent) => {
            context.fillStyle = formattedEvent.color;
            context.fillRect(formattedEvent[0], formattedEvent[1], 1, 1);
          }
        );
      }
    });

    drawLabel();

    if (localPlot.gate && shouldDrawGate(localPlot)) {
      drawGateLine(context, localPlot);
    }
  }, [localPlot]);

  const drawGateLine = (context, plot) => {
    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.beginPath();

    let pointsOnCanvas = plot.gate.points.map((point) => {
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
      context.fillStyle = "red";
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
    let points = newGatePointsCanvas;

    // Here im generating a random gate, which is a triangle
    points.forEach((point) => {
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

    let change = {
      type: "AddGate",
      plot: plot,
      plotIndex: plotIndex,
      points: points,
      gateName: gateName.name,
    };

    let gate = {
      color: gateColor,
      gateType: "polygon",
      // need to ask for gate name
      name: gateName.name,
      points: points,
      xAxisLabel: plot.xAxisIndex,
      yAxisLabel: plot.yAxisLabel,
      xScaleType: plot.xScaleType,
      yScaleType: plot.yScaleType,
      xAxisIndex: plot.xAxisIndex,
      yAxisIndex: plot.yAxisIndex,
      xAxisOriginalRanges: [0, 262144],
      yAxisOriginalRanges: [0, 262144],
      parent: plot.population,
    };

    plot.gate = gate;

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
    let context = getContext(props.plotIndex);
    //context.fillStyle = "rgba(100,100,100,0.5)";
    context.strokeStyle = "#df4b26";
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
    const xDivisor =
      props.enrichedFile.channels[localPlot.xAxisIndex].maximum / 200;

    let yRange = [
      props.enrichedFile.channels[localPlot.yAxisIndex].minimum,
      props.enrichedFile.channels[localPlot.yAxisIndex].maximum,
    ];
    const yDivisor =
      props.enrichedFile.channels[localPlot.yAxisIndex].maximum / 200;

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

    contextX.clearRect(0, 0, localPlot.width + 20, 20);
    for (let i = 0; i < xLabels.length; i++) {
      let tooClose = false;
      if (
        i > 0 &&
        xLabels[i].pos / xDivisor - xLabels[i - 1].pos / xDivisor < 15
      ) {
        tooClose = true;
      }
      let xPos =
        xLabels[i].pos / xDivisor + 20 > localPlot.width
          ? localPlot.width - 2
          : xLabels[i].pos / xDivisor + 20;
      if (tooClose) {
        xPos += 8;
      }
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

    contextY.clearRect(0, 0, 20, localPlot.height + 20);
    for (let i = 0; i < yLabels.length; i++) {
      let yPos =
        yLabels[i].pos / yDivisor + 20 > localPlot.height
          ? localPlot.height
          : yLabels[i].pos / yDivisor + 20;
      drawText(
        {
          x: 0,
          y: localPlot.height + 20 - yPos,
          text: yLabels[i].name,
          font: "10px Arial",
          fillColor: "black",
        },
        contextY
      );
    }
  };

  const drawPoints = () => {
    let context = getContext(props.plotIndex);

    context.strokeStyle = "#df4b26";
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
    isMouseDown = true;

    if (hasGate()) {
      // check if on point
      // convert real points to canvas points and check if within 5 points of canvas points
      let gateCanvasPoints = localPlot.gate.points.map((point) => {
        console.log("point is ", point);
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

      gateCanvasPoints.find((point, index) => {
        let isNear =
          point[0] + 5 >= event.offsetX &&
          point[0] - 5 <= event.offsetX &&
          point[1] + 5 >= event.offsetY &&
          point[1] - 5 <= event.offsetY;
        if (isNear) dragPointIndex = index;
        return isNear;
      });

      startPointsReal = getRealPointFromCanvasPoints(
        props.enrichedFile.channels,
        localPlot,
        [event.offsetX, event.offsetY],
        props.enrichedFile.logicles
      );
    } else {
    }
  };

  const handleMouseUp = (event) => {
    isMouseDown = false;
    dragPointIndex = false;
    if (hasGate()) {
      let change = {
        type: "EditGate",
        plot: localPlot,
        plotIndex: props.plotIndex.split("-")[1],
        points: JSON.parse(JSON.stringify(localPlot.gate.points)),
        fileId: props.enrichedFile.fileId,
      };

      props.onEditGate(change);
    } else {
      // so its a new gate
      // only if the file is controlled file then it is allowed to create a new gate
      if (props.enrichedFile.fileId === getWorkspace().selectedFile) {
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
    if (isMouseDown && hasGate()) {
      let newPointsCanvas = [event.offsetX, event.offsetY];

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

      if (isInside || typeof dragPointIndex == "number") {
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

        setLocalPlot({
          ...localPlot,
          gate: { ...localPlot.gate, points: points },
        });

        // IMPORTANT - reset start points
        startPointsReal = getRealPointFromCanvasPoints(
          props.enrichedFile.channels,
          localPlot,
          [event.offsetX, event.offsetY],
          props.enrichedFile.logicles
        );
      }
    }
  };

  const handleCursorProperty = (event) => {
    if (hasGate() && props?.plot?.gate?.gateType === "polygon") {
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

      // const isDraggingGatePoint = isCursorNearAPolygonPoint(localPlot, newPointsReal);
      // document.body.style.cursor = isDraggingGatePoint?.dragging ? 'nesw-resize' :  isInside ? 'grab' : 'context-menu';
      document.body.style.cursor = isInside ? "grab" : "context-menu";
    } else {
      document.body.style.cursor =
        props.enrichedFile.fileId === getWorkspace().selectedFile
          ? "crosshair"
          : "context-menu";
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
                style={{
                  width: 200,
                  marginLeft: 5,
                  border: "none",
                  borderRadius: 5,
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
                style={{ marginRight: 5 }}
                disabled={gateName.error || !gateName.name}
                onClick={() => onSetGateName()}
              >
                Ok
              </button>
              <button onClick={() => onCancelGateName()}>Cancel</button>
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
          canvasComponent={
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex" }}>
                {/* Y-axis */}
                <canvas
                  height={localPlot.height}
                  id={`canvas-${props.plotIndex}-yAxis`}
                  width={25}
                  style={{
                    background: "#FAFAFA",
                  }}
                />
                {/* main canvas */}
                <div
                  style={{
                    border: "1px solid #32a1ce",
                    width: `${localPlot.width}px`,
                    height: `${localPlot.height}px`,
                  }}
                  // ref={ref}
                >
                  <canvas
                    className="canvas"
                    id={`canvas-${props.plotIndex}`}
                    width={localPlot.width}
                    height={localPlot.height}
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
                      document.body.style.cursor = "context-menu";
                    }}
                  />
                </div>
              </div>
              {/* X-axis */}
              <canvas
                width={localPlot.width + 20}
                id={`canvas-${props.plotIndex}-xAxis`}
                height={20}
                style={{
                  background: "#FAFAFA",
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
