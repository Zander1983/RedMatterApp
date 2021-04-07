import Drawer, { DrawerState } from "graph/renderers/drawers/drawer";

export interface GraphDrawerState extends DrawerState {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  ibx: number;
  iex: number;
  iby: number;
  iey: number;
  scale: number;

  xpts?: number;
  ypts?: number;
}

const binSize = 100;

export default class GraphDrawer extends Drawer {
  protected x1: number;
  protected y1: number;
  protected x2: number;
  protected y2: number;
  protected ibx: number;
  protected iex: number;
  protected iby: number;
  protected iey: number;
  protected scale: number;

  protected xpts: number;
  protected ypts: number;

  update() {
    super.update();

    if (this.xpts === undefined) {
      this.xpts = Math.round(
        (Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2)) / binSize
      );
    }

    if (this.ypts === undefined) {
      this.ypts = Math.round(
        (Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2)) / binSize
      );
    }
  }

  setDrawerState(state: any) {
    super.setDrawerState(state);

    if (state.horizontalBinCount !== undefined) {
      this.xpts = state.horizontalBinCount;
    }

    if (state.verticalBinCount !== undefined) {
      this.xpts = state.verticalBinCount;
    }

    this.x1 = state.x1;
    this.y1 = state.y1;
    this.x2 = state.x2;
    this.y2 = state.y2;
    this.ibx = state.ibx;
    this.iex = state.iex;
    this.iby = state.iby;
    this.iey = state.iey;
    this.scale = state.scale;

    this.xpts = state.xpts !== undefined ? state.xpts : this.xpts;
    this.ypts = state.ypts !== undefined ? state.ypts : this.xpts;
  }

  getDrawerState(): GraphDrawerState {
    return {
      ...super.getDrawerState(),
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      ibx: this.ibx,
      iex: this.iex,
      iby: this.iby,
      iey: this.iey,
      scale: this.scale,
    };
  }

  private graphLine(params: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    ib: number;
    ie: number;
  }) {
    this.segment({
      x1: params.x1,
      y1: params.y1,
      x2: params.x2,
      y2: params.y2,
      lineWidth: 2,
    });

    if (params.x1 !== params.x2 && params.y1 !== params.y2) {
      throw new Error("Plot line is not vertical nor horizontal");
    }

    const orientation = params.x1 === params.x2 ? "v" : "h";
    const bins = orientation == "v" ? this.ypts : this.xpts;
    const p1 = orientation == "v" ? this.y1 : this.x1;
    const p2 = orientation == "v" ? this.y2 : this.x2;
    const op1 = orientation == "v" ? this.x1 : this.y1;
    const op2 = orientation == "v" ? this.x2 : this.y2;

    let counter = bins;
    let interval = Math.max(p1, p2) - Math.min(p1, p2);
    interval /= bins;

    if (orientation == "v") {
      for (let y = Math.min(p1, p2); y <= Math.max(p1, p2); y += interval) {
        this.segment({
          x1: op1 - 14,
          y1: y,
          x2: op1 + 14,
          y2: y,
          lineWidth: 1,
        });

        let textWrite = (
          (Math.abs(params.ie - params.ib) / this.ypts) * counter +
          params.ib
        ).toString();
        if (textWrite.length > 6) textWrite = textWrite.substring(0, 6);

        this.text({
          x: op1 - 90,
          y: y + 8,
          text: textWrite,
          font: "20px Arial",
          fillColor: "black",
        });
      }
    } else {
      for (let x = Math.max(p1, p2); x >= Math.min(p1, p2); x -= interval) {
        this.segment({
          x1: x,
          y1: op2 - 14,
          x2: x,
          y2: op2 + 14,
          lineWidth: 1,
        });
        let textWrite = (
          (Math.abs(params.ie - params.ib) / this.xpts) * counter +
          params.ib
        ).toString();
        if (textWrite.length > 6) textWrite = textWrite.substring(0, 6);

        this.text({
          font: "20px Arial",
          fillColor: "black",
          text: textWrite,
          x: x - 24,
          y: op2 + 40,
        });
      }
      counter--;
    }
  }

  private drawPlotLines(orientation: "v" | "h", strokeColor?: string) {
    const bins = orientation == "h" ? this.ypts : this.xpts;

    const begin = orientation == "h" ? this.y1 : this.x1;
    const end = orientation == "h" ? this.y2 : this.x2;

    const obegin = orientation == "h" ? this.x1 : this.y1;
    const oend = orientation == "h" ? this.x2 : this.y2;

    for (
      let i = orientation == "v" ? 1 : 0;
      i < bins + (orientation == "v" ? 1 : 0);
      i++
    ) {
      const fd = (Math.abs(begin - end) / bins) * i + Math.min(begin, end);
      this.segment({
        x1: orientation == "h" ? obegin : fd,
        y1: orientation == "h" ? fd : obegin,
        x2: orientation == "h" ? oend : fd,
        y2: orientation == "h" ? fd : oend,
        strokeColor: strokeColor,
      });
    }
  }

  drawPlotGraph(): void {
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

    this.drawPlotLines("v");
    this.drawPlotLines("h");
  }
}
