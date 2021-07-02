// Returns the value at a given percentile in a sorted numeric array.
// "Linear interpolation between closest ranks" method
const percentile = (arr, p) => {
  if (arr.length === 0) return 0;
  if (typeof p !== "number") throw new TypeError("p must be a number");
  if (p <= 0) return arr[0];
  if (p >= 1) return arr[arr.length - 1];

  var index = arr.length * p,
    lower = Math.floor(index),
    upper = lower + 1,
    weight = index % 1;

  if (upper >= arr.length) return arr[lower];
  return arr[lower] * (1 - weight) + arr[upper] * weight;
};

const calculateW = (r, T) => {
  // if (r === 0) {
  //     return 0;
  // }

  var M = 4.5;

  var W = (M - Math.log10(T / Math.abs(r))) / 2;

  if (W < 0) {
    return 0;
  }

  return W;
};

export default {
  calculateW,
  percentile,
};
