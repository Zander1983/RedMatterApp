import { useEffect, useState } from "react";

import { Gate, Plot } from "graph/resources/types";

import CanvasComponent, {
  CanvasManager,
} from "graph/components/CanvasComponent";

import PlotterFactory from "graph/renderers/plotters/plotterFactory";
import GraphPlotter from "graph/renderers/plotters/graphPlotter";
import HistogramPlotter from "graph/renderers/plotters/histogramPlotter";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";

import MouseInteractor from "graph/renderers/gateMouseInteractors/gateMouseInteractor";
// import OvalMouseInteractor from "graph/renderers/gateMouseInteractors/ovalMouseInteractor";
import PolygonMouseInteractor from "graph/renderers/gateMouseInteractors/polygonMouseInteractor";
import * as PlotResource from "graph/resources/plots";
import { getGate, getPopulation } from "graph/utils/workspace";

const plotterFactory = new PlotterFactory();

const typeToClassType = {
  // Oval: OvalMouseInteractor,
  oval: Error,
  polygon: PolygonMouseInteractor,
  histogram: Error,
};

const PlotRenderer = (props: { plot: Plot }) => {
  const [canvas, setCanvas] = useState<CanvasManager | null>(null);
  const [configured, setConfigured] = useState<boolean>(false);

  const plot = props.plot;

  // Mouse interaction objects
  let mouseInteractors: MouseInteractor[] = [];
  // let ovalMouseInteractor: OvalMouseInteractor | null = null;
  let polygonMouseInteractor: PolygonMouseInteractor | null = null;

  // Rendering objects
  let plotter: GraphPlotter | null = null;
  let scatterPlotter: ScatterPlotter | null = null;
  let histogramPlotter: HistogramPlotter | null = null;

  const configure = () => {
    constructPlotters();
    plotter = scatterPlotter;

    setPlotterState();
    histogramPlotter.setup(canvas.getContext());
    scatterPlotter.setup(canvas.getContext());

    plotter.update();

    contructMouseInteractors();
    setGating("polygon", true);
    setGating("polygon", false);
    setGating("oval", true);
    setGating("oval", false);

    setTimeout(() => draw(), 20);
  };

  const update = () => {
    if (plot.xAxis === plot.yAxis) {
      plotter = histogramPlotter;
    } else {
      plotter = scatterPlotter;
    }

    draw();
  };

  const draw = () => {
    if (!validateReady()) return;

    setCanvasState();
    setPlotterState();

    plotter.update();

    canvas.render();

    plotter.draw();
  };

  const unsetGating = () => {
    console.log("unsetGating");
  };

  const setGating = (
    type: "oval" | "histogram" | "polygon",
    start: boolean
  ) => {
    mouseInteractors
      .filter((e) => e instanceof typeToClassType[type])
      .forEach((e) => {
        e.setMouseInteractorState({
          plotID: plot.id,
          yAxis: plot.xAxis,
          xAxis: plot.yAxis,
          rerender: () => {
            canvas.render();
            plotter.draw();
          },
        });
        e.setup(scatterPlotter);
        e.unsetGating = unsetGating;
        start ? e.start() : e.end();
      });
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
    const data = PlotResource.getXandYData(plot);
    const ranges = PlotResource.getXandYRanges(plot);
    const gates: Gate[] = [
      ...plot.gates.map((e) => getGate(e)),
      ...getPopulation(plot.population).gates.map((e) => getGate(e.gate)),
    ];
    const plotterState = {
      plot: plot,
      xAxis: data[0],
      yAxis: data[1],
      xAxisName: plot.xAxis,
      yAxisName: plot.yAxis,
      width: plot.plotWidth,
      height: plot.plotHeight,
      scale: plot.plotScale,
      direction: plot.histogramAxis,
      gates: gates,
      xRange: ranges.x,
      yRange: ranges.y,
    };
    plotter.setPlotterState(plotterState);
  };

  const contructMouseInteractors = () => {
    // ovalMouseInteractor = new OvalMouseInteractor();
    polygonMouseInteractor = new PolygonMouseInteractor();
    mouseInteractors = [polygonMouseInteractor];
  };

  useEffect(() => {
    if (!configured) {
      setConfigured(true);
      configure();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(update);

  return (
    <CanvasComponent
      plotID={plot.id}
      setCanvas={setCanvas}
      setMouseEvent={(type, x, y) => {
        mouseInteractors.forEach((e) => e.registerMouseEvent(type, x, y));
      }}
    />
  );
};

export default PlotRenderer;
