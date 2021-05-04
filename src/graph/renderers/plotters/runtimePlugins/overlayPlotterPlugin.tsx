import PlotterPlugin from "graph/renderers/plotters/plotterPlugin";
import HistogramPlotter from "../histogramPlotter";

export default class OverlayPlotterPlugin extends PlotterPlugin {
  plotter: HistogramPlotter;
  heatmappingRadius = 0.05;
  heatMapCache: Array<{ xAxis: string; yAxis: string; colors: string[] }> = [];
  colors: string[] | null = null;

  setPlotter(plotter: HistogramPlotter) {
    this.plotter = plotter;
  }

  draw_AFTER() {
    const overlays = this.plotter.plotData.getOverlays();
    const axis =
      this.plotter.direction === "vertical"
        ? this.plotter.xAxisName
        : this.plotter.yAxisName;
    for (const overlay of overlays) {
      console.log(overlay);
      const { list, max } = overlay.plot.getBins(
        Math.round(this.plotter.bins / 20) - 1,
        axis
      );
      const curve = list
        .map((e: any, i: number) => {
          return this.plotter.drawer.getBinPos(
            i,
            e / max,
            Math.round(this.plotter.bins / 20)
          );
        })
        .sort((a: any, b: any) => {
          return a.x - b.x;
        });
      this.plotter.drawer.curve({
        points: curve,
        strokeColor: overlay.color,
        lineWidth: 6,
      });
    }
  }
}
