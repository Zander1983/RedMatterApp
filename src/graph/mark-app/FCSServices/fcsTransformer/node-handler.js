// "use strict";
import Scale from "./scale";

let fcsModel = require("./fcsModel");
const fcsHelper = require("./fcsHelper");
const generalHelper = require("./generalHelper");

export const parseAndUpload = (event, fcs, fileId, experimentId, upload) => {
  let {
    channelsEvents,
    paramsAnalysis,
    channels,
    scale,
    paramNamesHasSpillover,
  } = parse(fcs);

  // 1. Turn data into the expected file format
  const fileData = getFileInExpectedFormat(channelsEvents);

  let fileName = "";
  try {
    fileName = event.Records[0].s3.object.key;
  } catch (e) {
    console.log("[ERROR] Error finding filename");
  }

  channels = channels.map((c) => {
    let paramAnalysis;
    for (const val of Object.values(paramsAnalysis)) {
      if (val.paramName === c.value) {
        paramAnalysis = val;
        break;
      }
    }
    delete c.key;
    return {
      ...c,
      ...paramAnalysis,
    };
  });

  const metadata = {
    name: experimentId,
    fileId: "",
    //bucket: JSON_S3_BUCKET,
    filepath: experimentId + "/" + fileId,
    channels: channels,
    jsonEventCount: fileData.length,
    events: fileData,
    scale: scale,
    paramNamesHasSpillover: paramNamesHasSpillover,
  };

  // 3. Save metadata of file to dynamo with link to S3 file
  //promises.push(saveFileMetadataToDynamo(metadata));

  return metadata;
  // } catch (err) {
  //   console.log("[ERROR]", err);
  // }
};

const getFileInExpectedFormat = (channelsEvents) => {
  let treatedData = [];
  for (let i = 0; i < channelsEvents[0].length; i++) {
    let row = [];
    for (let j = 0; j < channelsEvents.length; j++) {
      row.push(channelsEvents[j][i]);
    }
    treatedData.push(row);
  }
  return treatedData;
};

const parse = (fcs) => {
  let indexOfSpilloverParamX;
  let channelsEvents = [];
  let scaledX;
  let eventData;

  let channels = fcs.getParamsAndScales();
  let channelNames = channels.map((e) => e.value);

  // set the maximum values for each event param
  fcs.setMaxes();

  const scale = new Scale(fcs);
  const dataAsNumbers = fcs.dataAsNumbers;

  const paramNamesHasSpillover = fcs.getParamNameHasSpillover({
    dataAsNumbers: dataAsNumbers,
    scale: scale,
  });

  const channelMaximums = fcsHelper.getMaxesFromFile(fcs);

  let paramsAnalysis = {};
  for (let paramIndex = 0; paramIndex < dataAsNumbers[0].length; paramIndex++) {
    // debugger;
    indexOfSpilloverParamX = scale.getMatrixSpilloverIndex({
      paramName: paramNamesHasSpillover[paramIndex].paramName,
      paramIndex: paramIndex,
    });

    let channelEvents = [];

    let event;

    let minimum = 0;
    let maximum = channelMaximums[paramIndex];
    for (
      let event = 0;
      // Math.round(event) < 7;
      event < dataAsNumbers.length;
      event = event + 1
    ) {
      eventData = Math.round(dataAsNumbers[event][paramIndex]);

      // console.log(
      //   ">>>dataAsNumbers[event] is ",
      //   dataAsNumbers[event]
      // );

      scaledX = scale.scaleValue({
        value: eventData,
        paramIndex: paramIndex,
        paramName: paramNamesHasSpillover[paramIndex].paramName,
        scaleType: channels[paramIndex].display,
        hasSpilloverForParam: paramNamesHasSpillover[paramIndex].hasSpillover,
        arrayOfOneEvent: dataAsNumbers[event],
        matrixSpilloverIndex: indexOfSpilloverParamX,
        channelMaximums: channelMaximums,
      });
      //
      scaledX = Math.round(scaledX);

      channelEvents.push(scaledX);

      if (scaledX < minimum) {
        minimum = scaledX;
      }

      channelsEvents[paramIndex] = channelEvents;
    }

    paramsAnalysis[paramIndex] = {
      minimum: minimum,
      maximum: Math.round(maximum),
      paramName: channelNames[paramIndex],
    };
  }

  return {
    channelsEvents,
    paramsAnalysis,
    channels,
    scale,
    paramNamesHasSpillover,
  };
};

// const getParamsAnalysis = (fcs, scale, channelNames) => {
//   let paramsAnalysis = {};
//   const channelMaximums = fcsHelper.getMaxesFromFile(fcs);

//   for (
//     let paramIndex = 0;
//     paramIndex < fcs.dataAsNumbers[0].length;
//     paramIndex++
//   ) {
//     let linearLimitsSet = false;
//     let biexponentialLimitsSet = false;
//     let minimum = 0;
//     let maximum = 0;
//     let minimum = 0;
//     let maximum = 0;
//     let linearLimits = scale.getRangeFromPnD(paramIndex, "lin");

//     //console.log("linearLimits is ", linearLimits);

//     if (linearLimits) {
//       linearLimitsSet = true;

//       minimum = linearLimits.min;
//       maximum = linearLimits.max;
//     }

//     let biexponentialLimits = scale.getRangeFromPnD(paramIndex, "bi");

//     //console.log(">>>>>>>>>>> PnD biexponentialLimits is ", biexponentialLimits);

//     if (biexponentialLimits) {
//       biexponentialLimitsSet = true;

//       minimum = biexponentialLimits.min;
//       maximum = biexponentialLimits.max;
//     } else {
//       biexponentialLimits = scale.getRangeFromPnE(paramIndex);

//       if (biexponentialLimits) {
//         minimum = biexponentialLimits.min;
//         maximum = biexponentialLimits.max;
//       }
//     }

//     //console.log(">>>>>>>>>>> PnE biexponentialLimits is ", biexponentialLimits);

//     if (!biexponentialLimitsSet || !linearLimitsSet) {
//       var params = generalHelper.removeNulls(fcs.get$PnX("N"));

//       var hasSpilloverForParam = scale.hasSpilloverForParam({
//         paramName: params[paramIndex],
//         paramIndex: paramIndex,
//       });

//       var indexOfSpilloverParam = scale.getIndexOfSpilloverParam({
//         paramName: params[paramIndex],
//         params: paramIndex,
//       });

//       let negatives = [];
//       let max = 0;
//       var paramMax = fcsHelper.getParamMax(fcs, paramIndex);
//       var g = scale.g[paramIndex];
//       var r = scale.r[paramIndex];
//       var f1 = scale.getEF1({
//         param: paramIndex,
//       });
//       var f2 = scale.getEF2({
//         param: paramIndex,
//       });

//       var hasSpilloverForParam = scale.hasSpilloverForParam({
//         paramName: params[paramIndex],
//         paramIndex: paramIndex,
//       });

//       var indexOfSpilloverParam = scale.getIndexOfSpilloverParam({
//         paramName: params[paramIndex],
//         paramIndex: paramIndex,
//       });

//       let eventData;
//       let scaledLin;
//       let scaledBi;
//       for (let event = 0; event < fcs.dataAsNumbers.length; event++) {
//         eventData = fcs.dataAsNumbers[event][paramIndex];

//         // Figure out min max
//         if (eventData > -paramMax && eventData <= paramMax) {
//           scaledLin = scale.scaleValueAccordingToFile({
//             value: eventData,
//             paramIndex: paramIndex,
//             scaleType: "lin",
//             g: g,
//             f1: f1,
//             f2: f2,
//             channelMaximum: channelMaximums[paramIndex],
//           });

//           scaledBi = scale.scaleValueAccordingToFile({
//             value: eventData,
//             paramIndex: paramIndex,
//             scaleType: "bi",
//             r: r,
//             f1: f1,
//             f2: f2,
//             channelMaximum: channelMaximums[paramIndex],
//           });

//           if (hasSpilloverForParam) {
//             scaledLin = scale.adjustSpillover({
//               param: paramIndex,
//               paramName: params[paramIndex],
//               values: fcs.dataAsNumbers[event],
//               scaleType: "lin",
//               indexOfSpilloverParam: indexOfSpilloverParam,
//               channelMaximums: channelMaximums,
//             });

//             scaledBi = scale.adjustSpillover({
//               param: paramIndex,
//               paramName: params[paramIndex],
//               values: fcs.dataAsNumbers[event],
//               scaleType: "bi",
//               indexOfSpilloverParam: indexOfSpilloverParam,
//               channelMaximums: channelMaximums,
//             });
//           }

//           if (!linearLimitsSet) {
//             if (scaledLin < minimum) {
//               minimum = scaledLin;
//             }
//           }

//           if (!biexponentialLimitsSet) {
//             if (scaledBi < minimum) {
//               minimum = scaledBi;
//             }
//           }
//         }
//       }

//       // if still no max, get recommnded from file header and scale

//       if (maximum == 0) {
//         max = fcsHelper.getMaxForParam({
//           fcs: fcs,
//           paramIndex: paramIndex,
//         });

//         scaledBi = scale.scaleValueAccordingToFile({
//           value: max,
//           paramIndex: paramIndex,
//           scaleType: "bi",
//           r: r,
//           f1: f1,
//           f2: f2,
//         });

//         maximum = scaledBi;
//       }

//       if (maximum == 0) {
//         scaledLin = scale.scaleValueAccordingToFile({
//           value: channelMaximums[paramIndex],
//           paramIndex: paramIndex,
//           scaleType: "lin",
//           g: g,
//           f1: f1,
//           f2: f2,
//         });

//         maximum = scaledLin;
//       }
//     }

//     paramsAnalysis[paramIndex] = {
//       minimum: minimum,
//       maximum: maximum,
//       minimum: minimum,
//       maximum: maximum,
//       paramName: channelNames[paramIndex],
//     };
//   }

//   return paramsAnalysis;
// };
