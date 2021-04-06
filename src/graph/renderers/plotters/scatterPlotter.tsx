import GraphPlotter, {
  GraphPlotterState,
} from "graph/renderers/plotters/graphPlotter";
import ScatterDrawer from "graph/renderers/drawers/scatterDrawer";
import OvalGate from "graph/dataManagement/gate/ovalGate";
import PolygonGate from "graph/dataManagement/gate/PolygonGate";
import PlotterPlugin from "graph/renderers/plotters/plotterPlugin";
import ScatterHeatmapper from "graph/renderers/plotters/instancePlugins/scatterHeatmapper";
import Plotter from "./plotter";

interface ScatterPlotterState extends GraphPlotterState {}

const applyPlugin = () => {
  return function (
    target: ScatterPlotter,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      let overwritten = false;
      let functionList: any[] = ["original"];

      // Let's build a function list of all plugin's function
      //@ts-ignore
      if (this.plugins.has(key)) {
        //@ts-ignore
        this.plugins.get(key).forEach((e) => {
          if (e.overwrite) {
            if (overwritten) {
              throw Error(
                "Two override plugins in " +
                  //@ts-ignore
                  key +
                  " of " +
                  this.constructor.name
              );
            }
            overwritten = true;
            functionList = [e.function];
          } else if (!overwritten) {
            if (e.order == "before") {
              functionList = [e.function, ...functionList];
            } else if (e.order == "after") {
              functionList = [...functionList, e.function];
            } else {
              throw Error("Unrecognized plugin order " + e.order);
            }
          }
        });
      }

      // Now call each function in the list, return is last function's return
      let ret: any = null;
      for (const e of functionList) {
        if (typeof e == "string") {
          ret = original.apply(this, args);
        } else {
          ret = e(args);
        }
      }

      return ret;
    };
  };
};

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
export default class ScatterPlotter extends GraphPlotter {
  gates: (OvalGate | PolygonGate)[] = [];
  drawer: ScatterDrawer | null = null;
  plugins: Map<
    string,
    {
      origin: string;
      order: string;
      overwrite: boolean;
      functionSignature: string;
      function: Function;
    }[]
  >;

  public addPlugin(plugin: PlotterPlugin) {
    const setup = plugin.getPluginSetup();
    for (const param of setup) {
      const final = {
        origin: plugin.constructor.name,
        ...param,
      };
      if (this.plugins.has(param.functionSignature)) {
        const list = this.plugins.get(param.functionSignature);
        if (!list.includes(final)) {
          list.push(final);
          this.plugins.set(param.functionSignature, list);
        }
      } else {
        this.plugins.set(param.functionSignature, [final]);
      }
    }
    plugin.setPlotter(this);
  }

  public removePlugin(plugin: PlotterPlugin) {
    const setup = plugin.getPluginSetup();
    for (const param of setup) {
      const l = this.plugins.get(param.functionSignature);
      const final = {
        origin: plugin.constructor.name,
        ...param,
      };
      const nl = l.filter((e) => e !== final);
      this.plugins.set(param.functionSignature, nl);
    }
  }

  @applyPlugin()
  public update() {
    super.update();
  }

  @applyPlugin()
  public setPlotterState(state: ScatterPlotterState) {
    super.setPlotterState(state);
  }

  @applyPlugin()
  public getPlotterState(): ScatterPlotterState {
    return {
      ...super.getPlotterState(),
    };
  }

  @applyPlugin()
  public setDrawerState(): void {
    super.setDrawerState();
  }

  @applyPlugin()
  public createDrawer(): void {
    this.drawer = new ScatterDrawer();
  }

  @applyPlugin()
  public updateDrawer(): void {
    this.drawer.update();
  }

  @applyPlugin()
  public setTransformerState(): void {
    super.setTransformerState();
  }

  @applyPlugin()
  public createTransformer(): void {
    super.createTransformer();
  }

  @applyPlugin()
  public updateTransformer(): void {
    super.updateTransformer();
  }

  @applyPlugin()
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
    super.draw();
    this.validateDraw();

    this.drawPoints();
  }

  @applyPlugin()
  public drawPoints() {
    const pointCount = this.xAxis.length;
    for (let i = 0; i < pointCount; i++) {
      const color = this.getPointColor(i);
      const x = this.xAxis[i];
      const y = this.yAxis[i];
      this.drawer.addPoint(this.xAxis[i], this.yAxis[i], 1.4, color);
    }
  }

  public getPointColor(index: number) {
    return "#000";
  }
}
