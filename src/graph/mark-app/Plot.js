import { getRandomPointsOnCanvas, getSetLinearPoints } from "./PlotHelper";
import Dropdown from "react-dropdown";
import { useEffect } from "react";

const getContext = (plot, plotIndex) => {
  // const findBy = "canvas-" + plot.plotIndex
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

function Plot(props) {
  console.log("PLot >> props is ", props);

  useEffect(() => {
    console.log("in UseEffecy of plots.....");
    const { context } = getContext(props.plot, props.plotIndex);
    // props.workspaceState.plots.map((plot, plotIndex) => {
    // console.log( props.enrichedFile);
    props.enrichedFile.enrichedEvents.forEach((enrichedEvent, index) => {
      if (context) {
        getFormattedEvents(enrichedEvent, props.plot).forEach(
          (formattedEvent) => {
            context.fillStyle = formattedEvent.color;
            context.fillRect(formattedEvent[0], formattedEvent[1], 2, 2);
          }
        );
      }
    });

    if (props.plot.gate && shouldDrawGate(props.plot)) {
      drawGateLine(context, props.plot);
    }
  });

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
    plot,
    xAxisPointOnCanvas
  ) => {
    const range =
      Math.abs(props.enrichedFile.channels[plot.xAxisIndex].minimum) +
      props.enrichedFile.channels[plot.xAxisIndex].maximum;
    // get full range by adding min and max of a channel - the min could be negative
    return (range * xAxisPointOnCanvas) / plot.width;
  };

  const getRealYAxisValueFromCanvasPointOnLinearScale = (
    plot,
    yAxisPointOnCanvas
  ) => {
    yAxisPointOnCanvas = plot.height - yAxisPointOnCanvas;
    const range =
      Math.abs(props.enrichedFile.channels[plot.yAxisIndex].minimum) +
      props.enrichedFile.channels[plot.yAxisIndex].maximum;
    // get full range by adding min and max of a channel - the min could be negative
    return (range * yAxisPointOnCanvas) / plot.height;
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

    //enrichedFile.forEach((event) => {
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
    //});
    return events;
  };

  const onChangeChannel = (event) => {
    console.log("1. send the change back to the parent changed");
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
      if (props.plot.xScaleType === "lin") {
        // if linear, convert to the "real" value
        point[0] = getRealXAxisValueFromCanvasPointOnLinearScale(
          plot,
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
          plot,
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
    console.log(
      "1. send the change back to the parent, plot, plotIndex is ",
      plot,
      plotIndex
    );

    //let points = plot.gate.points;

    let newPoints = getRandomPointsOnCanvas(plot.width, plot.height, 1)[0];

    console.log("newPoints are : ", newPoints);

    // the scale the gate is created on is important hear - linear very different to logicle
    if (props.plot.xScaleType === "lin") {
      // if linear, convert to the "real" value
      newPoints[0] = getRealXAxisValueFromCanvasPointOnLinearScale(
        plot,
        newPoints[0]
      );
    } else {
      // if logicle, get the logicle transform, convert the canvas point to logicle (between 0 and 1), and then to real value
      newPoints[0] = getRealXAxisValueFromCanvasPointOnLogicleScale(
        plot,
        newPoints[0]
      );
    }

    if (plot.yScaleType === "lin") {
      newPoints[1] = getRealYAxisValueFromCanvasPointOnLinearScale(
        plot,
        newPoints[1]
      );
    } else {
      newPoints[1] = getRealYAxisValueFromCanvasPointOnLogicleScale(
        plot,
        newPoints[1]
      );
    }

    console.log("newPoints are NOW: ", newPoints);

    console.log("plot.gate.points is ", plot.gate.points);

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
    //console.log("Chanel: ", channel);
    return channel.name;
  });

  //console.log(" ==== channelOptions === ");
  //console.log(channelOptions);

  return (
    <>
      {" "}
      <div key={props.plotIndex}>
        {props.plot.xAxis} | {props.plot.xScaleType}
        <Dropdown
          options={channelOptions}
          onChange={onChangeChannel}
          placeholder="Select a new Y channel"
        />
        <canvas
          className="canvas"
          id={`canvas-${props.plotIndex}`}
          width={props.plot.width}
          height={props.plot.height}
        />
        <button
          onClick={() => onEditGate(props.plot, props.plotIndex.split("-")[1])}
        >
          Edit Gate
        </button>
        <button
          disabled={props.plot.gate}
          onClick={() => onAddGate(props.plot, props.plotIndex.split("-")[1])}
        >
          New Gate
        </button>
        {props.yAxis} | {props.plot.yScaleType}
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
