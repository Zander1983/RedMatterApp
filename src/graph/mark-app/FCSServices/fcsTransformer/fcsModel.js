/* eslint-disable no-throw-literal */
/* eslint-disable  */
import FCS from "fcs";
import FS from "fs";
import Q from "q";
import * as math from "mathjs";
import generalHelper from "./generalHelper";
import Scale from "./scale";
import { compensate } from "../../Helper";

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
    this.channels = {};
    this.scale = {};
    this.events = {};

    this.scale = new Scale(this);
    const paramNamesHasSpillover = this.getParamNameHasSpillover(this.scale);
    this.channelMaximums = generalHelper.removeNulls(this.get$PnX("R"));
    this.channels = this.getParamsAndScales();
    //eneralHelper.removeNulls(fcs.get$PnX("R"));

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
    var indexOfSpilloverParamX;
    let minimums = new Array(numParams);
    let channelF1s = [];
    let channelF2s = [];

    for (p = 0; p < numParams; p++) {
      minimums[p] = 0;
    }

    // loop over each event

    let test = [];
    for (p = 0; p < numParams; p++) {
      indexOfSpilloverParamX = this.scale.getMatrixSpilloverIndex({
        paramName: paramNamesHasSpillover[p].paramName,
        paramIndex: p,
      });

      channelF1s.push(this.scale.getEF1(p));
      channelF2s.push(this.scale.getEF2(p));
    }

    let scaledX;
    //eventsToRead
    let compenatedEvents = [];
    let origEvents = new Array(eventsToRead);
    let compenatedAndOrigEvents = {};
    let compensated;
    for (e = 0; e < eventsToRead; e++) {
      if (dataStrings) {
        eventString = "[";
      }

      var dataE = dataNumbers ? dataNumbers[e] : null; // efficiency

      //console.log("dataE is ", dataE);
      //console.log("decimalsToPrint is ", decimalsToPrint);

      // loop over each parameter
      for (let paramIndex = 0; paramIndex < numParams; paramIndex++) {
        v = databufReadFn.call(databuf, offset, bytesPerMeasurement);

        offset += bytesPerMeasurement;

        if (dataE) dataE[paramIndex] = v;

        if (
          this.channels[paramIndex].display == "bi" &&
          channelF1s[paramIndex]
        ) {
          scaledX = this.scale.scaleWithAmplify({
            value: dataE[paramIndex],
            f1: channelF1s[paramIndex],
            f2: channelF2s[paramIndex],
            channelMaximum: this.channelMaximums[paramIndex],
          });
        } else {
          scaledX = dataE[paramIndex];
        }

        if (dataE) dataE[paramIndex] = scaledX;
        if (scaledX < minimums[paramIndex]) {
          minimums[paramIndex] = scaledX;
        }
      }

      // compenatedAndOrigEvents = compensate(dataE, this.scale, this.channels);
      compenatedEvents = [];
      for (let paramIndex = 0; paramIndex < numParams; paramIndex++) {
        let hasSpilloverForParam =
          paramNamesHasSpillover[paramIndex].hasSpillover;
        if (hasSpilloverForParam) {
          // origEvents[e][paramIndex] = dataE[paramIndex];
          let matrixSpilloverIndex = this.scale.matrixSpilloverIndexes[
            paramIndex
          ];
          compensated = this.scale.adjustSpillover({
            eventValues: dataE,
            scaleType: this.channels[paramIndex].display,
            matrixSpilloverIndex: matrixSpilloverIndex,
            channelMaximums: this.channelMaximums,
          });
          // let compensated = dataE[paramIndex];
          compenatedEvents.push({
            index: paramIndex,
            value: compensated,
          });

          // test.push({
          //   index: paramIndex,
          //   value: compensated,
          // });
          // dataE[paramIndex] = compensated;
        }
      }

      // let index = 0;
      // for (let paramIndex = 0; paramIndex < numParams; paramIndex++) {
      //   let hasSpilloverForParam =
      //     paramNamesHasSpillover[paramIndex].hasSpillover;

      //   if (hasSpilloverForParam) {
      //     dataE[paramIndex] = compenatedEvents[index];
      //     index++;
      //   }
      // }

      // dataE.forEach((eventPoint) => {});

      compenatedEvents.forEach(
        (compenatedEvent) =>
          (dataE[compenatedEvent.index] = compenatedEvent.value)
      );

      offset += readParameters.bigSkip;
    }

    // console.log(
    //   ">>>> FINISHED converting buffer to numbers, dataNumbers is ",
    //   dataNumbers
    // );

    this.channels.forEach((channel, index) => {
      channel.minimum = minimums[index];
      channel.maximum = parseInt(this.channelMaximums[index]);
    });

    this.events = dataNumbers;

    this.paramNamesHasSpillover = paramNamesHasSpillover;
    // this.dataAsStrings = dataStrings;
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
              let PnS = self.getText("$P" + (index + 1) + "S");

              if (!PnS) {
                PnS = self.getText("P" + (index + 1) + "S");
              }

              if (PnS) {
                if (PnS.toLowerCase().indexOf("log") > -1) {
                  display = "LOG";
                } else if (PnS.toLowerCase().indexOf("lin") > -1)
                  display = "LIN";
              }

              if (!display) {
                let PnS = self.getText("P" + (index + 1) + "S");

                if (PnS) {
                  display = "LOG";
                }

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
                    } else if (
                      entry &&
                      entry.toLowerCase().indexOf("fs") > -1
                    ) {
                      display = "LIN";
                    } else if (
                      entry &&
                      entry.toLowerCase().indexOf("ss") > -1
                    ) {
                      display = "LIN";
                    } else if (
                      entry &&
                      entry.toLowerCase().indexOf("time") > -1
                    ) {
                      display = "LIN";
                    } else {
                      display = "LOG";
                    }
                  }
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

  getParamNameHasSpillover(scale) {
    var paramNameHasSpillover = [];

    scale.n.forEach(function (paramName, index) {
      var hasSpillover = scale.hasSpilloverForParam({
        paramName: paramName,
        paramIndex: index,
      });

      let indexOfSpilloverParam = scale.getMatrixSpilloverIndex({
        paramName: paramName,
        paramIndex: index,
      });

      paramNameHasSpillover.push({
        paramName: paramName,
        paramIndex: index,
        hasSpillover: hasSpillover,
        indexOfSpilloverParam: indexOfSpilloverParam,
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
        invertedMatrix.data = invertedMatrix._data;
        invertedMatrix.datatype = invertedMatrix._datatype;
        invertedMatrix.size = invertedMatrix._size;

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
    skip: params.skip,
  });
};

var getFcsFromDataBuf = function (params) {
  var fcs;
  var options = {
    dataFormat: "asNumber",
    eventsToRead: params.eventsToRead,
    skip: params.skip,
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

function checkIfHasMeta(fcs) {
  return fcs && fcs.hasOwnProperty("meta");
}

var getMinMax = function (fcs, paramX, paramY) {
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
