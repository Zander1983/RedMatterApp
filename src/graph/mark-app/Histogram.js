import { histogram } from "./HistogramHelper";
import { useEffect } from "react";
import SideSelector from "./PlotEntities/SideSelector";

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
  let firstX = getPointOnCanvas(
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

    pointX = getPointOnCanvas(
      hist.x,
      plot.xScaleType,
      ratio,
      minimum,
      plot.width,
      "x"
    );

    pointY = getPointOnCanvas(hist.y, "lin", ratioY, 0, plot.height, "y");

    context.lineTo(pointX, pointY);
  });

  context.lineTo(plot.width, plot.height);
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.stroke();
};

const getPointOnCanvas = (value, scaleType, ratio, minimum, width, axis) => {
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
  useEffect(() => {
    let { context } = getContext(props.plot, props.plotIndex);
    let color = "#000";

    let data = props.enrichedFile.enrichedEvents.flatMap(
      (enrichedEvent, index) => {
        if (
          props.plot.population == "All" ||
          enrichedEvent["isInGate" + props.plot.population]
        ) {
          // TODO no need to keep setting the color like this
          color = enrichedEvent["color"];

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

    let bins;
    if (props.plot.xScaleType === "bi") {
      bins = linspace(0, 1, props.plot.width);
    } else {
      bins = linspace(
        props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
        props.enrichedFile.channels[props.plot.xAxisIndex].maximum,
        props.plot.width
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
      props.plot,
      props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
      color
    );
  });

  const onChangeScale = (e, axis, plotIndex) => {
    let channeIndex = props.plot.xAxisIndex;
    let channelLabel = props.plot.xAxisLabel;
    let channelScale = e.scale;
    if (axis == "y") {
      channeIndex = props.plot.yAxisIndex;
      channelLabel = props.plot.yAxisLabel;
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

  return (
    <>
      {" "}
      <div>
        <SideSelector
          channelOptions={channelOptions}
          onChange={onChangeChannel}
          onChangeScale={onChangeScale}
          plot={props.plot}
          plotIndex={props.plotIndex}
          canvasComponent={
            <canvas
              className="canvas"
              id={`canvas-${props.plotIndex}`}
              width={props.plot.width}
              height={props.plot.height}
            />
          }
        />
      </div>
    </>
  );
}

export default Histogram;
