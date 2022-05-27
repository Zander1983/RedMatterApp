import fcsModel from "../fcsTransformer/fcsModel";
import Scale from "../fcsTransformer/scale";
import fcsHelper from "../fcsTransformer/fcsHelper";
import generalHelper from "../fcsTransformer/generalHelper";
import fcs from "../fcs/fcs";
import { min } from "mathjs";

const logicleTransformer = (event) => {
  var negatives = [];
  var max = 0;
  // scaled and compensated
  var scaledMaxLin = 0;
  var scaledMaxBi = 0;
  var scaledMinLin = 0;
  var scaledMinBi = 0;
  var scaledLin;
  var scaledBi;
  let eventData;
  let indexOfSpilloverParamX;
  let channelsEvents = [];
  let scaledX;
  let fcsPercentile = [];

  // let fcs = fcsModel.getFcsFromDataBuf(-1, data.Body);
  // GET FCS FILE ON CUSTOM FORMAT

  let channels = fcs.getParamsAndScales();

  // set the maximum values for each event param
  fcs.setMaxes();

  const scale = new Scale(fcs);
  const dataAsNumbers = fcs.dataAsNumbers;
  const paramNamesHasSpillover = fcs.getParamNameHasSpillover({
    dataAsNumbers: dataAsNumbers,
    scale: scale,
  });

  const channelMaximums = fcsHelper.getMaxesFromFile(fcs);

  var increment = fcsHelper.getLengthIncrement({
    length: dataAsNumbers.length,
  });

  let paramsAnalysis = getParamsAnalysis(
    fcs,
    scale,
    channels.map((e) => e.value),
    increment
  );

  for (let paramIndex = 0; paramIndex < dataAsNumbers[0].length; paramIndex++) {
    let channelEvents = [];

    let biexponentialAxisLimits = {
      minimum: paramsAnalysis[paramIndex].minimum,
      maximum: paramsAnalysis[paramIndex].maximum,
    };

    const logicle = fcsHelper.getLogicle(biexponentialAxisLimits);
    let roundedEvent;

    for (
      let event = 0;
      Math.round(event) < dataAsNumbers.length;
      event = event + increment
    ) {
      roundedEvent = Math.round(event);
      eventData = dataAsNumbers[roundedEvent][paramIndex];

      indexOfSpilloverParamX = scale.getIndexOfSpilloverParam({
        paramName: paramNamesHasSpillover[paramIndex].paramName,
        paramIndex: paramIndex,
      });

      scaledX = scale.scaleValue({
        value: eventData,
        paramIndex: paramIndex,
        paramName: paramNamesHasSpillover[paramIndex].paramName,
        scaleType: channels[paramIndex].display,
        hasSpilloverForParam: paramNamesHasSpillover[paramIndex].hasSpillover,
        arrayOfOneEvent: dataAsNumbers[roundedEvent],
        logicle: logicle,
        indexOfSpilloverParam: indexOfSpilloverParamX,
        channelMaximums: channelMaximums,
      });

      channelEvents.push(scaledX);

      channelsEvents[paramIndex] = channelEvents;
    }
  }
};

const getParamsAnalysis = (fcs, scale, channelNames) => {
  let paramsAnalysis = {};
  const channelMaximums = fcsHelper.getMaxesFromFile(fcs);

  for (
    let paramIndex = 0;
    paramIndex < fcs.dataAsNumbers[0].length;
    paramIndex++
  ) {
    let linearLimitsSet = false;
    let biexponentialLimitsSet = false;
    let minimum = 0;
    let maximum = 0;
    let minimum = 0;
    let maximum = 0;
    let linearLimits = scale.getRangeFromPnD(paramIndex, "lin");

    if (linearLimits) {
      linearLimitsSet = true;

      minimum = linearLimits.min;
      maximum = linearLimits.max;
    }

    let biexponentialLimits = scale.getRangeFromPnD(paramIndex, "bi");

    if (biexponentialLimits) {
      biexponentialLimitsSet = true;

      minimum = biexponentialLimits.min;
      maximum = biexponentialLimits.max;
    } else {
      biexponentialLimits = scale.getRangeFromPnE(paramIndex);

      if (biexponentialLimits) {
        minimum = biexponentialLimits.min;
        maximum = biexponentialLimits.max;
      }
    }

    if (!biexponentialLimitsSet || !linearLimitsSet) {
      var params = generalHelper.removeNulls(fcs.get$PnX("N"));

      var hasSpilloverForParam = scale.hasSpilloverForParam({
        paramName: params[paramIndex],
        paramIndex: paramIndex,
      });

      var indexOfSpilloverParam = scale.getIndexOfSpilloverParam({
        paramName: params[paramIndex],
        params: paramIndex,
      });

      let negatives = [];
      let max = 0;
      var paramMax = fcsHelper.getParamMax(fcs, paramIndex);
      var g = scale.g[paramIndex];
      var r = scale.r[paramIndex];
      var f1 = scale.getEF1({
        param: paramIndex,
      });
      var f2 = scale.getEF2({
        param: paramIndex,
      });

      var hasSpilloverForParam = scale.hasSpilloverForParam({
        paramName: params[paramIndex],
        paramIndex: paramIndex,
      });

      var indexOfSpilloverParam = scale.getIndexOfSpilloverParam({
        paramName: params[paramIndex],
        paramIndex: paramIndex,
      });

      let eventData;
      let scaledLin;
      let scaledBi;
      for (let event = 0; event < fcs.dataAsNumbers.length; event++) {
        eventData = fcs.dataAsNumbers[event][paramIndex];

        //*********************************** Figure out min max *****************************/
        if (eventData > -paramMax && eventData <= paramMax) {
          scaledLin = scale.scaleValueAccordingToFile({
            value: eventData,
            paramIndex: paramIndex,
            scaleType: "lin",
            g: g,
            f1: f1,
            f2: f2,
            channelMaximum: channelMaximums[paramIndex],
          });

          scaledBi = scale.scaleValueAccordingToFile({
            value: eventData,
            paramIndex: paramIndex,
            scaleType: "bi",
            r: r,
            f1: f1,
            f2: f2,
            channelMaximum: channelMaximums[paramIndex],
          });

          if (hasSpilloverForParam) {
            scaledLin = scale.adjustSpillover({
              param: paramIndex,
              paramName: params[paramIndex],
              values: fcs.dataAsNumbers[event],
              scaleType: "lin",
              indexOfSpilloverParam: indexOfSpilloverParam,
              channelMaximums: channelMaximums,
            });

            scaledBi = scale.adjustSpillover({
              param: paramIndex,
              paramName: params[paramIndex],
              values: fcs.dataAsNumbers[event],
              scaleType: "bi",
              indexOfSpilloverParam: indexOfSpilloverParam,
              channelMaximums: channelMaximums,
            });
          }

          if (!linearLimitsSet) {
            if (scaledLin < minimum) {
              minimum = scaledLin;
            }
          }

          if (!biexponentialLimitsSet) {
            if (scaledBi < minimum) {
              minimum = scaledBi;
            }
          }
        }
      }

      // if still no max, get recommnded from file header and scale

      if (maximum == 0) {
        max = fcsHelper.getMaxForParam({
          fcs: fcs,
          paramIndex: paramIndex,
        });

        scaledBi = scale.scaleValueAccordingToFile({
          value: max,
          paramIndex: paramIndex,
          scaleType: "bi",
          r: r,
          f1: f1,
          f2: f2,
        });

        maximum = scaledBi;
      }

      if (maximum == 0) {
        scaledLin = scale.scaleValueAccordingToFile({
          value: channelMaximums[paramIndex],
          paramIndex: paramIndex,
          scaleType: "lin",
          g: g,
          f1: f1,
          f2: f2,
        });

        maximum = scaledLin;
      }
    }

    paramsAnalysis[paramIndex] = {
      minimum: minimum,
      maximum: maximum,
      minimum: minimum,
      maximum: maximum,
      paramName: channelNames[paramIndex],
    };

    //*********************************** end of Figure out min max *****************************/
  }

  return paramsAnalysis;
};

export default logicleTransformer;
