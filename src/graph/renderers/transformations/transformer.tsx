export interface Point {}

export default abstract class Transformer {
  update() {}

  abstract toAbstractPoint(point: Point): Point;

  abstract toConcretePoint(point: Point): Point;
}
