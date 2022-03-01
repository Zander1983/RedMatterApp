export const getRandomPointsOnCanvas = (width, height, number) => {
  let points = [];
  for (let i = 0; i < number; i++) {
    // I get a random point between 0 and 400 - we will pick up this point when a user clicks on the canvas
    let randomX = Math.floor(Math.random() * (width - 0 + 1)) + 0;
    let randomY = Math.floor(Math.random() * (height - 0 + 1)) + 0;
    points.push([randomX, randomY]);
  }

  return points;
};

export const getSetLinearPoints = (width, height, number) => {
  let points = [];

  points.push([10, 190]);
  points.push([100, 190]);
  points.push([100, 100]);
  points.push([10, 100]);

  return points;
};
