const euclidianDistance2D = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

export { euclidianDistance2D };
