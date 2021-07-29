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

/* 
  In the future, we will need a way to get all overlayed canvases and turn them
  into a single one to use on other parts of the app for report creation and
  so on. I have no idea how to do it, but keep it here as a remainder.
*/
const collectCanvas = () => {};

const CanvasEngine = (props: {
  root: string;
  width: number;
  height: number;
  props: any;
}) => {
  const child = renderMap[props.root];
  return (
    <Renderer
      {...child}
      {...props}
      canvas={{
        width: props.width,
        height: props.height,
      }}
    />
  );
};

export default CanvasEngine;
