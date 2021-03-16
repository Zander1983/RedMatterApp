/*
  This is responsible for plotting a general graph given specific inputs
*/
import Drawer from "./drawer";
import Context from "../canvas/contextInterface";
import Polygon from "../gates/polygon";

interface HistogramDrawerConstructorParams {
  context: Context;
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

export default class HistogramDrawer extends Drawer {
  private x1: number;
  private y1: number;
  private x2: number;
  private y2: number;
  private ibx: number;
  private iex: number;
  private iby: number;
  private iey: number;

  constructor({
    context,
    x1,
    y1,
    x2,
    y2,
    ibx,
    iex,
    iby,
    iey,
  }: GraphDrawerConstructorParams) {
    super(context);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.ibx = ibx;
    this.iex = iex;
    this.iby = iby;
    this.iey = iey;
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

    // Draw markings and text
    let counter = 10;

    if (x1 === x2) {
      let interval = Math.max(y1, y2) - Math.min(y1, y2);
      interval /= 10;
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y += interval) {
        this.line({
          x1: x1 - 14,
          y1: y,
          x2: x1 + 14,
          y2: y,
          lineWidth: 1,
        });

        let textWrite = ((Math.abs(ib - ie) / 10) * counter + ib).toString();
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
      let interval = Math.max(x1, x2) - Math.min(x1, x2);
      interval /= 10;
      for (let x = Math.max(x1, x2); x >= Math.min(x1, x2); x -= interval) {
        this.line({
          x1: x,
          y1: y1 - 14,
          x2: x,
          y2: y1 + 14,
          lineWidth: 1,
        });
        let text_write = ((Math.abs(ie - ib) / 10) * counter + ib).toString();
        if (text_write.length > 6) text_write = text_write.substring(0, 6);

        this.text({
          font: "20px Arial",
          fillColor: "black",
          text: text_write,
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

  private convertToPlotCanvasPoint = (x: number, y: number) => {
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

  drawPlotGraph(): PlotGraph {
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

    // Horizontal plot lines
    for (let i = 0; i < 10; i++) {
      const height =
        (Math.abs(this.y1 - this.y2) / 10) * i + Math.min(this.y1, this.y2);
      this.line({
        x1: this.x1,
        y1: height,
        x2: this.x2,
        y2: height,
        strokeColor: "#bababa",
      });
    }
    // Vertical plot lines
    for (let i = 1; i <= 10; i++) {
      const width =
        (Math.abs(this.x1 - this.x2) / 10) * i + Math.min(this.x1, this.x2);
      this.line({
        x1: width,
        y1: this.y1,
        x2: width,
        y2: this.y2,
        strokeColor: "#bababa",
      });
    }

    return ((parent) => {
      return {
        addPoint: (x: number, y: number, color: string = "#000") => {
          if (x < parent.ibx || x > parent.iex) return;
          if (y < parent.iby || y > parent.iey) return;
          const plotPoints = parent.convertToPlotCanvasPoint(x, y);
          const plotx = plotPoints[0];
          const ploty = plotPoints[1];
          parent.circle({
            x: plotx,
            y: ploty,
            radius: 6,
            strokeColor: color,
          });
        },
        addPolygon: (polygon: Polygon, color: string = "#000") => {
          const pl = polygon.getLength();
          for (let i = 0; i < pl; i++) {
            let pA = polygon.getPoint(i);
            const a = parent.convertToPlotCanvasPoint(pA.x, pA.y);

            let pB = polygon.getPoint((i + 1) % pl);
            const b = parent.convertToPlotCanvasPoint(pB.x, pB.y);

            parent.line({
              x1: a[0],
              y1: a[1],
              x2: b[0],
              y2: b[1],
              strokeColor: color,
            });
          }
        },
        addLine: (
          pa: [number, number],
          pb: [number, number],
          color: string = "#000"
        ) => {
          parent.ctx.strokeStyle = color;
          const a = parent.convertToPlotCanvasPoint(pa[0], pa[1]);
          const b = parent.convertToPlotCanvasPoint(pb[0], pb[1]);
          parent.line({
            x1: a[0],
            y1: a[1],
            x2: b[0],
            y2: b[1],
            strokeColor: color,
          });
        },
      };
    })(this);
  }
}
