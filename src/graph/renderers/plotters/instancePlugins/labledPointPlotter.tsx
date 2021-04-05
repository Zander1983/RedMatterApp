import PlotterPlugin from "graph/renderers/plotters/plotterPlugin";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";

export default class ScatterHeatmapperPlugin extends PlotterPlugin {
  static TargetPlotter = ScatterPlotter;
  plotter: ScatterPlotter;
  specialPoints: {
    color: string;
    x: number;
    y: number;
    text: string | undefined;
  }[] = [];

  setPlotter(plotter: ScatterPlotter) {
    this.plotter = plotter;
  }

  draw_AFTER(index: number) {
    const plotter = this.plotter;
    for (const special of this.specialPoints) {
      if (special.text !== undefined) {
        const { x, y } = plotter.transformer.convertToPlotCanvasPoint(
          special.x,
          special.y
        );
        this.drawer.text({
          x: (x + 5) * this.scale,
          y: (y - 5) * this.scale,
          radius: 3,
          text: special.text,
          font: "30px Roboto black",
        });
      } else {
        this.drawer.text({
          x: (special.x + 5) * this.scale,
          y: (special.y - 5) * this.scale,
          text: special.text,
          font: "30px Roboto black",
        });
      }
    }
  }
}
