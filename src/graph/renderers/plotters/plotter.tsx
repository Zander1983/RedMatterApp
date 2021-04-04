import Drawer from "graph/renderers/drawers/drawer";
import Transformer from "graph/renderers/transformers/transformer";

export interface PlotterState {}

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
export default abstract class Plotter {
  /* === DATA === */

  protected canvasContext: any = null;
  protected drawer: Drawer | null = null;
  protected transformer: Transformer | null = null;

  /* === METHODS === */

  public abstract draw(): void;

  public setup(canvasContext: any): void {
    this.canvasContext = canvasContext;
    this.createDrawer();
    this.createTransformer();
  }

  public update(): void {
    this.setDrawerState();
    this.updateDrawer();
    this.setTransformerState();
    this.updateTransformer();
  }

  public setPlotterState(state: PlotterState): void {}

  public getPlotterState(): PlotterState {
    return {};
  }

  protected abstract setDrawerState(): void;
  protected abstract createDrawer(): void;
  protected abstract updateDrawer(): void;

  protected abstract setTransformerState(): void;
  protected abstract createTransformer(): void;
  protected abstract updateTransformer(): void;
}
