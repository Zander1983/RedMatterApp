import { PolygonGate2Points } from "graph/resources/types";

interface Point2D {
  x: number;
  y: number;
}

// Given two points in 2D plane, returns euclidian distance
const euclidianDistance2D = (p: Point2D, q: Point2D): number =>
  Math.sqrt(Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2));

const euclidianDistance1D = (p: number, q: number): number => Math.abs(p - q);

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

// Given a point, treated as 2D vector, and an angle in radians returns other
// point/vector of the rotation of said point bt said degrees.
// Counter-clockwise.
const rotatePointOverTarget = (
  target: Point2D,
  p: Point2D,
  ang: number
): Point2D => {
  const cosA = Math.cos(ang);
  const sinA = Math.sin(ang);
  const dx = p.x - target.x;
  const dy = p.y - target.y;
  return {
    x: target.x + dx * cosA - dy * sinA,
    y: target.y + dx * sinA + dy * cosA,
  };
};

// Given a point and an ellipse, returns true if point inside the ellipse
// or on it's edge
const pointInsideEllipse = (
  p: Point2D,
  ellipse: {
    center: Point2D;
    primaryP1: Point2D;
    primaryP2: Point2D;
    secondaryP1: Point2D;
    secondaryP2: Point2D;
    d1?: number;
    d2?: number;
    ang?: number;
  }
): boolean => {
  const ang = getVectorAngle2D(ellipse.primaryP1, ellipse.primaryP2);
  const mp = rotatePointOverTarget(ellipse.center, p, -ang);
  const pd =
    ellipse.d1 !== undefined
      ? ellipse.d1
      : euclidianDistance2D(ellipse.primaryP1, ellipse.primaryP2) / 2;
  const sd =
    ellipse.d2 !== undefined
      ? ellipse.d2
      : euclidianDistance2D(ellipse.secondaryP1, ellipse.secondaryP2) / 2;
  const l = Math.pow(mp.x - ellipse.center.x, 2) / Math.pow(pd, 2);
  const r = Math.pow(mp.y - ellipse.center.y, 2) / Math.pow(sd, 2);
  return r + l <= 1;
};

// Give a point and a polygon (convex or concave) return true if given point
// is inside or on the edge of the polygon
const pointInsidePolygon = ({ x, y }: Point2D, polygon: Point2D[]): boolean => {
  const onSegment = (p: Point2D, q: Point2D, r: Point2D): boolean => {
    if (
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) &&
      q.y >= Math.min(p.y, r.y)
    )
      return true;
    return false;
  };

  const orientation = (p: Point2D, q: Point2D, r: Point2D): 0 | 1 | 2 => {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if (val === 0) return 0; // colinear

    return val > 0 ? 1 : 2; // clock or counterclock wise
  };

  const segmentIntersection = (
    p1: Point2D,
    p2: Point2D,
    q1: Point2D,
    q2: Point2D
  ): boolean => {
    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);

    // General case
    if (o1 !== o2 && o3 !== o4) return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
  };
  const p1 = {
    x: 1e30,
    y: y,
  };
  const q1 = {
    x: x,
    y: y,
  };
  let hits = 0;
  const pl = polygon.length;
  for (let i = 0; i < pl; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % pl];
    const p2 = {
      x: a.x,
      y: a.y,
    };
    const q2 = {
      x: b.x,
      y: b.y,
    };
    if (segmentIntersection(p1, p2, q1, q2)) {
      if (orientation(p2, q1, q2) === 0) return onSegment(p2, q1, q2);
      hits++;
    }
  }
  if (hits & 1) return true;
  return false;
};
const pointInsidePolygon2 = (
  { x, y }: Point2D,
  polygon: Point2D[]
): boolean => {
  const onSegment = (p: Point2D, q: Point2D, r: Point2D): boolean => {
    if (
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) &&
      q.y >= Math.min(p.y, r.y)
    )
      return true;
    return false;
  };

  const orientation = (p: Point2D, q: Point2D, r: Point2D): 0 | 1 | 2 => {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if (val === 0) return 0; // colinear

    return val > 0 ? 1 : 2; // clock or counterclock wise
  };

  const segmentIntersection = (
    p1: Point2D,
    p2: Point2D,
    q1: Point2D,
    q2: Point2D
  ): boolean => {
    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);

    // General case
    if (o1 !== o2 && o3 !== o4) return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
  };
  const p1 = {
    x: 1e30,
    y: y,
  };
  const q1 = {
    x: x,
    y: y,
  };
  let hits = 0;
  const pl = polygon.length;
  for (let i = 0; i < pl; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % pl];
    const p2 = {
      x: a.x,
      y: a.y,
    };
    const q2 = {
      x: b.x,
      y: b.y,
    };
    if (segmentIntersection(p1, p2, q1, q2)) {
      if (orientation(p2, q1, q2) === 0) return onSegment(p2, q1, q2);
      hits++;
    }
  }
  if (hits & 1) return true;
  return false;
};

export {
  euclidianDistance2D,
  euclidianDistance1D,
  distLinePoint2D,
  getVectorAngle2D,
  rotateVector2D,
  pointInsideEllipse,
  pointInsidePolygon,
  pointInsidePolygon2,
  rotatePointOverTarget,
};
