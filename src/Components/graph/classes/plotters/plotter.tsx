/*
    Responsible for providing a scatterplot with the input data
*/
import FCSFile from "../fcsFile";
import ScatterDrawer from "../drawers/scatterDrawer";

export interface PlotterInput {
  xAxis: Array<number>; // "FCS-A"
  yAxis: Array<number>; // "FTP-S"
  width: number;
  height: number;
  scale: number;
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

  // Constant
  rangeSpacer: number = 0.05;
  scale: number = 2;

  drawer: ScatterDrawer | null = null;

  constructor({
    xAxis,
    yAxis,
    width,
    height,
    scale,
    xRange = undefined,
    yRange = undefined,
  }: PlotterInput) {
    this.xAxis = xAxis;
    this.yAxis = yAxis;

    this.width = width;
    this.height = height;
    this.scale = scale;

    this.xRange = xRange === undefined ? this.findRangeBoundries("x") : xRange;
    this.yRange = yRange === undefined ? this.findRangeBoundries("y") : yRange;
  }

  findRangeBoundries(axis: "x" | "y"): [number, number] {
    const axisData = axis === "x" ? this.xAxis : this.yAxis;
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

  abstract convertToAbstractPoint(x: number, y: number): any;
}
