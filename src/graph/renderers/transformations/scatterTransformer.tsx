import Transformer, {
  Point,
} from "graph/renderers/transformations/transformer";

export interface ScatterPoint extends Point {
  x: number;
  y: number;
}

export default class ScatterTransformer extends Transformer {
  constructor() {
    super();
  }

  toAbstractPoint(point: ScatterPoint): ScatterPoint {
    return { x: 0, y: 0 };
  }

  toConcretePoint(point: ScatterPoint): ScatterPoint {
    return { x: 0, y: 0 };
  }
}
