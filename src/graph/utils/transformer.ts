// import { Plot, Point } from "graph/resources/types";
// import FCSServices from "services/FCSServices/FCSServices";
// import {
//   bottomPadding,
//   leftPadding,
//   rightPadding,
//   topPadding,
// } from "../renderers/plotters/graphPlotter";

// const isOutOfBounds = (plot: Plot, p: Point): boolean => {
//   let { ibx, iby, iex, iey } = this;
//   const xBi = this.plot.xPlotType === "bi";
//   const yBi = this.plot.yPlotType === "bi";
//   const rangeX = xBi ? [0.5, 1] : [ibx, iex];
//   const rangeY = yBi ? [0.5, 1] : [iby, iey];
//   if (p.x < rangeX[0] || p.x > rangeX[1]) {
//     return true;
//   }
//   if (p.y < rangeY[0] || p.y > rangeY[1]) {
//     return true;
//   }
//   return false;
// };

// const toConcretePoint = (
//   p: Point,
//   customRanges?: [[number, number], [number, number]],
//   withLogicle: boolean = false
// ): Point => {
//   let { ibx, iby, iex, iey } = this;
//   if (customRanges !== undefined) {
//     ibx = customRanges[0][0];
//     iex = customRanges[0][1];
//     iby = customRanges[1][0];
//     iey = customRanges[1][1];
//   }
//   const xBi = this.plot.xPlotType === "bi";
//   const yBi = this.plot.yPlotType === "bi";
//   let ret = { x: 0, y: 0 };
//   if (withLogicle) {
//     p = rawAbstractLinearToLogicle(p);
//   }
//   ret.x = xBi
//     ? toConcreteLogicle(p.x, "x")
//     : toConcreteLinear(p.x, "x", ibx, iex);
//   ret.y = yBi
//     ? toConcreteLogicle(p.y, "y")
//     : toConcreteLinear(p.y, "y", iby, iey);
//   return ret;
// };

// const toConcreteLinear = (
//   number: number,
//   axis: "x" | "y",
//   b: number,
//   e: number
// ): number => {
//   const amplitude =
//     axis === "x"
//       ? Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2)
//       : Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2);

//   const padding =
//     axis === "x" ? Math.min(this.x1, this.x2) : Math.max(this.y1, this.y2);

//   const scaledPosition = (number - b) / (e - b);

//   return axis === "x"
//     ? (padding + scaledPosition * amplitude) / this.scale
//     : (padding - scaledPosition * amplitude) / this.scale;
// };

// const toConcreteLogicle = (number: number, axis: "x" | "y"): number => {
//   let range =
//     axis === "x"
//       ? [leftPadding, this.plot.plotWidth - rightPadding]
//       : [topPadding, this.plot.plotHeight - bottomPadding];
//   const amplitude = range[1] - range[0];
//   return axis === "x"
//     ? amplitude * number + range[0]
//     : amplitude * (1.0 - number) + range[0];
// };

// const toAbstractPoint = (p: Point, forceLin: boolean = false): Point => {
//   const xBi = this.plot.xPlotType === "bi";
//   const yBi = this.plot.yPlotType === "bi";
//   let ret = { x: 0, y: 0 };
//   ret.x =
//     xBi && !forceLin ? toAbstractLogicle(p.x, "x") : toAbstractLinear(p.x, "x");
//   ret.y =
//     yBi && !forceLin ? toAbstractLogicle(p.y, "y") : toAbstractLinear(p.y, "y");
//   return ret;
// };

// const toAbstractLogicle = (number: number, axis: "x" | "y"): number => {
//   let range =
//     axis === "x"
//       ? [leftPadding, this.plot.plotWidth - rightPadding]
//       : [topPadding, this.plot.plotHeight - bottomPadding];
//   const ret =
//     axis === "x"
//       ? 1 - (range[1] - number) / (range[1] - range[0])
//       : (range[1] - number) / (range[1] - range[0]);
//   return ret;
// };

// const toAbstractLinear = (number: number, axis: "x" | "y"): number => {
//   const plotRange =
//     axis === "x"
//       ? this.x2 / this.scale - this.x1 / this.scale
//       : this.y1 / this.scale - this.y2 / this.scale;
//   const abstractRange =
//     axis === "x" ? this.iex - this.ibx : this.iey - this.iby;
//   return axis === "x"
//     ? ((number - this.x1 / this.scale) / plotRange) * abstractRange + this.ibx
//     : this.iey - ((this.y1 / this.scale - number) / plotRange) * abstractRange;
// };

// const abstractLinearToLogicle = (p: {
//   x: number;
//   y: number;
// }): {
//   x: number;
//   y: number;
// } => {
//   const xBi = this.plot.xPlotType === "bi";
//   const yBi = this.plot.yPlotType === "bi";
//   if (!xBi && !yBi) return p;
//   let ranges = [
//     this.plot.ranges[this.plot.xAxis],
//     this.plot.ranges[this.plot.yAxis],
//   ];
//   const fcsService = new FCSServices();
//   if (xBi) {
//     p.x = fcsService.logicleMarkTransformer(
//       [p.x],
//       ranges[0][0],
//       ranges[0][1]
//     )[0];
//   }
//   if (yBi) {
//     p.y = fcsService.logicleMarkTransformer(
//       [p.y],
//       ranges[0][0],
//       ranges[0][1]
//     )[0];
//   }
//   return p;
// };

// const abstractLogicleToLinear = (p: {
//   x: number;
//   y: number;
// }): {
//   x: number;
//   y: number;
// } => {
//   const xBi = this.plot.xPlotType === "bi";
//   const yBi = this.plot.yPlotType === "bi";
//   if (!xBi && !yBi) return p;
//   let ranges = [
//     this.plot.ranges[this.plot.xAxis],
//     this.plot.ranges[this.plot.yAxis],
//   ];
//   const fcsService = new FCSServices();
//   let ret = { x: 0, y: 0 };
//   if (xBi) {
//     p.x = fcsService.logicleInverseMarkTransformer(
//       [p.x],
//       ranges[0][0],
//       ranges[0][1]
//     )[0];
//   } else ret.x = p.x;
//   if (yBi) {
//     p.y = fcsService.logicleInverseMarkTransformer(
//       [p.y],
//       ranges[0][0],
//       ranges[0][1]
//     )[0];
//   } else ret.y = p.y;
//   return p;
// };

// const rawAbstractLogicleToLinear = (p: Point): Point => {
//   const np = { ...p };
//   const xBi = this.plot.xPlotType === "bi";
//   const yBi = this.plot.yPlotType === "bi";
//   let ranges = [
//     this.plot.ranges[this.plot.xAxis],
//     this.plot.ranges[this.plot.yAxis],
//   ];
//   if (xBi) {
//     np.x = ranges[0][0] + (ranges[0][1] - ranges[0][0]) * np.x;
//   }
//   if (yBi) {
//     np.y = ranges[1][0] + (ranges[1][1] - ranges[1][0]) * np.y;
//   }
//   return np;
// };

// const rawAbstractLinearToLogicle = (p: Point): Point => {
//   const xBi = this.plot.xPlotType === "bi";
//   const yBi = this.plot.yPlotType === "bi";
//   let ranges = [
//     this.plot.ranges[this.plot.xAxis],
//     this.plot.ranges[this.plot.yAxis],
//   ];
//   if (xBi) {
//     p.x = (p.x - ranges[0][0]) / (ranges[0][1] - ranges[0][0]);
//   }
//   if (yBi) {
//     p.y = (p.y - ranges[1][0]) / (ranges[1][1] - ranges[1][0]);
//   }
//   return p;
// };

export {};
