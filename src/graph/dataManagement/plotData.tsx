/*
  This is supposed to store all data related to a single plot, including
  rendering params, so that it can be constructed, reconstructed and changed 
  easily.
*/

import FCSFile from "./fcsFile";
import Gate from "./gate/gate";

/* TypeScript does not deal well with decorators. Your linter might
   indicate a problem with this function but it does not exist */
const conditionalUpdateDecorator = () => {
  return function (
    target: PlotData,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      original.apply(this, args);
      //@ts-ignore
      this.conditionalUpdate();
    };
  };
};

export default class PlotData {
  id: string;
  xRange: [number, number];
  yRange: [number, number];
  file: FCSFile;
  gates: Gate[];
  xAxis: string;
  yAxis: string;
  positionInWorkspace: [number, number];
  plotWidth: number;
  plotHeight: number;

  changed: boolean = false;

  /* PLOT DATA LIFETIME */

  setupPlot() {}

  export(): string {
    return JSON.stringify({
      fuck: "this",
    });
  }
  import(plotJSON: string) {
    const plot = JSON.parse(plotJSON);
    /* ... */
  }

  /* ALTER PLOT STATE */

  addGate() {}

  // private conditionalUpdate() {
  //   if (this.changed) {
  //     this.changed = false;
  //     if (this.plotRender === null || this.canvas.canvasRender === null) {
  //       throw Error("Null renderer for Canvas");
  //     }
  //     if (this.xAxis == this.yAxis) {
  //       this.plotter = this.histogramPlotter;
  //     } else {
  //       this.plotter = this.scatterPlotter;
  //     }
  //     this.draw();
  //   }
  // }

  // @conditionalUpdateDecorator()
  // setWidthAndHeight(w: number, h: number) {
  //   this.changed = this.changed || this.width != w || this.height != h;
  //   this.width = w;
  //   this.height = h;
  // }

  // @conditionalUpdateDecorator()
  // setXAxisPlotType(plotType: string) {
  //   this.changed = this.changed || this.xPlotType !== plotType;
  //   this.xPlotType = plotType;
  // }

  // @conditionalUpdateDecorator()
  // setYAxisPlotType(plotType: string) {
  //   this.changed = this.changed || this.yPlotType !== plotType;
  //   this.yPlotType = plotType;
  // }

  // @conditionalUpdateDecorator()
  // xAxisToHistogram() {
  //   this.changed = this.changed || this.yAxis !== this.xAxis;
  //   this.yAxis = this.xAxis;
  //   this.histogramAxis = "vertical";
  // }

  // @conditionalUpdateDecorator()
  // yAxisToHistogram() {
  //   this.changed = this.changed || this.yAxis !== this.xAxis;
  //   this.xAxis = this.yAxis;
  //   this.histogramAxis = "horizontal";
  // }

  // @conditionalUpdateDecorator()
  // setXAxis(xAxis: string) {
  //   this.changed = this.changed || xAxis !== this.xAxis;
  //   this.xAxis = xAxis;
  // }

  // @conditionalUpdateDecorator()
  // setYAxis(yAxis: string) {
  //   this.changed = this.changed || yAxis !== this.yAxis;
  //   this.yAxis = yAxis;
  // }

  // getXAxisName() {
  //   return this.xAxis;
  // }

  // getYAxisName() {
  //   return this.yAxis;
  // }
}
