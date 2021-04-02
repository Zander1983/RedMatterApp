import Transformer, {
  Point,
} from "graph/renderers/transformations/transformer";

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
}
