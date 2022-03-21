export const getRandomPointsOnCanvas = (width, height, number) => {
  let points = [];
  for (let i = 0; i < number; i++) {
    // I get a random point between 0 and 400 - we will pick up this point when a user clicks on the canvas
    let randomX = Math.floor(Math.random() * (width - 0 + 1)) + 0;
    let randomY = Math.floor(Math.random() * (height - 0 + 1)) + 0;
    points.push([randomX, randomY]);
  }

  return points;
};

export const getSetLinearPoints = (width, height, number) => {
  let points = [];

  points.push([10, 190]);
  points.push([100, 190]);
  points.push([100, 100]);
  points.push([10, 100]);

  return points;
};

export const getRealPointFromCanvasPoints = (
  channels,
  plot,
  points,
  logicles
) => {
  let x = points[0],
    y = points[1];

  if (x) {
    if (plot.xScaleType === "lin") {
      // if linear, convert to the "real" value
      x = getRealXAxisValueFromCanvasPointOnLinearScale(
        channels,
        plot.xAxisIndex,
        plot.width,
        x
      );
    } else {
      // if logicle, get the logicle transform, convert the canvas point to logicle (between 0 and 1), and then to real value
      x = getRealXAxisValueFromCanvasPointOnLogicleScale(logicles, plot, x);
    }
  }

  if (y) {
    if (plot.yScaleType === "lin") {
      y = getRealYAxisValueFromCanvasPointOnLinearScale(
        channels,
        plot.yAxisIndex,
        plot.height,
        y
      );
    } else {
      y = getRealYAxisValueFromCanvasPointOnLogicleScale(logicles, plot, y);
    }
  }

  return [x, y];
};

export const getPointOnCanvas = (
  channels,
  realXValue,
  realYValue,
  plot,
  logicles
) => {
  if (plot.xScaleType === "bi") {
    const logicle = logicles[plot.xAxisIndex];
    realXValue = logicle.scale(realXValue);
    realXValue = Math.floor(realXValue * plot.width);
  } else {
    realXValue = Math.floor(
      (realXValue * plot.width) / channels[plot.xAxisIndex].maximum
    );
  }

  if (realYValue) {
    if (plot.yScaleType === "bi") {
      const logicle = logicles[plot.yAxisIndex];
      realYValue = logicle.scale(realYValue);
      realYValue = plot.height - Math.floor(realYValue * plot.height);
    } else {
      realYValue =
        plot.height -
        Math.floor(
          (realYValue * plot.height) / channels[plot.yAxisIndex].maximum
        );
    }
  }

  return [realXValue, realYValue];
};

export const getRealXAxisValueFromCanvasPointOnLinearScale = (
  channels,
  xAxisIndex,
  width,
  xAxisPointOnCanvas
) => {
  const range = channels[xAxisIndex].minimum + channels[xAxisIndex].maximum;
  // get full range by adding min and max of a channel - the min could be negative
  return (range * xAxisPointOnCanvas) / width;
};

export const getRealYAxisValueFromCanvasPointOnLogicleScale = (
  logicles,
  plot,
  yAxisPointOnCanvas
) => {
  const logicle = logicles[plot.yAxisIndex];
  yAxisPointOnCanvas = plot.height - yAxisPointOnCanvas;
  yAxisPointOnCanvas = yAxisPointOnCanvas / plot.height;
  return logicle.inverse(yAxisPointOnCanvas);
};

export const getRealYAxisValueFromCanvasPointOnLinearScale = (
  channels,
  yAxisIndex,
  height,
  yAxisPointOnCanvas
) => {
  yAxisPointOnCanvas = height - yAxisPointOnCanvas;
  const range =
    Math.abs(channels[yAxisIndex].minimum) + channels[yAxisIndex].maximum;
  // get full range by adding min and max of a channel - the min could be negative
  return (range * yAxisPointOnCanvas) / height;
};

export const getRealXAxisValueFromCanvasPointOnLogicleScale = (
  logicles,
  plot,
  xAxisPointOnCanvas
) => {
  const logicle = logicles[plot.xAxisIndex]; // this is undefined
  xAxisPointOnCanvas = xAxisPointOnCanvas / plot.width;
  return logicle.inverse(xAxisPointOnCanvas);
};

export const isCursorNearAPolygonPoint = (plot, mouseRealPoints) => {
  let minimumDistanceFromPointX = 5000;
  let minimumDistanceFromPointY = 5000;
  if (plot.xScaleType === "bi") {
    minimumDistanceFromPointX =
      mouseRealPoints[0] < 0
        ? 10
        : mouseRealPoints[0] < 100
        ? 20
        : mouseRealPoints[0] < 1000
        ? 50
        : mouseRealPoints[0] < 10000
        ? 500
        : mouseRealPoints[0] < 50000
        ? 5000
        : 10000;
  }
  if (plot.yScaleType === "bi") {
    minimumDistanceFromPointY =
      mouseRealPoints[1] < 0
        ? 10
        : mouseRealPoints[1] < 100
        ? 20
        : mouseRealPoints[1] < 1000
        ? 50
        : mouseRealPoints[1] < 10000
        ? 500
        : mouseRealPoints[1] < 50000
        ? 5000
        : 10000;
  }
  for (const point of plot.gate.points) {
    const xPointTouched =
      mouseRealPoints[0] + minimumDistanceFromPointX > point[0] &&
      mouseRealPoints[0] - minimumDistanceFromPointX < point[0];
    const yPointTouched =
      mouseRealPoints[1] + minimumDistanceFromPointY > point[1] &&
      mouseRealPoints[1] - minimumDistanceFromPointY < point[1];
    if (xPointTouched && yPointTouched) {
      return {
        dragging: true,
        pointValue: point,
      };
    }
  }
  return {
    dragging: false,
    pointValue: undefined,
  };
};
