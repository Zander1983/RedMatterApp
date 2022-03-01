import { histogram } from "./HistogramHelper";
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

const paintHist = (context, hists, plot, minimum, color) => {
  let maxCount = 0;

  // TODO get ratio correctly, function below
  // minimum, maximum, width, scaleType
  const ratio = getAxisRatio(0, 262144, plot.width, plot.xScaleType);

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

    pointY = getPointOnCanvas(
      hist.y,
      plot.xScaleType,
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
  console.log("props is ", props);

  useEffect(() => {
    let { context } = getContext(props.plot, props.plotIndex);

    let data = props.enrichedFile.enrichedEvents.map((enrichedEvent, index) => {
      // need to deal with logicle() here
      return enrichedEvent[props.plot.xAxisIndex];
    });

    let bins;
    if (props.plot.xScaleType === "bi") {
      bins = linspace(0, 1, props.plot.width);
    } else {
      // TODO replace with real min max
      bins = linspace(0, 262144, props.plot.width);
    }

    const hists = histogram({
      data: data,
      bins: bins,
    });

    // TODO replace 0 with minimum
    // correctly get the color
    paintHist(context, hists, props.plot, 0, "#d5b34b");
  });

  return (
    <>
      {" "}
      <div>
        in histogram
        <canvas
          className="canvas"
          id={`canvas-${props.plotIndex}`}
          width={props.plot.width}
          height={props.plot.height}
        />
      </div>
    </>
  );
}

export default Histogram;
