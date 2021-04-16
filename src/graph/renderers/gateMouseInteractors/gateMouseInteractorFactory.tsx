import GatePlotterPlugin from "../plotters/runtimePlugins/gatePlotterPlugin";
import OvalMousePlotterPlugin from "../plotters/runtimePlugins/scatterOvalGatePlotter";
// import PolygonMousePlotterPlugin from "../plotters/runtimePlugins/scatterPolygonGatePlotter";
import GateMouseInteractor from "./gateMouseInteractor";
import OvalMouseInteractor from "./ovalMouseInteractor";
// import HistogramGateMouseInteractor from "./histogramGateMouseInteractor";
import PolygonMouseInteractor from "./polygonMouseInteractor";

export default class GateMouseInteractorFactory {
  makeGateMouseInteractor(
    gate: string
  ): {
    mouseInteractor: GateMouseInteractor;
    plotterPlugin: GatePlotterPlugin;
  } {
    if (gate === "oval") {
      return this.makeOvalGateMouseInteractor();
    }
    // if (gate === "line") {
    //   return this.makeHistogramGateMouseInteractor();
    // }
    // if (gate === "polygon") {
    //   return this.makePolygonGateMouseInteractor();
    // }
    throw Error("Unrecognized type of gate mouse interactor: " + gate);
  }

  makeOvalGateMouseInteractor(): {
    mouseInteractor: GateMouseInteractor;
    plotterPlugin: GatePlotterPlugin;
  } {
    return {
      mouseInteractor: new OvalMouseInteractor(),
      plotterPlugin: new OvalMousePlotterPlugin(),
    };
  }

  // makeHistogramGateMouseInteractor(): HistogramGateMouseInteractor {
  //   return new HistogramGateMouseInteractor();
  // }

  // makePolygonGateMouseInteractor(): {
  //   mouseInteractor: GateMouseInteractor;
  //   plotterPlugin: GatePlotterPlugin;
  // } {
  //   return {
  //     mouseInteractor: new PolygonMouseInteractor(),
  //     plotterPlugin: new PolygonMousePlotterPlugin(),
  //   };
  // }
}
