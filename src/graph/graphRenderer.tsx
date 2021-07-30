import { RendererProps } from "./engine/renderManager";

export interface GraphRendererProps extends RendererProps {
  num: number;
}

export const graphRenderer = (
  state: GraphRendererProps,
  context: CanvasRenderingContext2D
) => {
  context.beginPath();
  const num = state.props.num * 10;
  console.log(state, "graphRenderer");
  context.moveTo(100, 100 + num);
  context.lineTo(200, 200 + num);
  context.stroke();
};

export const setGraphRenderChildrenState = (
  state: GraphRendererProps
): { [index: string]: any } => {
  const childrenState: any = {
    graphRenderer2: {
      num: state.props.num + 1,
    },
  };
  return childrenState;
};
