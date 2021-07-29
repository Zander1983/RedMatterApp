import GraphPlotter from "graph/renderers/plotters/graphPlotter";
import PlotterPlugin from "graph/renderers/plotters/plotterPlugin";

export const applyPlugin = () => {
  return function (
    target: PluginGraphPlotter,
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
            if (e.order === "before") {
              functionList = [e, ...functionList];
            } else if (e.order === "after") {
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
          ret = e.plugin[e.functionSignature](args, ret);
        }
      }

      return ret;
    };
  };
};

/*
  How to use plugins?
    1. Instance and setup the plotter
    2. Pick the plugins you want to add, and apply them to the plotter, like this:
      ```
      const plugin = new AddBehaviourPlugin();
      this.addPlugin(plugin);
      ```
    3. Now add the decorator "applyPlugin" to all functions that could be
       targeted by a plugin. (@applyPlugin())
    4. That's it.
*/
export default abstract class PluginGraphPlotter extends GraphPlotter {
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
}
