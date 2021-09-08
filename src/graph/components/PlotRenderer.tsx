import { useEffect, useState } from "react";

import { Gate, GateType, Plot } from "graph/resources/types";

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
import GateMouseInteractor from "graph/renderers/gateMouseInteractors/gateMouseInteractor";

const plotterFactory = new PlotterFactory();

const typeToClassType = {
  // Oval: OvalMouseInteractor,
  oval: Error,
  polygon: PolygonMouseInteractor,
  histogram: Error,
};

let mouseInteractorInstances: { [index: string]: GateMouseInteractor[] } = {};

const PlotRenderer = (props: { plot: Plot }) => {
  const [canvas, setCanvas] = useState<CanvasManager | null>(null);
  const [configured, setConfigured] = useState<boolean>(false);
  const [plotter, setPlotter] = useState<GraphPlotter | null>(null);
  const [scatterPlotter, setScatterPlotter] = useState<ScatterPlotter | null>(
    null
  );
  const [histogramPlotter, setHistogramPlotter] =
    useState<HistogramPlotter | null>(null);
  const [lastGatingType, setLastGatingType] = useState<GateType>("");
  const plot = props.plot;

  const validateReady = (): boolean => {
    if (
      plot.plotWidth !== 0 &&
      plot.plotHeight !== 0 &&
      plot.plotScale !== 0 &&
      plotter &&
      plotter.drawer !== null
    ) {
      return true;
    }
    return false;
  };

  const draw = () => {
    if (!validateReady()) return;

    setCanvasState();
    canvas.render();

    let selectedPlotter = plotter;
    if (plot.xAxis === plot.yAxis) {
      setPlotter(histogramPlotter);
      selectedPlotter = histogramPlotter;
    } else {
      setPlotter(scatterPlotter);
      selectedPlotter = scatterPlotter;
    }

    setPlotterState(selectedPlotter);
    selectedPlotter.update();
    selectedPlotter.draw();
    const gatingType = plot.gatingActive;
    if (lastGatingType !== gatingType) {
      unsetGating("polygon");
      if (gatingType === "polygon") {
        setGating("polygon", true);
      }
      setLastGatingType(gatingType);
    }
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

  const unsetGating = (type: "oval" | "histogram" | "polygon") => {
    mouseInteractorInstances[plot.id]
      //@ts-ignore
      .filter((e) => !(e instanceof typeToClassType[type]))
      .forEach((e) => e.unsetGating());
  };

  const setGating = (
    type: "oval" | "histogram" | "polygon",
    start: boolean,
    inpPlotter?: GraphPlotter
  ) => {
    if (!inpPlotter) inpPlotter = plotter;
    mouseInteractorInstances[plot.id]
      .filter((e) => e instanceof typeToClassType[type])
      .forEach((e) => {
        e.setMouseInteractorState({
          plotID: plot.id,
          yAxis: plot.xAxis,
          xAxis: plot.yAxis,
          rerender: () => {
            draw();
          },
        });
        //@ts-ignore
        e.setup(inpPlotter);
        start ? e.start() : e.end();
      });
  };

  const setPlotterState = (inpPlotter?: GraphPlotter) => {
    if (!inpPlotter) inpPlotter = plotter;
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
    inpPlotter.setPlotterState(plotterState);
  };

  const setMouseEvent = (type: string, x: number, y: number) => {
    mouseInteractorInstances[plot.id].forEach((e) => {
      e.registerMouseEvent(type, x, y);
    });
  };

  useEffect(() => {
    if (!configured && canvas) {
      setConfigured(true);

      //@ts-ignore
      const scatterPlotter = plotterFactory.makePlotter("scatter", ["heatmap"]);
      //@ts-ignore
      const histogramPlotter = plotterFactory.makePlotter("histogram", []);

      //@ts-ignore
      setScatterPlotter(scatterPlotter);
      //@ts-ignore
      setHistogramPlotter(histogramPlotter);

      //@ts-ignore
      setPlotter(scatterPlotter);

      //@ts-ignore
      setPlotterState(scatterPlotter);

      histogramPlotter.setup(canvas.getContext());
      scatterPlotter.setup(canvas.getContext());

      scatterPlotter.update();

      mouseInteractorInstances[plot.id] = [new PolygonMouseInteractor()];

      for (const mouseInteractor of mouseInteractorInstances[plot.id]) {
        //@ts-ignore
        mouseInteractor.setup(scatterPlotter);
      }

      //@ts-ignore
      setGating("polygon", true, scatterPlotter);
      //@ts-ignore
      setGating("polygon", false, scatterPlotter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  useEffect(draw, [props.plot]);

  return (
    <CanvasComponent
      plotID={plot.id}
      width={plot.plotWidth}
      height={plot.plotHeight}
      setCanvas={(canvas) => {
        setCanvas(canvas);
      }}
      setMouseEvent={setMouseEvent}
    />
  );
};

export default PlotRenderer;
