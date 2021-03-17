/*
  Plotter - Factory class that takes care of assigning the right child for
  the job: if it's a histogram or scatter plotter. Returns a general instance
  of plot that can be used interchangebly.
*/
import Plotter, { PlotterInput } from "./plotter";
import ScatterPlotter from "./scatterPlotter";
import HistogramPlotter from "./histogramPlotter";
import canvasManager from "../../classes/canvas/canvasManager";

const plotterFactory = (input: PlotterInput): Plotter => {
  if (input.xAxis == input.yAxis) {
    return new HistogramPlotter(input);
  } else {
    return new ScatterPlotter(input);
  }
};

const generatePlots = (): Plotter[] => {
  const canvasList = canvasManager.getCanvas();
  plotterFactory();
};

export default generatePlots;
