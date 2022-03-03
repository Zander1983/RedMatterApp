import { getRandomPointsOnCanvas, getSetLinearPoints } from "./PlotHelper";
import Dropdown from "react-dropdown";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { isPointInPolygon } from "./Helper";
import { ConstantNodeDependencies } from "mathjs";

const getContext = (plot, plotIndex) => {
  const canvas = document.getElementById("canvas-" + plotIndex);
  if (canvas) {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    return { context };
  } else {
    return {};
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

function Plot(props) {
  const [localPlot, setLocalPlot] = useState(props.plot);

  useEffect(() => {
    console.log("in useEffect, props.plotIndex is ", props.plotIndex);
    console.log("in useEffect, localPlot is now ", localPlot);

    const { context } = getContext(localPlot, props.plotIndex);
    // props.workspaceState.plots.map((plot, plotIndex) => {
    // console.log( props.enrichedFile);
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

    if (localPlot.gate && shouldDrawGate(localPlot)) {
      console.log("DRAWING GATE  WHICH IS ", localPlot.gate);
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
    xAxisPointOnCanvas = xAxisPointOnCanvas / plot.height;

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

  const onChangeChannel = (event) => {
    console.log("1. send the change back to the parent", event);

    let change = {
      type: "ChannelIndexChange",
      // TODO need to get the plot here
      plotIndex: 0,
      channel: "x",
      value: event.value,
    };
    props.onChangeChannel(change);
  };

  const onAddGate = (plot, plotIndex) => {
    let points = getRandomPointsOnCanvas(plot.width, plot.height, 4);

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
    };

    props.onAddGate(change);
  };

  const onEditGate = (plot, plotIndex) => {
    //let points = plot.gate.points;

    let newPoints = getRandomPointsOnCanvas(plot.width, plot.height, 1)[0];

    newPoints = getRealPointFromCanvasPoints(newPoints, plot);

    plot.gate.points[1] = newPoints;

    let change = {
      type: "EditGate",
      plot: plot,
      plotIndex: plotIndex,
      points: [],
    };

    props.onEditGate(change);
  };

  const channelOptions = props.enrichedFile.channels.map((channel, index) => {
    return channel.name;
  });

  const handleMouseDown = (event) => {
    isMouseDown = true;

    startPointsReal = getRealPointFromCanvasPoints(localPlot, [
      event.offsetX,
      event.offsetY,
    ]);
  };

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

  const handleMouseMove = (event) => {
    if (isMouseDown) {
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

        setLocalPlot(JSON.parse(JSON.stringify(localPlot)));
      }
    }
  };

  const handleMouseUp = (event) => {
    isMouseDown = false;

    let change = {
      type: "EditGate",
      plot: localPlot,
      plotIndex: props.plotIndex.split("-")[1],
      points: JSON.parse(JSON.stringify(localPlot.gate.points)),
    };

    props.onEditGate(change);
  };

  return (
    <>
      {" "}
      <div key={props.plotIndex}>
        {localPlot.xAxis} | {localPlot.xScaleType}
        <Dropdown
          options={channelOptions}
          onChange={onChangeChannel}
          placeholder="Select a new Y channel"
        />
        <canvas
          style={{ border: "thick solid #32a1ce" }}
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
        <button
          onClick={() => onEditGate(localPlot, props.plotIndex.split("-")[1])}
        >
          Edit Gate
        </button>
        <button
          disabled={localPlot.gate}
          onClick={() => onAddGate(localPlot, props.plotIndex.split("-")[1])}
        >
          New Gate
        </button>
        {props.yAxis} | {localPlot.yScaleType}
        <Dropdown
          options={channelOptions}
          onChange={onChangeChannel}
          placeholder="Select a new X channel"
        />
      </div>
    </>
  );
}

export default Plot;
