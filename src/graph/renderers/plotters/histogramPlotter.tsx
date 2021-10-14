import {
  GraphPlotterState,
  leftPadding,
  topPadding,
  bottomPadding,
  rightPadding,
} from "graph/renderers/plotters/graphPlotter";
import HistogramDrawer from "../drawers/histogramDrawer";
import PluginGraphPlotter, { applyPlugin } from "./PluginGraphPlotter";
import * as PlotResource from "graph/resources/plots";
import { getGate, getPopulation } from "graph/utils/workspace";
import HistogramGatePlotter from "./runtimePlugins/histogramGatePlotter";
import { createEmptyPlot, createPlot } from "graph/resources/plots";

interface HistogramPlotterState extends GraphPlotterState {
  bins: number;
}

export default class HistogramPlotter extends PluginGraphPlotter {
  bins: number = 1;
  drawer: HistogramDrawer;

  globalMax: number = 0;
  rangeMin: number = 0;
  rangeMax: number = 0;

  private mainBins: any;
  private lineGraphBinSize = 3;

  histogramGatePlugin: HistogramGatePlotter | null = null;

  setup(canvasContext: any) {
    super.setup(canvasContext);
    this.histogramGatePlugin = new HistogramGatePlotter();
    this.addPlugin(this.histogramGatePlugin);
  }

  protected setDrawerState(): void {
    let hBins =
      this.width === undefined ? 2 : Math.round(this.width / (30 * this.scale));
    let vBins =
      this.height === undefined
        ? 2
        : Math.round(this.height / (30 * this.scale));
    hBins = Math.max(2, hBins);
    vBins = Math.max(2, vBins);

    const drawerState = {
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.ranges.x[0],
      iex: this.ranges.x[1],
      iby: 0,
      iey: this.rangeMax,
      scale: this.scale,
      xpts: hBins,
      ypts: vBins,
      bins: this.bins,
      axis: "vertical",
    };

    this.drawer.setDrawerState(drawerState);
  }

  public getPlotterState() {
    return {
      ...super.getPlotterState(),
      bins: this.bins,
    };
  }

  public setPlotterState(state: HistogramPlotterState) {
    super.setPlotterState(state);
    this.bins = state.bins !== undefined ? state.bins : 0;
  }
  public createDrawer(): void {
    this.drawer = new HistogramDrawer();
  }

  protected setBins() {
    this.binSize = 30;
    this.horizontalBinCount =
      this.width === undefined
        ? 2
        : Math.max(2, Math.round(this.width / this.scale));
    this.verticalBinCount =
      this.height === undefined
        ? 2
        : Math.max(2, Math.round(this.height / this.scale));
    this.bins = this.horizontalBinCount;
  }

  public update() {
    super.update();
    this.setBins();

    this.histogramGatePlugin.setGates(
      //@ts-ignore
      this.gates.filter((e) => e.gateType === "histogram")
    );

    this.setBins();

    const axisName = this.xAxisName;
    this.mainBins = PlotResource.getHistogramBins(
      this.plot,
      this.bins,
      axisName
    );

    const binCount =
      this.height === undefined
        ? 2
        : Math.round(this.height / (this.binSize * this.scale));

    this.yLabels = this.transformer.getAxisLabels(
      "lin",
      [0, this.mainBins.max],
      binCount
    );
  }

  @applyPlugin()
  public draw() {
    this.update();

    super.draw({
      lines: false,
      vbins: (this.height - bottomPadding) / 50,
      hbins: (this.width - rightPadding) / 50,
      yCustomLabelRange: [0, this.mainBins.max],
    });

    const axis = this.xAxisName;
    let globlMax = this.mainBins.max;
    let range =
      this.plot.ranges[PlotResource.getPlotAxisRangeString(this.plot, "x")];

    const overlaysObj = this.plot.histogramOverlays;
    const overlays = [];

    this.rangeMin = range[0];
    this.rangeMax = range[1];

    for (const overlay of overlaysObj) {
      if (!overlay) continue;
      let newPlotData = createEmptyPlot();

      switch (overlay.dataSource) {
        case "file":
          newPlotData = createPlot({
            clonePlot: newPlotData,
            population: getPopulation(overlay.population),
          });
          newPlotData.xAxis = this.plot.xAxis;
          newPlotData.yAxis = this.plot.yAxis;
          newPlotData.xPlotType = this.plot.xPlotType;
          newPlotData.yPlotType = this.plot.yPlotType;
          newPlotData.ranges = this.plot.ranges;
          newPlotData.gates = this.plot.gates;
          break;
        default:
          throw Error(
            "Overlay data source type '" +
              overlay.dataSource +
              "' not supported"
          );
      }

      const overlayRes = PlotResource.getHistogramBins(
        newPlotData,
        this.bins / this.lineGraphBinSize,
        axis
      );

      overlays.push({
        ...overlayRes,
        color: overlay.color,
      });
      const lastMax = overlayRes.max / this.lineGraphBinSize;
      if (lastMax > globlMax) globlMax = lastMax;
    }

    this.globalMax = globlMax;
    let binsArray = [];
    let parentBinsArray: any[] = [];
    const population = getPopulation(this.plot.population);
    let mainPlotColor =
      population.gates.length > 0
        ? getGate(population.gates[0].gate).color
        : "";

    for (let i = 0; i < this.bins; i++) {
      binsArray.push({
        value: this.mainBins.list[i] / globlMax,
        color: mainPlotColor,
      });
    }

    for (let i = 0; i < binsArray.length; i++) {
      let binsAscArray = [];
      binsAscArray.push(binsArray[i]);
      for (let j = 0; j < parentBinsArray.length; j++) {
        binsAscArray.push(parentBinsArray[j][i]);
      }
      binsAscArray.sort((a, b) => {
        return b.value - a.value;
      });

      for (let j = 0; j < binsAscArray.length; j++) {
        if (binsAscArray[j]) {
          if (binsAscArray[j].color)
            this.drawer.addBin(i, binsAscArray[j].value, binsAscArray[j].color);
          else this.drawer.addBin(i, binsAscArray[j].value);
        }
      }
    }

    for (const overlay of overlays) {
      const curve = overlay.list
        .map((e: any, i: number) => {
          return this.drawer.getBinPos(
            i,
            e / this.lineGraphBinSize / globlMax,
            Math.floor(this.bins) / this.lineGraphBinSize
          );
        })
        .filter((e) => e.x !== undefined && e.y !== undefined)
        .sort((a: any, b: any) => {
          return a.x - b.x;
        });
      this.drawer.curve({
        points: curve,
        strokeColor: overlay.color,
        lineWidth: 6,
      });
    }
  }
}
