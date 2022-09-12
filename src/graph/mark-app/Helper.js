import MarkLogicle from "./logicleMark";
import numeral from "numeral";

const minLabelPadding = 30;

export const DEFAULT_PLOT_TYPE = "scatter";
const DEFAULT_X_AXIS_LABEL = "FSC-A";
const DEFAULT_Y_AXIS_LABEL = "SSC-A";
const DEFAULT_PLOT_WIDTH = 200;
const DEFAULT_PLOT_HEIGHT = 200;
const DEFAULT_X_SCALE_TYPE = "lin";
const DEFAULT_Y_SCALE_TYPE = "lin";
const EXP_NUMS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

export const DSC_SORT = "dsc";
export const ASC_SORT = "asc";

export const superAlgorithm = (
  OriginalFiles,
  OriginalWorkspaceState,
  calculateMedianAndMean = false
) => {
  let controlOriginalFile = OriginalFiles.find(
    (file) => file.id == OriginalWorkspaceState.controlFileId
  );

  let Files = OriginalFiles;
  let WorkspaceState = OriginalWorkspaceState;
  let controlFileId = WorkspaceState.controlFileId;
  let gateNames = [];

  let plots = getPlotsForFileFromWorkspaceState(null, WorkspaceState);

  plots.forEach((plot) => {
    plot?.gates?.map((gate, index) => {
      gateNames.push(gate.name);
    });
  });

  for (let fileIndex = 0; fileIndex < Files.length; fileIndex++) {
    let file = Files[fileIndex];
    let gateStatsObj = {};
    let eventsInsideGate = [];
    // let plots = WorkspaceState.files[file.id]
    //   ? WorkspaceState.files[file.id].plots
    //   : WorkspaceState.files[controlFileId].plots;

    plots = getPlotsForFileFromWorkspaceState(file.id, WorkspaceState);

    for (let plotIndex = 0; plotIndex < plots.length; plotIndex++) {
      if (plots[plotIndex].gates) {
        plots[plotIndex].gates.forEach((gate) => {
          eventsInsideGate[gate.name] = [];
        });
      }
    }

    plots.forEach((plot) => {
      plot?.gates?.map((gate, index) => {
        if (gate?.name !== undefined) {
          gateStatsObj[gate.name] = {
            count: 0,
            parent: plot.population,
          };
        }

        if (gate && gate["xScaleType"] === "bi") {
          let xLogicle = new MarkLogicle(
            gate.xAxisOriginalRanges[0],
            gate.xAxisOriginalRanges[1]
          );
          gate.xLogicle = xLogicle;
        }
        if (gate && gate["yScaleType"] === "bi") {
          let yLogicle = new MarkLogicle(
            gate.yAxisOriginalRanges[0],
            gate.yAxisOriginalRanges[1]
          );
          gate.yLogicle = yLogicle;
        }
      });
    });

    //eventIndex < Files[fileIndex].events

    //let adjustedEvents = Files[fileIndex].events.map((event, eventIndex) => {});

    let enrichedEvent;
    let isInGate;
    let plot;
    let gates;
    let event;

    for (
      let eventIndex = 0;
      eventIndex < Files[fileIndex].events.length;
      //eventIndex < 1;
      eventIndex++
    ) {
      event = Files[fileIndex].events[eventIndex];
      event["color"] = "#000";
      gateNames.forEach((gateName) => (event["isInGate" + gateName] = false));
      // event["isInGate" + gate.name] = true;

      // if the file has its own plots, use that, otherwise use control file plots
      for (let plotIndex = 0; plotIndex < plots.length; plotIndex++) {
        plot = plots[plotIndex];
        gates = plot.gates;
        if (!event["color"]) {
          event["color"] = "#000";
        }

        if (gates) {
          gates.map((gate, index) => {
            if (
              plot.population == "All" ||
              event["isInGate" + plot.population] == true
            ) {
              let pointX = event[gate["xAxisIndex"]];

              let pointY = event[gate["yAxisIndex"]];
              let tranformedPoints = [];

              // if a gate was made on an axis with the scale logicle, we need to convert it with logicle transform
              // same for the event point
              // a gate can be created on a linear scale on 1 axis, and logicle on the other
              if (gate["xScaleType"] === "bi") {
                pointX = gate.xLogicle.scale(pointX);

                if (gate.gateType == "polygon") {
                  tranformedPoints = gate.points.map((point) => {
                    return [gate.xLogicle.scale(point[0]), point[1]];
                  });
                } else {
                  // so histogram
                  tranformedPoints = [
                    gate.xLogicle.scale(gate.points[0]),
                    gate.xLogicle.scale(gate.points[1]),
                  ];
                }
              } else {
                if (gate.gateType == "polygon") {
                  tranformedPoints = gate.points.map((point) => {
                    return [point[0], point[1]];
                  });
                } else {
                  tranformedPoints = [gate.points[0], gate.points[1]];
                }
              }

              if (gate["yScaleType"] === "bi") {
                pointY = gate.yLogicle.scale(pointY);
                // TODO maybe we should just store logicle axis points in logile i.e. between 0 and 1?
                // either way this inefficient here - the logicle transform of the gate point needs only to be done once
                tranformedPoints = tranformedPoints.map((point) => {
                  return [point[0], gate.yLogicle.scale(point[1])];
                });
              }

              if (gate.gateType == "polygon") {
                tranformedPoints = tranformedPoints.map((point) => {
                  return { x: point[0], y: point[1] };
                });
              }

              if (gate.gateType == "polygon") {
                isInGate = pointInsidePolygon(
                  {
                    x: pointX,
                    y: pointY,
                  },
                  tranformedPoints
                );
              } else {
                // so its histogram
                isInGate = isInHistGate(
                  tranformedPoints[0],
                  tranformedPoints[1],
                  pointX
                );
              }

              if (isInGate) {
                if (calculateMedianAndMean) {
                  eventsInsideGate[gate.name].push(event.filter(Number));
                }

                event["color"] = gate["color"];
                event["isInGate" + gate.name] = true;

                !gateStatsObj[gate.name] && !gateStatsObj[gate.name].count
                  ? (gateStatsObj[gate.name].count = 1)
                  : gateStatsObj[gate.name].count++;
              } else {
                event["isInGate" + gate.name] = false;
              }
            }
          });
        }
      }
    }

    const gateKeys = Object.keys(gateStatsObj);

    let gateStats = [];
    gateKeys.forEach((gateKey, index) => {
      const gateName = gateKey.replace("_count", "");

      let parentGate = gateStatsObj[gateKey].parent;

      const divider =
        parentGate == "All"
          ? Files[fileIndex].events.length
          : gateStatsObj[parentGate].count;

      let percentage = ((gateStatsObj[gateKey].count * 100) / divider).toFixed(
        2
      );

      if (isNaN(percentage)) {
        percentage = Number(0).toFixed(2);
      }

      if (calculateMedianAndMean) {
        gateStats.push({
          gateName: gateName,
          count: gateStatsObj[gateKey],
          percentage: percentage,
          eventsInsideGate: eventsInsideGate[gateName],
        });
      } else {
        gateStats.push({
          gateName: gateName,
          count: gateStatsObj[gateKey],
          percentage: percentage,
        });
      }
    });

    Files[fileIndex].gateStats = gateStats;
  }
  return Files;
};

export const compensate = (dataE, scale, channels, origEvents) => {
  // let compenatedEvents = [];
  // for (let paramIndex = 0; paramIndex < dataE[0].length; paramIndex++) {
  //   let hasSpilloverForParam = paramNamesHasSpillover[paramIndex].hasSpillover;
  //   if (hasSpilloverForParam) {
  //     origEvents[e][paramIndex] = dataE[paramIndex];
  //     let matrixSpilloverIndex = scale.matrixSpilloverIndexes[paramIndex];
  //     let compensated = scale.adjustSpillover({
  //       eventValues: dataE,
  //       scaleType: channels[paramIndex].display,
  //       matrixSpilloverIndex: matrixSpilloverIndex,
  //       channelMaximums: channelMaximums,
  //     });
  //     // let compensated = cachedEvent[paramIndex];
  //     compenatedEvents.push({
  //       index: paramIndex,
  //       value: compensated,
  //     });
  //     // dataE[paramIndex] = compensated;
  //   }
  // }
  // return { compenatedEvents: compenatedEvents, origEvents: origEvents };
};

export const loopAndCompensate = (
  events,
  paramNamesHasSpillover,
  scale,
  channels,
  channelMaximums,
  origEvents
) => {
  let compenatedEvents = [];
  for (let e = 0; e < events.length; e++) {
    for (let paramIndex = 0; paramIndex < events[0].length; paramIndex++) {
      let hasSpilloverForParam =
        paramNamesHasSpillover[paramIndex].hasSpillover;
      if (hasSpilloverForParam) {
        let matrixSpilloverIndex = scale.matrixSpilloverIndexes[paramIndex];
        let compensated = scale.adjustSpillover({
          eventValues: origEvents[e],
          scaleType: channels[paramIndex].display,
          matrixSpilloverIndex: matrixSpilloverIndex,
          channelMaximums: channelMaximums,
        });
        // let compensated = cachedEvent[paramIndex];
        compenatedEvents.push({
          index: paramIndex,
          value: compensated,
        });
        // dataE[paramIndex] = compensated;
      }
    }

    compenatedEvents.forEach(
      (compenatedEvent) =>
        (events[e][compenatedEvent.index] = compenatedEvent.value)
    );
  }
};

export const getMedian = (values) => {
  values.sort(function (a, b) {
    return a - b;
  });
  let half = Math.floor(values.length / 2);

  if (values.length % 2) {
    return values[half];
  }
  return (values[half - 1] + values[half]) / 2.0;
};

export function isPointInPolygon(latitude, longitude, polygon) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new TypeError("Invalid latitude or longitude. Numbers are expected");
  } else if (!polygon || !Array.isArray(polygon)) {
    throw new TypeError("Invalid polygon. Array with locations expected");
  } else if (polygon.length === 0) {
    throw new TypeError("Invalid polygon. Non-empty Array expected");
  }

  const x = latitude;
  const y = longitude;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

export const pointInsidePolygon = ({ x, y }, polygon) => {
  const onSegment = (p, q, r) => {
    if (
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) &&
      q.y >= Math.min(p.y, r.y)
    )
      return true;
    return false;
  };

  const orientation = (p, q, r) => {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if (val === 0) return 0; // colinear

    return val > 0 ? 1 : 2; // clock or counterclock wise
  };

  const segmentIntersection = (p1, p2, q1, q2) => {
    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);

    // General case
    if (o1 !== o2 && o3 !== o4) return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
  };
  const p1 = {
    x: 1e30,
    y: y,
  };
  const q1 = {
    x: x,
    y: y,
  };
  let hits = 0;
  const pl = polygon.length;
  for (let i = 0; i < pl; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % pl];
    const p2 = {
      x: a.x,
      y: a.y,
    };
    const q2 = {
      x: b.x,
      y: b.y,
    };
    if (segmentIntersection(p1, p2, q1, q2)) {
      if (orientation(p2, q1, q2) === 0) return onSegment(p2, q1, q2);
      hits++;
    }
  }
  if (hits & 1) return true;
  return false;
};

let isInHistGate = (gateStartPoint, gateEndpoint, value) => {
  if (value > gateStartPoint && value < gateEndpoint) {
    return true;
  }

  return false;
};

export const graphLine = (params, ctx) => {
  let xpts = Math.round(
    (Math.max(params.x1, params.x2) - Math.min(params.x1, params.x2)) /
      params.bins
  );

  let ypts = Math.round(
    (Math.max(params.y1, params.y2) - Math.min(params.y1, params.y2)) /
      params.bins
  );

  drawSegment(
    {
      x1: params.x1,
      y1: params.y1,
      x2: params.x2,
      y2: params.y2,
      lineWidth: 2,
    },
    ctx
  );

  if (params.x1 !== params.x2 && params.y1 !== params.y2) {
    throw new Error("Plot line is not vertical nor horizontal");
  }

  const orientation = params.x1 === params.x2 ? "v" : "h";
  const bins =
    params.bins !== undefined ? params.bins : orientation === "v" ? ypts : xpts;
  const p1 = orientation === "v" ? params.y1 : params.x1;
  const p2 = orientation === "v" ? params.y2 : params.x2;
  const op1 = orientation === "v" ? params.x1 : params.y1;
  const op2 = orientation === "v" ? params.x2 : params.y2;

  let counter = bins;
  let interval = Math.max(p1, p2) - Math.min(p1, p2);

  if (params.labels !== undefined) {
    let min = orientation === "h" ? params.ib : params.ib;
    let max = orientation === "h" ? params.ie : params.ie;
    let lastLabelPos = null;

    if (orientation === "v") {
      for (const label of params.labels) {
        let pos = (label.pos - min) / (max - min);
        const y = Math.abs(p1 - p2) * (1 - pos) + Math.min(p1, p2);
        if (lastLabelPos !== null && lastLabelPos < y) {
          continue;
        }
        drawSegment(
          {
            x1: op1 - 14,
            y1: y,
            x2: op1 + 14,
            y2: y,
            lineWidth: 1,
          },
          ctx
        );
        drawText(
          {
            x: op1 - 90,
            y: y + 8,
            text: label.name,
            font: "20px Arial",
            fillColor: "black",
          },
          ctx
        );
        lastLabelPos = y - minLabelPadding;
      }
    } else {
      for (const label of params.labels) {
        let pos = (label.pos - min) / (max - min);
        const x = Math.abs(p1 - p2) * pos + Math.min(p1, p2);
        if (lastLabelPos !== null && lastLabelPos > x) {
          continue;
        }
        drawSegment(
          {
            x1: x,
            y1: op2 - 14,
            x2: x,
            y2: op2 + 14,
            lineWidth: 1,
          },
          ctx
        );
        drawText(
          {
            font: "20px Arial",
            fillColor: "black",
            text: label.name,
            x: x - 24,
            y: op2 + 40,
          },
          ctx
        );
        lastLabelPos = x + minLabelPadding;
      }
    }
    return;
  }

  if (bins === 0 || bins === null || bins === undefined) {
    throw Error("Bins are unset or set as an invalid amount");
  }

  interval /= bins;

  if (interval === 0) {
    throw Error("Width and height are unset");
  }

  if (orientation === "v") {
    for (let y = Math.min(p1, p2); y <= Math.max(p1, p2); y += interval) {
      drawSegment(
        {
          x1: op1 - 14,
          y1: y,
          x2: op1 + 14,
          y2: y,
          lineWidth: 1,
        },
        ctx
      );

      let textWrite = numToLabelText(
        (Math.abs(params.ie - params.ib) / ypts) * counter + params.ib
      );

      drawText(
        {
          x: op1 - 90,
          y: y + 8,
          text: textWrite,
          font: "20px Arial",
          fillColor: "black",
        },
        ctx
      );
      counter--;
    }
  } else {
    for (let x = Math.max(p1, p2); x >= Math.min(p1, p2); x -= interval) {
      drawSegment(
        {
          x1: x,
          y1: op2 - 14,
          x2: x,
          y2: op2 + 14,
          lineWidth: 1,
        },
        ctx
      );
      let textWrite = numToLabelText(
        (Math.abs(params.ie - params.ib) / xpts) * counter + params.ib
      );

      drawText(
        {
          font: "20px Arial",
          fillColor: "black",
          text: textWrite,
          x: x - 24,
          y: op2 + 40,
        },
        ctx
      );
      counter--;
    }
  }
};

export const formatEnrichedFiles = (enrichedFiles, workspaceState) => {
  // let controlFileId = workspaceState.controlFileId;
  let controlFile = enrichedFiles[0];

  return enrichedFiles.map((file) => {
    let logicles = file.channels.map((channel, index) => {
      return new MarkLogicle(
        controlFile.channels[index].minimum,
        controlFile.channels[index].maximum
      );
    });

    let channels = file.channels.map((channel, index) => {
      return {
        minimum: controlFile.channels[index].minimum,
        maximum: controlFile.channels[index].maximum,
        name: channel.label || channel.value || channel.name,
        defaultScale: channel.display || channel.defaultScale,
      };
    });

    let controlFileId = workspaceState.controlFileId;

    let plots = getPlotsForFileFromWorkspaceState(file.fileId, workspaceState);

    // let plots = workspaceState.files[file.fileId]
    //   ? JSON.parse(JSON.stringify(workspaceState.files[file.fileId].plots))
    //   : JSON.parse(JSON.stringify(workspaceState.files[controlFileId].plots));

    return {
      enrichedEvents: file.events || file.enrichedEvents,
      channels: channels,
      logicles: logicles,
      gateStats: file.gateStats,
      plots: plots,
      fileId: file.name || file.fileId,
      isControlFile: (file.id || file.fileId) == controlFileId ? 1 : 0,
      label: file.name || file.label,
      scale: file.scale,
    };
  });
};

export const getPlotChannelAndPosition = (file) => {
  const expectedXChannels = "FSC";
  let xAxisIndex, yAxisIndex;
  let xAxisLabel, yAxisLabel;
  let xAxisScaleType, yAxisScaleType;
  let xChannel = file.channels.find(
    (channel) => channel?.value?.toUpperCase().indexOf(expectedXChannels) > -1
  );

  const expectedYChannels = "SSC";
  let yChannel = file.channels.find(
    (channel) => channel?.value?.toUpperCase().indexOf(expectedYChannels) > -1
  );

  if (xChannel) {
    xAxisIndex = xChannel.key;
    xAxisLabel = xChannel.value;
    xAxisScaleType = xChannel.display;
  } else {
    xAxisIndex = 0;
    xAxisLabel = file.channels[0].value;
    xAxisScaleType = file.channels[0].display;
  }

  if (yChannel) {
    yAxisIndex = yChannel.key;
    yAxisLabel = yChannel.value;
    yAxisScaleType = yChannel.display;
  } else {
    yAxisIndex = 1;
    yAxisLabel = file.channels[1].value;
    yAxisScaleType = file.channels[1].display;
  }

  return {
    xAxisLabel,
    yAxisLabel,
    xAxisIndex,
    yAxisIndex,
    xAxisScaleType,
    yAxisScaleType,
  };
};

export const createDefaultPlotSnapShot = (
  fileId,
  xAxisLabel = DEFAULT_X_AXIS_LABEL,
  yAxisLabel = DEFAULT_Y_AXIS_LABEL,
  xAxisIndex = 0,
  yAxisIndex = 1,
  xScaleType = DEFAULT_X_SCALE_TYPE,
  yScaleType = DEFAULT_Y_SCALE_TYPE
) => {
  let plotType = DEFAULT_PLOT_TYPE;
  return {
    // controlFileId: fileId,
    plots: [
      {
        madeOnFile: fileId,
        population: "All",
        level: 0,
        left: 5,
        top: 5,
        plotType: plotType || DEFAULT_PLOT_TYPE,
        width: DEFAULT_PLOT_WIDTH,
        height: DEFAULT_PLOT_HEIGHT,
        xAxisLabel: xAxisLabel || DEFAULT_X_AXIS_LABEL,
        yAxisLabel: yAxisLabel || DEFAULT_Y_AXIS_LABEL,
        xAxisIndex: xAxisIndex,
        yAxisIndex: yAxisIndex,
        plotScale: 2,
        xScaleType: xScaleType ?? DEFAULT_X_SCALE_TYPE,
        yScaleType: yScaleType ?? DEFAULT_Y_SCALE_TYPE,
        histogramAxis: "",
        label: "",
        dimensions: {
          w: 9,
          h: 10,
        },
        positions: {
          x: 0,
          y: 0,
        },
        parentPlotId: "",
        gatingActive: "",
      },
    ],
    files: {
      // [fileId]: {
      //   plots: [
      //     {
      //       population: "All",
      //       level: 0,
      //       left: 5,
      //       top: 5,
      //       plotType: plotType || DEFAULT_PLOT_TYPE,
      //       width: DEFAULT_PLOT_WIDTH,
      //       height: DEFAULT_PLOT_HEIGHT,
      //       xAxisLabel: xAxisLabel || DEFAULT_X_AXIS_LABEL,
      //       yAxisLabel: yAxisLabel || DEFAULT_Y_AXIS_LABEL,
      //       xAxisIndex: xAxisIndex,
      //       yAxisIndex: yAxisIndex,
      //       plotScale: 2,
      //       xScaleType: xScaleType ?? DEFAULT_X_SCALE_TYPE,
      //       yScaleType: yScaleType ?? DEFAULT_Y_SCALE_TYPE,
      //       histogramAxis: "",
      //       label: "",
      //       dimensions: {
      //         w: 9,
      //         h: 10,
      //       },
      //       positions: {
      //         x: 0,
      //         y: 0,
      //       },
      //       parentPlotId: "",
      //       gatingActive: "",
      //     },
      //   ],
      // },
    },
    sharedWorkspace: "false",
    editWorkspace: "true",
    isShared: "false",
    openFile: fileId,
    workspaceContainerHeight: 500,
  };
};

export const getPlotsForFileFromWorkspaceState = (fileId, workspaceState) => {
  let plots = JSON.parse(JSON.stringify(workspaceState.plots));

  if (fileId && workspaceState.customGates) {
    //if (fileId && plots.gates && workspaceState.customGates) {

    plots.forEach((plot) => {
      if (plot.gates) {
        plot.gates.forEach((gate) => {
          let customGate = workspaceState.customGates.find(
            (g) => g.madeOnFile == fileId && g.name == gate.name
          );

          if (customGate) {
            gate.points = customGate.points;
          }
          // plots[index] = JSON.parse(JSON.stringify(plot));
        });
      }
    });
  }

  return plots;
};

export const hasCustomGate = (fileId, population, workspaceState) => {
  const gate =
    workspaceState.customGates &&
    workspaceState.customGates.find(
      (g) => g.name == population && g.madeOnFile == fileId
    );

  if (gate) {
    return true;
  }

  return false;
};

const numToLabelText = (num) => {
  let snum = "";
  if (num < 2) {
    snum = numeral(num.toFixed(2)).format("0.0a");
  } else {
    snum = num.toFixed(2);
    snum = numeral(snum).format("0a");
  }
  return snum;
};

const drawSegment = (params, ctx) => {
  ctx.strokeStyle = params.strokeColor;
  ctx.lineWidth = params.lineWidth;

  ctx.beginPath();
  ctx.moveTo(params.x1, params.y1);
  ctx.lineTo(params.x2, params.y2);
  ctx.stroke();
};

export const drawText = (params, ctx) => {
  ctx.fillStyle = params.fillColor;
  if (params.font !== undefined) {
    ctx.font = params.font;
  }
  if (params.rotate !== undefined) {
    ctx.rotate(params.rotate);
    const bx = params.x;
    const by = params.y;
    params.x = -bx * Math.cos(params.rotate) + by * Math.sin(params.rotate);
    params.y = -bx * Math.sin(params.rotate) - by * Math.cos(params.rotate);
  }
  ctx.fillText(params.text, params.x, params.y);
  ctx.font = "Arial";
  if (params.rotate !== undefined) {
    ctx.rotate(-params.rotate);
  }
};

export const linLabel = (num) => {
  let snum = "";
  if (num < 2) {
    snum = numeral(num.toFixed(2)).format("0a");
  } else {
    snum = num.toFixed(2);
    snum = numeral(snum).format("0a");
  }
  return snum;
};

export const pot10Label = (pot10Indx) => {
  let ev = "";
  for (const l of Math.abs(pot10Indx).toString()) ev += EXP_NUMS[parseInt(l)];
  let name = "10" + ev;
  if (!name.includes("-") && pot10Indx < 0) name = "-" + name;
  return name;
};

export const getAxisLabels = (format, linRange, logicle, binsCount) => {
  let labels = [];
  if (format === "lin") {
    const binSize = (Math.abs(linRange[1]) - linRange[0]) / binsCount;

    for (let i = linRange[0], j = 0; j <= binsCount; i += binSize, j++)
      labels.push({
        pos: i,
        name: linLabel(i),
      });
  }
  if (format === "bi") {
    let originalBinsCount = binsCount;
    binsCount = 2;
    const baseline = Math.abs(linRange[1]);

    const baselineMin = linRange[0];
    const baselineMax = linRange[1];

    //-1000 to 1000
    let pot10 = baselineMin || 1;
    let pot10Exp = 0;

    if (baselineMin > 0) {
      let min = baselineMin;
      while (min > 9) {
        min = Math.floor(min / 10);
        pot10Exp++;
      }
    }

    const fow = () => {
      if (Math.ceil(pot10) == 0) {
        pot10 = 1;
      }
      if (pot10 < 0) {
        pot10 = pot10 / Math.pow(10, binsCount - 1);
      } else {
        pot10 *= 10;
        pot10Exp++;
      }
    };
    const back = () => {
      if (Math.floor(pot10) == 0) {
        pot10 = -1;
      }
      if (pot10 < 0) {
        pot10 = pot10 * Math.pow(10, binsCount - 1);
      } else {
        pot10 /= Math.pow(10, binsCount - 1);
      }
      if (Math.floor(pot10) == 0) {
        pot10 = -1;
        pot10 = pot10 * Math.pow(10, binsCount - 1);
      }
      pot10Exp = pot10Exp - (binsCount - 1);
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
        // if (originalBinsCount) {
        //   binsCount = originalBinsCount;
        //   originalBinsCount = 0;
        // }
      }
    };
    while (pot10 <= baseline) fow();
    while (pot10 >= baselineMin) {
      add(pot10, pot10Exp);

      back();
    }

    labels.sort((a, b) => a.pos - b.pos);
  }
  return labels;
};

export const getBins = (width, height, scale) => {
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

export const isGateShowing = (plot) => {
  if (plot?.plotType === "scatter") {
    return (
      plot?.gate?.xAxisIndex === plot?.xAxisIndex &&
      plot?.gate?.xScaleType === plot?.xScaleType &&
      plot?.gate?.yAxisIndex === plot?.yAxisIndex &&
      plot?.gate?.yScaleType === plot?.yScaleType &&
      plot?.gate?.gateType === "polygon" &&
      plot?.plotType === "scatter"
    );
  } else if (plot?.plotType === "histogram") {
    return (
      plot?.gate?.xAxisIndex === plot?.xAxisIndex &&
      plot?.gate?.xScaleType === plot?.xScaleType &&
      plot?.gate?.gateType === plot?.plotType
    );
  }
};

export const getGateName = (gateName) => {
  return gateName.split(" ").join("_") + "timestamp" + Date.now();
};

export const getGateNameFriendly = (gateName) => {
  if (!gateName) {
    return "";
  }

  gateName = gateName.split("_").join(" ") + "timestamp" + Date.now();
  return gateName.substring(0, gateName.indexOf("timestamp"));
};
