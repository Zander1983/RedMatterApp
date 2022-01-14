import GatePlotterPlugin from "graph/renderers/plotters/runtimePlugins/gatePlotterPlugin";
import ScatterPlotter from "graph/renderers/plotters/scatterPlotter";
import { euclidianDistance2D } from "graph/utils/euclidianPlane";
import { selectPointDist } from "graph/renderers/gateMouseInteractors/polygonMouseInteractor";
import { Point, PolygonGate, Workspace } from "graph/resources/types";
import { getWorkspace, getFile, getPopulation } from "graph/utils/workspace";
import PlotStats from "graph/utils/stats";

export interface ScatterPolygonGatePlotterState {}
const statsProvider = new PlotStats();
interface PolygonGateState {
  points: Point[];
  lastMousePos: Point | null;
}

export default class ScatterPolygonGatePlotter extends GatePlotterPlugin {
  plotter: ScatterPlotter | null = null;
  gaterType = "2D" as "1D" | "2D";

  points: Point[] = [];
  polygonGates: PolygonGate[] = [];

  setPlotter(plotter: ScatterPlotter) {
    this.plotter = plotter;
  }

  setGates(gates: PolygonGate[]) {
    this.gates = gates;
  }

  setGatingState(state: PolygonGateState) {
    this.points = state.points.map((e) => {
      return { ...e };
    });
    this.lastMousePos = state.lastMousePos;
  }

  protected drawGate(gate: PolygonGate, drawGates?: PolygonGate[]) {
    //@ts-ignore
    const workspace: Workspace = getWorkspace();
    if (
      gate.xAxisType !== this.plotter.plot.xPlotType ||
      gate.yAxisType !== this.plotter.plot.yPlotType
    ) {
      return;
    }

    const pointCount = gate.points.length;
    const scale = this.plotter.scale;
    let x = 10000000000,
      y = 10000000000;
    for (let i = 0; i < pointCount; i++) {
      let p = { ...gate.points[i] };
      let pp = { ...gate.points[(i + 1) % gate.points.length] };
      p = this.plotter.transformer.toConcretePoint(p, undefined, true);
      pp = this.plotter.transformer.toConcretePoint(pp, undefined, true);

      // Setting the X & Y value for Stats
      if (p.y < y || pp.y < y) {
        y = p.y < pp.y ? p.y : pp.y;
        x = p.y < pp.y ? p.x : pp.x;
      }

      this.plotter.drawer.segment({
        x1: p.x * scale,
        y1: p.y * scale,
        x2: pp.x * scale,
        y2: pp.y * scale,
        lineWidth: 2,
        strokeColor: gate.color,
      });
      let color = "#f00";
      let size = 5;
      this.plotter.drawer.addPoint(p.x - size / 4, p.y - size / 4, size, color);
    }

    // setting up the states
    let stats: any;
    // let stats2: any;
    // workspace.populations.map((population) => {
    //   if (
    //     population.gates.length > 0 &&
    //     workspace.selectedFile === population.file
    //   ) {
    //     workspace.files.map((file) => {
    //       if (file.id === population.file) {
    //         if (workspace.plots.length > 0) {
    //           stats2 = statsProvider.getPlotStatsWithFiles(file, population);
    //         }
    //       }
    //     });
    //   }
    // });

    // workspace.plots.map((plot) => {
    //   const population = workspace.populations.find(
    //     (item) => item.id === plot.population
    //   );
    //   if (population && population.gates.length) {
    //     population.gates.map((g) => {
    //       if (g.gate === gate.id) {
    //         stats = statsProvider.getPlotStats(plot, 1, 1);
    //       }
    //     });
    //   }
    // });

    // stats = statsProvider.getPlotStats(this.plotter.plot, 1, 1);
    const plotPopulation = getPopulation(this.plotter.plot.population);
    const plotFile = getFile(plotPopulation.file);
    const gates = JSON.parse(JSON.stringify(plotPopulation.gates));
    gates.push({ gate: gate.id, inverseGating: false });

    stats = statsProvider.getPlotStatsWithFiles(
      plotFile,
      plotPopulation,
      gates
    );
    console.log(stats, plotFile);
    // console.log(stats2);

    // adding a rect for better visualization
    const rectY = y - 15;
    y = y - 3;
    this.plotter.drawer.rect({
      x: x * scale,
      y: rectY * scale,
      w: 100,
      h: 30,
      fill: true,
      fillColor: gate.color,
    });

    // Stat Text
    x = x + 5;
    this.plotter.drawer.text({
      x: x * scale,
      y: y * scale,
      text: stats.gatedFilePopulationPercentage,
      font: `24px Roboto`,
      fillColor: "white",
    });
  }

  protected drawGating() {
    if (this.points === undefined) return;
    let lastMousePos = { ...this.lastMousePos };
    const points = [
      ...this.points.map((e) => {
        return { ...e };
      }),
    ];
    const pointCount = points.length;
    let lastPoint = null;
    const scale = this.plotter.scale;
    for (let i = 0; i < pointCount; i++) {
      const p = points[i];
      this.plotter.drawer.addPoint(p.x, p.y, 2, "#f00");
      if (i === pointCount - 1) {
        const mouse = lastMousePos;
        this.plotter.drawer.addPoint(p.x, p.y, 2, "#f00");
        this.plotter.drawer.segment({
          x1: p.x * scale,
          y1: p.y * scale,
          x2: mouse.x * scale,
          y2: mouse.y * scale,
          lineWidth: this.closeToFirstPoint(mouse, false) ? 4 : 2,
          strokeColor: this.closeToFirstPoint(mouse, false) ? "#00f" : "#f00",
        });
      }
      if (lastPoint !== null) {
        this.plotter.drawer.segment({
          x1: p.x * scale,
          y1: p.y * scale,
          x2: lastPoint.x * scale,
          y2: lastPoint.y * scale,
          lineWidth: 2,
          strokeColor: "#f00",
        });
      }
      lastPoint = p;
    }
  }

  closeToFirstPoint(
    p: Point,
    abstract: boolean = false,
    otherPointToCompare: Point = undefined
  ) {
    const p1 =
      otherPointToCompare === undefined
        ? { ...this.points[0] }
        : otherPointToCompare;
    const p2 = abstract
      ? this.plotter.transformer.toConcretePoint({ ...p })
      : p;
    const dist = euclidianDistance2D(p1, p2);
    if (dist <= selectPointDist * 0.75) {
      return true;
    }
    return false;
  }
}
