import { baseSetChildrenState, RendererProps } from "./renderManager";

export interface GraphContentRendererType extends RendererProps {
  /* === THIS IS WHERE EXPECTED STATE DEFINITIONS HAPPEN === */
}

export const gateRenderer = (
  state: GraphContentRendererType,
  context: CanvasRenderingContext2D
) => {
  /* === THIS IS WHERE THE DRAWING HAPENS === */
};

export const setChildrenState = (
  state: GraphContentRendererType
): { [index: string]: any } => {
  const childrenState: any = {};

  childrenState["scatterPlotRenderer"] = {
    /* === DECIDE THE STATE CHILD WILL RECEIVE === */
  };

  childrenState["histogramPlotRenderer"] = {
    /* === DECIDE THE STATE CHILD WILL RECEIVE === */
  };

  return childrenState;
};
