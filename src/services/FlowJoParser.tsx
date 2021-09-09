// // import dataManager from "../graph/dataManagement/dataManager";
// // import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
// // import PolygonGate, {
// //   PolygonGateState,
// // } from "graph/dataManagement/gate/polygonGate";
// // import { generateColor } from "graph/utils/color";
// // import PlotData from "graph/dataManagement/plotData";
// // import { snackbarService } from "uno-material-ui";

// const getFileOrSkipThisSample = (filesUsed: any, channelsInfo: any) => {
//   let files = dataManager.downloaded;
//   let channels = channelsInfo.map((x: any) => {
//     return `${x.channelName} - ${x.channelName}`;
//   });
//   let fileCanbeUsed = true;
//   let fileId = "";
//   let repeatFileUse = false;
//   for (let i = 0; i < files.length; i++) {
//     let file = files[i];
//     let axes = file.channels.map((x: any) => {
//       let value = x.value;
//       if (x.display == "bi") {
//         value = value.replace("Comp-", "");
//         return value;
//       }
//       return value;
//     });
//     for (let j = 0; j < axes.length; j++) {
//       if (!channels.includes(axes[j])) {
//         fileCanbeUsed = false;
//         break;
//       }
//     }
//     if (fileCanbeUsed) {
//       if (filesUsed.includes(file.id)) {
//         if (!repeatFileUse) {
//           repeatFileUse = true;
//           fileId = file.id;
//         }
//       } else {
//         fileId = file.id;
//         break;
//       }
//     }
//   }

//   return { fileId: fileId ? fileId : null };
// };

// const ParseFlowJoJson = async (flowJoJson: any) => {
//   let plots: any = [];
//   let workspace = flowJoJson["Workspace"];
//   let filesUsed: any = [];
//   if (
//     workspace &&
//     workspace["SampleList"] &&
//     workspace["SampleList"]["Sample"]
//   ) {
//     let sample = workspace["SampleList"]["Sample"];
//     let samples = [];
//     if (sample.length == undefined) samples.push(sample);
//     else samples = sample;
//     for (let i = 0; i < samples.length; i++) {
//       let sampleNode = samples[i]["SampleNode"];
//       let plot = new PlotData();
//       let sampleUri = samples[i]["DataSet"]["_attributes"]["uri"];
//       let sampleUrlArray = sampleUri.split("/");
//       let sampleName = sampleUri[sampleUrlArray.length - 1];
//       sampleName = sampleName.replace("%20", "");
//       let transformations = samples[i]["Transformations"];
//       let channelsInfo: any = [];
//       if (transformations) {
//         let logTransformations = transformations["transforms:log"];
//         if (logTransformations && logTransformations.length == undefined)
//           logTransformations = [logTransformations];
//         let linearTransformations = transformations["transforms:linear"];
//         if (linearTransformations && linearTransformations.length == undefined)
//           linearTransformations = [linearTransformations];
//         if (logTransformations && logTransformations.length > 0) {
//           channelsInfo = channelsInfo.concat(
//             parseChannels(logTransformations, "bi")
//           );
//         }
//         if (linearTransformations && linearTransformations.length > 0) {
//           channelsInfo = channelsInfo.concat(
//             parseChannels(linearTransformations, "lin")
//           );
//         }
//       }
//       let fileObj = getFileOrSkipThisSample(filesUsed, channelsInfo);
//       let fileId = fileObj.fileId;
//       if (fileId) {
//         filesUsed.push(fileId);
//         let mainGraphAxis = sampleNode["Graph"]["Axis"];
//         let xAxis = mainGraphAxis.find(
//           (x: any) => x["_attributes"].dimension == "x"
//         );
//         let yAxis = mainGraphAxis.find(
//           (x: any) => x["_attributes"].dimension == "y"
//         );
//         let xAxisName = xAxis["_attributes"].name;
//         let yAxisName = yAxis["_attributes"].name;
//         plot.xAxis = `${xAxisName} - ${xAxisName}`;
//         plot.yAxis = `${yAxisName} - ${yAxisName}`;
//         let xChannelInfo = channelsInfo.find(
//           (x: any) => x.channelName == xAxisName
//         );
//         let yChannelInfo = channelsInfo.find(
//           (x: any) => x.channelName == yAxisName
//         );
//         plot.setXAxisPlotType(xChannelInfo.type);
//         plot.setYAxisPlotType(yChannelInfo.type);
//         addNewPlot(plots, plot, fileId);

//         if (
//           sampleNode["Subpopulations"] &&
//           Object.keys(sampleNode["Subpopulations"]).length > 0
//         ) {
//           parseSubpopulation(
//             plots,
//             plot,
//             fileId,
//             sampleNode["Subpopulations"],
//             channelsInfo
//           );
//         }
//       } else {
//         snackbarService.showSnackbar(
//           "Clouldn't find matching file for flow jo sample " + sampleName,
//           "warning"
//         );
//       }
//     }
//   }
//   for (let i = 0; i < plots.length; i++) {
//     dataManager.addNewPlotToWorkspace(plots[i], false);
//   }
// };

// const parseChannels = (transformations: any, type: string) => {
//   let channelArray = [];
//   for (let i = 0; i < transformations.length; i++) {
//     let transformationAttributes = transformations[i]["_attributes"];

//     let rangeMin;
//     let rangeMax;
//     if (type == "bi") {
//       rangeMin = "0";
//       rangeMax = Math.pow(
//         10,
//         parseFloat(transformationAttributes["transforms:decades"])
//       ).toString();
//     } else {
//       rangeMin = transformationAttributes["transforms:minRange"];
//       rangeMax = transformationAttributes["transforms:maxRange"];
//     }
//     let channelName =
//       transformations[i]["data-type:parameter"]["_attributes"][
//         "data-type:name"
//       ];
//     channelArray.push({
//       channelName: channelName,
//       rangeMin: rangeMin,
//       rangeMax: rangeMax,
//       type: type,
//     });
//   }
//   return channelArray;
// };

// const addNewPlot = (plots: any, plot: PlotData, fileID: string) => {
//   plot.file = dataManager.getFile(fileID);
//   plot.setupPlot(false);
//   plots.push(plot);
// };

// const parseSubpopulation = (
//   plots: any,
//   plot: PlotData,
//   fileId: string,
//   subPopulation: any,
//   channelsInfo: any
// ) => {
//   let populations = subPopulation["Population"];
//   if (populations) {
//     if (populations.length == undefined) {
//       populations = [populations];
//     }

//     for (let i = 0; i < populations.length; i++) {
//       let newPlot = new PlotData();
//       let population = populations[i];
//       let graph = population["Graph"];
//       let axis = graph["Axis"];
//       let xAxis = axis.find((x: any) => x["_attributes"].dimension == "x");
//       let yAxis = axis.find((x: any) => x["_attributes"].dimension == "y");
//       let xAxisName = xAxis["_attributes"].name;
//       let yAxisName = yAxis["_attributes"].name;
//       newPlot.xAxis = `${xAxisName} - ${xAxisName}`;
//       newPlot.yAxis = `${yAxisName} - ${yAxisName}`;
//       let xChannelInfo = channelsInfo.find(
//         (x: any) => x.channelName == xAxisName
//       );
//       let yChannelInfo = channelsInfo.find(
//         (x: any) => x.channelName == yAxisName
//       );
//       newPlot.setXAxisPlotType(xChannelInfo.type);
//       newPlot.setYAxisPlotType(yChannelInfo.type);

//       if (population["Gate"]) {
//         let gateAssign: PolygonGateState = {
//           name: population["_attributes"].name,
//           xAxis: `${xAxisName} - ${xAxisName}`,
//           yAxis: `${yAxisName} - ${yAxisName}`,
//           color: generateColor(),
//           xAxisType: xChannelInfo.type,
//           yAxisType: yChannelInfo.type,
//           parents: [],
//           points: [],
//           xAxisOriginalRanges: [xChannelInfo.rangeMin, xChannelInfo.rangeMax],
//           yAxisOriginalRanges: [yChannelInfo.rangeMin, yChannelInfo.rangeMax],
//         };
//         let polygonGate = new PolygonGate(gateAssign);
//         let gate = population["Gate"];
//         let gateType = Object.keys(gate).filter((x) => x != "_attributes")[0];
//         parseGateType(gateType, gate, polygonGate, xChannelInfo, yChannelInfo);
//         newPlot.population.push({ gate: polygonGate, inverseGating: false });
//         plot.gates.push({
//           gate: polygonGate,
//           inverseGating: false,
//           displayOnlyPointsInGate: false,
//         });
//         dataManager.addNewGateToWorkspace(polygonGate);
//         addNewPlot(plots, newPlot, fileId);
//         if (population["Subpopulations"]) {
//           parseSubpopulation(
//             plots,
//             newPlot,
//             fileId,
//             population["Subpopulations"],
//             channelsInfo
//           );
//         }
//       }
//     }
//   }
// };

// const getRangeMinMaxIfPropertyNotThere = (
//   attributes: any,
//   property: string,
//   returnValueIfPropertyNotFound: string
// ) => {
//   if (property in attributes) {
//     return attributes[property];
//   }

//   return returnValueIfPropertyNotFound;
// };

// const parseGateType = (
//   gateType: string,
//   gate: any,
//   polygonGate: PolygonGate,
//   xChannelInfo: any,
//   yChannelInfo: any
// ) => {
//   let gateDimensions: any;
//   let xAxisDimension: any;
//   let yAxisDimension: any;
//   switch (gateType) {
//     case COMMON_CONSTANTS.FLOW_JO.GATE_TYPE.RECTANGLE:
//       let gateRectangle = gate[gateType];
//       gateDimensions = gateRectangle["gating:dimension"];

//       xAxisDimension = gateDimensions[0];
//       yAxisDimension = gateDimensions[1];
//       let xMax = getRangeMinMaxIfPropertyNotThere(
//         xAxisDimension["_attributes"],
//         "gating:max",
//         xChannelInfo.rangeMax
//       );
//       let xMin = getRangeMinMaxIfPropertyNotThere(
//         xAxisDimension["_attributes"],
//         "gating:min",
//         "0"
//       );
//       let yMax = getRangeMinMaxIfPropertyNotThere(
//         yAxisDimension["_attributes"],
//         "gating:max",
//         yChannelInfo.rangeMax
//       );
//       let yMin = getRangeMinMaxIfPropertyNotThere(
//         yAxisDimension["_attributes"],
//         "gating:min",
//         "0"
//       );

//       polygonGate.points.push({ x: xMin, y: yMin });
//       polygonGate.points.push({ x: xMax, y: yMin });
//       polygonGate.points.push({ x: xMax, y: yMax });
//       polygonGate.points.push({ x: xMin, y: yMax });

//       break;
//     case COMMON_CONSTANTS.FLOW_JO.GATE_TYPE.ECLIPSE:
//       break;
//     case COMMON_CONSTANTS.FLOW_JO.GATE_TYPE.POLYGON:
//       let gatePolygon = gate[gateType];

//       gateDimensions = gatePolygon["gating:dimension"];

//       let xAxisDimensionIndex = 0;
//       let yAxisDimensionIndex = 1;

//       xAxisDimension = gateDimensions[xAxisDimensionIndex];
//       yAxisDimension = gateDimensions[yAxisDimensionIndex];
//       let gateVertexs = gatePolygon["gating:vertex"];

//       for (let i = 0; i < gateVertexs.length; i++) {
//         let gateVertice = gateVertexs[i];
//         let x =
//           gateVertice["gating:coordinate"][xAxisDimensionIndex]["_attributes"][
//             "data-type:value"
//           ];
//         let y =
//           gateVertice["gating:coordinate"][yAxisDimensionIndex]["_attributes"][
//             "data-type:value"
//           ];
//         polygonGate.points.push({ x: x, y: y });
//       }

//       break;
//   }
// };

// export { ParseFlowJoJson };

export {};
