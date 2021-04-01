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

interface Point {
  x: number;
  y: number;
}

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
    center: Point | null;
    primaryP1: Point | null;
    primaryP2: Point | number;
    secondaryP1: Point | null;
    secondaryP2: Point | null;
    ang: number | null;
  } | null = null;
  lastMousePos: Point;

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

  setLastMousePos(lastMousePos: { x: number; y: number }) {
    this.lastMousePos = lastMousePos;
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

  drawOvalGate(
    gate:
      | OvalGate
      | {
          center: Point;
          primaryP1: Point;
          primaryP2: Point;
          secondaryP1: Point;
          secondaryP2: Point;
        }
  ) {
    const c = this.convertToPlotPoint(gate.center.x, gate.center.y);
    const p1 = this.convertToPlotPoint(gate.primaryP1.x, gate.primaryP1.y);
    const p2 = this.convertToPlotPoint(gate.primaryP2.x, gate.primaryP2.y);
    const s1 = this.convertToPlotPoint(gate.secondaryP1.x, gate.secondaryP1.y);
    const s2 = this.convertToPlotPoint(gate.secondaryP2.x, gate.secondaryP2.y);

    const d1 = euclidianDistance2D(p1, p2);
    const d2 = euclidianDistance2D(s1, s2);

    const ang = getVectorAngle2D(p1, p2);

    this.drawer.oval({
      x: c.x,
      y: c.y,
      d1: d1 / 2,
      d2: d2 / 2,
      ang: ang,
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

    //@ts-ignore
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
    if (this.heatmap) {
      heatmapColors = this.getHeatmapColors();
    }

    for (let i = 0; i < this.xAxis.length; i++) {
      let color = "#444";
      if (this.heatmap) {
        color = heatmapColors[i];
      }

      let validConcrete = this.gates.length > 0 ? true : false;
      for (let gate of this.gates) {
        if (!(gate instanceof OvalGate)) {
          continue;
        }
        const c = this.drawer.convertToPlotCanvasPoint(
          gate.center.x,
          gate.center.y
        );
        const p1 = this.drawer.convertToPlotCanvasPoint(
          gate.primaryP1.x,
          gate.primaryP1.y
        );
        const p2 = this.drawer.convertToPlotCanvasPoint(
          gate.primaryP2.x,
          gate.primaryP2.y
        );
        const s1 = this.drawer.convertToPlotCanvasPoint(
          gate.secondaryP1.x,
          gate.secondaryP1.y
        );
        const s2 = this.drawer.convertToPlotCanvasPoint(
          gate.secondaryP2.x,
          gate.secondaryP2.y
        );
        const v = this.drawer.convertToPlotCanvasPoint(
          this.xAxis[i],
          this.yAxis[i]
        );
        const ang = getVectorAngle2D(p1, p2);

        if (
          !pointInsideEllipse(v, {
            center: c,
            primaryP1: p1,
            primaryP2: p2,
            secondaryP1: s1,
            secondaryP2: s2,
            ang: ang,
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
        if (!gate.isPointInside({ x: this.xAxis[i], y: this.yAxis[i] })) {
          validAbstract = false;
        }
      }

      if (validConcrete && !validAbstract) color = "#44f";
      if (!validConcrete && validAbstract) color = "#4b4";
      if (validConcrete && validAbstract) color = "#f44";
      // if (validAbstract) color = "#44f";
      plotGraph.addPoint(this.xAxis[i], this.yAxis[i], 1.4, color);
    }

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
          const { x, y } = this.drawer.convertToPlotCanvasPoint(
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
    center: Point | null;
    primaryP1: Point | null;
    primaryP2: Point | number;
    secondaryP1: Point | null;
    secondaryP2: Point | null;
    ang: number;
  }) {
    console.log("=== oval gate state has been set ===");
    this.ovalGateState = state;
  }

  unsetOvalGate() {
    this.ovalGateState = null;
  }

  drawOvalGating(context: any, plotGraph: any) {
    if (
      this.ovalGateState.primaryP1 != null &&
      this.ovalGateState.secondaryP1 != null
    ) {
      //@ts-ignore
      this.drawOvalGate(this.ovalGateState);
      this.drawer.scline({
        x1: this.ovalGateState.center.x,
        y1: this.ovalGateState.center.y,
        x2: this.ovalGateState.primaryP1.x,
        y2: this.ovalGateState.primaryP1.y,
        lineWidth: 3,
        strokeColor: "#d00",
      });
      plotGraph.addPoint(
        this.ovalGateState.center.x,
        this.ovalGateState.center.y,
        "#00d"
      );
    } else if (this.ovalGateState.primaryP1 != null) {
      this.drawer.scline({
        x1: this.ovalGateState.primaryP1.x,
        y1: this.ovalGateState.primaryP1.y,
        x2: this.lastMousePos.x,
        y2: this.lastMousePos.y,
        lineWidth: 3,
        strokeColor: "#f00",
      });
    }
  }

  convertToAbstractPoint(x: number, y: number): any {
    return this.drawer.convertToAbstractPoint(x, y);
  }
}
