/*
  Plotters can be hard to instance. This function tries to abstract all that
  away from the user the interface.
*/
import Plotter from "graph/renderers/plotters/plotter";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";
import HistogramPlotter from "graph/renderers/plotters/histogramPlotter";
import PlotterPlugin from "graph/renderers/plotters/plotterPlugin";
import ScatterHeatmapperPlugin from "graph/renderers/plotters/instancePlugins/scatterHeatmapper";

/*
  This is the only place in the whole codebase where plots are allowed to be
  instanced. Don't break this rule otherwise you are going to have headaches.
*/
export default class PlotterFactory {
  makePlotter(type: "histogram" | "scatter", options: string[]): Plotter {
    if (type === "histogram") {
      return this.makeHistogramPlot(options);
    }

    if (type === "scatter") {
      return this.makeScatterPlot(options);
    }

    throw Error("Type " + type + " unrecognized");
  }

  private makeHistogramPlot(options: string[]): HistogramPlotter {
    const histogramPlotter = new HistogramPlotter();

    return histogramPlotter;
  }

  private makeScatterPlot(options: string[]): ScatterPlotter {
    const plugins: PlotterPlugin[] = [];

    // if (options.includes("heatmap")) {
    //   plugins.push(new ScatterHeatmapperPlugin());
    // }

    const scatterPlotter = new ScatterPlotter();
    plugins.forEach((e) => scatterPlotter.addPlugin(e));

    return scatterPlotter;
  }
}
