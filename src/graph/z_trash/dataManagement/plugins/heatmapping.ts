import { pointInsideEllipse } from "graph/utils/euclidianPlane";

/*
  Heatmapping implementations, completely independent module.

  You call "getHeatmapColors" passing the data (however many dimesions you
  need) and the labels for the colors you want to target.
*/
export default class Heatmapping {
  // heatmappingRadius = 0.05;
  // heatMapCache: Array<{ xAxis: string; yAxis: string; colors: string[] }> = [];
  // colors: string[] | null = null;
  // getHeatmapColors(
  //   data: number[][],
  //   labels: string[],
  //   invalidateCache: boolean = false
  // ): string[] {
  //   if (data.length !== labels.length) {
  //     throw Error("Invalid match between data and labels size.");
  //   }
  // }
  // /*
  //   Characteristics:
  //   - Works on O(BINNING_SIZE^2 + dataLength).
  //   - If binning size is too low, look ugly.
  //   - Works really fast for a correct binning size.
  //   - Is easy to understand.
  // */
  // BINNING_SIZE: number = 100;
  // private binningAlgorithm(data: number[][]) {
  //   let bins: any[] = Array(data.length).fill(0);
  // }
  // /*
  //   Characteristics:
  //   - Works in O(dataLength^2).
  //   - Is slow for large datasets.
  //   - Coloring might look a little off if dataset is small.
  // */
  // private naiveAlgorithm() {
  //   for (const hm of this.heatMapCache) {
  //     const { xAxis, yAxis, colors } = hm;
  //     if (
  //       plotter.xAxisName == xAxis &&
  //       plotter.yAxisName == yAxis &&
  //       plotter.xAxis.length === colors.length
  //     ) {
  //       return colors;
  //     }
  //   }
  //   const hmr = this.heatmappingRadius;
  //   // Returns how many points are close (within heatmapping percentage radius)
  //   // to a given point i
  //   const ranges = this.plotter.plotData.getXandYRanges();
  //   const closePoints = (i: number) => {
  //     let count = 0;
  //     const x = plotter.xAxis[i];
  //     const y = plotter.yAxis[i];
  //     const xr = ranges.x[1] - ranges.x[0];
  //     const yr = ranges.y[1] - ranges.y[0];
  //     const pp1 = { x: x - hmr * xr, y: y };
  //     const pp2 = { x: x + hmr * xr, y: y };
  //     const sp1 = { x: x, y: y - hmr * yr };
  //     const sp2 = { x: x, y: y + hmr * yr };
  //     plotter.xAxis.forEach((e, j) => {
  //       if (
  //         j !== i &&
  //         pointInsideEllipse(
  //           { x: plotter.xAxis[j], y: plotter.yAxis[j] },
  //           {
  //             center: { x: x, y: y },
  //             primaryP1: pp1,
  //             primaryP2: pp2,
  //             secondaryP1: sp1,
  //             secondaryP2: sp2,
  //             ang: 0,
  //           }
  //         )
  //       ) {
  //         count++;
  //       }
  //     });
  //     return count;
  //   };
  //   const lp = Array(plotter.xAxis.length)
  //     .fill(0)
  //     .map((e, i) => closePoints(i));
  //   //@ts-ignore
  //   const mx = lp.reduce((a, c) => (a > c ? a : c), []);
  //   let cColors: string[] = lp.map((e) => {
  //     const p = -Math.pow(e / mx, 5) + 1;
  //     const blue = (150 - 50) * p + 50;
  //     const red = -(210 - 100) * p + 210;
  //     const green = 80;
  //     return `rgb(${red}, ${green}, ${blue})`;
  //   });
  //   for (let i = 0; i < plotter.xAxis.length; i++) {}
  //   this.heatMapCache.push({
  //     colors: cColors,
  //     xAxis: plotter.xAxisName,
  //     yAxis: plotter.yAxisName,
  //   });
  //   return cColors;
  // }
}
