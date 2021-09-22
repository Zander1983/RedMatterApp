import { GraphPlotterState } from "graph/renderers/plotters/graphPlotter";
import ScatterDrawer from "graph/renderers/drawers/scatterDrawer";
// import ScatterOvalGatePlotter from "./runtimePlugins/scatterOvalGatePlotter";
import ScatterPolygonGatePlotter from "./runtimePlugins/scatterPolygonGatePlotter";
import PluginGraphPlotter, { applyPlugin } from "./PluginGraphPlotter";
import FCSServices from "services/FCSServices/FCSServices";
import { OvalGate, PolygonGate } from "graph/resources/types";
import * as PlotResource from "graph/resources/plots";

interface ScatterPlotterState extends GraphPlotterState {}

/*
  How to use plotters?
   1. Instance the plotter (no args)
   2. Set plotter state with setPlotterState(state)
   3. Call setup(canvasContext)

  You are now ready to go!
  
  Call draw() when you need to draw to the canvas
  
  If you ever need to update the plotter
   1. Call setPlotterState(state)
   2. Call update()
*/
export default class ScatterPlotter extends PluginGraphPlotter {
  gates: (OvalGate | PolygonGate)[] = [];
  drawer: ScatterDrawer | null = null;
  plugins: Map<
    string,
    {
      origin: string;
      order: string;
      overwrite: boolean;
      functionSignature: string;
    }[]
  > = new Map();

  // Gate plotters
  // ovalGatePlugin: ScatterOvalGatePlotter | null = null;
  polygonGatePlugin: ScatterPolygonGatePlotter | null = null;

  static instaceIndex = 0;
  instance: number;

  /* This will also create and add to itself all gate plugins it supports, so
     it's never duplicated. Needless to say this is a bad idea and should be
     addressed in the future. */
  public setup(canvasContext: any) {
    this.instance = ScatterPlotter.instaceIndex++;
    super.setup(canvasContext);

    // this.ovalGatePlugin = new ScatterOvalGatePlotter();
    // this.addPlugin(this.ovalGatePlugin);

    this.polygonGatePlugin = new ScatterPolygonGatePlotter();
    this.addPlugin(this.polygonGatePlugin);
  }

  public update() {
    super.update();
    // this.ovalGatePlugin.setGates(
    //   //@ts-ignore
    //   this.gates.filter((e) => e.gateType === "oval")
    // );
    this.polygonGatePlugin.setGates(
      //@ts-ignore
      this.gates.filter((e) => e.gateType === "polygon")
    );
  }

  public setPlotterState(state: ScatterPlotterState) {
    super.setPlotterState(state);
  }

  public getPlotterState(): ScatterPlotterState {
    return {
      ...super.getPlotterState(),
    };
  }

  public addGate(gate: OvalGate | PolygonGate) {
    if (gate.gateType === "oval") {
      // this.ovalGatePlugin.gates.push(gate);
    } else if (gate.gateType === "polygon") {
      this.polygonGatePlugin.gates.push(gate);
    }
  }

  public removeGate(gate: OvalGate | PolygonGate) {
    if (gate.gateType === "oval") {
      // this.ovalGatePlugin.gates = this.ovalGatePlugin.gates.filter(
      //   (e) => e.id !== gate.id
      // );
    } else if (gate.gateType === "polygon") {
      this.polygonGatePlugin.gates = this.polygonGatePlugin.gates.filter(
        (e) => e.id !== gate.id
      );
    }
  }

  public setDrawerState(): void {
    super.setDrawerState();
  }

  public createDrawer(): void {
    this.drawer = new ScatterDrawer();
  }

  public updateDrawer(): void {
    this.drawer.update();
  }

  public validateDraw(): void {
    if (this.xAxis.length !== this.yAxis.length) {
      throw Error(
        "Axes point count are different. xAxis has " +
          this.xAxis.length.toString() +
          " points while yAxis has " +
          this.yAxis.length.toString() +
          " points"
      );
    }
  }

  @applyPlugin()
  public draw() {
    super.draw({
      xAxisLabel: this.plot.xAxis,
      yAxisLabel: this.plot.yAxis,
    });
    this.validateDraw();

    this.drawPoints();
  }

  public drawPoints() {
    const { points, colors } = PlotResource.getXandYDataAndColors(this.plot);
    let xData = points[0];
    let yData = points[1];
    const pointCount = xData.length;

    const fcsServices = new FCSServices();
    let customRanges: [[number, number], [number, number]] = [
      this.ranges.x,
      this.ranges.y,
    ];

    if (this.plot.xPlotType === "bi") {
      const calc = fcsServices.logicleMarkTransformer(
        customRanges[0],
        customRanges[0][0],
        customRanges[0][1]
      );
      customRanges[0] = [calc[0], calc[1]];
      xData = fcsServices.logicleMarkTransformer(
        xData,
        this.ranges.x[0],
        this.ranges.x[1]
      );
    }
    if (this.plot.yPlotType === "bi") {
      const calc = fcsServices.logicleMarkTransformer(
        customRanges[1],
        customRanges[1][0],
        customRanges[1][1]
      );
      customRanges[1] = [calc[0], calc[1]];
      yData = fcsServices.logicleMarkTransformer(
        yData,
        this.ranges.y[0],
        this.ranges.y[1]
      );
    }

    for (let i = 0; i < pointCount; i++) {
      if (this.isOutOfRange({ x: xData[i], y: yData[i] }, customRanges))
        continue;
      const { x, y } = this.transformer.toConcretePoint(
        {
          x: xData[i],
          y: yData[i],
        },
        customRanges
      );
      this.drawer.addPoint(x, y, 3, colors.getI(i));
    }
  }

  private isOutOfRange(
    p: { x: number; y: number },
    ranges: [[number, number], [number, number]]
  ) {
    let x: [number, number], y: [number, number];
    x = ranges[0];
    y = ranges[1];
    return p.x < x[0] || p.x > x[1] || p.y < y[0] || p.y > y[1];
  }

  public getPointColors() {
    return PlotResource.getPointColors(this.plot);
  }
}
