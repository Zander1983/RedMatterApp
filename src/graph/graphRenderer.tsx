import { RendererProps } from "./engine/renderManager";

export interface GraphRendererProps extends RendererProps {
  num: number;
  a: number;
}

export const graphRenderer = (
  state: GraphRendererProps,
  context: CanvasRenderingContext2D
) => {
  console.log("graphRenderer =", state.props.num);
  context.clearRect(0, 0, state.canvas.width, state.canvas.height);
  context.beginPath();
  context.moveTo(100 + state.props.num, 100);
  context.lineTo(200 + state.props.num, 200);
  context.stroke();
};

export const setGraphRenderChildrenState = (
  state: GraphRendererProps
): { [index: string]: any } => {
  const childrenState: any = {
    graphRenderer2: {
      num: state.props.num + 10,
    },
  };
  return childrenState;
};
