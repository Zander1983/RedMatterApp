import percentileHelper from "./percentileHelper";
import generalHelper from "./generalHelper";
import Logicle from "./logicle";

export const getParamMax = (fcs, param) => {
  var maxArray = fcs.get$PnX("R");

  maxArray = generalHelper.removeNulls(maxArray);

  return maxArray[param];
};

export const getLogicles = (params) => {
  var logicles = {};
  var fcs = params.fcs;
  var fcsFileDb = params.fcsFileDb;
  var self = this;
  var scale = params.scale;

  //fcsFileDb.paramsAnaylsis.forEach(function(paramsAnaylsisElement, paramIndex){

  fcs.getParams().forEach(function (paramsAnaylsisElement, paramIndex) {
    logicles[paramIndex] = self.getLogicle({
      fcsFileDb: fcsFileDb,
      paramIndex: paramIndex,
      fcs: fcs,
      scale: scale,
    });
  });

  return logicles;
};

export const getLogicle = (params) => {
  var fcs = params.fcs;
  var fcsFileDb = params.fcsFileDb;
  var paramIndex = params.paramIndex;
  var scale = params.scale;
  var minMax = params.minMax;

  var transformParams = this.getTMWA({
    fcs: fcs,
    fcsFileDb: fcsFileDb,
    paramIndex: paramIndex,
    scale: scale,
    minMax: minMax,
  });

  return new Logicle(transformParams.T, transformParams.W);
};

export const getTMWA = (params) => {
  var fcs = params.fcs;
  var fcsFileDb = params.fcsFileDb;
  var paramIndex = params.paramIndex;
  var scale = params.scale;
  var minMax = params.minMax;

  console.log("2. fcs.get$PnX is ", fcs.get$PnX("R"));

  if (!minMax) {
    minMax = scale.getMinMax({
      fcs: fcs,
      fcsFileDb: fcsFileDb,
      paramIndex: paramIndex,
      scaleType: "bi",
    });
  }

  var T = minMax.max;
  var M = 4.5;
  var A = 0;
  var W = percentileHelper.calculateW(minMax.min, T);

  return {
    T: T,
    M: M,
    A: A,
    W: W,
  };
};

export const getMaxForParam = (params) => {
  var fcs = params.fcs;
  var param = params.param;

  var maxArray = fcs.get$PnX("R");
  maxArray = generalHelper.removeNulls(maxArray);
  var maxInHeader = maxArray[param];

  // IF WANT TO USE MAX FROM DB, WILL NEED TO RUN A SCRIPT AS ALL THE MAXES ARE SLIGHTLY WRONG
  // SO JUST USE MAX FORM THE FILE
  // var maxInDb = fcsFileDb.paramsAnaylsis[param].max;

  // if(maxInDb > maxInHeader){
  // 	return parseFloat(maxInDb);
  // }

  return parseFloat(maxInHeader);
};

export const getMinForParam = (params) => {
  return 0;

  // TODO: this should be used

  var fcsFileDb = params.fcsFileDb;
  var param = params.param;
  var scaleType = params.scaleType;

  if (scaleType === "bi") {
    return fcsFileDb.paramsAnaylsis[param].scaledMinBi;
  } else {
    return fcsFileDb.paramsAnaylsis[param].scaledMinLin;
  }
};

export const getMaxesFromDb = function (params) {
  var fcsFileDb = params.fcsFileDb;
  var param = params.param;

  return fcsFileDb.paramsAnaylsis.map(function (param) {
    return param.max;
  });
};

export const getMaxesFromFile = function (fcs) {
  var maxArray = fcs.get$PnX("R");

  return generalHelper.removeNulls(maxArray);
};

export default {
  getParamMax,
  getLogicles,
  getLogicle,
  getTMWA,
  getMaxForParam,
  getMinForParam,
  getMaxesFromDb,
  getMaxesFromFile,
};
