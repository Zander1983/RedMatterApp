export interface Point {}

export default abstract class Transformer {
  constructor() {}

  abstract toAbstractPoint(point: Point): Point;

  abstract toConcretePoint(point: Point): Point;
}
