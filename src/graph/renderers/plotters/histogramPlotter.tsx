import GraphPlotter, {
  GraphPlotterState,
} from "graph/renderers/plotters/graphPlotter";
import HistogramDrawer from "../drawers/histogramDrawer";
import PluginGraphPlotter, { applyPlugin } from "./PluginGraphPlotter";
import OverlayPlotterPlugin from "./runtimePlugins/overlayPlotterPlugin";

const leftPadding = 70;
const rightPadding = 50;
const topPadding = 50;
const bottomPadding = 50;

interface HistogramPlotterState extends GraphPlotterState {
  direction: "vertical" | "horizontal";
  bins: number;
}

export default class HistogramPlotter extends PluginGraphPlotter {
  direction: "vertical" | "horizontal" = "vertical";
  bins: number = 1;
  drawer: HistogramDrawer;

  setup(canvasContext: any) {
    super.setup(canvasContext);

    const overlayPlugin = new OverlayPlotterPlugin();
    this.addPlugin(overlayPlugin);
  }

  protected setDrawerState(): void {
    const ranges = this.plotData.getXandYRanges();
    const binListMax = this.plotData.getBins(
      this.bins,
      this.direction == "vertical" ? this.xAxisName : this.yAxisName
    ).max;
    const drawerState = {
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.direction == "vertical" ? ranges.x[0] : 0,
      iex: this.direction == "vertical" ? ranges.x[1] : binListMax,
      iby: this.direction == "vertical" ? 0 : ranges.y[0],
      iey: this.direction == "vertical" ? binListMax : ranges.y[1],
      scale: this.scale,
      xpts: this.horizontalBinCount,
      ypts: this.verticalBinCount,
      bins: this.bins,
      axis: this.direction,
    };
    this.drawer.setDrawerState(drawerState);
  }

  public getPlotterState() {
    return {
      ...super.getPlotterState(),
      direction: this.direction,
      bins: this.bins,
    };
  }

  public setPlotterState(state: HistogramPlotterState) {
    super.setPlotterState(state);
    this.direction = state.direction;
    this.bins = state.bins !== undefined ? state.bins : 0;
  }

  protected getBins() {
    this.binSize = 1;
    this.horizontalBinCount =
      this.width === undefined
        ? 2
        : Math.max(2, Math.round(this.width / (this.binSize * this.scale)));
    this.verticalBinCount =
      this.height === undefined
        ? 2
        : Math.max(2, Math.round(this.height / (this.binSize * this.scale)));
    this.bins =
      this.direction === "vertical"
        ? this.horizontalBinCount
        : this.verticalBinCount;
  }

  public update() {
    super.update();
  }

  public createDrawer(): void {
    this.drawer = new HistogramDrawer();
  }

  @applyPlugin()
  public draw() {
    super.draw(
      false,
      (this.height - bottomPadding) / 50,
      (this.width - rightPadding) / 50
    );

    const { list, max } = this.plotData.getBins(
      this.bins,
      this.direction == "vertical" ? this.xAxisName : this.yAxisName
    );
    for (let i = 0; i < this.bins; i++) {
      this.drawer.addBin(i, list[i] / max);
    }
  }
}
