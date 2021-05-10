import { GraphPlotterState } from "graph/renderers/plotters/graphPlotter";
import ScatterDrawer from "graph/renderers/drawers/scatterDrawer";
import OvalGate from "graph/dataManagement/gate/ovalGate";
import PolygonGate from "graph/dataManagement/gate/polygonGate";
import ScatterOvalGatePlotter from "./runtimePlugins/scatterOvalGatePlotter";
import ScatterPolygonGatePlotter from "./runtimePlugins/scatterPolygonGatePlotter";
import PluginGraphPlotter, { applyPlugin } from "./PluginGraphPlotter";

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
  ovalGatePlugin: ScatterOvalGatePlotter | null = null;
  polygonGatePlugin: ScatterPolygonGatePlotter | null = null;

  static instaceIndex = 0;
  instance: number;

  /* This will also create and add to itself all gate plugins it supports, so
     it's never duplicated. Needless to say this is a bad idea and should be
     addressed in the future. */
  public setup(canvasContext: any) {
    this.instance = ScatterPlotter.instaceIndex++;
    super.setup(canvasContext);

    this.ovalGatePlugin = new ScatterOvalGatePlotter();
    this.addPlugin(this.ovalGatePlugin);

    this.polygonGatePlugin = new ScatterPolygonGatePlotter();
    this.addPlugin(this.polygonGatePlugin);
  }

  public update() {
    super.update();
    this.ovalGatePlugin.setGates(
      //@ts-ignore
      this.gates.filter((e) => e instanceof OvalGate)
    );
    this.polygonGatePlugin.setGates(
      //@ts-ignore
      this.gates.filter((e) => e instanceof PolygonGate)
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
    if (gate instanceof OvalGate) {
      this.ovalGatePlugin.gates.push(gate);
    } else if (gate instanceof PolygonGate) {
      this.polygonGatePlugin.gates.push(gate);
    }
  }

  public removeGate(gate: OvalGate | PolygonGate) {
    if (gate instanceof OvalGate) {
      this.ovalGatePlugin.gates = this.ovalGatePlugin.gates.filter(
        (e) => e.id !== gate.id
      );
    } else if (gate instanceof PolygonGate) {
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
    if (this.xAxis.length != this.yAxis.length) {
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
      xAxisLabel: this.plotData.xAxis,
      yAxisLabel: this.plotData.yAxis,
    });
    this.validateDraw();

    this.drawPoints();
  }

  public drawPoints() {
    const pointCount = this.xAxis.length;
    const colors = this.getPointColors();

    for (let i = 0; i < pointCount; i++) {
      if (this.isOutOfRange({ x: this.xAxis[i], y: this.yAxis[i] })) continue;
      const { x, y } = this.transformer.toConcretePoint({
        x: this.xAxis[i],
        y: this.yAxis[i],
      });
      this.drawer.addPoint(x, y, 1.1, colors[i]);
    }
  }

  private isOutOfRange(p: { x: number; y: number }) {
    const { x, y } = this.plotData.getXandYRanges();
    return p.x < x[0] || p.x > x[1] || p.y < y[0] || p.y > y[1];
  }

  public getPointColors() {
    return this.plotData.getPointColors();
  }
}
