/*
  Canvas - A frontend for a canvas component, which includes it's files.
  This exists to facilitate the life of CanvasManager by removing the
  complexities of logic that has to be fed to each canvas.
*/

import FCSFile from "../fcsFile";
import CanvasComponent from "./canvasComponent";

class Canvas {
  xAxis: string;
  yAxis: string;
  width: number;
  height: number;
  changed: boolean = false;
  xPlotType = "lin";
  yPlotType = "lin";
  canvas: any = null;
  id: number;
  rerender: Function;

  constructor(file: FCSFile, id: number, rerender: Function) {
    this.xAxis = file.axes[0];
    this.yAxis = file.axes[1];
    this.width = 0;
    this.height = 0;
    this.id = id;

    this.rerender = rerender;

    this.canvas = <CanvasComponent rerender={this.rerender} />;
  }

  wasCanvasChanged(): boolean {
    if (this.changed) {
      this.changed = false;
      return true;
    }
    return false;
  }

  getCanvas() {
    return this.canvas;
  }

  setXAxisPlotType(plotType: string) {
    this.changed = this.changed || this.xPlotType !== plotType;
    this.xPlotType = plotType;
  }

  setYAxisPlotType(plotType: string) {
    this.changed = this.changed || this.yPlotType !== plotType;
    this.yPlotType = plotType;
  }

  xAxisToHistogram() {
    this.changed = this.changed || this.yAxis !== this.xAxis;
    this.yAxis = this.xAxis;
  }

  yAxisToHistogram() {
    this.changed = this.changed || this.yAxis !== this.xAxis;
    this.xAxis = this.yAxis;
  }

  setXAxis(xAxis: string) {
    this.changed = this.changed || xAxis !== this.xAxis;
    this.xAxis = xAxis;
  }

  setYAxis(yAxis: string) {
    this.changed = this.changed || yAxis !== this.yAxis;
    this.yAxis = yAxis;
  }
}

export default Canvas;
