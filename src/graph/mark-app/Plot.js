import { getRandomPointsOnCanvas, getSetLinearPoints } from "./PlotHelper";
import Dropdown from "react-dropdown";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { isPointInPolygon } from "./Helper";

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

let isMouseDown = false;
let startPoints;

function Plot(props) {
  console.log("PLot >> props is ", props);

  const [localPlot, setLocalPlot] = useState(props.plot);

  useEffect(() => {
    const { context } = getContext(localPlot, props.plotIndex);
    // props.workspaceState.plots.map((plot, plotIndex) => {
    // console.log( props.enrichedFile);
    props.enrichedFile.enrichedEvents.forEach((enrichedEvent, index) => {
      if (context) {
        getFormattedEvents(enrichedEvent, localPlot).forEach(
          (formattedEvent) => {
            context.fillStyle = formattedEvent.color;
            context.fillRect(formattedEvent[0], formattedEvent[1], 2, 2);
          }
        );
      }
    });

    if (localPlot.gate && shouldDrawGate(localPlot)) {
      drawGateLine(context, localPlot);
    }
  }, [localPlot]);

  // points are an array like [100, 150]
  const getRealPointFromCanvasPoints = (plot, points) => {
    let x = points[0],
      y = points[1];
    if (plot.xScaleType === "lin") {
      // if linear, convert to the "real" value
      x = getRealXAxisValueFromCanvasPointOnLinearScale(plot, x);
    } else {
      // if logicle, get the logicle transform, convert the canvas point to logicle (between 0 and 1), and then to real value
      x = getRealXAxisValueFromCanvasPointOnLogicleScale(plot, x);
    }

    if (plot.yScaleType === "lin") {
      y = getRealYAxisValueFromCanvasPointOnLinearScale(plot, y);
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

    startPoints = getRealPointFromCanvasPoints(localPlot, [
      event.offsetX,
      event.offsetY,
    ]);
    // //added code here
    // console.log(event);
    // this.setState(
    //   {
    //     isDown: true,
    //     previousPointX: event.offsetX,
    //     previousPointY: event.offsetY,
    //   },
    //   () => {
    //     const canvas = ReactDOM.findDOMNode(this.refs.canvas);
    //     var x = event.offsetX;
    //     var y = event.offsetY;
    //     var ctx = canvas.getContext("2d");
    //     console.log(x, y);
    //     ctx.moveTo(x, y);
    //     ctx.lineTo(x + 1, y + 1);
    //     ctx.stroke();
    //   }
    // );
  };

  const handleMouseMove = (event) => {
    if (isMouseDown) {
      var x = event.offsetX;
      var y = event.offsetY;

      let newPoints = getRealPointFromCanvasPoints(localPlot, [x, y]);

      //
      // console.log("localPlot.gate.points is ", localPlot.gate.points);

      let isInide = isPointInPolygon(
        newPoints[0],
        newPoints[1],
        localPlot.gate.points
      );

      if (isInide) {
        let moveX = newPoints[0] - startPoints[0];
        let moveY = newPoints[1] - startPoints[1];

        localPlot.gate.points = props.plot.gate.points.map((point) => {
          let x = point[0] + moveX;
          let y = point[1] + moveY;

          return [x, y];
        });

        setLocalPlot(JSON.parse(JSON.stringify(localPlot)));

        // let change = {
        //   type: "EditGate",
        //   plot: localPlot,
        //   // TODO get correctly
        //   plotIndex: 0,
        //   points: localPlot.gate.points,
        // };

        // props.onEditGate(change);
      }
    }
  };

  const handleMouseUp = (event) => {
    isMouseDown = false;

    let change = {
      type: "EditGate",
      plot: localPlot,
      // TODO get correctly
      plotIndex: 0,
      points: localPlot.gate.points,
    };

    props.onEditGate(change);

    // this.setState({
    //   isDown: false,
    // });
    // //if(this.state.isDown){
    // const canvas = ReactDOM.findDOMNode(this.refs.canvas);
    // var x = event.offsetX;
    // var y = event.offsetY;
    // var ctx = canvas.getContext("2d");
    // ctx.moveTo(this.state.previousPointX, this.state.previousPointY);
    // ctx.lineTo(x, y);
    // ctx.stroke();
    // ctx.closePath();
    //}
  };
  // componentDidMount() {
  //     const canvas = ReactDOM.findDOMNode(this.refs.canvas);
  //     const ctx = canvas.getContext("2d");
  //     ctx.fillStyle = 'rgb(200,255,255)';
  //     ctx.fillRect(0, 0, 640, 425);
  // }

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
