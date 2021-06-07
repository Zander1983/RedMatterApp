export const generateRandomData = (
  dimesionCount: number,
  maxPoints: number,
  l: number,
  r: number
) => {
  if (l > r) throw Error("R must be greater than L");
  const pointCount = Math.round(
    Math.random() * (maxPoints / 2) + maxPoints / 2
  );
  const points: Array<Array<number>> = [];
  for (let i = 0; i < pointCount; i++) {
    let dimesion = [];
    for (let j = 0; j < dimesionCount; j++) {
      dimesion.push(Math.random() * (r - l) + l);
    }
    points.push(dimesion);
  }
  return points;
};

export const generateRandomAxes = (dimesionCount: number) => {
  const list = [];
  for (let i: number = 0; i < dimesionCount; i++) {
    list.push({
      value: Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, Math.round(Math.random() * 5 + 2)),
      key: i,
      display: ["lin", "log"][Math.round(Math.random() * 1.5 - 0.5)],
    });
  }
  return list;
};
