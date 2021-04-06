import Plotter, { PlotterState } from "graph/renderers/plotters/plotter";

interface PluginSetup {
  order: string; // "before" | "after" | null;
  overwrite: boolean;
  functionSignature: string;
  function: Function;
}

/*
  What is this?
  A Plotter Plugin is a way to extend a Plotter without inheritance. To be more
  precise, this can alter, add or subtract behaviour from any Plotter were it's
  present by altering it's functions. It's a lot like multiple inheritance but
  it is up to the developer to say how the two classes above interact.

  A Plotter Plugin inherits this abstract class. To create, first add a static
  TargetPlotter, which is the plotter in which this plugin will work on (and it
  can also work on that plotter's children). Then you proceed to implement a set 
  plugin state function, which will receive the plotters state and save only what
  it needs. After that, you can start to alter behaviour from TargetPlotter. Do
  this by creating functions with the SAME name as they are in the the target and 
  a underline after the name plus the a tag of the behaviour you expect 
  ("OVERWRITE", "AFTER", "BEFORE").

  For example, if I want a plotter to draw a rect at the center of the scatter
  plot after the original plotter's draw is called, you could write:

  class CentralPointPlugin extends PlotterPlugin {
    static TargetPlotter = ScatterPlotter

    setPlotter(plotter: ScatterPlotter) {
      this.plotter = plotter
    }

    draw_AFTER() {
      const x = (this.plotter.xRange[1] + this.plotter.xRange[0])/2
      const y = (this.plotter.yRange[1] + this.plotter.yRange[0])/2
      const fp = this,plotter.transformer.toConcretePoint(x, y)
      this.plotter.drawer.addRect({
        x: fp.x - 10, 
        y: fp.y - 10,
        w: 20,
        h: 20,
        fill: true
      })
    }
  }

  So, after the draw() is called on scatter plotter, this will be called which will
  draw a nice black square in the center of the graph.

  If multiple plugins are used in a plotter, they are set inside the plotter as an
  ordered list.

  Rules on plotter plugin interaction: 
  1) Only one overwrite per plotter function
  2) BEFORE is FIFO, if list is [plugin1, plugin2] then plugin1.func_BEFORE will be
  called before plugin2.func_BEFORE when func is called in plotter.
  2) AFTER is FILO, if list is [plugin1, plugin2] then plugin2.func_AFTER will be
  called before plugin1.func_AFTER when func is called in plotter.
  3) A same plugin may implement a (BEFORE and AFTER) or OVERWRITE
*/
export default abstract class PlotterPlugin {
  static TargetPlotter = Plotter;

  static baseObjectFunctions = [
    "__defineGetter__",
    "__defineSetter__",
    "__lookupGetter__",
    "__lookupSetter__",
    "constructor",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toLocaleString",
    "toString",
    "valueOf",
    "getAllFunctions",
    "getPluginSetup",
    "setPluginState",
  ];

  private getAllFunctions(): string[] {
    let props: string[] = [];
    let obj = this;
    do {
      props = props.concat(Object.getOwnPropertyNames(this));
    } while ((obj = Object.getPrototypeOf(this)));

    return props.sort().filter(function (e, i, arr) {
      //@ts-ignore
      if (e != arr[i + 1] && typeof this[e] == "function") return true;
    });
  }

  public getPluginSetup(): PluginSetup[] {
    const funcs = this.getAllFunctions();
    const filtered = funcs.filter(
      (e) => !PlotterPlugin.baseObjectFunctions.includes(e) && e.includes("_")
    );
    const ret = filtered.map((e) => {
      if (!e.includes("_"))
        throw Error("Invalid plugin function signature: " + e);
      const signature = e.split("_")[0];
      const overwrite = e.split("_")[1] === "OVERWRITE";
      const order = overwrite ? null : e.split("_")[1].toLowerCase();
      return {
        order: order,
        overwrite: overwrite,
        functionSignature: signature,
        //@ts-ignore
        function: this[e],
      };
    });
    return ret;
  }

  public abstract setPlotter(state: Plotter): void;
}
