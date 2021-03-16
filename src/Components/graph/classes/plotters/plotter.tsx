/*
    Responsible for providing a scatterplot with the input data
*/
import FCSFile from "../fcsFile";
import Drawer from "../drawers/drawer";

export interface PlotterInput {
  file: FCSFile;
  xAxis: string; // "FCS-A"
  yAxis: string; // "FTP-S"
  xRange?: [number, number] | undefined; // [0, 2000], or [10^5, 10^10]
  yRange?: [number, number] | undefined; // [0, 2000], or [10^5, 10^10]
  width?: number;
  height?: number;
  drawer: Drawer | null;
}

export default abstract class Plotter {
  // Essential Paramss
  width: number;
  height: number;
  drawer: Drawer | null = null;

  file: FCSFile;
  xAxis: string;
  yAxis: string;

  // Optional params
  xRange: [number, number];
  yRange: [number, number];

  // Internal
  drawer: GraphDrawer | null;
  canvas: GraphCanvas;

  // Constant
  rangeSpacer: number = 0.05;
  scale: number = 2;

  // Data
  xData: Array<number>;
  yData: Array<number>;

  constructor({
    file,
    xAxis,
    yAxis,
    xRange = undefined,
    yRange = undefined,
    width = 700,
    height = 600,
    drawer = null,
  }: PlotInput) {
    if (drawer === null) {
      throw Error("Undefined drawer for plotter");
    }

    this.file = file;
    this.xAxis = xAxis;
    this.yAxis = yAxis;

    this.xData = file.getAxisPoints(xAxis);
    this.yData = file.getAxisPoints(yAxis);

    this.width = width;
    this.height = height;

    this.xRange = xRange === undefined ? this.findRangeBoundries("x") : xRange;
    this.yRange = yRange === undefined ? this.findRangeBoundries("y") : yRange;

    this.drawer = null;
    this.canvas = new GraphCanvas({
      scale: this.scale,
      parentref: this,
      style: {
        width: this.width,
        height: this.height,
      },
    });
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
