import PlotData from "../plotData";
import PolygonGate from "./polygonGate";

export default class AutoCornerGater {
  // addCornerGate(plotData: PlotData) {
  //   let alreadyHasCornerGate = false;
  //   plotData.gates.forEach((e: any) => {
  //     if (e.gate.name === "corner-auto-gate") alreadyHasCornerGate = true;
  //   });
  //   if (alreadyHasCornerGate) {
  //     return;
  //   }
  //   const axesList = plotData.file.axes;
  //   for (let i = 0; i < axesList.length; i++) {
  //     for (let j = i + 1; j < axesList.length; j++) {}
  //   }
  // }
  // removeCornerGates(plotData: PlotData) {
  //   let alreadyHasCornerGate = false;
  //   plotData.gates.forEach((e: any) => {
  //     if (e.gate.name === "corner-auto-gate") alreadyHasCornerGate = true;
  //   });
  //   if (!alreadyHasCornerGate) {
  //     return;
  //   }
  // }
  // private createCornerGate(
  //   plotData: PlotData,
  //   xAxis: string,
  //   yAxis: string
  // ): PolygonGate {
  //   const cornerGates = new PolygonGate({
  //     points: [],
  //     color: null,
  //     xAxis: xAxis,
  //     yAxis: yAxis,
  //     name: "corner-auto-gate",
  //     parent: null,
  //   });
  // }
}
