import { RendererProps } from "./engine/renderManager";

export interface GraphRendererProps extends RendererProps {
  num: number;
}

export const graphRenderer = (
  state: GraphRendererProps,
  context: CanvasRenderingContext2D
) => {
  context.beginPath();
  context.moveTo(100 + state.num, 100 + state.num);
  context.lineTo(200 + state.num, 200 + state.num);
  context.stroke();
};

export const setGraphRenderChildrenState = (
  state: GraphRendererProps
): { [index: string]: any } => {
  const childrenState: any = {
    graphRenderer2: {
      num: state.num + 1,
    },
  };
  /* None as of now */
  return childrenState;
};
