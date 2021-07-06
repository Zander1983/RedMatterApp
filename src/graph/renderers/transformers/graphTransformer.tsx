import Transformer, { Point } from "graph/renderers/transformers/transformer";
import numeral from "numeral";

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
  }

  getTransformerState() {
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
    };
  }

  toConcretePoint = (p: GraphPoint): GraphPoint => {
    const w = Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2);
    const h = Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2);
    const xBegin = Math.min(this.x1, this.x2);
    const yEnd = Math.max(this.y1, this.y2);
    return {
      x: (((p.x - this.ibx) / (this.iex - this.ibx)) * w + xBegin) / this.scale,
      y: (yEnd - ((p.y - this.iby) / (this.iey - this.iby)) * h) / this.scale,
    };
  };

  toAbstractPoint = (p: GraphPoint): GraphPoint => {
    const plotXRange = this.x2 / this.scale - this.x1 / this.scale;
    const plotYRange = this.y1 / this.scale - this.y2 / this.scale;
    const abstractXRange = this.iex - this.ibx;
    const abstractYRange = this.iey - this.iby;
    return {
      x:
        ((p.x - this.x1 / this.scale) / plotXRange) * abstractXRange + this.ibx,
      y:
        this.iey - ((this.y1 / this.scale - p.y) / plotYRange) * abstractYRange,
    };
  };

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
          name: this.numToLabelText(i),
        });
    }
    if (format === "bi") {
      let min = 1.01;
      let max = 1e5;
      while (labels.length != binsCount) {
        let div = (min + max) / 2;
        let mx = linRange[1];
        let mi = linRange[0];
        let pt = 1e100;
        const ptlist = [];
        while (pt > mx) pt = pt / div;
        while (pt <= mx && pt > mi) {
          ptlist.push(pt);
          pt = pt / div;
        }
        labels = ptlist.map((e) => {
          let name = numeral(e).format("0,0e+0");
          const str = name.includes("e+") ? "e+" : "e-";
          let ts = name.split(str)[1];
          name = name.split(str)[0];
          let ev = "";
          for (const l of ts) ev += EXP_NUMS[parseInt(l)];
          name = name + ".10" + ev;
          return {
            pos: e,
            name,
          };
        });
        if (labels.length < binsCount) {
          max = (min + max) / 2;
        } else {
          min = (min + max) / 2;
        }
      }
    }
    return labels;
  }

  // logicleToAbstractPoint(p: GraphPoint): GraphPoint {
  //   const logicle;
  // }

  private numToLabelText(num: number): string {
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
