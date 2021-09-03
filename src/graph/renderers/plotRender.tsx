/*
  Plot - Responsible for keeping all rendering state syncronized.
*/
import PlotterFactory from "graph/renderers/plotters/plotterFactory";
import GraphPlotter from "graph/renderers/plotters/graphPlotter";
import HistogramPlotter from "graph/renderers/plotters/histogramPlotter";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";

import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";

import MouseInteractor from "graph/renderers/gateMouseInteractors/gateMouseInteractor";
import OvalMouseInteractor from "graph/renderers/gateMouseInteractors/ovalMouseInteractor";
import PolygonMouseInteractor from "graph/renderers/gateMouseInteractors/polygonMouseInteractor";
import { Plot } from "graph/resources/types";
import CanvasComponent from "graph/components/CanvasComponent";
import { useState } from "react";

const plotterFactory = new PlotterFactory();

const PlotRenderer = (props: { plot: Plot }) => {
  const plot = props.plot;
  const [canvas, setCanvas] = useState(null);
  const unsetGating: Function;

  // Mouse interaction objects
  const mouseInteractors: MouseInteractor[] = [];
  let ovalMouseInteractor: OvalMouseInteractor | null = null;
  let polygonMouseInteractor: PolygonMouseInteractor | null = null;

  // Rendering objects
  let mouseInteractorPlugin: GatePlotterPlugin | null = null;
  let plotter: GraphPlotter | null = null;
  let scatterPlotter: ScatterPlotter | null = null;
  let histogramPlotter: HistogramPlotter | null = null;

  /* Whenever plot data gets updated, should be called to rerender
     what changed */
  const update = () => {
    // Plot type update
    if (plot.xAxis === plot.yAxis) {
      plotter = histogramPlotter;
    } else {
      plotter = scatterPlotter;
    }

    draw();
  };

  const setup = () => {
    constructPlotters();
    plotter = scatterPlotter;

    setPlotterState();
    histogramPlotter.setup(canvas.getContext());
    scatterPlotter.setup(canvas.getContext());

    plotter.update();

    contructMouseInteractors();
    setGating("Polygon", true);
    setGating("Polygon", false);
    setGating("Oval", true);
    setGating("Oval", false);

    setTimeout(() => draw(), 20);
  };

  const draw = () => {
    if (plot === undefined || plot === null || !validateReady()) return;

    setCanvasState();
    setPlotterState();

    plotter.update();

    canvasRender();

    plotter.draw();
  };

  const canvasRender = () => {
    canvas.canvasRender();
  };

  const setPlotRender = (plotRender: Function) => {
    plotRender = plotRender;
  };

  const setPlotData = (plotData: PlotData) => {
    plot = plotData;
  };

  const typeToClassType = {
    Oval: OvalMouseInteractor,
    Polygon: PolygonMouseInteractor,
    Histogram: Error,
  };

  const setGating = (
    type: "Oval" | "Histogram" | "Polygon",
    start: boolean
  ) => {
    mouseInteractors
      .filter((e) => e instanceof Plot.typeToClassType[type])
      .forEach((e) => {
        e.setMouseInteractorState({
          plotID: plot.id,
          yAxis: plot.xAxis,
          xAxis: plot.yAxis,
          rerender: () => {
            canvasRender();
            plotter.draw();
          },
        });
        e.setup(scatterPlotter);
        e.unsetGating = unsetGating;
        start ? e.start() : e.end();
      });
  };

  const registerMouseEvent = (type: string, x: number, y: number) => {
    mouseInteractors.forEach((e) => e.registerMouseEvent(type, x, y));
  };

  const validateReady = (): boolean => {
    if (
      plot.plotWidth !== 0 &&
      plot.plotHeight !== 0 &&
      plot.plotScale !== 0 &&
      plotter.drawer !== null
    ) {
      return true;
    }
    return false;
  };

  const setCanvasState = () => {
    const canvasState = {
      id: plot.id,
      width: plot.plotWidth,
      height: plot.plotHeight,
      scale: plot.plotScale,
    };
    canvas.setCanvasState(canvasState);
  };

  const constructPlotters = () => {
    //@ts-ignore
    scatterPlotter = plotterFactory.makePlotter("scatter", ["heatmap"]);
    //@ts-ignore
    histogramPlotter = plotterFactory.makePlotter("histogram", []);
  };

  const setPlotterState = () => {
    /*
      Fills up data to feed all plotters. It's the resposability of a plotter to
      pick only what it needs.
    */
    const data = plot.getXandYData();
    const ranges = plot.getXandYRanges();
    const plotterState = {
      plotData: plot,
      xAxis: data.xAxis,
      yAxis: data.yAxis,
      xAxisName: plot.xAxis,
      yAxisName: plot.yAxis,
      width: plot.plotWidth,
      height: plot.plotHeight,
      scale: plot.plotScale,
      direction: plot.histogramAxis,
      gates: plot.getGatesAndPopulation(),
      xRange: ranges.x,
      yRange: ranges.y,
    };
    plotter.setPlotterState(plotterState);
  };

  const contructMouseInteractors = () => {
    ovalMouseInteractor = new OvalMouseInteractor();
    polygonMouseInteractor = new PolygonMouseInteractor();
    // by default
    mouseInteractors = [ovalMouseInteractor, polygonMouseInteractor];
  };

  return <CanvasComponent plotID={plot.id} />;
};

export default PlotRenderer;
