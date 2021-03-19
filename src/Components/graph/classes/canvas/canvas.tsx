/*
  Canvas - A frontend for a canvas component, which includes it's files.
  This exists to facilitate the life of CanvasManager by removing the
  complexities of logic that has to be fed to each canvas.
*/

import FCSFile from "../fcsFile";
import MouseInteractor from "../mouseInteractors/mouseInteractor";
import CanvasComponent from "./canvasComponent";

/* TypeScript does not deal well with decorators. Your linter might
   indicate a problem with this function but it does not exist */
const conditionalUpdateDecorator = () => {
  return function (
    target: Canvas,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      original.apply(this, args);
      if (this.changed) {
        this.changed = false;
        if (this.rerender === null) {
          throw Error("Null rerenderer for Canvas");
        }
        this.rerender();
      }
    };
  };
};

class Canvas {
  xAxis: string;
  yAxis: string;
  changed: boolean = false;
  xPlotType = "lin";
  yPlotType = "lin";
  id: number;
  rerender: Function | null = null;
  file: FCSFile;
  mouseInteractor: MouseInteractor;

  constructor(file: FCSFile, id: number) {
    this.xAxis = file.axes[0];
    this.yAxis = file.axes[1];
    this.id = id;
    this.file = file;
    this.rerender = null;
    this.mouseInteractor = new MouseInteractor();
  }

  componentSizeUpdater: Function;

  getCanvas() {
    return (
      <CanvasComponent
        sizeupdatersetter={(su: Function) => {
          this.componentSizeUpdater = su;
        }}
        data={{
          x: this.file.getAxisPoints(this.xAxis),
          y: this.file.getAxisPoints(this.yAxis),
        }}
        histogram={(this.xAxis == this.yAxis).toString()}
        // mouseInteractor={this.mouseInteractor}
        id={this.id}
      />
    );
  }

  getFile() {
    return this.file;
  }

  setWidthAndHeight(width: number, height: number) {
    this.componentSizeUpdater(width, height);
  }

  @conditionalUpdateDecorator()
  setXAxisPlotType(plotType: string) {
    this.changed = this.changed || this.xPlotType !== plotType;
    this.xPlotType = plotType;
  }

  @conditionalUpdateDecorator()
  setYAxisPlotType(plotType: string) {
    this.changed = this.changed || this.yPlotType !== plotType;
    this.yPlotType = plotType;
  }

  @conditionalUpdateDecorator()
  xAxisToHistogram() {
    this.changed = this.changed || this.yAxis !== this.xAxis;
    this.yAxis = this.xAxis;
  }

  @conditionalUpdateDecorator()
  yAxisToHistogram() {
    this.changed = this.changed || this.yAxis !== this.xAxis;
    this.xAxis = this.yAxis;
  }

  @conditionalUpdateDecorator()
  setXAxis(xAxis: string) {
    this.changed = this.changed || xAxis !== this.xAxis;
    this.xAxis = xAxis;
  }

  @conditionalUpdateDecorator()
  setYAxis(yAxis: string) {
    this.changed = this.changed || yAxis !== this.yAxis;
    this.yAxis = yAxis;
  }
}

export default Canvas;
