import PlotData from "graph/dataManagement/plotData";
import Transformer, { Point } from "graph/renderers/transformers/transformer";
import numeral from "numeral";
import FCSServices from "services/FCSServices/FCSServices";
import {
  bottomPadding,
  leftPadding,
  rightPadding,
  topPadding,
} from "../plotters/graphPlotter";

const EXP_NUMS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

export interface GraphPoint extends Point {
  x: number;
  y: number;
}

export interface GraphTransformerState {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  ibx: number;
  iex: number;
  iby: number;
  iey: number;
  scale: number;
  plotData?: PlotData;
}

export type Label = {
  name: string;
  pos: number;
};

export default class GraphTransformer extends Transformer {
  private x1: number;
  private y1: number;
  private x2: number;
  private y2: number;
  private ibx: number;
  private iex: number;
  private iby: number;
  private iey: number;
  private scale: number;
  private plotData: PlotData;

  update() {
    super.update();
  }

  setTransformerState(state: GraphTransformerState) {
    this.x1 = state.x1;
    this.y1 = state.y1;
    this.x2 = state.x2;
    this.y2 = state.y2;
    this.ibx = state.ibx;
    this.iex = state.iex;
    this.iby = state.iby;
    this.iey = state.iey;
    this.scale = state.scale;
    if (state.plotData !== undefined) this.plotData = state.plotData;
  }

  getTransformerState(): GraphTransformerState {
    return {
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      ibx: this.ibx,
      iex: this.iex,
      iby: this.iby,
      iey: this.iey,
      scale: this.scale,
      plotData: this.plotData,
    };
  }

  isOutOfBounds(p: GraphPoint): boolean {
    let { ibx, iby, iex, iey } = this;
    const xBi = this.plotData.xPlotType === "bi";
    const yBi = this.plotData.yPlotType === "bi";
    const rangeX = xBi ? [0.5, 1] : [ibx, iex];
    const rangeY = yBi ? [0.5, 1] : [iby, iey];
    if (p.x < rangeX[0] || p.x > rangeX[1]) {
      return true;
    }
    if (p.y < rangeY[0] || p.y > rangeY[1]) {
      return true;
    }
    return false;
  }

  toConcretePoint = (
    p: GraphPoint,
    customRanges?: [[number, number], [number, number]],
    withLogicle: boolean = false
  ): GraphPoint => {
    let { ibx, iby, iex, iey } = this;
    if (customRanges !== undefined) {
      ibx = customRanges[0][0];
      iex = customRanges[0][1];
      iby = customRanges[1][0];
      iey = customRanges[1][1];
    }
    const xBi = this.plotData.xPlotType === "bi";
    const yBi = this.plotData.yPlotType === "bi";
    let ret = { x: 0, y: 0 };
    if (withLogicle) {
      p = this.rawAbstractLinearToLogicle(p);
    }
    ret.x = xBi
      ? this.toConcreteLogicle(p.x, "x")
      : this.toConcreteLinear(p.x, "x", ibx, iex);
    ret.y = yBi
      ? this.toConcreteLogicle(p.y, "y")
      : this.toConcreteLinear(p.y, "y", iby, iey);
    return ret;
  };

  private toConcreteLinear(
    number: number,
    axis: "x" | "y",
    b: number,
    e: number
  ): number {
    const amplitude =
      axis === "x"
        ? Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2)
        : Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2);

    const padding =
      axis === "x" ? Math.min(this.x1, this.x2) : Math.max(this.y1, this.y2);

    const scaledPosition = (number - b) / (e - b);

    return axis === "x"
      ? (padding + scaledPosition * amplitude) / this.scale
      : (padding - scaledPosition * amplitude) / this.scale;
  }

  private toConcreteLogicle(number: number, axis: "x" | "y"): number {
    let range =
      axis === "x"
        ? [leftPadding, this.plotData.plotWidth - rightPadding]
        : [topPadding, this.plotData.plotHeight - bottomPadding];
    const amplitude = range[1] - range[0];
    return axis === "x"
      ? amplitude * number + range[0]
      : amplitude * (1.0 - number) + range[0];
  }

  toAbstractPoint = (p: GraphPoint, forceLin: boolean = false): GraphPoint => {
    const xBi = this.plotData.xPlotType === "bi";
    const yBi = this.plotData.yPlotType === "bi";
    let ret = { x: 0, y: 0 };
    ret.x =
      xBi && !forceLin
        ? this.toAbstractLogicle(p.x, "x")
        : this.toAbstractLinear(p.x, "x");
    ret.y =
      yBi && !forceLin
        ? this.toAbstractLogicle(p.y, "y")
        : this.toAbstractLinear(p.y, "y");
    return ret;
  };

  private toAbstractLogicle(number: number, axis: "x" | "y"): number {
    let range =
      axis === "x"
        ? [leftPadding, this.plotData.plotWidth - rightPadding]
        : [topPadding, this.plotData.plotHeight - bottomPadding];
    const ret =
      axis === "x"
        ? 1 - (range[1] - number) / (range[1] - range[0])
        : (range[1] - number) / (range[1] - range[0]);
    return ret;
  }

  private toAbstractLinear(number: number, axis: "x" | "y"): number {
    const plotRange =
      axis === "x"
        ? this.x2 / this.scale - this.x1 / this.scale
        : this.y1 / this.scale - this.y2 / this.scale;
    const abstractRange =
      axis === "x" ? this.iex - this.ibx : this.iey - this.iby;
    return axis === "x"
      ? ((number - this.x1 / this.scale) / plotRange) * abstractRange + this.ibx
      : this.iey -
          ((this.y1 / this.scale - number) / plotRange) * abstractRange;
  }

  abstractLinearToLogicle(p: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    const xBi = this.plotData.xPlotType === "bi";
    const yBi = this.plotData.yPlotType === "bi";
    if (!xBi && !yBi) return p;
    let ranges = [
      this.plotData.ranges.get(this.plotData.xAxis),
      this.plotData.ranges.get(this.plotData.yAxis),
    ];
    const fcsService = new FCSServices();
    if (xBi) {
      p.x = fcsService.logicleMarkTransformer(
        [p.x],
        ranges[0][0],
        ranges[0][1]
      )[0];
    }
    if (yBi) {
      p.y = fcsService.logicleMarkTransformer(
        [p.y],
        ranges[0][0],
        ranges[0][1]
      )[0];
    }
    return p;
  }

  abstractLogicleToLinear(p: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    const xBi = this.plotData.xPlotType === "bi";
    const yBi = this.plotData.yPlotType === "bi";
    if (!xBi && !yBi) return p;
    let ranges = [
      this.plotData.ranges.get(this.plotData.xAxis),
      this.plotData.ranges.get(this.plotData.yAxis),
    ];
    const fcsService = new FCSServices();
    let ret = { x: 0, y: 0 };
    if (xBi) {
      p.x = fcsService.logicleInverseMarkTransformer(
        [p.x],
        ranges[0][0],
        ranges[0][1]
      )[0];
    } else ret.x = p.x;
    if (yBi) {
      p.y = fcsService.logicleInverseMarkTransformer(
        [p.y],
        ranges[0][0],
        ranges[0][1]
      )[0];
    } else ret.y = p.y;
    return p;
  }

  rawAbstractLogicleToLinear(p: GraphPoint): GraphPoint {
    const xBi = this.plotData.xPlotType === "bi";
    const yBi = this.plotData.yPlotType === "bi";
    let ranges = [
      this.plotData.ranges.get(this.plotData.xAxis),
      this.plotData.ranges.get(this.plotData.yAxis),
    ];
    if (xBi) {
      p.x = ranges[0][0] + (ranges[0][1] - ranges[0][0]) * p.x;
    }
    if (yBi) {
      p.y = ranges[1][0] + (ranges[1][1] - ranges[1][0]) * p.y;
    }
    return p;
  }

  rawAbstractLinearToLogicle(p: GraphPoint): GraphPoint {
    const xBi = this.plotData.xPlotType === "bi";
    const yBi = this.plotData.yPlotType === "bi";
    let ranges = [
      this.plotData.ranges.get(this.plotData.xAxis),
      this.plotData.ranges.get(this.plotData.yAxis),
    ];
    if (xBi) {
      p.x = (p.x - ranges[0][0]) / (ranges[0][1] - ranges[0][0]);
    }
    if (yBi) {
      p.y = (p.y - ranges[1][0]) / (ranges[1][1] - ranges[1][0]);
    }
    return p;
  }

  getAxisLabels(
    format: string,
    linRange: [number, number],
    binsCount: number = 10
  ): Label[] {
    let labels = [];
    if (format === "lin") {
      const binSize = (linRange[1] - linRange[0]) / binsCount;

      for (let i = linRange[0], j = 0; j <= binsCount; i += binSize, j++)
        labels.push({
          pos: i,
          name: this.linLabel(i),
        });
    }
    if (format === "bi") {
      const binSize = 1.0 / binsCount;
      const fcsServices = new FCSServices();

      for (let i = 0, j = 0; j <= binsCount; i += binSize, j++) {
        const inverse = fcsServices.logicleInverseMarkTransformer(
          [i],
          linRange[0],
          linRange[1]
        )[0];
        const name = this.expLabel(inverse);
        const pos = i;
        labels.push({ pos, name });
      }
    }
    return labels;
  }

  private expLabel(num: number): string {
    // EG.: A number such as "2,342" turns to "2.10³" or "-77" to "-7.10¹"
    let name = numeral(num).format("0,0e+0");
    const str = name.includes("e+") ? "e+" : "e-";
    let ts = name.split(str)[1];
    name = name.split(str)[0];
    let ev = "";
    for (const l of ts) ev += EXP_NUMS[parseInt(l)];
    name = name + ".10" + ev;
    if (!name.includes("-") && num < 0) name = "-" + name;
    return name;
  }

  private linLabel(num: number): string {
    // EG.: A number such as "2,342" turns to "2k"
    let snum = "";
    if (num < 2) {
      snum = numeral(num.toFixed(2)).format("0.0a");
    } else {
      snum = num.toFixed(2);
      snum = numeral(snum).format("0a");
    }
    return snum;
  }
}
