/*
  This is responsible for plotting a general graph given specific inputs
*/
import Drawer from "./drawer";
import { TimerOff } from "@material-ui/icons";

const binPadding = 5;

interface HistogramDrawerConstructorParams {
  context: any;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  ibx: number;
  iex: number;
  iby: number;
  iey: number;
}

interface GraphLineParams {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  ib: number;
  ie: number;
}

interface PlotGraph {
  addLine: Function;
  addPoint: Function;
  addPolygon: Function;
}

//@ts-ignore
export default class HistogramDrawer extends Drawer {
  private x1: number;
  private y1: number;
  private x2: number;
  private y2: number;

  private ibx: number;
  private iex: number;
  private iby: number;
  private iey: number;

  private scale: number;

  private ypts: number;
  private xpts: number;
  private binSize: number;
  private bins: number;

  private axis: "vertical" | "horizontal" = "vertical";

  constructor({
    x1,
    y1,
    x2,
    y2,
    ibx,
    iex,
    iby,
    iey,
    binSize,
  }: //@ts-ignore
  GraphDrawerConstructorParams) {
    super();
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.ibx = ibx;
    this.iex = iex;
    this.iby = iby;
    this.iey = iey;

    this.binSize = binSize;
    this.bins = Math.floor((x2 - x1) / this.binSize);
  }

  setMeta(state: any) {
    this.x1 = state.x1;
    this.y1 = state.y1;
    this.x2 = state.x2;
    this.y2 = state.y2;
    this.ibx = state.ibx;
    this.iex = state.iex;
    this.iby = state.iby;
    this.iey = state.iey;
    this.scale = state.scale;

    this.binSize = state.binSize;
    this.bins = state.bins;

    this.axis = state.axis;

    if (this.axis === "vertical") {
      this.ypts = Math.round(
        (Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2)) / 100
      );
    } else {
      this.xpts = Math.round(
        (Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2)) / 100
      );
    }
  }

  private graphLine({ x1, y1, x2, y2, ib, ie }: GraphLineParams) {
    // Draw line
    this.line({
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      lineWidth: 2,
    });

    if (x1 === x2) {
      let counter = this.axis === "vertical" ? this.ypts : this.bins;
      let interval = Math.max(y1, y2) - Math.min(y1, y2);
      interval /= this.axis === "vertical" ? this.ypts : this.bins;
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y += interval) {
        this.line({
          x1: x1 - 14,
          y1: y,
          x2: x1 + 14,
          y2: y,
          lineWidth: 1,
        });

        let textWrite = (
          (Math.abs(ie - ib) /
            (this.axis === "vertical" ? this.ypts : this.bins)) *
            counter +
          ib
        ).toString();
        if (textWrite.length > 6) textWrite = textWrite.substring(0, 6);

        this.text({
          x: x1 - 90,
          y: y + 8,
          text: textWrite,
          font: "20px Arial",
          fillColor: "black",
        });

        counter--;
      }
    } else if (y1 === y2) {
      let counter = this.axis === "vertical" ? this.bins : this.xpts;
      let interval = Math.max(x1, x2) - Math.min(x1, x2);
      interval /= this.axis === "vertical" ? this.bins : this.xpts;
      for (let x = Math.max(x1, x2); x >= Math.min(x1, x2); x -= interval) {
        this.line({
          x1: x,
          y1: y1 - 14,
          x2: x,
          y2: y1 + 14,
          lineWidth: 1,
        });
        let textWrite = (
          (Math.abs(ie - ib) /
            (this.axis === "vertical" ? this.bins : this.xpts)) *
            counter +
          ib
        ).toString();
        if (textWrite.length > 6) textWrite = textWrite.substring(0, 6);

        this.text({
          font: "20px Arial",
          fillColor: "black",
          text: textWrite,
          x: x - 24,
          y: y1 + 40,
        });

        counter--;
      }
    } else {
      throw new Error("Plot line is not vertical nor horizontal");
    }
  }

  private plotCanvasWidth(): number {
    return Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2);
  }

  private plotCanvasHeight(): number {
    return Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2);
  }

  convertToPlotCanvasPoint = (x: number, y: number) => {
    const w = this.plotCanvasWidth();
    const h = this.plotCanvasHeight();
    const xBegin = Math.min(this.x1, this.x2);
    const yEnd = Math.max(this.y1, this.y2);
    const v = [
      ((x - this.ibx) / (this.iex - this.ibx)) * w + xBegin,
      yEnd - ((y - this.iby) / (this.iey - this.iby)) * h,
    ];
    return v;
  };

  // @ts-ignore
  drawPlotGraph(): ScatterPlotGraph {
    this.graphLine({
      x1: this.x1,
      y1: this.y1,
      x2: this.x1,
      y2: this.y2,
      ib: this.iby,
      ie: this.iey,
    });

    this.graphLine({
      x1: this.x1,
      y1: this.y2,
      x2: this.x2,
      y2: this.y2,
      ib: this.ibx,
      ie: this.iex,
    });

    if (this.axis == "vertical") {
      // Horizontal hist lines
      for (let i = 0; i < this.ypts; i++) {
        const height =
          (Math.abs(this.y1 - this.y2) / this.ypts) * i +
          Math.min(this.y1, this.y2);
        this.line({
          x1: this.x1,
          y1: height,
          x2: this.x2,
          y2: height,
          strokeColor: "#bababa",
        });
      }

      // Last vertical hist line
      this.line({
        x1: this.x2,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        strokeColor: "#bababa",
      });
    } else {
      // vertical hist lines
      for (let i = 0; i <= this.xpts; i++) {
        const width =
          (Math.abs(this.x1 - this.x2) / this.xpts) * i +
          Math.min(this.x1, this.x2);
        this.line({
          y1: this.y1,
          x1: width,
          y2: this.y2,
          x2: width,
          strokeColor: "#bababa",
        });
      }

      // Last horizontal hist line
      this.line({
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y1,
        strokeColor: "#bababa",
      });
    }

    return ((parent) => {
      return {
        addBin: (
          index: number,
          heightPercentage: number,
          color: string = "#66a"
        ) => {
          if (this.axis === "vertical") {
            this.binSize = (this.x2 - this.x1) / this.bins;
            if (this.bins <= index) {
              throw Error(
                `Out of bounds index for histogram with ${this.bins} bins`
              );
            }
            const outterBeginX = this.x1 + index * this.binSize;
            const outterEndX = this.x1 + (index + 1) * this.binSize;
            const innerBeginX = outterBeginX + binPadding;
            const innerEndX = outterEndX - binPadding;
            const y = (this.y2 - this.y1) * (1 - heightPercentage) + this.y1;

            this.rect({
              x: innerBeginX,
              y: y,
              w: innerEndX - innerBeginX,
              h: (this.y2 - this.y1) * heightPercentage,
              fill: true,
              fillColor: color,
            });
          } else {
            this.binSize = (this.y2 - this.y1) / this.bins;
            if (this.bins <= index) {
              throw Error(
                `Out of bounds index for histogram with ${this.bins} bins`
              );
            }
            const outterBeginY =
              this.y1 + (this.bins - 1 - index) * this.binSize;
            const outterEndY = this.y1 + (this.bins - index) * this.binSize;
            const innerBeginY = outterBeginY + binPadding;
            const innerEndY = outterEndY - binPadding;

            this.rect({
              x: this.x1,
              y: innerBeginY,
              h: innerEndY - innerBeginY,
              w: (this.x2 - this.x1) * heightPercentage,
              fill: true,
              fillColor: color,
            });
          }
        },
      };
    })(this);
  }
}
