import { RendererProps } from "./engine/renderManager";

export interface GraphRendererProps extends RendererProps {
  num: number;
}

export const graphRenderer = (
  state: GraphRendererProps,
  context: CanvasRenderingContext2D
) => {
  console.log("graphRenderer2 =", state.props.num);
  context.clearRect(0, 0, state.canvas.width, state.canvas.height);
  context.beginPath();
  context.strokeStyle = "#F00";
  context.moveTo(100, 100 + state.props.num);
  context.lineTo(200 + state.props.num, 200);
  context.stroke();
};

export const setGraphRenderChildrenState = (
  state: GraphRendererProps
): { [index: string]: any } => {
  const childrenState: any = {};
  /* None as of now */
  return childrenState;
};
