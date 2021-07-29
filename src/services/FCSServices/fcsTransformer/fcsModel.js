/* eslint-disable no-throw-literal */
/* eslint-disable  */
import FCS from "fcs";
import FS from "fs";
import Q from "q";
import * as math from "mathjs";

import generalHelper from "./generalHelper";
import Scale from "./scale";

class CustomFCS extends FCS {
  _prepareReadParameters(databuf) {
    var isBE;
    if ("4,3,2,1" === this.text.$BYTEORD) isBE = true;
    else if ("1,2,3,4" === this.text.$BYTEORD) isBE = false;

    var options = this.meta;

    var readParameters = {
      asNumber:
        FCS.OPTION_VALUES.asNumber === options.dataFormat ||
        FCS.OPTION_VALUES.asBoth === options.dataFormat,
      asString:
        FCS.OPTION_VALUES.asString === options.dataFormat ||
        FCS.OPTION_VALUES.asBoth === options.dataFormat,
      decimalsToPrint: Number(
        options.decimalsToPrint || FCS.DEFAULT_VALUES.decimalsToPrint
      ),
      bigSkip: 0,
    };

    readParameters.eventsToRead = Number(
      options.eventsToRead || FCS.DEFAULT_VALUES.eventsToRead
    );

    if (
      readParameters.eventsToRead <= 0 ||
      readParameters.eventsToRead > this.meta.eventCount
    )
      readParameters.eventsToRead = this.meta.eventCount;

    switch (this.text.$DATATYPE) {
      case "D":
        readParameters.fn = isBE ? databuf.readDoubleBE : databuf.readDoubleLE;
        readParameters.bytes = 8;
        break;
      case "F":
        readParameters.fn = isBE ? databuf.readFloatBE : databuf.readFloatLE;
        readParameters.bytes = 4;
        break;
      case "I":
        var bits = Number(this.text["$P1B"]);
        if (bits === 24) {
          readParameters.fn = isBE ? databuf.readUIntBE : databuf.readUIntLE;
          readParameters.bytes = 3;
        } else if (bits > 16) {
          readParameters.fn = isBE
            ? databuf.readUInt32BE
            : databuf.readUInt32LE;
          readParameters.bytes = 4;
        } else {
          readParameters.fn = isBE
            ? databuf.readUInt16BE
            : databuf.readUInt16LE;
          readParameters.bytes = 2;
        }
        break;
      default:
        throw "oops";
    }

    readParameters.bytesPerEvent = readParameters.bytes * this.meta.$PAR;

    if (options.skip && readParameters.eventsToRead < this.meta.eventCount) {
      var events2Skip;
      if (isFinite(options.skip)) events2Skip = options.skip;
      else {
        events2Skip =
          Math.floor(this.meta.eventCount / readParameters.eventsToRead) - 1;
        this.meta.eventSkip = options.skip + " -> " + events2Skip;
      }
      readParameters.bigSkip = events2Skip * readParameters.bytesPerEvent;
    }

    return readParameters;
  }

  _readDataGroupByEvent(databuf, readParameters) {
    // determine if these are ints, floats, etc...
    readParameters = readParameters || this._prepareReadParameters(databuf);

    var offset = Number(this.header.beginData);

    // local cache since heavily used
    var bytesPerMeasurement = readParameters.bytes;
    var databufReadFn = readParameters.fn;

    this.databufReadFn2 = readParameters.fn;

    var eventsToRead = readParameters.eventsToRead;
    var numParams = Number(this.meta.$PAR);
    var decimalsToPrint =
      "I" === this.text.$DATATYPE ? -1 : readParameters.decimalsToPrint;

    var e = Number;
    var p = Number;
    var v = Number;

    var dataNumbers;
    if (readParameters.asNumber) {
      dataNumbers = new Array(eventsToRead);
      for (e = 0; e < eventsToRead; e++) dataNumbers[e] = new Array(numParams);
    }

    var dataStrings = readParameters.asString ? new Array(eventsToRead) : null;
    var eventString;

    // loop over each event
    for (e = 0; e < eventsToRead; e++) {
      if (dataStrings) {
        eventString = "[";
      }
      var dataE = dataNumbers ? dataNumbers[e] : null; // efficiency

      // loop over each parameter
      for (p = 0; p < numParams; p++) {
        v = databufReadFn.call(databuf, offset, bytesPerMeasurement);
        offset += bytesPerMeasurement;

        if (dataStrings) {
          if (p > 0) eventString += ",";
          if (decimalsToPrint >= 0) eventString += v.toFixed(decimalsToPrint);
          else eventString += v;
        }

        if (dataE) dataE[p] = v;
      }

      if (dataStrings) {
        eventString += "]";
        dataStrings[e] = eventString;
      }

      offset += readParameters.bigSkip;
    }

    this.dataAsNumbers = dataNumbers;
    this.dataAsStrings = dataStrings;
    return this;
  }

  setMaxes(databuf) {
    var maxArray = this.get$PnX("R");
    maxArray = generalHelper.removeNulls(maxArray);
    this.maxArray = maxArray;
  }

  getEvents(databuf) {
    return this.dataAsNumbers;
  }

  getEvent(params) {
    var value = this.dataAsNumbers[params.i][params.param];

    if (
      value >= -this.maxArray[params.param] &&
      value <= this.maxArray[params.param]
    ) {
      return value;
    } else {
      // console.log('returning false for value ', value);
      return "false";
    }
  }

  getParams() {
    return generalHelper.removeNulls(this.get$PnX("N"));
  }

  getParamsAndScales() {
    // If $PnD is missing, analytical software may still
    // be able guess the best scale based on other hints, e.g., $PnE, $PnN, $PnS.
    var self = this;
    var scale = new Scale(this);
    var display;
    var longName;
    var json = [],
      i = 0;

    var nArray = this.getParams();
    var sArray = this.get$PnX("S");
    var paramArray = [];
    var range;

    sArray = generalHelper.removeNulls(sArray);

    for (var x = 0; x < nArray.length; x++) {
      var param = nArray[x];

      if (
        scale.hasSpilloverForParam({
          paramName: param,
          paramIndex: x,
        })
      ) {
        param = "Comp-" + param;
      }

      if (sArray[x]) {
        param = param + " - " + sArray[x];
      }

      paramArray.push(param);
    }

    paramArray = generalHelper.removeNulls(paramArray);

    paramArray.forEach(function (entry, index) {
      display = self.getText("$P" + (index + 1) + "DISPLAY");

      if (!display) {
        display = self.getText("P" + (index + 1) + "DISPLAY");

        if (!display) {
          display = self.getText("$P" + (index + 1) + "D");

          if (!display) {
            display = self.getText("P" + (index + 1) + "D");

            if (!display) {
              // if this returns anything, should be log
              range = scale.getRangeFromPnE({
                param: index,
              });

              if (range) {
                display = "LOG";
              }

              if (!display) {
                if (entry && entry.toLowerCase().indexOf("log") > -1) {
                  display = "LOG";
                } else if (entry && entry.toLowerCase().indexOf("fs") > -1) {
                  display = "LIN";
                } else if (entry && entry.toLowerCase().indexOf("ss") > -1) {
                  display = "LIN";
                } else {
                  display = "LOG";
                }
              }
            }
          }
        }
      }

      if (display && display.toLowerCase().indexOf("log") > -1) {
        display = "bi";
      } else {
        display = "lin";
      }

      json.push({
        key: index,
        value: entry,
        display: display,
      });
    });

    return json;
  }

  getParamNameFromIndex(params) {
    var index = params.index;

    return this.get("text", "$P" + (index + 1) + "N");
  }

  getIndexesOfParams(params) {
    var parameterNames = params.parameterNames;

    var paramNames = this.get$PnX("N");
    paramNames = generalHelper.removeNulls(paramNames);

    var indexes = [];

    parameterNames.forEach(function (param) {
      indexes.push(paramNames.indexOf(param));
    });

    return indexes;
  }

  getParamLike(params) {
    var paramToMatch = params.paramToMatch;

    var allParamNames = this.get$PnX("N");
    allParamNames = generalHelper.removeNulls(allParamNames);

    var indexes = [];

    var match = allParamNames.find(function (param) {
      return param.indexOf(paramToMatch) > -1;
    });

    if (match) {
      return {
        match: match,
        index: allParamNames.indexOf(match),
      };
    }

    return false;
  }

  getParamNameHasSpillover(params) {
    var self = this;
    var paramNameHasSpillover = [];
    var scale = params.scale;

    this.dataAsNumbers[0].forEach(function (val, index) {
      var paramName = self.getParamNameFromIndex({
        index: index,
      });

      var hasSpillover = scale.hasSpilloverForParam({
        paramName: paramName,
        paramIndex: index,
      });

      paramNameHasSpillover.push({
        paramName: paramName,
        paramIndex: index,
        hasSpillover: hasSpillover,
      });
    });

    return paramNameHasSpillover;
  }

  getSpillover() {
    var spillover = this.getText("$SPILLOVER");

    if (!spillover) {
      spillover = this.getText("SPILL");

      if (!spillover) {
        spillover = this.getText("COMP");
      }
    }

    return spillover;
  }

  parseSpillover(params) {
    var spillover;
    var self = this;

    if (!params.spillover) {
      spillover = this.getSpillover();
    } else {
      spillover = params.spillover;
    }

    if (spillover && spillover.length > 0) {
      var split = spillover.split(",");
      var numParams = parseInt(split[0]);
      var values = split.slice(numParams + 1, split.length);
      var spilloverValues = [];

      for (var i = 0; i < numParams; i++) {
        var arr = values.slice(i * numParams, i * numParams + numParams);

        spilloverValues.push(arr);
      }

      var matrix = math.matrix(spilloverValues);
      var determinant = math.det(matrix);

      if (determinant != 0) {
        var invertedMatrix = math.inv(matrix);

        var spilloverParams = split.slice(1, numParams + 1);
        var indexesOfSpilloverParams;
        var spilloverParamLabels = [];

        if (Array.isArray(spilloverParams) && isNaN(spilloverParams[0])) {
          // if 'FCS' etc
          indexesOfSpilloverParams = this.getIndexesOfParams({
            parameterNames: spilloverParams,
          });

          spilloverParamLabels = spilloverParams;
        } else if (
          Array.isArray(spilloverParams) &&
          !isNaN(spilloverParams[0])
        ) {
          // so '1, '2', '3'

          indexesOfSpilloverParams = spilloverParams.map(function (param) {
            // subtract 1 as  starts a '1'
            var index = parseInt(param, 10) - 1;

            var paramName = self.getParamNameFromIndex({
              index: index,
            });

            spilloverParamLabels.push(paramName);

            return index;
          });
        }

        return {
          spilloverValues: spilloverValues,
          invertedMatrix: invertedMatrix,
          spilloverParams: spilloverParams,
          indexesOfSpilloverParams: indexesOfSpilloverParams,
          spilloverParamLabels: spilloverParamLabels,
        };
      } else {
        return {
          spilloverValues: [],
          invertedMatrix: [],
          spilloverParams: [],
          indexesOfSpilloverParams: [],
          spilloverParamLabels: [],
        };
      }
    }

    return false;
  }
}

var getFCS = function (params) {
  return getFcsFromDataBuf({
    databuf: params.file,
    eventsToRead: params.eventsToRead,
  });
};

var getFcsFromDataBuf = function (params) {
  var fcs;
  var options = {
    dataFormat: "asNumber",
    eventsToRead: params.eventsToRead,
  };

  return new Promise(function (resolve, reject) {
    var fcs = new CustomFCS(options, params.databuf);
    if (fcs) {
      resolve(fcs);
    } else {
      reject(fcs);
    }
  });
};

var isFcsFile = function (req, res, path, index) {
  return this.getFCS({
    filePath: path,
  })
    .then(function (fcs) {
      if (!checkIfHasMeta(fcs)) {
        // emailHelper.sendLoggingEmail(req, 'file upload error - not fcs file', 'failed file upload cos not fcs file');

        if (FS.existsSync(path)) {
          FS.unlinkSync(path);
        }

        throw new Error("The file does not appear to be a flow cytometry file");
      }

      return {
        index,
        index,
        label: fcs.getText("$FIL"),
        fcs: fcs,
      };
    })
    .catch(function (err) {
      if (FS.existsSync(path)) {
        FS.unlinkSync(path);
      }

      throw err;
    });
};

var updateWorkspaceLogicleParams = function (res, req) {};

// var calculateLogicleParams = function(req, res){

//     return fileModel.getUserFilesWithoutAnalysisAsync(req, res)
//     .then(function(filesRecords){

//         var readFiles = filesRecords.map(readFileAync);

//         return Promise.all(readFiles).then(function(files){

//             var fcsFilesMapped = files.map(getFCSAsync);

//             return Promise.all(fcsFilesMapped).then(function(fcsFiles){

//                 var fcsPercentiles = {};
//                 var paramNegatives = {};
//                 fcsFiles.forEach(function(fcs, index){

//                         var id = filesRecords[index]['_id'];
//                         fcsPercentiles[id] = [];

//                         var params = generalHelper.removeNulls(fcs.get$PnX('N'));

//                         var scale = new Scale(fcs);

//                         for (var p = 0; p < params.length; p++) {

//                             var negatives = [];
//                             var max = 0;
//                             // scaled and compensated
//                             var scaledMaxLin = 0;
//                             var scaledMaxBi = 0;
//                             var scaledMinLin = 0;
//                             var scaledMinBi = 0;
//                             var scaledLin;
//                             var scaledBi;
//                             var paramName =  params[p];
//                             var paramMax = fcsHelper.getParamMax(fcs, p);

//                             // this is the gain i.e from $PnG
//                             var g = scale.g[p];
//                             var r = scale.r[p];
//                             var f1 = scale.getEF1({
//                                 param: p
//                             });
//                             var f2 = scale.getEF2({
//                                 param: p
//                             });

//                             // var hasSpilloverForParam = scale.hasSpilloverForParam({
//                             //     paramName: paramName,
//                             //     paramIndex: p
//                             // });

//                             // var indexOfSpilloverParam = scale.getIndexOfSpilloverParam({
//                             //     paramName: paramName,
//                             //     params: p
//                             // });

//                             for (var i = 0; i < fcs.dataAsNumbers.length; i++) {

//                                 var value = fcs.dataAsNumbers[i][p];

//                                 // disguard any values that are lower than the negative of the max
//                                 if(value > -paramMax) {

//                                     if (!max) {
//                                         max = value;
//                                     }

//                                     if (value > max) {
//                                         max = value;
//                                     }

//                                     scaledLin = scale.scaleValueAccordingToFile({
//                                         value: value,
//                                         param: p,
//                                         scaleType: 'lin',
//                                         g: g,
//                                         f1: f1,
//                                         f2: f2
//                                     });

//                                     scaledBi = scale.scaleValueAccordingToFile({
//                                         value: value,
//                                         param: p,
//                                         scaleType: 'bi',
//                                         r: r,
//                                         f1: f1,
//                                         f2: f2
//                                     });

//                                     // This takes too long
//                                     // if(hasSpilloverForParam){

//                                     //     scaledLin = scale.adjustSpillover({
//                                     //         param: p,
//                                     //         paramName: paramName,
//                                     //         values: fcs.dataAsNumbers[i],
//                                     //         scaleType: 'lin',
//                                     //         indexOfSpilloverParam: indexOfSpilloverParam
//                                     //     });

//                                     //     scaledBi = scale.adjustSpillover({
//                                     //         param: p,
//                                     //         paramName: paramName,
//                                     //         values: fcs.dataAsNumbers[i],
//                                     //         scaleType: 'bi',
//                                     //         indexOfSpilloverParam: indexOfSpilloverParam
//                                     //     });

//                                     // }

//                                    if (scaledLin < scaledMinLin) {
//                                         scaledMinLin = scaledLin;
//                                     }

//                                     if (scaledBi < scaledMinBi) {
//                                         scaledMinBi = scaledBi;
//                                     }

//                                     if(scaledLin > scaledMaxLin) {
//                                         scaledMaxLin = scaledLin;
//                                     }

//                                     if(scaledBi > scaledMaxBi) {
//                                         scaledMaxBi = scaledBi;
//                                     }

//                                     if (scaledBi < 0) {
//                                         negatives.push(scaledBi);
//                                     }

//                                 }

//                             }

//                             negatives.sort(function(a,b) { return a - b;});

//                             var acceptedMin = 0;

//                             // including compensation
//                             var scaledMin = 0;

//                             var fifthPercentile = 0;

//                             if(negatives.length > 0) {

//                                 // var paramMax = -fcsHelper.getParamMax(fcs, p);

//                                 // //negatives = [-6000000, -500000, -200000, -25]

//                                 // var found = negatives.find(function(negative){
//                                 //     return negative > paramMax;
//                                 // });

//                                 // if(found) {
//                                 //     acceptedMin = found;
//                                 // }

//                             }

//                             fcsPercentiles[id][p] = {
//                                 max: max,
//                                 min: negatives.length > 0 ? negatives[0] : 0,
//                                 acceptedMin: acceptedMin,
//                                 fifthPercentile: percentileHelper.percentile(negatives, .05),
//                                 scaledMinLin: scaledMinLin,
//                                 scaledMinBi: scaledMinBi,
//                                 scaledMaxLin: scaledMaxLin,
//                                 scaledMaxBi: scaledMaxBi,
//                                 paramName: paramName
//                             }
//                         };
//                 });

//                 var saved = [];

//                 filesRecords.forEach(function(filesRecord){

//                     filesRecord.paramsAnaylsis = fcsPercentiles[filesRecord._id];
//                     saved.push(filesRecord.save());

//                 });

//                 return Promise.all(saved);

//             })
//             .catch(function(err){
//                 console.log('err is ', err);
//                 return err;
//             });
//         })
//         .catch(function(failedResult){
//             return err;
//         });
//     })
//     .catch(function(failedResult){
//         return err;
//     });

// };

// var checkIfHasCorrectParams = function(uploadingFile, req, res){
//     console.log('uploadingFile>>>>>>>>>>>>>>')
//     return fileModel.getUserFilesAsync(req, res)
//     .then(function(data2){
//         console.log('1............>>>>>>>>>>>>>>>>>>',data2)
//         var readFiles = data2.map(readFileAync);
//         return Promise.all(readFiles);
//     })
//     .then(function(files){
//         console.log('2............>>>>>>>>>>>>>>>>>>')
//         var fcsFiles = files.map(getFCSAsync);
//         return Promise.all(fcsFiles);
//     })
//     .then(function(fcsFiles){
//         console.log('3............>>>>>>>>>>>>>>>>>>')
//         var compared = fcsFiles.map(function(fcsFile){
//             return compareArraysAsync(fcsFile.get$PnX('N'), uploadingFile.get$PnX('N'))
//         });
//         return Promise.all(compared);
//     })
//     .then(function(finalResult){
//         console.log('4............>>>>>>>>>>>>>>>>>>')
//         // in here if uploaded fcs params are the same as all other file params in workspace
//         return true;
//     })
//     .catch(function(failedResult){
//         console.log('failedResult>>>>>>>>>>>>>>>>>>>>>',failedResult)
//         // emailHelper.sendLoggingEmail(req, 'doesnt have same params');

//         throw new Error('All files in the same workspace must have the same parmaters');
//     });
// };

function compareArraysAsync(array1, array2) {
  return new Promise(function (resolve, reject) {
    var result = generalHelper.compareTwoArrays(array1, array2);
    if (result) {
      resolve(result);
    } else {
      reject(result);
    }
  });
}

function getFCSAsync(databuf) {
  var options = {
    dataFormat: "asNumber",
    eventsToRead: -1,
  };

  return new Promise(function (resolve) {
    var fcs = new CustomFCS(options, databuf);
    resolve(fcs);
  });
}

function readFileAync(fileObject) {
  var filePath = "uploads/" + fileObject.userId + "/" + fileObject.filename;
  console.log("inised readFileAync>>>>>", filePath);
  var readFile = Q.denodeify(FS.readFile);
  return readFile(filePath);
}

function readFileAyncFromPath(filePath) {
  var readFile = Q.denodeify(FS.readFile);

  console.log("readfile is ", readFile);
  return readFile(filePath);
}

function checkIfHasMeta(fcs) {
  return fcs && fcs.hasOwnProperty("meta");
}

var getMinMax = function (fcs, paramX, paramY) {
  /*
    var maxArray = fcs.get$PnX('R');

    maxArray = this.removeNulls(maxArray);

    maxX = maxArray[paramX];
    maxY = maxArray[paramY];

    return {
        maxX: maxX,
        maxY: maxY
    }*/

  var maxX = 0;
  var maxY = 0;
  var x;
  var y;

  for (var i = 0; i < fcs.dataAsNumbers.length; i++) {
    x = fcs.dataAsNumbers[i][paramX];
    x = Math.log10(x);

    y = fcs.dataAsNumbers[i][paramY];
    y = Math.log10(y);

    if (x > maxX) {
      maxX = x;
    }

    if (y > maxY) {
      maxY = y;
    }
  }

  return {
    maxX: maxX,
    maxY: maxY,
  };
};

export default {
  getMinMax,
  getFCS,
  getFcsFromDataBuf,
  isFcsFile,
  CustomFCS,
};
