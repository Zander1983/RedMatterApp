import { PlotType } from "./Types";

export const getMockPlotNoGates = (): PlotType => {
  return {
    id: "123",
    fileId: "123",
    gates: [],
    population: [],
    ranges: {
      a: { min: 0, max: 1, axis: "a", axisType: "lin" },
      b: { min: 0, max: 1, axis: "a", axisType: "lin" },
    },
    context2D: {
      xAxis: "a",
      yAxis: "b",
      xAxisType: "lin",
      yAxisType: "lin",
    },
    positionInWorkspace: [0, 0],
    plotWidth: 0,
    plotHeight: 0,
    plotScale: 0,
    label: "a",
    dimensions: {
      w: 0,
      h: 0,
    },
    positions: {
      x: 0,
      y: 0,
    },
  };
};
