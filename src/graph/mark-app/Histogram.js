import { histogram } from "./HistogramHelper";
import { useEffect, useState } from "react";
import SideSelector from "./PlotEntities/SideSelector";
import { getRealPointFromCanvasPoints, getPointOnCanvas } from "./PlotHelper";

let startXPointsReal;
let isMouseDown = false;

const hasGate = (localPlot) => {
  return !!localPlot.gate;
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

const paintHist = (context, hists, enrichedFile, plot, minimum, color) => {
  let maxCount = 0;

  // TODO get ratio correctly, function below
  // minimum, maximum, width, scaleType
  const ratio = getAxisRatio(
    enrichedFile.channels[plot.xAxisIndex].minimum,
    enrichedFile.channels[plot.xAxisIndex].maximum,
    plot.width,
    plot.xScaleType
  );

  let countYMinMax = getMultiArrayMinMax(hists, "y");

  if (countYMinMax.max * 1.1 > maxCount) {
    maxCount = countYMinMax.max * 1.1;
  }

  hists.maxCount = countYMinMax.max;

  let ratioY = plot.height / maxCount;

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
  context.fillStyle = color;
  context.fill();
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
  console.log("props.plotIndex is ", props.plotIndex);
  const [localPlot, setLocalPlot] = useState(props.plot);
  // let [newXPointsReal, setNewXPointsReal] = useState(0);

  // useEffect(() => {
  //   console.log("in the 2nd useEffect, here you could rewrite the canvas");
  // }, [newXPointsReal]);

  useEffect(() => {
    setLocalPlot(localPlot);
    let { context } = getContext(localPlot, props.plotIndex);
    let color = "#000";

    let data = props.enrichedFile.enrichedEvents.flatMap(
      (enrichedEvent, index) => {
        if (
          localPlot.population == "All" ||
          enrichedEvent["isInGate" + localPlot.population]
        ) {
          // TODO no need to keep setting the color like this
          color = enrichedEvent["color"];

          if (localPlot.xScaleType == "lin") {
            return enrichedEvent[localPlot.xAxisIndex];
          } else {
            let logicle = props.enrichedFile.logicles[localPlot.xAxisIndex];
            return logicle.scale(enrichedEvent[localPlot.xAxisIndex]);
          }
        } else {
          return [];
        }
      }
    );

    let bins;
    if (localPlot.xScaleType === "bi") {
      bins = linspace(0, 1, localPlot.width);
    } else {
      bins = linspace(
        props.enrichedFile.channels[localPlot.xAxisIndex].minimum,
        props.enrichedFile.channels[localPlot.xAxisIndex].maximum,
        localPlot.width
      );
    }

    const hists = histogram({
      data: data,
      bins: bins,
    });

    paintHist(
      context,
      hists,
      props.enrichedFile,
      localPlot,
      props.enrichedFile.channels[localPlot.xAxisIndex].minimum,
      color
    );

    if (localPlot.gate && shouldDrawGate(localPlot)) {
      drawGateLine(context, localPlot);
    }
  }, [localPlot]);

  const drawGateLine = (context, plot) => {
    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.beginPath();

    let leftPointsOnCanvas = getPointOnCanvas(
      props.enrichedFile.channels,
      plot.gate.points[0],
      null,
      plot,
      props.enrichedFile.logicles
    );
    let rightPointsOnCanvas = getPointOnCanvas(
      props.enrichedFile.channels,
      plot.gate.points[1],
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

  /*********************MOUSE EVENTS FOR GATES********************************/
  const handleMouseDown = (event) => {
    isMouseDown = true;

    console.log(
      "in handleMouseDown hasGate(localPlot) is ",
      hasGate(localPlot)
    );
    if (!hasGate(localPlot)) {
      startXPointsReal = getRealPointFromCanvasPoints(
        props.enrichedFile.channels,
        localPlot,
        [event.offsetX, event.offsetY],
        props.enrichedFile.logicles
      )[0];

      console.log(">>>>>>> startXPointsReal is ", startXPointsReal);
    } else {
    }
  };

  const handleMouseUp = (event) => {
    isMouseDown = false;
    if (hasGate(localPlot)) {
      let change = {
        type: "EditGate",
        plot: localPlot,
        plotIndex: props.plotIndex.split("-")[1],
        points: JSON.parse(JSON.stringify(localPlot.gate.points)),
        fileId: props.enrichedFile.fileId,
      };

      props.onEditGate(change);
    } else {
      // // so its a new gate
      // newGatePointsCanvas.forEach((newGatePointCanvas) => {
      //   if (
      //     inRange(
      //       event.offsetX,
      //       newGatePointCanvas[0] - 10,
      //       newGatePointCanvas[0] + 10
      //     ) &&
      //     inRange(
      //       event.offsetY,
      //       newGatePointCanvas[1] - 10,
      //       newGatePointCanvas[1] + 10
      //     )
      //   ) {
      //     setModalIsOpen(true);
      //     polygonComplete = true;
      //   }
      // });
      // if (!polygonComplete) {
      //   newGatePointsCanvas.push([event.offsetX, event.offsetY]);
      // }
      // redraw();
    }
  };

  const handleMouseMove = (event) => {
    if (isMouseDown) {
      let newPointsCanvas = [event.offsetX, event.offsetY];

      let newXPointsReal = getRealPointFromCanvasPoints(
        props.enrichedFile.channels,
        localPlot,
        [event.offsetX, event.offsetY],
        props.enrichedFile.logicles
      )[0];

      //setNewXPointsReal();

      // localPlot.gate.points = localPlot.gate.points = [
      //   startXPointsReal,
      //   newXPointsReal,
      // ];

      localPlot.gate.points = localPlot.gate.points = [
        startXPointsReal,
        newXPointsReal,
      ];

      setLocalPlot(JSON.parse(JSON.stringify(localPlot)));

      // IMPORTANT - reste start points
      startXPointsReal = getRealPointFromCanvasPoints(
        props.enrichedFile.channels,
        localPlot,
        [event.offsetX, event.offsetY],
        props.enrichedFile.logicles
      )[0];

      console.log(">>>>>>. startXPointsReal is ", startXPointsReal);
    }
  };

  const handleCursorProperty = (event) => {
    if (props?.plot?.plotType === "histogram") {
      document.body.style.cursor = "text";
    }
  };

  return (
    <>
      {" "}
      <div>
        <SideSelector
          channelOptions={channelOptions}
          onChange={onChangeChannel}
          onChangeScale={onChangeScale}
          plot={localPlot}
          plotIndex={props.plotIndex}
          canvasComponent={
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
          }
        />
      </div>
    </>
  );
}

export default Histogram;
