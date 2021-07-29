import renderMap from "graph/renderMap";
import Renderer from "./renderer";

export interface CanvasProps {
  canvas: {
    width: number;
    height: number;
  };
}

export interface RendererProps extends CanvasProps {
  renderMethod: (
    props: RendererProps,
    context: CanvasRenderingContext2D
  ) => void;
  setChildrenState: (state: RendererProps) => { [index: string]: any };
}

export interface ChildStateProps extends RendererProps {}

export interface RenderMapType {
  children: string[];
  renderMethod: (
    state: RendererProps,
    context: CanvasRenderingContext2D
  ) => void;
  setChildrenState: (state: RendererProps) => { [index: string]: any };
}

export const baseSetChildrenState = (
  state: any
): { [index: string]: ChildStateProps } => {
  const childrenState: { [index: string]: ChildStateProps } = {};
  const children = Object.keys(state);
  for (const childName of children) {
    childrenState[childName] = {
      ...state[childName],
      ...renderMap[childName],
      canvas: state.canvas,
    };
  }
  return childrenState;
};

const CanvasEngine = (props: {
  root: string;
  width: number;
  height: number;
}) => {
  const child = renderMap[props.root];
  return (
    <Renderer
      {...child}
      canvas={{
        width: props.width,
        height: props.height,
      }}
    />
  );
};
export default CanvasEngine;
