let api = require("./build/Release/addons.node");

exports.LogicleTransform = function (x, T, M, W, A, inverse = false) {
  if (x == null) throw "x is not specified";
  if (T == null) throw "T is not specified";
  if (M == null) throw "M is not specified";
  if (W == null) throw "W is not specified";
  if (A == null) throw "A is not specified";

  console.log(api);

  return api["logicle_transform"]({
    x: x,
    T: T,
    M: M,
    W: W,
    A: A,
    inverse: inverse,
  });
};

exports.FastLogicleTransform = function (x, T, M, W, A, inverse = false) {
  if (x == null) throw "x is not specified";
  if (T == null) throw "T is not specified";
  if (M == null) throw "M is not specified";
  if (W == null) throw "W is not specified";
  if (A == null) throw "A is not specified";

  return api.fast_logicle_transform({
    x: x,
    T: T,
    M: M,
    W: W,
    A: A,
    inverse: inverse,
  });
};

exports.HyperlogTransform = function (x, T, M, W, A, inverse = false) {
  if (x == null) throw "x is not specified";
  if (T == null) throw "T is not specified";
  if (M == null) throw "M is not specified";
  if (W == null) throw "W is not specified";
  if (A == null) throw "A is not specified";

  return api.hyperlog_transform({
    x: x,
    T: T,
    M: M,
    W: W,
    A: A,
    inverse: inverse,
  });
};
