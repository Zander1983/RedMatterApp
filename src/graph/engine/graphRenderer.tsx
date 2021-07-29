import { RendererProps } from "./renderManager";

export interface GraphRendererProps extends RendererProps {
  /* === THIS IS WHERE EXPECTED STATE DEFINITIONS HAPPEN === */
}

export const graphRenderer = (
  state: GraphRendererProps,
  context: CanvasRenderingContext2D
) => {
  /* === THIS IS WHERE THE DRAWING HAPENS === */
};

export const setGraphRenderChildrenState = (
  state: GraphRendererProps
): { [index: string]: any } => {
  const childrenState: any = {};
  /* None as of now */
  return childrenState;
};
