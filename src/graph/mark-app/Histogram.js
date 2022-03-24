import { histogram } from "./HistogramHelper";
import { useEffect, useState } from "react";
import SideSelector from "./PlotEntities/SideSelector";
import Modal from "react-modal";
import {
  getRealPointFromCanvasPoints,
  getPointOnCanvas,
  getRealXAxisValueFromCanvasPointOnLinearScale,
  getRealYAxisValueFromCanvasPointOnLinearScale,
  getRealXAxisValueFromCanvasPointOnLogicleScale,
  getRealYAxisValueFromCanvasPointOnLogicleScale,
} from "./PlotHelper";
import { CompactPicker } from "react-color";
import { drawText, getAxisLabels, getBins } from "./Helper";
import { getWorkspace } from "graph/utils/workspace";

let isMouseDown = false;
let dragPointIndex = false;

const hasGate = (plot) => {
  return !!plot.gate;
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

const getContext = (canvasId) => {
  // const findBy = "canvas-" + plot.plotIndex
  const canvas = document.getElementById(canvasId);
  if (canvas) {
    const context = canvas.getContext("2d");
    return context;
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

const paintHist = (
  context,
  hists,
  enrichedFile,
  plot,
  minimum,
  color,
  maxCountPlusTenPercent
) => {
  // TODO get ratio correctly, function below
  // minimum, maximum, width, scaleType
  const ratio = getAxisRatio(
    enrichedFile.channels[plot.xAxisIndex].minimum,
    enrichedFile.channels[plot.xAxisIndex].maximum,
    plot.width,
    plot.xScaleType
  );

  let ratioY = plot.height / maxCountPlusTenPercent;

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
  const [modalIsOpen, setModalIsOpen] = useState(false);

  let [startCanvasPoint, setStartCanvasPoint] = useState(null);
  let [endCanvasPoint, setEndCanvasPoint] = useState(null);
  const [gateName, setGateName] = useState({
    name: "",
    error: false,
  });
  const [gateColor, setGateColor] = useState(
    `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );
  const plotNames = props.enrichedFile.plots.map((plt) => plt.population);

  useEffect(() => {
    if (startCanvasPoint && endCanvasPoint) {
      let context = getContext("covering-canvas-" + props.plotIndex);

      if (context) {
        drawTemporaryGateLine(context, props.plot);
      }
    } else {
      let context = getContext("covering-canvas-" + props.plotIndex);
      context.clearRect(0, 0, props.plot.width, props.plot.height);
      context.fillStyle = "white";
    }
  }, [startCanvasPoint, endCanvasPoint]);

  useEffect(() => {
    console.log(
      "in useEffect and plotIndex is ",
      props.plotIndex,
      " and props.plot is ",
      props.plot
    );

    //setLocalPlot(props.plot);
    let context = getContext("canvas-" + props.plotIndex);
    context.clearRect(0, 0, props.plot.width, props.plot.height);
    context.fillStyle = "white";

    let color = props.plot.color || "#000";

    let data = props.enrichedFile.enrichedEvents.flatMap(
      (enrichedEvent, index) => {
        if (
          props.plot.population == "All" ||
          enrichedEvent["isInGate" + props.plot.population]
        ) {
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

    let countYMinMax = getMultiArrayMinMax(hists, "y");

    let maxCountPlusTenPercent = countYMinMax.max * 1.1;
    drawLabel(maxCountPlusTenPercent);

    paintHist(
      context,
      hists,
      props.enrichedFile,
      props.plot,
      props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
      color,
      maxCountPlusTenPercent
    );

    if (props.plot.gate && shouldDrawGate(props.plot)) {
      drawGateLine(context, props.plot);
    }
  }, [props.plot]);

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

  const drawTemporaryGateLine = (context, plot) => {
    context.clearRect(0, 0, props.plot.width, props.plot.height);
    context.fillStyle = "white";

    context.strokeStyle = "pink";
    context.lineWidth = 1;
    context.beginPath();

    context.lineWidth = 2;

    context.moveTo(startCanvasPoint, plot.height / 2);
    context.lineTo(endCanvasPoint, plot.height / 2);

    context.moveTo(startCanvasPoint, 0);
    context.lineTo(startCanvasPoint, plot.height);

    context.moveTo(endCanvasPoint, 0);
    context.lineTo(endCanvasPoint, plot.height);

    context.stroke();
  };

  const drawLabel = (maxCountPlusTenPercent) => {
    let xRange = [
      props.enrichedFile.channels[props.plot.xAxisIndex].minimum,
      props.enrichedFile.channels[props.plot.xAxisIndex].maximum,
    ];
    const xDivisor =
      props.enrichedFile.channels[props.plot.xAxisIndex].maximum / 200;

    let yRange = [
      props.enrichedFile.channels[props.plot.yAxisIndex].minimum,
      props.enrichedFile.channels[props.plot.yAxisIndex].maximum,
    ];
    const yDivisor =
      props.enrichedFile.channels[props.plot.yAxisIndex].maximum / 200;

    let [horizontalBinCount, verticalBinCount] = getBins(
      props.plot.width,
      props.plot.height,
      props.plot.plotScale
    );

    let xLabels = getAxisLabels(
      props.plot.xScaleType,
      xRange,
      props.enrichedFile.logicles[props.plot.xAxisIndex],
      horizontalBinCount
    );
    let contextX = document
      .getElementById("canvas-" + props.plotIndex + "-xAxis")
      .getContext("2d");

    contextX.clearRect(0, 0, props.plot.width + 20, 20);
    for (let i = 0; i < xLabels.length; i++) {
      let tooClose = false;
      if (
        i > 0 &&
        xLabels[i].pos / xDivisor - xLabels[i - 1].pos / xDivisor < 15
      ) {
        tooClose = true;
      }
      let xPos =
        xLabels[i].pos / xDivisor + 20 > props.plot.width
          ? props.plot.width - 2
          : xLabels[i].pos / xDivisor + 20;
      // to avoid overlapping between the labels
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

    const values = [
      maxCountPlusTenPercent.toFixed(0),
      (maxCountPlusTenPercent * 0.75).toFixed(0),
      (maxCountPlusTenPercent * 0.5).toFixed(0),
      (maxCountPlusTenPercent * 0.25).toFixed(0),
    ];

    let contextY = document
      .getElementById("canvas-" + props.plotIndex + "-yAxis")
      .getContext("2d");

    contextY.clearRect(0, 0, 20, props.plot.height + 20);

    for (let i = 0; i < values.length; i++) {
      const yPos = ((props.plot.height + 20) / 4) * i;
      drawText(
        {
          x: 0,
          y: yPos + 20,
          text: values[i],
          font: "10px Arial",
          fillColor: "black",
        },
        contextY
      );
    }
  };

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

  const onAddGate = () => {
    // Here im generating a random gate, which is a triangle

    let startPoint = getRealPointFromCanvasPoints(
      props.enrichedFile.channels,
      props.plot,
      [startCanvasPoint, null],
      props.enrichedFile.logicles
    )[0];
    let endPoint = getRealPointFromCanvasPoints(
      props.enrichedFile.channels,
      props.plot,
      [endCanvasPoint, null],
      props.enrichedFile.logicles
    )[0];

    let points =
      endPoint > startPoint ? [startPoint, endPoint] : [endPoint, startPoint];
    let gate = {
      color: gateColor,
      gateType: "histogram",
      name: gateName.name,
      points: points,
      xAxisLabel: props.plot.xAxisIndex,
      xScaleType: props.plot.xScaleType,
      xAxisIndex: props.plot.xAxisIndex,
      parent: props.plot.population,
    };

    let plot = JSON.parse(JSON.stringify(props.plot));
    plot.gate = gate;

    let change = {
      type: "AddGate",
      plot: plot,
      plotIndex: props.plotIndex.split("-")[1],
      fileId: props.enrichedFile.fileId,
    };

    props.onAddGate(change);
  };

  const onEditGate = () => {
    let startPoint = getRealPointFromCanvasPoints(
      props.enrichedFile.channels,
      props.plot,
      [startCanvasPoint, null],
      props.enrichedFile.logicles
    )[0];
    let endPoint = getRealPointFromCanvasPoints(
      props.enrichedFile.channels,
      props.plot,
      [endCanvasPoint, null],
      props.enrichedFile.logicles
    )[0];

    let points =
      endPoint > startPoint ? [startPoint, endPoint] : [endPoint, startPoint];

    let plot = JSON.parse(JSON.stringify(props.plot));
    plot.gate.points = points;

    console.log("in onEditGate is plot.gate.points ", plot.gate.points);

    let change = {
      type: "EditGate",
      plot: plot,
      plotIndex: props.plotIndex.split("-")[1],
      fileId: props.enrichedFile.fileId,
    };

    props.onEditGate(change);
  };

  /*********************MOUSE EVENTS FOR GATES********************************/
  const handleMouseDown = (event) => {
    isMouseDown = true;
    if (!hasGate(props.plot)) {
      // draw histogram gate only if it is selected file
      props.enrichedFile.fileId === getWorkspace().selectedFile &&
        setStartCanvasPoint(event.offsetX);
    } else {
    }

  };

  const handleMouseUp = (event) => {
    isMouseDown = false;
    if (hasGate(props.plot)) {
      onEditGate();
      setStartCanvasPoint(null);
      setEndCanvasPoint(null);
    } else {
      // draw histogram gate only if it is selected file
      props.enrichedFile.fileId === getWorkspace().selectedFile &&
        setModalIsOpen(true);

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
      setEndCanvasPoint(event.offsetX);
    }
  };

  const handleCursorProperty = (event) => {
    if (props?.plot?.plotType === "histogram") {
      document.body.style.cursor =
        props.enrichedFile.fileId === getWorkspace().selectedFile
          ? "text"
          : "context-menu";
    }
  };

  const onSetGateName = () => {
    onAddGate();
    setModalIsOpen(false);
    setStartCanvasPoint(null);
    setEndCanvasPoint(null);
  };

  const onCancelGateName = () => {
    setModalIsOpen(false);
    setStartCanvasPoint(null);
    setEndCanvasPoint(null);
  };

  const gateNameHandler = (name) => {
    setGateName({
      name: name,
      error: plotNames.includes(name) ? true : false,
    });
  };

  const handleChangeComplete = (color) => {
    setGateColor(color.hex);
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
      <div>
        <Modal
          isOpen={modalIsOpen}
          appElement={document.getElementById("root") || undefined}
          style={customStyles}
        >
          <div
            style={{
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
          plot={props.plot}
          plotIndex={props.plotIndex}
          canvasComponent={
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex" }}>
                {/* Y-axis */}
                <canvas
                  height={props.plot.height}
                  id={`canvas-${props.plotIndex}-yAxis`}
                  width={25}
                  style={{
                    background: "#FAFAFA",
                  }}
                />
                {/* main canvas */}
                <div
                  style={{
                    position: "relative",
                    width: props.plot.width,
                    height: props.plot.height,
                  }}
                >
                  <canvas
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                    className="canvas"
                    id={`canvas-${props.plotIndex}`}
                    width={props.plot.width}
                    height={props.plot.height}
                  />
                  <canvas
                    id={`covering-canvas-${props.plotIndex}`}
                    width={props.plot.width}
                    height={props.plot.height}
                    style={{
                      border: "1px solid #32a1ce",
                      position: "absolute",
                      left: 0,
                      top: 0,
                      // display: "block" : "none",
                    }}
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
                width={props.plot.width + 20}
                id={`canvas-${props.plotIndex}-xAxis`}
                height={20}
                style={{ background: "#FAFAFA" }}
              />
            </div>
          }
        />
      </div>
    </>
  );
}

export default Histogram;
