import { Point } from "chart.js";

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

// Given a point, treated as 2D vector, and an angle in radians returns other
// point/vector of the rotation of said point bt said degrees.
// Counter-clockwise.
const rotatePointOverTarget = (target: Point2D, p: Point2D, ang: number) => {
  const cosA = Math.cos(ang);
  const sinA = Math.sin(ang);
  const dx = p.x - target.x;
  const dy = p.y - target.y;
  return {
    x: target.x + dx * cosA - dy * sinA,
    y: target.y + dx * sinA + dy * cosA,
  };
};

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
) => {
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

export {
  euclidianDistance2D,
  distLinePoint2D,
  getVectorAngle2D,
  rotateVector2D,
  pointInsideEllipse,
  rotatePointOverTarget,
};
