import { RendererProps } from "./engine/renderManager";

export interface GraphRendererProps extends RendererProps {
  num: number;
}

export const graphRenderer = (
  state: GraphRendererProps,
  context: CanvasRenderingContext2D
) => {
  console.log(state);
  context.clearRect(0, 0, state.canvas.width, state.canvas.height);
  console.log("graphRender2 was drawn with state =", state);
  context.beginPath();
  const num = state.props.num * 10;
  context.strokeStyle = "#F00";
  context.moveTo(100 + num, 100);
  context.lineTo(200 + num, 200);
  context.stroke();
};

export const setGraphRenderChildrenState = (
  state: GraphRendererProps
): { [index: string]: any } => {
  const childrenState: any = {};
  /* None as of now */
  return childrenState;
};
