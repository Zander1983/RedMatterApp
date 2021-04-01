import Transformer, {
  Point,
} from "graph/renderers/transformations/transformer";

export interface HistogramPoint extends Point {
  x: number;
}

export default class HistogramTransformer extends Transformer {
  constructor() {
    super();
  }

  toAbstractPoint(point: HistogramPoint): HistogramPoint {
    return { x: 0 };
  }

  toConcretePoint(point: HistogramPoint): HistogramPoint {
    return { x: 0 };
  }
}
