/*
    Responsible for providing a scatterplot with the input data
*/
import FCSFile from "../fcsFile";
import Drawer from "../drawers/drawer";
import GraphDrawer from "../drawers/scatterDrawer";

export interface PlotterInput {
  xAxis: string; // "FCS-A"
  yAxis: string; // "FTP-S"
  width: number;
  height: number;
  xRange?: [number, number] | undefined; // [0, 2000], or [10^5, 10^10]
  yRange?: [number, number] | undefined; // [0, 2000], or [10^5, 10^10]
}

export default abstract class Plotter {
  // Essential Paramss
  width: number;
  height: number;

  xAxis: Array<number>;
  yAxis: Array<number>;

  // Optional params
  xRange: [number, number];
  yRange: [number, number];

  // Internal
  drawer: Drawer | null = null;

  // Constant
  rangeSpacer: number = 0.05;
  scale: number = 2;

  constructor({
    xAxis,
    yAxis,
    width,
    height,
    xRange = undefined,
    yRange = undefined,
  }: PlotInput) {
    if (drawer === null) {
      throw Error("Undefined drawer for plotter");
    }
    this.xAxis = xAxis;
    this.yAxis = yAxis;

    this.width = width;
    this.height = height;

    this.xRange = xRange === undefined ? this.findRangeBoundries("x") : xRange;
    this.yRange = yRange === undefined ? this.findRangeBoundries("y") : yRange;

    this.drawer = new GraphDrawer({});
  }

  findRangeBoundries(axis: "x" | "y"): [number, number] {
    const axisData = axis === "x" ? this.xData : this.yData;
    let min = axisData[0],
      max = axisData[0];
    for (const p of axisData) {
      min = Math.min(p, min);
      max = Math.max(p, max);
    }
    const d = Math.max(max - min, 0.1);
    return [min - d * this.rangeSpacer, max + d * this.rangeSpacer];
  }

  abstract draw(context: any, frameCount: number): void;
}
