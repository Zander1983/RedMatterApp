var percentileHelper = require("./percentileHelper");
var generalHelper = require("./generalHelper");
var Logicle = require("../../logicleMark");

module.exports.getParamMax = (fcs, param) => {
  var maxArray = fcs.get$PnX("R");

  maxArray = generalHelper.removeNulls(maxArray);

  return maxArray[param];
};

module.exports.getLogicles = (params) => {
  var logicles = {};
  var fcs = params.fcs;
  var self = this;
  var minMax = params.minMax;

  fcs.getParams().forEach(function (paramsAnaylsisElement, paramIndex) {
    logicles[paramIndex] = self.getLogicle(minMax);
  });

  return logicles;
};

module.exports.getLogicle = (biexponentialAxisLimits) => {
  var transformParams = this.getTMWA(biexponentialAxisLimits);

  return new Logicle(transformParams.T, transformParams.W);
};

module.exports.getTMWA = (biexponentialAxisLimits) => {
  var T = biexponentialAxisLimits.maximum;
  var M = 4.5;
  var A = 0;
  var W = percentileHelper.calculateW(biexponentialAxisLimits.minimum, T);

  return {
    T: T,
    M: M,
    A: A,
    W: W,
  };
};

module.exports.getMaxForParam = (params) => {
  var fcs = params.fcs;
  var paramIndex = params.paramIndex;

  var maxArray = fcs.get$PnX("R");
  maxArray = generalHelper.removeNulls(maxArray);
  var maxInHeader = maxArray[paramIndex];

  // IF WANT TO USE MAX FROM DB, WILL NEED TO RUN A SCRIPT AS ALL THE MAXES ARE SLIGHTLY WRONG
  // SO JUST USE MAX FORM THE FILE

  return parseFloat(maxInHeader);
};

module.exports.getMinForParam = (params) => {
  // TODO: this should be used

  var paramsAnaylsis = params.paramsAnaylsis;
  var param = params.param;
  var scaleType = params.scaleType;

  if (scaleType === "bi") {
    return paramsAnaylsis[param].scaledMinBi;
  } else {
    return paramsAnaylsis[param].scaledMinLin;
  }
};

module.exports.getMaxesFromDb = function (params) {
  var fcsFileDb = params.fcsFileDb;
  var param = params.param;

  return fcsFileDb.paramsAnaylsis.map(function (param) {
    return param.max;
  });
};

module.exports.getMaxesFromFile = function (fcs) {
  var maxArray = fcs.get$PnX("R");

  return generalHelper.removeNulls(maxArray);
};

module.exports.getLengthIncrement = function (params) {
  var length = params.length;
  const limit = params.limit;

  if (length <= limit) {
    return 1;
  }

  return length / limit;
};
