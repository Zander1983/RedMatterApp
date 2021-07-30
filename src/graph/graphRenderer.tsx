import { RendererProps } from "./engine/renderManager";

export interface GraphRendererProps extends RendererProps {
  num: number;
}

export const graphRenderer = (
  state: GraphRendererProps,
  context: CanvasRenderingContext2D
) => {
  console.log("graphRender was drawn with state =", state);
  context.beginPath();
  const num = state.num * 10;
  context.moveTo(100 + num, 100 + num);
  context.lineTo(200 + num, 200 + num);
  context.stroke();
};

export const setGraphRenderChildrenState = (
  state: GraphRendererProps
): { [index: string]: any } => {
  // console.log("graphRender child", state);
  const childrenState: any = {
    graphRenderer2: {
      num: state.num + 1,
    },
  };
  return childrenState;
};
