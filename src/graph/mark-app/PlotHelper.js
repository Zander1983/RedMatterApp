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
  let canvasXValue, canvasYValue;
  if (plot.xScaleType === "bi") {
    //console.log(">>> logicles[plot.xAxisIndex] is ", logicles[plot.xAxisIndex]);
    const logicle = logicles[plot.xAxisIndex];
    realXValue = logicle.scale(realXValue);
    canvasXValue = Math.floor(realXValue * plot.width);
  } else {
    let range = getRealRange(
      channels[plot.xAxisIndex].minimum,
      channels[plot.xAxisIndex].maximum
    );

    let realValueInRange =
      realXValue + Math.abs(channels[plot.xAxisIndex].minimum);

    if (channels[plot.xAxisIndex].minimum > 0) {
      realValueInRange =
        realXValue - Math.abs(channels[plot.xAxisIndex].minimum);
    }

    canvasXValue = (plot.width * realValueInRange) / range;
  }

  if (!isNaN(realYValue)) {
    if (plot.yScaleType === "bi") {
      const logicle = logicles[plot.yAxisIndex];
      realYValue = logicle.scale(realYValue);
      canvasYValue = plot.height - Math.floor(realYValue * plot.height);
    } else {
      let range = getRealRange(
        channels[plot.yAxisIndex].minimum,
        channels[plot.yAxisIndex].maximum
      );

      let realValueInRange =
        realYValue + Math.abs(channels[plot.yAxisIndex].minimum);

      if (channels[plot.yAxisIndex].minimum > 0) {
        realValueInRange =
          realYValue - Math.abs(channels[plot.yAxisIndex].minimum);
      }

      canvasYValue = plot.height - (plot.height * realValueInRange) / range;
    }
  }

  return [Math.round(canvasXValue), Math.round(canvasYValue)];
};

export const getRealRange = (minimum, maximum) => {
  return minimum > 0 ? maximum - minimum : maximum + Math.abs(minimum);
};

export const getMoveValue = (
  plot,
  channels,
  logicles,
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
      axis == "y" ? plot.height - newValueCanvas : newValueCanvas;

    let logicle = logicles[axisIndex];
    let startValueScaled = logicle.scale(startValueReal);

    let startValueCanvas =
      axis == "x"
        ? startValueScaled * plot.width
        : startValueScaled * plot.height;

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
            channels,
            plot.xAxisIndex,
            plot.width,
            newValueCanvas
          )
        : getRealYAxisValueFromCanvasPointOnLinearScale(
            channels,
            plot.yAxisIndex,
            plot.height,
            newValueCanvas
          );

    return newValueReal - startValueReal;
  }
};

export const getGateValue = (
  logicles,
  value,
  scale,
  axisIndex,
  length,
  moveBy
) => {
  if (scale == "bi") {
    let logicle = logicles[axisIndex];
    let canvasX = logicle.scale(value) * length;

    let newValueCanvas = canvasX + moveBy;
    let newValueLogicle = newValueCanvas / length;
    let newValueReal = logicle.inverse(newValueLogicle);
    return Math.round(newValueReal);
  } else {
    return Math.round(value + moveBy);
  }
};

export const getRealXAxisValueFromCanvasPointOnLinearScale = (
  channels,
  xAxisIndex,
  width,
  xAxisPointOnCanvas
) => {
  const range = getRealRange(
    channels[xAxisIndex].minimum,
    channels[xAxisIndex].maximum
  );
  // get full range by adding min and max of a channel - the min could be negative
  let value = (range * xAxisPointOnCanvas) / width;
  value = value + channels[xAxisIndex].minimum;
  return value;
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

  const range = getRealRange(
    channels[yAxisIndex].minimum,
    channels[yAxisIndex].maximum
  );

  // get full range by adding min and max of a channel - the min could be negative
  let value = (range * yAxisPointOnCanvas) / height;
  value = value + channels[yAxisIndex].minimum;
  return value;
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

export const isMousePointNearScatterPoints = (
  gateCanvasPoints,
  mousePointX,
  mousePointY
) => {
  let near = false;
  let pointIndex = false;
  gateCanvasPoints.find((point, index) => {
    let isNear =
      point[0] + 5 >= mousePointX &&
      point[0] - 5 <= mousePointX &&
      point[1] + 5 >= mousePointY &&
      point[1] - 5 <= mousePointY;
    if (isNear) {
      near = isNear;
      pointIndex = index;
    }
    return isNear;
  });
  return {
    isNear: near,
    pointIndex: pointIndex,
  };
};

export const isMousePointNearHistPoints = (
  leftPoint,
  rightPoint,
  mousePoint
) => {
  let isNear = false;
  let pointIndex = false;

  if (mousePoint >= leftPoint - 3 && mousePoint <= leftPoint + 3) {
    return {
      isNear: true,
      pointIndex: 0,
    };
  }

  if (mousePoint >= rightPoint - 3 && mousePoint <= rightPoint + 3) {
    return {
      isNear: true,
      pointIndex: 0,
    };
  }
  return { isNear: isNear, pointIndex: pointIndex };
};

export const isMousePointInsideHistPoints = (
  leftPoint,
  rightPoint,
  mousePoint
) => {
  let isInside = mousePoint >= leftPoint + 5 && mousePoint <= rightPoint - 5;
  return isInside;
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
