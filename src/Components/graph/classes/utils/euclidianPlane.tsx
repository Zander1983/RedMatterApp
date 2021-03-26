interface Point2D {
  x: number;
  y: number;
}

// Given two points in 2D plane, returns euclidian distance
const euclidianDistance2D = (p: Point2D, q: Point2D): number =>
  Math.sqrt(Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2));

// Given three points in 2D plane, the first two points defining a line and the
// last being the target point, returns minimal distance from target to line
const distLinePoint2D = (p: Point2D, q: Point2D, r: Point2D): number => {
  const top = Math.abs((q.x - p.x) * (p.y - r.y) - (p.x - r.x) * (q.y - p.y));
  const bottom = Math.sqrt(Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2));
  return top / bottom;
};

// Given two points representing a vector from the first to the second point,
// returns the angle between them in radians
const getVectorAngle2D = (p: Point2D, q: Point2D): number => {
  const vectorX = q.x - p.x;
  const vectorY = q.y - p.y;
  return Math.atan2(vectorY, vectorX);
};

// Given a point, treated as 2D vector, and an angle in radians returns other
// point/vector of the rotation of said point bt said degrees.
// Counter-clockwise.
const rotateVector2D = (v: Point2D, ang: number): Point2D => {
  return {
    x: Math.cos(ang) * v.x - Math.sin(ang) * v.y,
    y: Math.sin(ang) * v.x + Math.cos(ang) * v.y,
  };
};

export {
  euclidianDistance2D,
  distLinePoint2D,
  getVectorAngle2D,
  rotateVector2D,
};
