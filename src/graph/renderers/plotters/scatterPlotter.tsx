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
      if (this.plugins !== undefined && this.plugins.has(key)) {
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
            functionList = [e];
          } else if (!overwritten) {
            if (e.order == "before") {
              functionList = [e, ...functionList];
            } else if (e.order == "after") {
              functionList = [...functionList, e];
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
          ret = e.plugin[e.functionSignature](args);
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
    }[]
  > = new Map();

  public addPlugin(plugin: PlotterPlugin) {
    const setup = plugin.getPluginSetup();
    for (const param of setup) {
      const final = {
        origin: plugin.constructor.name,
        ...param,
      };
      const targetFunction = param.functionSignature.split("_")[0];
      if (this.plugins.has(targetFunction)) {
        const list = this.plugins.get(targetFunction);
        if (!list.includes(final)) {
          list.push(final);
          this.plugins.set(targetFunction, list);
        }
      } else {
        this.plugins.set(targetFunction, [final]);
      }
    }
    plugin.setPlotter(this);
  }

  public removePlugin(plugin: PlotterPlugin) {
    const setup = plugin.getPluginSetup();
    for (const param of setup) {
      const l = this.plugins.get(param.functionSignature.split("_")[0]);
      const final = {
        origin: plugin.constructor.name,
        ...param,
      };
      const nl = l.filter((e) => e !== final);
      this.plugins.set(param.functionSignature, nl);
    }
  }

  // @applyPlugin()
  public update() {
    super.update();
  }

  // @applyPlugin()
  public setPlotterState(state: ScatterPlotterState) {
    super.setPlotterState(state);
  }

  // @applyPlugin()
  public getPlotterState(): ScatterPlotterState {
    return {
      ...super.getPlotterState(),
    };
  }

  // @applyPlugin()
  public setDrawerState(): void {
    super.setDrawerState();
  }

  // @applyPlugin()
  public createDrawer(): void {
    this.drawer = new ScatterDrawer();
  }

  // @applyPlugin()
  public updateDrawer(): void {
    this.drawer.update();
  }

  // @applyPlugin()
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

  private shouldSamplePoint() {
    const pointCount = this.xAxis.length;
    if (pointCount < 1000) {
      return true;
    }
    const v = (Math.random() * (pointCount - 1000)) / 1000;
    return Math.round(v) === 1 ? true : false;
  }

  // @applyPlugin()
  public drawPoints() {
    const pointCount = this.xAxis.length;
    const colors = this.getPointColors(pointCount);
    for (let i = 0; i < pointCount; i++) {
      // if (!this.shouldSamplePoint()) continue;
      const { x, y } = this.transformer.toConcretePoint({
        x: this.xAxis[i],
        y: this.yAxis[i],
      });
      this.drawer.addPoint(x, y, 1.4, colors[i]);
    }
  }

  @applyPlugin()
  public getPointColors(size: number) {
    return Array(size).fill("#000");
  }
}
