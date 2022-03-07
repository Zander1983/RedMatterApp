import { useEffect, useState, useCallback, useReducer, React } from "react";
import { isPointInPolygon, graphLine } from "./Helper";
import Modal from "react-modal";
import SideSelector from "./PlotEntities/SideSelector";
import numeral from "numeral";
import ResizeObserver from "react-resize-detector";
import { useResizeDetector } from "react-resize-detector";

export const leftPadding = 55;
export const rightPadding = 20;
export const topPadding = 40;
export const bottomPadding = 5;

const EXP_NUMS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

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
let newGatePointsCanvas = [];
let polygonComplete = false;
let resizeStartPoints;

function Plot(props) {
  const [localPlot, setLocalPlot] = useState(props.plot);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [gateName, setGateName] = useState("");

  useEffect(() => {
    setLocalPlot(props.plot);

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

    //drawLabel();

    if (localPlot.gate && shouldDrawGate(localPlot)) {
      drawGateLine(context, localPlot);
    }
  }, [localPlot, props.plot, props.enrichedFile]);

  // points are an array like [100, 150]
  const getRealPointFromCanvasPoints = (plot, points) => {
    let x = points[0],
      y = points[1];
    if (plot.xScaleType === "lin") {
      // if linear, convert to the "real" value
      x = getRealXAxisValueFromCanvasPointOnLinearScale(
        plot.xAxisIndex,
        plot.width,
        x
      );
    } else {
      // if logicle, get the logicle transform, convert the canvas point to logicle (between 0 and 1), and then to real value
      x = getRealXAxisValueFromCanvasPointOnLogicleScale(plot, x);
    }

    if (plot.yScaleType === "lin") {
      y = getRealYAxisValueFromCanvasPointOnLinearScale(
        plot.yAxisIndex,
        plot.height,
        y
      );
    } else {
      y = getRealYAxisValueFromCanvasPointOnLogicleScale(plot, y);
    }

    return [x, y];
  };

  const getRealXAxisValueFromCanvasPointOnLogicleScale = (
    plot,
    xAxisPointOnCanvas
  ) => {
    const logicle = props.enrichedFile.logicles[plot.xAxisIndex];
    xAxisPointOnCanvas = xAxisPointOnCanvas / plot.width;
    return logicle.inverse(xAxisPointOnCanvas);
  };

  const getRealYAxisValueFromCanvasPointOnLogicleScale = (
    plot,
    yAxisPointOnCanvas
  ) => {
    const logicle = props.enrichedFile.logicles[plot.yAxisIndex];
    yAxisPointOnCanvas = plot.height - yAxisPointOnCanvas;
    yAxisPointOnCanvas = yAxisPointOnCanvas / plot.height;
    return logicle.inverse(yAxisPointOnCanvas);
  };

  const getRealXAxisValueFromCanvasPointOnLinearScale = (
    xAxisIndex,
    width,
    xAxisPointOnCanvas
  ) => {
    const range =
      Math.abs(props.enrichedFile.channels[xAxisIndex].minimum) +
      props.enrichedFile.channels[xAxisIndex].maximum;
    // get full range by adding min and max of a channel - the min could be negative
    return (range * xAxisPointOnCanvas) / width;
  };

  const getRealYAxisValueFromCanvasPointOnLinearScale = (
    yAxisIndex,
    height,
    yAxisPointOnCanvas
  ) => {
    yAxisPointOnCanvas = height - yAxisPointOnCanvas;
    const range =
      Math.abs(props.enrichedFile.channels[yAxisIndex].minimum) +
      props.enrichedFile.channels[yAxisIndex].maximum;
    // get full range by adding min and max of a channel - the min could be negative
    return (range * yAxisPointOnCanvas) / height;
  };

  const getPointOnCanvas = (realXValue, realYValue, plot) => {
    if (plot.xScaleType === "bi") {
      const logicle = props.enrichedFile.logicles[plot.xAxisIndex];
      realXValue = logicle.scale(realXValue);
      realXValue = Math.floor(realXValue * plot.width);
    } else {
      realXValue = Math.floor(
        (realXValue * plot.width) /
          props.enrichedFile.channels[plot.xAxisIndex].maximum
      );
    }

    if (plot.yScaleType === "bi") {
      const logicle = props.enrichedFile.logicles[plot.yAxisIndex];
      realYValue = logicle.scale(realYValue);
      realYValue = plot.height - Math.floor(realYValue * plot.height);
    } else {
      realYValue =
        plot.height -
        Math.floor(
          (realYValue * plot.height) /
            props.enrichedFile.channels[plot.yAxisIndex].maximum
        );
    }

    return [realXValue, realYValue];
  };

  const drawGateLine = (context, plot) => {
    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.beginPath();

    let pointsOnCanvas = plot.gate.points.map((point) => {
      return getPointOnCanvas(point[0], point[1], plot);
    });

    // draw the first point of the gate
    context.moveTo(pointsOnCanvas[0][0], pointsOnCanvas[0][1]);

    pointsOnCanvas.forEach((pointOnCanvas) => {
      context.lineTo(pointOnCanvas[0], pointOnCanvas[1]);
    });

    context.closePath();
    context.stroke();
  };

  const getFormattedEvents = (enrichedEvent, plot) => {
    const events = [];

    // if population is not "All", isInGate{gateName} is true. Remember, plot.population is the same as the gate name
    if (
      plot.population === "All" ||
      enrichedEvent["isInGate" + plot.population]
    ) {
      let pointOnCanvas = getPointOnCanvas(
        enrichedEvent[plot.xAxisIndex],
        enrichedEvent[plot.yAxisIndex],
        plot
      );

      pointOnCanvas.color = enrichedEvent["color"];

      events.push(pointOnCanvas);
    }

    return events;
  };

  const onChangeScale = (e, axis, plotIndex) => {
    let channeIndex = localPlot.xAxisIndex;
    let channelLabel = localPlot.xAxisLabel;
    let channelScale = e.scale;
    if (axis == "y") {
      channeIndex = localPlot.yAxisIndex;
      channelLabel = localPlot.yAxisLabel;
    }

    let change = {
      type: "ChannelIndexChange",
      plotIndex: plotIndex,
      axis: axis,
      axisIndex: channeIndex,
      axisLabel: channelLabel,
      scaleType: channelScale,
    };

    props.onChangeChannel(change);
  };

  const onChangeChannel = (e, axis, plotIndex) => {
    let channeIndex = e.value;
    let channelLabel = channelOptions.find((x) => x.value == channeIndex).label;

    let change = {
      type: "ChannelIndexChange",
      plotIndex: plotIndex,
      axis: axis,
      axisIndex: channeIndex,
      axisLabel: channelLabel,
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
          plot.xAxisIndex,
          plot.width,
          point[0]
        );
      } else {
        // if logicle, get the logicle transform, convert the canvas point to logicle (between 0 and 1), and then to real value
        point[0] = getRealXAxisValueFromCanvasPointOnLogicleScale(
          plot,
          point[0]
        );
      }

      if (plot.yScaleType === "lin") {
        point[1] = getRealYAxisValueFromCanvasPointOnLinearScale(
          plot.yAxisIndex,
          plot.height,
          point[1]
        );
      } else {
        point[1] = getRealYAxisValueFromCanvasPointOnLogicleScale(
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
      gateName: gateName,
    };

    const randomColor = Math.floor(Math.random() * 16777215).toString(16);

    let gate = {
      color: "#" + randomColor,
      gateType: "polygon",
      // need to ask for gate name
      name: gateName,
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
              localPlot.xAxisIndex,
              localPlot.width,
              newValueCanvas
            )
          : getRealYAxisValueFromCanvasPointOnLinearScale(
              localPlot.yAxisIndex,
              localPlot.height,
              newValueCanvas
            );

      return newValueReal - startValueReal;
    }
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

  const hasGate = () => {
    return !!props.plot.gate;
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
    let context = getContext(props.plotIndex);

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

    let yLabels = getAxisLabels(
      localPlot.yScaleType,
      yRange,
      props.enrichedFile.logicles[localPlot.yAxisIndex],
      verticalBinCount
    );

    graphLine(
      {
        x1: leftPadding * localPlot.plotScale,
        y1: topPadding * localPlot.plotScale,
        x2: leftPadding * localPlot.plotScale,
        y2: (localPlot.height - bottomPadding) * localPlot.plotScale,
        ib: yRange[0],
        ie: yRange[1],
        bins: verticalBinCount,
        labels: yLabels,
      },
      context
    );

    graphLine(
      {
        x1: leftPadding * localPlot.plotScale,
        y1: topPadding * localPlot.plotScale,
        x2: (localPlot.width - rightPadding) * localPlot.plotScale,
        y2: topPadding * localPlot.plotScale,
        ib: xRange[0],
        ie: xRange[1],
        bins: horizontalBinCount,
        labels: xLabels,
      },
      context
    );
  };

  const linLabel = (num) => {
    let snum = "";
    if (num < 2) {
      snum = numeral(num.toFixed(2)).format("0.0a");
    } else {
      snum = num.toFixed(2);
      snum = numeral(snum).format("0a");
    }
    return snum;
  };

  const pot10Label = (pot10Indx) => {
    let ev = "";
    for (const l of Math.abs(pot10Indx).toString()) ev += EXP_NUMS[parseInt(l)];
    let name = "10" + ev;
    if (!name.includes("-") && pot10Indx < 0) name = "-" + name;
    return name;
  };

  const getAxisLabels = (format, linRange, logicle, binsCount) => {
    let labels = [];
    if (format === "lin") {
      const binSize = (linRange[1] - linRange[0]) / binsCount;

      for (let i = linRange[0], j = 0; j <= binsCount; i += binSize, j++)
        labels.push({
          pos: i,
          name: linLabel(i),
        });
    }
    if (format === "bi") {
      const baseline = Math.max(Math.abs(linRange[0]), Math.abs(linRange[1]));
      let pot10 = 1;
      let pot10Exp = 0;
      const fow = () => {
        pot10 *= 10;
        pot10Exp++;
      };
      const back = () => {
        pot10 /= 10;
        pot10Exp--;
      };
      const add = (x, p) => {
        if (
          (x >= linRange[0] && x <= linRange[1]) ||
          (x <= linRange[0] && x >= linRange[1])
        ) {
          labels.push({
            pos: x,
            name: pot10Label(p),
          });
        }
      };
      while (pot10 <= baseline) fow();
      while (pot10 >= 1) {
        add(pot10, pot10Exp);
        add(-pot10, -pot10Exp);
        back();
      }

      let newPos = labels.map((e) => logicle.scale(e.pos));

      newPos = newPos.map((e) => (linRange[1] - linRange[0]) * e + linRange[0]);
      labels = labels.map((e, i) => {
        e.pos = newPos[i];
        return e;
      });
      labels = labels.sort((a, b) => a.pos - b.pos);

      const distTolerance = 0.03;
      let lastAdded = null;
      labels = labels.filter((e, i) => {
        if (i === 0) {
          lastAdded = i;
          return true;
        }
        if (
          (e.pos - labels[lastAdded].pos) /
            (Math.max(linRange[0], linRange[1]) -
              Math.min(linRange[0], linRange[1])) >=
          distTolerance
        ) {
          lastAdded = i;
          return true;
        }
        return false;
      });
    }
    return labels;
  };

  const getBins = (width, height, scale) => {
    let verticalBinCount = 1;
    let horizontalBinCount = 1;

    if (scale === 0 || width === 0) {
      verticalBinCount = 1;
      horizontalBinCount = 1;
      return;
    }
    horizontalBinCount = width === undefined ? 2 : Math.round(width / 60);
    verticalBinCount = height === undefined ? 2 : Math.round(height / 60);
    horizontalBinCount = Math.max(2, horizontalBinCount);
    verticalBinCount = Math.max(2, verticalBinCount);

    return [verticalBinCount, horizontalBinCount];
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
      startPointsReal = getRealPointFromCanvasPoints(localPlot, [
        event.offsetX,
        event.offsetY,
      ]);
    } else {
    }
  };

  const handleMouseUp = (event) => {
    isMouseDown = false;
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
          )
        ) {
          setModalIsOpen(true);
          polygonComplete = true;
        }
      });

      if (!polygonComplete) {
        newGatePointsCanvas.push([event.offsetX, event.offsetY]);
      }

      redraw();
    }
  };

  const handleMouseMove = (event) => {
    if (isMouseDown && hasGate()) {
      let newPointsCanvas = [event.offsetX, event.offsetY];

      let newPointsReal = getRealPointFromCanvasPoints(localPlot, [
        event.offsetX,
        event.offsetY,
      ]);

      let isInside = isPointInPolygon(
        newPointsReal[0],
        newPointsReal[1],
        localPlot.gate.points
      );
      if (isInside) {
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

        localPlot.gate.points = props.plot.gate.points.map((point) => {
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
        });

        // IMPORTANT - reste start points
        startPointsReal = getRealPointFromCanvasPoints(localPlot, [
          event.offsetX,
          event.offsetY,
        ]);

        setLocalPlot(JSON.parse(JSON.stringify(localPlot)));
      }
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
      <div
        key={props.plotIndex}
        style={
          {
            // padding: "20px",
          }
        }
      >
        <Modal isOpen={modalIsOpen} style={customStyles}>
          <label>
            Gate Name:
            <input type="text" onChange={(e) => setGateName(e.target.value)} />
          </label>
          <button onClick={() => onSetGateName()}>Ok</button>
          <button onClick={() => onCancelGateName()}>Cancel</button>
        </Modal>
        <SideSelector
          channelOptions={channelOptions}
          onChange={onChangeChannel}
          onChangeScale={onChangeScale}
          plot={localPlot}
          plotIndex={props.plotIndex}
          handleResizeMouseDown={handleResizeMouseDown}
          handleResizeMouseMove={handleResizeMouseMove}
          handleResizeMouseUp={handleResizeMouseUp}
          canvasComponent={
            <div
              style={{
                border: "1px solid #32a1ce",
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
                  handleMouseMove(nativeEvent);
                }}
                onMouseUp={(e) => {
                  let nativeEvent = e.nativeEvent;
                  handleMouseUp(nativeEvent);
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
