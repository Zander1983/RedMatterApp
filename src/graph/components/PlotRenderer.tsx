import React, { useCallback, useEffect, useState, useRef } from "react";

import { GateType, PlotID, Plot2 } from "graph/resources/types";

import CanvasComponent, {
  CanvasManager,
} from "graph/components/CanvasComponent";

import PlotterFactory from "graph/renderers/plotters/plotterFactory";
import GraphPlotter from "graph/renderers/plotters/graphPlotter";
import HistogramPlotter from "graph/renderers/plotters/histogramPlotter";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";

import PolygonMouseInteractor from "graph/renderers/gateMouseInteractors/polygonMouseInteractor";
import * as PlotResource from "graph/resources/plots";
import GateMouseInteractor from "graph/renderers/gateMouseInteractors/gateMouseInteractor";
import HistogramGateMouseInteractor from "graph/renderers/gateMouseInteractors/histogramGateMouseInteractor";
import { snackbarService } from "uno-material-ui";
import { isEqual } from "lodash";
import useWhyDidYouUpdate from "hooks/useWhyDidYouUpdate";

const plotterFactory = new PlotterFactory();

const typeToClassType = {
  oval: Error,
  polygon: PolygonMouseInteractor,
  histogram: HistogramGateMouseInteractor,
};

let mouseInteractorInstances: { [index: string]: GateMouseInteractor[] } = {};
let propsStore: any = {};

function propsAreEqual(prev: any, next: any) {
  if (next && next.workspaceLoading) {
    return false;
  } else if (
    next.customPlotRerender &&
    next.customPlotRerender.length > 0 &&
    next.customPlotRerender.includes(next.plot._id)
  ) {
    return false;
  }
  let previous: any = {};
  if (propsStore && propsStore[next.plot._id]) {
    previous = propsStore[next.plot._id];
  }
  propsStore[next.plot._id] = JSON.parse(JSON.stringify(next));
  return (
    isEqual(previous.plot, next.plot) &&
    isEqual(previous.plotGates, next.plotGates) &&
    isEqual(previous.population, next.population) &&
    isEqual(previous.editWorkspace, next.editWorkspace)
  );
}

interface PlotRenderProps {
  editWorkspace: boolean;
  workspaceLoading: boolean;
  customPlotRerender: PlotID[];
  plot: Plot2;
}

const PlotRenderer = ({
  editWorkspace,
  workspaceLoading,
  customPlotRerender,
  plot,
}: PlotRenderProps) => {
  const [canvas, setCanvas] = useState<CanvasManager | null>(null);
  const [configured, setConfigured] = useState<boolean>(false);
  const [plotter, setPlotter] = useState<GraphPlotter | null>(null);
  const [scatterPlotter, setScatterPlotter] = useState<ScatterPlotter | null>(
    null
  );

  const [histogramPlotter, setHistogramPlotter] =
    useState<HistogramPlotter | null>(null);
  const [lastGatingType, setLastGatingType] = useState<GateType>("");
  const [, setLoader] = useState(false);
  // const plot = props.plot;
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

  useEffect(() => {
    if (customPlotRerender.includes(plot._id)) {
      let interactor: GateMouseInteractor[] =
        mouseInteractorInstances[plot._id];
      if (interactor && interactor.length > 0) {
        if (interactor[0]) interactor[0].end();
        if (interactor[1]) interactor[1].end();
      }
    }
  }, [customPlotRerender]);

  const draw = () => {
    if (!validateReady()) return;
    setLoader(true);
    setCanvasState();
    canvas.render();

    let selectedPlotter = plotter;
    if (plot.histogramAxis !== "") {
      setPlotter(histogramPlotter);
      selectedPlotter = histogramPlotter;
    } else {
      setPlotter(scatterPlotter);
      selectedPlotter = scatterPlotter;
    }

    setPlotterState(selectedPlotter);

    switch (process.env.REACT_APP_ENV) {
      case "production":
      case "staging":
        try {
          selectedPlotter.draw();
        } catch {
          snackbarService.showSnackbar(
            "There was an error rendering a plot.",
            "error"
          );
        }
        break;
      case "development":
      default:
        selectedPlotter.draw();
    }
    const gatingType = plot.gatingActive;
    if (lastGatingType !== gatingType) {
      const isHistogram = plot.xAxis === plot.yAxis;
      if (isHistogram) {
        unsetGating("polygon");
      } else {
        unsetGating("histogram");
      }

      if (gatingType === "polygon") {
        setGating("polygon", true);
      }
      if (gatingType === "histogram") {
        setGating("histogram", true);
      }
      setLastGatingType(gatingType);
    }
    setLoader(false);
  };

  const setCanvasState = () => {
    const canvasState = {
      id: plot._id,
      width: plot.plotWidth,
      height: plot.plotHeight,
      scale: plot.plotScale,
    };
    canvas.setCanvasState(canvasState);
  };

  const unsetGating = (type: "oval" | "histogram" | "polygon") => {
    if (mouseInteractorInstances[plot._id])
      mouseInteractorInstances[plot._id]
        //@ts-ignore
        .filter((e) => !(e instanceof typeToClassType[type]))
        .forEach((e) => e.unsetGating(true));
  };

  const setGating = (
    type: "oval" | "histogram" | "polygon",
    start: boolean,
    inpPlotter?: GraphPlotter
  ) => {
    if (!inpPlotter) inpPlotter = plotter;
    mouseInteractorInstances[plot._id]
      .filter((e) => e instanceof typeToClassType[type])
      .forEach((e) => {
        if (e.plugin.gaterType === "1D") {
          (e as HistogramGateMouseInteractor).setMouseInteractorState({
            plotID: plot._id,
            axis: plot.histogramAxis === "vertical" ? plot.xAxis : plot.yAxis,
            histogramDirection: plot.histogramAxis,
            axisPlotType:
              plot.histogramAxis === "vertical"
                ? plot.xPlotType
                : plot.yPlotType,
            rerender: () => {
              draw();
            },
          });
        } else if (e.plugin.gaterType === "2D") {
          (e as PolygonMouseInteractor).setMouseInteractorState({
            plotID: plot._id,
            xAxis: plot.xAxis,
            yAxis: plot.yAxis,
            rerender: () => {
              draw();
            },
          });
        }
        //@ts-ignore
        e.setup(inpPlotter);
        start ? e.start() : e.end();
      });
  };
  const setPlotterState = (inpPlotter?: GraphPlotter) => {
    if (!inpPlotter) inpPlotter = plotter;
    const data = PlotResource.getXandYDataFromPlot2(plot);
    // const ranges = PlotResource.getXandYRanges(plot);
    const ranges = PlotResource.getXandYRangesFromFile(plot);
    const plotterState = {
      // plot: props.plot,
      plot2: plot || null,
      xAxis: data[0],
      yAxis: data[1],
      xAxisName: plot.xAxis,
      yAxisName: plot.yAxis,
      width: plot.plotWidth,
      height: plot.plotHeight,
      scale: plot.plotScale,
      direction: plot.histogramAxis,
      // gates: props.plot.gates.map((e) => getGate(e)),
      xRange: ranges.x,
      yRange: ranges.y,
    };
    inpPlotter.setPlotterState(plotterState);
  };

  const setMouseEvent = useCallback(
    (type: string, x: number, y: number) => {
      // const cplot = getPlot(plot._id);
      const cplot = plot;
      setLoader(true);
      mouseInteractorInstances[cplot._id].forEach((e) => {
        if (
          (cplot.xAxis === cplot.yAxis && e.gaterType === "1D") ||
          (cplot.xAxis !== cplot.yAxis && e.gaterType === "2D")
        ) {
          try {
            e.registerMouseEvent(type, x, y);
          } catch {
            console.error(
              "[PlotRender:setMouseEvent] Failed to send mouse event to",
              e
            );
          }
        }
      });
    },
    [editWorkspace, workspaceLoading, customPlotRerender, plot]
  );

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
      //@ts-ignore
      setPlotterState(histogramPlotter);

      histogramPlotter.setup(canvas.getContext());
      scatterPlotter.setup(canvas.getContext());

      scatterPlotter.update();

      mouseInteractorInstances[plot._id] = [
        new PolygonMouseInteractor(),
        new HistogramGateMouseInteractor(),
      ];

      for (const mouseInteractor of mouseInteractorInstances[plot._id]) {
        if (mouseInteractor.gaterType === "1D") {
          //@ts-ignore
          mouseInteractor.setup(histogramPlotter);
        } else {
          //@ts-ignore
          mouseInteractor.setup(scatterPlotter);
        }
      }

      //@ts-ignore
      setGating("polygon", true, scatterPlotter);
      //@ts-ignore
      setGating("polygon", false, scatterPlotter);

      //@ts-ignore
      setGating("histogram", true, histogramPlotter);
      //@ts-ignore
      setGating("histogram", false, histogramPlotter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);
  useEffect(() => {
    if (plotter) {
      setGating("polygon", true, scatterPlotter);
      //@ts-ignore
      setGating("polygon", false, scatterPlotter);
      //@ts-ignore
      setGating("histogram", true, histogramPlotter);
      //@ts-ignore
      setGating("histogram", false, histogramPlotter);
    }
    draw();
  }, [plotter]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    draw();
  }, [
    plot.gatingActive,
    plot.histogramAxis,
    plot.xAxis,
    plot.xPlotType,
    plot.yAxis,
    plot.yPlotType,
  ]);
  useEffect(() => {
    return () => {
      if (propsStore && propsStore[plot._id]) delete propsStore[plot._id];
    };
  }, []);

  return (
    <CanvasComponent
      plotID={plot._id}
      width={plot.plotWidth}
      height={plot.plotHeight}
      setCanvas={(canvas) => {
        setCanvas(canvas);
      }}
      setMouseEvent={(type, x, y) => {
        if (editWorkspace) setMouseEvent(type, x, y);
      }}
    />
  );
};
export default PlotRenderer;
// export default React.memo(PlotRenderer, propsAreEqual);
