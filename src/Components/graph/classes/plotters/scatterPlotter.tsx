/*
    Responsible for providing a scatterplot with the input data
*/
import { ThreeSixtySharp } from "@material-ui/icons";
import Drawer from "../drawers/drawer";
import ScatterDrawer from "../drawers/scatterDrawer";
import OvalGate from "../gate/ovalGate";
import Gate from "../gate/gate";
import {
  euclidianDistance2D,
  getVectorAngle2D,
  pointInsideEllipse,
} from "../utils/euclidianPlane";

import Plotter, { PlotterInput } from "./plotter";
import { type } from "jquery";

const leftPadding = 70;
const rightPadding = 50;
const topPadding = 50;
const bottomPadding = 50;

interface ScatterPlotterInput extends PlotterInput {
  heatmap: boolean;
  xAxisName: string;
  yAxisName: string;
}

export default class ScatterPlotter extends Plotter {
  // Optional params
  xLabels: Array<string>;
  yLabels: Array<string>;
  gates: Gate[] = [];
  drawer: ScatterDrawer;
  heatmap: boolean = false;
  xAxisName: string;
  yAxisName: string;
  heatmappingRadius: number;
  specialPointsList: {
    x: number;
    y: number;
    color: string;
    text?: string;
    concrete?: boolean;
  }[] = [];

  ovalGateState: {
    p0: {
      x: number;
      y: number;
    } | null;
    p1: {
      x: number;
      y: number;
    } | null;
    lastMousePos: {
      x: number;
      y: number;
    } | null;
    e: number;
    ang: number;
    ovalGate: OvalGate | null;
  } | null = null;

  constructor(params: ScatterPlotterInput) {
    super(params);
    this.xLabels = this.createRangeArray("x");
    this.yLabels = this.createRangeArray("y");

    this.heatmap = params.heatmap;
    this.xAxisName = params.xAxisName;
    this.yAxisName = params.yAxisName;

    // percentage of range in each dimension. seeks all points close to each
    // point to assign it's color.
    this.heatmappingRadius = 0.05;

    this.drawer = new ScatterDrawer({
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.xRange[0],
      iex: this.xRange[1],
      iby: this.yRange[0],
      iey: this.yRange[1],
      scale: this.scale,
    });
  }

  createRangeArray(axis: "x" | "y"): Array<string> {
    const plotSize = axis === "x" ? this.width : this.height;
    const rangeSize =
      axis === "x"
        ? this.xRange[1] - this.xRange[0]
        : this.yRange[1] - this.yRange[0];
    const rangeMin = axis === "x" ? this.xRange[0] : this.yRange[0];
    const lineCount = Math.round(plotSize / 100);
    return Array(lineCount).map((e, i) =>
      ((rangeSize * i) / lineCount + rangeMin).toString()
    );
  }

  setGates(gates: Gate[]) {
    this.gates = gates;
  }

  ovalGate: OvalGate;

  convertToPlotPoint(x: number, y: number) {
    return this.drawer.convertToPlotCanvasPoint(x, y);
  }

  resetDrawer() {
    this.xRange = this.findRangeBoundries("x");
    this.yRange = this.findRangeBoundries("y");
    this.xLabels = this.createRangeArray("x");
    this.yLabels = this.createRangeArray("y");
    this.drawer.setMeta({
      x1: leftPadding * this.scale,
      y1: topPadding * this.scale,
      x2: (this.width - rightPadding) * this.scale,
      y2: (this.height - bottomPadding) * this.scale,
      ibx: this.xRange[0],
      iex: this.xRange[1],
      iby: this.yRange[0],
      iey: this.yRange[1],
      scale: this.scale,
    });
  }

  drawOvalGate(gate: OvalGate) {
    const [p1x, p1y] = this.convertToPlotPoint(
      gate.primaryP1.x,
      gate.primaryP1.y
    );
    const [p2x, p2y] = this.convertToPlotPoint(
      gate.primaryP2.x,
      gate.primaryP2.y
    );
    const [s1x, s1y] = this.convertToPlotPoint(
      gate.secondaryP1.x,
      gate.secondaryP1.y
    );
    const [s2x, s2y] = this.convertToPlotPoint(
      gate.secondaryP2.x,
      gate.secondaryP2.y
    );

    const d1 = euclidianDistance2D({ x: p1x, y: p1y }, { x: p2x, y: p2y });
    const d2 = euclidianDistance2D({ x: s1x, y: s1y }, { x: s2x, y: s2y });

    const concreteAng = getVectorAngle2D(
      { x: p1x, y: p1y },
      { x: p2x, y: p2y }
    );

    this.drawer.oval({
      x: gate.center.x,
      y: gate.center.y,
      d1: d1 / 2,
      d2: d2 / 2,
      ang: concreteAng,
    });
  }

  heatMapCache: Array<{ xAxis: string; yAxis: string; colors: string[] }> = [];

  getHeatmapColors() {
    for (const hm of this.heatMapCache) {
      const { xAxis, yAxis, colors } = hm;
      if (this.xAxisName == xAxis && this.yAxisName == yAxis) {
        return colors;
      }
    }
    const hmr = this.heatmappingRadius;

    // Returns how many points are close (within heatmapping percentage radius)
    // to a given point i
    const closePoints = (i: number) => {
      let count = 0;

      const x = this.xAxis[i];
      const y = this.yAxis[i];
      const xr = this.xRange[1] - this.xRange[0];
      const yr = this.yRange[1] - this.yRange[0];
      const pp1 = { x: x - hmr * xr, y: y };
      const pp2 = { x: x + hmr * xr, y: y };
      const sp1 = { x: x, y: y - hmr * yr };
      const sp2 = { x: x, y: y + hmr * yr };

      this.xAxis.forEach((e, j) => {
        if (
          j !== i &&
          pointInsideEllipse(
            { x: this.xAxis[j], y: this.yAxis[j] },
            {
              center: { x: x, y: y },
              primaryP1: pp1,
              primaryP2: pp2,
              secondaryP1: sp1,
              secondaryP2: sp2,
              ang: 0,
            }
          )
        ) {
          count++;
        }
      });
      return count;
    };
    const lp = Array(this.xAxis.length)
      .fill(0)
      .map((e, i) => closePoints(i));
    const mx = lp.reduce((a, c) => (a > c ? a : c), []);
    let cColors: string[] = lp.map((e) => {
      const p = -Math.pow(e / mx, 5) + 1;
      const blue = (150 - 50) * p + 50;
      const red = -(210 - 100) * p + 210;
      const green = 80;
      return `rgb(${red}, ${green}, ${blue})`;
    });
    for (let i = 0; i < this.xAxis.length; i++) {}
    this.heatMapCache.push({
      colors: cColors,
      xAxis: this.xAxisName,
      yAxis: this.yAxisName,
    });
    return cColors;
  }

  draw(context: any, frameCount: number) {
    this.resetDrawer();

    this.drawer.setContext(context);

    let plotGraph = this.drawer.drawPlotGraph();

    let heatmapColors: string[] = [];
    // if (this.heatmap) {
    //   heatmapColors = this.getHeatmapColors();
    // }

    for (let i = 0; i < this.xAxis.length; i++) {
      let color = "#444";
      // if (this.heatmap) {
      //   color = heatmapColors[i];
      // }

      let validConcrete = this.gates.length > 0 ? true : false;
      for (let gate of this.gates) {
        if (!(gate instanceof OvalGate)) {
          continue;
        }
        const [p1x, p1y] = this.drawer.convertToPlotCanvasPoint(
          gate.primaryP1.x,
          gate.primaryP1.y
        );
        const [p2x, p2y] = this.drawer.convertToPlotCanvasPoint(
          gate.primaryP2.x,
          gate.primaryP2.y
        );
        const [s1x, s1y] = this.drawer.convertToPlotCanvasPoint(
          gate.secondaryP1.x,
          gate.secondaryP1.y
        );
        const [s2x, s2y] = this.drawer.convertToPlotCanvasPoint(
          gate.secondaryP2.x,
          gate.secondaryP2.y
        );
        const c = { x: (p1x + p2x) / 2, y: (p1y + p2y) / 2 };
        const p1 = { x: p1x, y: p1y };
        const p2 = { x: p2x, y: p2y };
        const s1 = { x: s1x, y: s1y };
        const s2 = { x: s2x, y: s2y };
        const [v1, v2] = this.drawer.convertToPlotCanvasPoint(
          this.xAxis[i],
          this.yAxis[i]
        );
        const p = { x: v1, y: v2 };
        if (
          !pointInsideEllipse(p, {
            center: c,
            primaryP1: p1,
            primaryP2: p2,
            secondaryP1: s1,
            secondaryP2: s2,
            ang: getVectorAngle2D(p1, p2),
          })
        ) {
          validConcrete = false;
        }
      }

      let validAbstract = this.gates.length > 0 ? true : false;
      for (let gate of this.gates) {
        if (!(gate instanceof OvalGate)) {
          continue;
        }
        if (
          !pointInsideEllipse(
            { x: this.xAxis[i], y: this.yAxis[i] },
            {
              center: gate.center,
              primaryP1: gate.primaryP1,
              primaryP2: gate.primaryP2,
              secondaryP1: gate.secondaryP1,
              secondaryP2: gate.secondaryP2,
              ang: getVectorAngle2D(gate.primaryP1, gate.primaryP2),
            }
          )
        ) {
          validAbstract = false;
        }
      }
      if (validConcrete && !validAbstract) color = "#f44";
      if (!validConcrete && validAbstract) color = "#4f4";
      if (validConcrete && validAbstract) color = "#44f";
      plotGraph.addPoint(this.xAxis[i], this.yAxis[i], 1.4, color);
    }
    console.log("drawing again");

    if (this.ovalGateState != null) {
      this.drawOvalGating(context, plotGraph);
    }

    for (const gate of this.gates) {
      if (
        gate instanceof OvalGate &&
        this.xAxisName == gate.xAxis &&
        this.yAxisName == gate.yAxis
      ) {
        this.drawOvalGate(gate);
      }
    }

    for (const special of this.specialPointsList) {
      if (special.concrete === true) {
        this.drawer.circle({
          x: special.x * this.scale,
          y: special.y * this.scale,
          radius: 3,
          fillColor: special.color,
        });
      } else {
        plotGraph.addPoint(special.x, special.y, 5, special.color);
      }
      if (special.text !== undefined) {
        if (special.concrete !== true) {
          const [x, y] = this.drawer.convertToPlotCanvasPoint(
            special.x,
            special.y
          );
          this.drawer.text({
            x: (x + 5) * this.scale,
            y: (y - 5) * this.scale,
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

  setOvalGateState(state: {
    p0: {
      x: number;
      y: number;
    } | null;
    p1: {
      x: number;
      y: number;
    } | null;
    lastMousePos: {
      x: number;
      y: number;
    } | null;
    e: number;
    ang: number;
    ovalGate: OvalGate | null;
  }) {
    this.ovalGateState = state;
  }

  unsetOvalGate() {
    this.ovalGateState = null;
  }

  drawOvalGating(context: any, plotGraph: any) {
    if (this.ovalGateState.p0 != null && this.ovalGateState.p1 != null) {
      const x = (this.ovalGateState.p0.x + this.ovalGateState.p1.x) / 2;
      const y = (this.ovalGateState.p0.y + this.ovalGateState.p1.y) / 2;

      const [p1cx, p1cy] = this.drawer.convertToPlotCanvasPoint(
        this.ovalGateState.p0.x,
        this.ovalGateState.p0.y
      );
      const [p2cx, p2cy] = this.drawer.convertToPlotCanvasPoint(
        this.ovalGateState.p1.x,
        this.ovalGateState.p1.y
      );
      const dist = euclidianDistance2D(
        { x: p1cx, y: p1cy },
        { x: p2cx, y: p2cy }
      );
      this.drawer.oval({
        x: x,
        y: y,
        ang: this.ovalGateState.ang,
        d1: dist / 2,
        d2: (this.ovalGateState.e * dist) / 2,
      });
      this.drawer.scline({
        x1: x,
        y1: y,
        x2: this.ovalGateState.p1.x,
        y2: this.ovalGateState.p1.y,
        lineWidth: 3,
        strokeColor: "#f00",
      });
      plotGraph.addPoint(x, y, "#00f");
    } else if (this.ovalGateState.p0 != null) {
      this.drawer.scline({
        x1: this.ovalGateState.p0.x,
        y1: this.ovalGateState.p0.y,
        x2: this.ovalGateState.lastMousePos.x,
        y2: this.ovalGateState.lastMousePos.y,
        lineWidth: 3,
        strokeColor: "#f00",
      });
    }
  }

  convertToAbstractPoint(x: number, y: number): any {
    return this.drawer.convertToAbstractPoint(x, y);
  }
}
