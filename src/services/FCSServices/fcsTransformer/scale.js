var generalHelper = require("./generalHelper");
var fcsHelper = require("./fcsHelper");
var memoize = require("memoizee");

var getMinForParam = function (params) {
  return 0;

  // TODO: query mongo here
  var fcsFileDb = params.fcsFileDb;
  var param = params.param;
  var scaleType = params.scaleType;

  if (scaleType === "bi") {
    return fcsFileDb.paramsAnaylsis[param].scaledMinBi;
  } else {
    return fcsFileDb.paramsAnaylsis[param].scaledMinLin;
  }
};

function Scale(fcs) {
  // these are the labels

  // param name
  this.n = generalHelper.removeNulls(fcs.get$PnX("N"));

  //gain
  this.g = generalHelper.removeNulls(fcs.get$PnX("G"));
  // amplify
  this.e = generalHelper.removeNulls(fcs.get$PnX("E"));

  // mamimum value
  this.r = generalHelper.removeNulls(fcs.get$PnX("R"));
  // display
  this.d = generalHelper.removeNulls(fcs.get$PnX("D"));

  // spillover
  this.spillover = fcs.getSpillover();

  this.setSpillover({
    fcs: fcs,
  });
  // if(this.spillover) {
  //     var split = this.spillover.split(',');
  //     var numParams = parseInt(split[0]);

  //    this.spilloverParams = split.slice(1, numParams)
  // }

  this.paramArrayCorrectIndex = generalHelper.removeNulls(this.n);
}

Scale.prototype.scaleValue = function (params) {
  var scaled = params.value;
  var paramIndex = params.paramIndex;
  var paramName = params.paramName;
  var scaleType = params.scaleType;
  var hasSpilloverForParam = params.hasSpilloverForParam;
  var arrayOfOneEvent = params.arrayOfOneEvent;
  var logicle = params.logicle;
  var indexOfSpilloverParam = params.indexOfSpilloverParam;
  var dbMaxParams = params.dbMaxParams;
  var skipLogicleScale = params.skipLogicleScale;

  scaled = this.scaleValueAccordingToFile({
    value: scaled,
    param: paramIndex,
    scaleType: scaleType,
    dbMaxParam: dbMaxParams ? dbMaxParams[paramIndex] : null,
  });

  if (hasSpilloverForParam) {
    scaled = this.adjustSpillover({
      paramIndex: paramIndex,
      paramName: paramName,
      values: arrayOfOneEvent,
      scaleType: scaleType,
      indexOfSpilloverParam: indexOfSpilloverParam,
      dbMaxParams: dbMaxParams,
    });
  }

  if (!skipLogicleScale && scaleType === "bi") {
    scaled = logicle.scale(scaled);
  }

  return scaled;
};

Scale.prototype.scaleValueAccordingToFile = function (params) {
  var scaleType = params.scaleType;
  var value = params.value;
  var param = params.param;
  var g = params.g;
  var r = params.r;
  var f1 = params.f1;
  var f2 = params.f2;
  var dbMaxParam = params.dbMaxParam;

  // only scale with gain (PnG) is its linera, see doumentation
  if (scaleType == "lin") {
    //return value;
    // value = this.scaleWithGain({
    //     value: value,
    //     param: param,
    //     g: g,
    //     f1: f1,
    //     f2: f2
    // });
  } else {
    value = this.scaleWithAmplify({
      value: value,
      scaleType: scaleType,
      param: param,
      r: r,
      f1: f1,
      f2: f2,
      dbMaxParam: dbMaxParam,
    });
  }

  return value;
};

Scale.prototype.scaleWithGain = function (params) {
  // N>B THIS SEEMS TO BE IGNORED BY OTHER SOFTWARE

  var value = params.value;
  var param = params.param;
  var g = params.g;
  var f1 = params.f1;
  var f2 = params.f2;

  // $PnG/f/ $P2G/10.0/
  // This keyword specifies the gain that was used to amplify the signal for parameter n. This example
  // shows that parameter 2 was amplified 10.0-fold before digitization. The gain shall not be used in
  // combination with logarithmic amplification, i.e.,$PnG/f/, f not equal to 1, shall not be used together
  // with $PnE different from $PnE/0,0/.
  // Converting linearly amplified data from channel values to scale values. For $P1G/g/, g>0,
  // $PnE/0,0/: A channel value xc can be converted to a scale value xs as xs = xc / g.
  // Example of converting from channel to scale values:
  // $P1R/1024/, $P1E/0,0/, $P1G/8/: This is a parameter with channel values going from 0 to 1023,
  // and scale values from 0 to approximately 128. In this case, a channel value xc can be converted
  // to a scale value xs as xs = xc / 8.

  var g, f1, f2, n;

  if (!g) {
    g = this.g[param];
  }

  if (!f1) {
    f1 = this.getEF1({
      param: param,
    });
  }

  if (!f1) {
    f2 = this.getEF2({
      param: param,
    });
  }

  if (g > 0 && f1 == 0 && f2 == 0) {
    return value / g;
  }

  return value;
};

Scale.prototype.scaleWithAmplify = function (params) {
  // $PnE/f1,f2/ $P3E/4.0,0.01/ [REQUIRED]

  // This keyword specifies whether parameter number n is stored on linear or logarithmic scale and
  // includes details about the logarithmic amplification if logarithmic scale is used.
  // When linear scale is used, $PnE/0,0/ shall be entered. If the floating point data type is used
  // (either $DATATYPE/F/ or $DATATYPE/D/), then all parameters shall be stored as linear with
  // $PnE/0,0/.
  // When logarithmic scale is used, the value of f1 specifies the number of logarithmic decades and
  // f2 represents the linear value that would have been obtained for a signal with a log value of 0. In
  // the example above, the data for parameter 3 were collected using a four-decade logarithmic
  // amplifier and the 0 channel represents the linear value, 0.01.
  // ISAC Recommendation FCS 3.1 – Data File Standards for Flow Cytometry
  // 23/34
  // Note that both the values f1 and f2 shall either be zero or positive numbers. Especially,
  // $PnE/f1,0/ with f1 > 0 is not a valid entry and shall not be written. If this entry is found in an FCS
  // file, it is recommended to handle it as $PnE/f1,1/.
  // Explanation: Entries such as $PnE/4,0/ have never been correct. Unfortunately, the lack of clear
  // explanation made these widely used. For $PnE/f1,f2/, f1 specifies the number of logarithmic
  // decades and f2 represents the minimum on the log scale, which cannot be 0 since the logarithm
  // of zero is not defined. For example, $PnE/4,1/ means 4 decades log reaching from 1 to 10000;
  // $PnE/5,0.01/ means 5 decades log reaching from 0.01 to 1000.
  // Converting from channel values on logarithmic scale to linear scale values:
  // For $PnR/r/, r>0, $PnE/f1,f2/, f1>0, f2>0: n is a logarithmic parameter with channel values going
  // from 0 to r-1, and scale values going from f2 to f2*10^f1. A channel value xc can be converted to
  // a scale value xs as xs = 10^(f1 * xc /(r)) * f2.
  // Examples of converting from channel to scale values:
  // $P1R/1024/, $P1E/4,1/: This is a logarithmic parameter with channel values going from 0 to 1023,
  // and scale values going from 1 to approximately 10000. A channel value xc can be converted to a
  // scale value xs as xs = 10^(4 * xc / 1024) * 1.
  // $P2R/256/, $P2E/4.5,0.1/: This is a logarithmic parameter with channel values going from 0 to
  // 255, and scale values going from 0.1 to approximately 10^3.5 (~3162). A channel value xc can be
  // converted to a scale value xs as xs = 10^(4.5 * xc / 256) * 0.1.

  // For $PnR/r/, r>0, $PnE/f1,f2/, f1>0, f2>0: n is a logarithmic parameter with scale
  // values reaching from f2 to 10^(f1+log(f2)). A channel value xc can be converted to a scale value
  // xs as xs = 10^(f1*xc /r) * f2. If f2 equals 0, consider it 1.

  var param = params.param;
  var value = params.value;

  var r = params.r;
  var f1 = params.f1;
  var f2 = params.f2;

  var dbMaxParam = params.dbMaxParam;

  if (!r) {
    r = this.r[param];
  }

  if (!f1) {
    f1 = this.getEF1({
      param: param,
    });
  }

  if (!f2) {
    f2 = this.getEF2({
      param: param,
    });
  }

  // dbMaxParam > f1 is for when some values are already scaled at this point and the max db value is below f1 e.g. https://www.redmatterapp.com/analyse/59ad5c4b59accd1775e185be/59ad5c6f59accd1775e185bf/
  if (r > 0 && f1 > 0 && dbMaxParam > f1) {
    // xs = 10^(f1*xc /r) * f2. If f2 equals 0, consider it 1

    if (f2 === 0) {
      f2 = 1;
    }

    return Math.pow(10, (f1 * value) / r) * f2;
  }

  return value;
};

Scale.prototype.getRangeFromPnE = function (params) {
  // For $PnR/r/, r>0, $PnE/f1,f2/, f1>0, f2>0: n is a logarithmic parameter with scale
  // values reaching from f2 to 10^(f1+log(f2)).

  var param = params.param;

  var f1 = this.getEF1({
    param: param,
  });
  var f2 = this.getEF2({
    param: param,
  });

  if (f1 > 0) {
    // xs = 10^(f1*xc /r) * f2. If f2 equals 0, consider it 1

    if (f2 === 0) {
      f2 = 1;
    }

    return {
      min: parseFloat(f2),
      max: Math.pow(10, Math.log10(parseFloat(f2)) + parseFloat(f1)),
    };
  }

  return false;
};

Scale.prototype.getRamgeFromPnD = function (params) {
  // $PnD/string,f1,f2/ $P3D/Linear,0,1024/ $P2D/Logarithmic,4,0.1/
  // $PnD is an optional keyword that recommends visualization scale for parameter n. If this keyword
  // is present, the value of the string part shall be one of "Linear" or "Logarithmic". It is not mandatory
  // that any software uses the suggested visualization scale, e.g., the end user may still be able to
  // select another scale to visualize the parameter. If $PnD is missing, analytical software may still
  // be able guess the best scale based on other hints, e.g., $PnE, $PnN, $PnS.

  // The string value encodes the type of display transformation. Two types of display transforms are
  // recognized by the standard. These are "Linear" and "Logarithmic" and the value should map to
  // the transformation that was applied to the data during acquisition. Note that this is different from
  // $PnE since some software exports all data as linear so that the original transformation is not
  // maintained without use of the $PnD keyword.
  // Each of the transformations has a different parameter list (floating point numbers f1, f2) that
  // specifies how to construct the transformation.
  // • $PnD/Linear,f1,f2/ $P3D/Linear,0,1024/
  // Data should be displayed as linear scale. Note that the f1 and f2 parameter values are in
  // "scale" units, not "channel" units, see below for details.
  // ISAC Recommendation FCS 3.1 – Data File Standards for Flow Cytometry
  // 22/34
  // f1: Lower bound - the scale value corresponding to the left edge of the display
  // f2: Upper bound - the scale value corresponding to the right edge of the display
  // Example: $P3D/Linear,0,1024/ specifies a linear display ranging from 0 to 1024 (scale
  // value).
  // Example: $P5D/Linear,100,200/ specifies that the parameter values to be displayed run
  // from 100 to 200.
  // Note: All parameter values are in "scale" units, not "channel" units. Consider the following
  // cases:
  // $P3B/8/ $P3R/256/ $P3G/4/ $P3E/0,0/ $P3D/Linear,0,32/
  // This is a linear parameter with channel values going from 0 to 255. Taking account the
  // gain, the scale values go from 0 to 64. The $P3D specifies a linear display from 0 to 32
  // scale units, which only encompasses the bottom half of the collected data range.
  // $P4B/16/ $P4R/1024/ $P4E/4,1/ $P4D/Linear,0,1000/
  // The display keyword specifies that the data should be shown in linear scaling, with only
  // the bottom 10th of the scale values shown. This will restrict the display to channel values
  // between 0 and 768 (the bottom 3 decades), with channels being distributed exponentially
  // in the linear display.
  // • $PnD/Logarithmic,f1,f2/ $P2D/Logarithmic,4,0.1/
  // Data should be displayed with logarithmic scaling. Note that the f1 and f2 parameter
  // values are in "scale" units, not "channel" units, see below for details.
  // f1: Decades - The number of decades to display.
  // f2: Offset - The scale value corresponding to the left edge of the display
  // Example: $P2D/Logarithmic,4,0.1/ specifies a linear display ranging from 0.1 to 1000
  // (scale value), which is 4 decades of display width.
  // Example: $P1D/Logarithmic,5,0.01/ specifies a linear display ranging from 0.01 to 1000
  // (scale value), which is 5 decades of display width.
  // Note: All parameter values are in "scale" units, not "channel" units. Consider the following
  // case:
  // $P4B/16/ $P4R/1024/ $P4E/4,1/ $P4D/Logarithmic,3,1/
  // The display keyword specifies that the data should be shown in logarithmic scaling, with
  // only the bottom 3 decades shown. This will restrict the display to channel values between
  // 0 and 768 (1024*3/4)

  // N>B revisit this, makes no sesne $P4B/16/ $P4R/1024/ $P4E/4,1/ $P4D/Linear,0,1000/

  // N.B Do you just show ) - the max value?

  var param = params.param;
  var min = params.min;
  var max = params.max;
  var scaleType = params.scaleType;

  if (this.d) {
    if (this.d[param]) {
      var scale = this.d[param].split(",")[0];
      var dF1 = this.d[param].split(",")[1];
      var dF2 = this.d[param].split(",")[2];

      if (scale && dF1 && dF2) {
        // if the user has selected linear,then only use suggestion if its linear
        if (scaleType === "lin") {
          if (scale == "Linear") {
            return {
              min: parseFloat(dF1),
              max: parseFloat(dF2),
            };
          }
        } else {
          // SO user has selected bi, only use if theres a display for Logarithmic
          if (scale == "Logarithmic") {
            return {
              min: parseFloat(dF2),
              max: dF2 * Math.pow(10, dF1),
            };
          }
        }
      }
    }
  }

  return false;

  // // if on bi, get nearest next decade
  // if(scaleType === 'bi') {
  //     return {
  //         min: this.getNearestPower(min),
  //         max: this.getNearestPower(max)
  //     }
  // }

  // // here get min max from file/db
  // return {
  //     min: min,
  //     max: max
  // };
};

Scale.prototype.getNearestPower = function (v) {
  // if(v % 10 === 0) {
  //     if(v > 0) {
  //         v++;
  //     } else {
  //         v--;
  //     }
  // }

  return (v >= 0 || -1) * Math.pow(10, 1 + Math.floor(Math.log10(Math.abs(v))));

  //return (v >= 0 || -1) * Math.pow(10, Math.floor(Math.log10(Math.abs(v))));
};

Scale.prototype.setSpillover = function (params) {
  var spilloverObj = params.fcs.parseSpillover({
    spillover: this.spillover,
  });

  if (spilloverObj) {
    this.spilloverValues = spilloverObj.spilloverValues;
    this.spilloverParams = spilloverObj.spilloverParams;
    this.invertedMatrix = spilloverObj.invertedMatrix;
    this.indexesOfSpilloverParams = spilloverObj.indexesOfSpilloverParams;
  }
};

Scale.prototype.hasSpillover = function (params) {
  return this.spillover && this.spillover.length > 0;
};

Scale.prototype.hasSpilloverForParam = function (params) {
  if (Array.isArray(this.spilloverParams) && isNaN(this.spilloverParams[0])) {
    // so if its 'FCS' etc
    return this.spilloverParams.indexOf(params.paramName) > -1;
  } else if (
    Array.isArray(this.spilloverParams) &&
    !isNaN(this.spilloverParams[0])
  ) {
    // if its 1, 2, 3
    return this.indexesOfSpilloverParams.indexOf(params.paramIndex) > -1;
  }

  return false;
};

Scale.prototype.getIndexOfSpilloverParam = function (params) {
  var indexOfParam;
  if (Array.isArray(this.spilloverParams) && isNaN(this.spilloverParams[0])) {
    indexOfParam = this.spilloverParams.indexOf(params.paramName);
  } else if (
    Array.isArray(this.spilloverParams) &&
    !isNaN(this.spilloverParams[0])
  ) {
    // if its 1, 2, 3

    var integers = this.indexesOfSpilloverParams.map(function (p) {
      return parseInt(p);
    });

    indexOfParam = integers.indexOf(params.paramIndex);
  }

  return indexOfParam;
};

Scale.prototype.memoizedScaleValueAccordingToFile = memoize(
  Scale.prototype.scaleValueAccordingToFile,
  { length: 4 }
);

Scale.prototype.adjustSpillover = function (params) {
  // $SPILL or $COMP and standard keyword is $SPILLOVER
  var param = params.param;
  var paramName = params.paramName;

  // this will be an array of values, one for each param
  var values = params.values;
  var scaleType = params.scaleType;
  var indexOfSpilloverParam = params.indexOfSpilloverParam;

  var dbMaxParams = params.dbMaxParams;

  var adjusted = 0;
  for (var i = 0; i < this.indexesOfSpilloverParams.length; i++) {
    if (this.invertedMatrix._data[i][indexOfSpilloverParam] != 0) {
      var scaled = this.scaleValueAccordingToFile({
        value: values[this.indexesOfSpilloverParams[i]],
        param: this.indexesOfSpilloverParams[i],
        scaleType: scaleType,
        dbMaxParam: dbMaxParams[this.indexesOfSpilloverParams[i]],
      });

      adjusted += scaled * this.invertedMatrix._data[i][indexOfSpilloverParam];
    }
  }

  return adjusted;
};

Scale.prototype.getEF1 = function (params) {
  var param = params.param;

  if (Array.isArray(this.e) && this.e[param]) {
    return parseInt(this.e[param].split(",")[0]);
  }

  return false;
};

Scale.prototype.getEF2 = function (params) {
  var param = params.param;

  if (Array.isArray(this.e) && this.e[param]) {
    return parseInt(this.e[param].split(",")[1]);
  }

  return false;
};

Scale.prototype.getMinMax = function (params) {
  var fcs = params.fcs;
  var fcsFileDb = params.fcsFileDb;
  var paramIndex = params.paramIndex;
  var scaleType = params.scaleType;

  var minMax;
  var max;
  var min;

  var minLabel;
  var maxLabel;

  var rX;
  var rY;

  if (scaleType === "bi") {
    // 1. If its logicle, en the range wilither by ddescribed in PnE, and/or PnD, OR it will be taking from the accpetedMin in the DB and max from the fcs file

    minMax = this.getRangeFromPnE({
      param: paramIndex,
    });

    if (minMax) {
      max = minMax.max;
      min = minMax.min;
      rX = min;

      minLabel = minMax.min;
      maxLabel = minMax.max;
    }
  }

  // 2. check if there's a recommended display in PnD
  minMax = this.getRamgeFromPnD({
    param: paramIndex,
  });

  if (minMax) {
    max = minMax.max;
    min = minMax.min;

    minLabel = minMax.min;
    maxLabel = minMax.max;
  }

  console.log("3. fcs.get$PnX is ", fcs.get$PnX("R"));

  // 3. if it stil hasn't been set, get from file
  if (!max) {
    max = fcsHelper.getMaxForParam({
      fcs: fcs,
      param: paramIndex,
    });

    // 4/ if its logicle, get bearest decade

    if (scaleType === "bi") {
      maxLabel = this.getNearestPower(max);
    }
  }

  console.log("fcsHelper f is ", fcsHelper);

  if (!min) {
    min = fcsHelper.getMinForParam({
      fcsFileDb: fcsFileDb,
      param: paramIndex,
      scaleType: scaleType,
    });

    // 4/ if its logicle, get bearest decade

    if (scaleType === "bi") {
      minLabel = this.getNearestPower(min);
    }
  }

  return {
    min: min,
    max: max,
    minLabel: minLabel,
    maxLabel: maxLabel,
  };
};

Scale.prototype.logScale = function (params) {
  var value = params.value;
  var scale = params.scale;
  var min = params.min;
  var logicle = params.logicle;

  if (min < 0) {
    return logicle.scale(value);
  } else {
    if (value > 0) {
      value = Math.log10(value);
    }

    return value + (min > 0 ? Math.abs(Math.log10(min)) : 0);
  }
};

export default Scale;
