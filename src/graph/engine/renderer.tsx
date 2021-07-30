import renderMap from "graph/renderMap";
import { useEffect, useRef, useState } from "react";
import { ChildStateProps, RendererProps } from "./renderManager";

const baseSetChildrenState = (
  state: any
): { [index: string]: ChildStateProps } => {
  const childrenState: { [index: string]: ChildStateProps } = {};
  const children = Object.keys(state);
  for (const childName of children) {
    childrenState[childName] = {
      props: state[childName],
      ...renderMap[childName],
      canvas: state.canvas,
    };
  }
  return childrenState;
};

const getChildren = (props: any): any[] => {
  const protoChildrenState = props.setChildrenState(props);
  const childrenState = baseSetChildrenState(protoChildrenState);
  const children = Object.keys(childrenState);
  const ret = children.map((childName) => {
    const child = childrenState[childName];
    const element = {
      ...child,
      canvas: props.canvas,
      props: { ...props.props, ...child.props },
    };
    return element;
  });
  return ret;
};

const Renderer = (props: RendererProps) => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [children, setChildren] = useState(null);

  useEffect(() => {
    setChildren(getChildren(props));
  }, [props]);

  const render = (context: CanvasRenderingContext2D) => {
    if (context === null || context === undefined) return;
    props.renderMethod(props, context);
  };

  useEffect(() => {
    if (canvasRef === null || canvasRef.current === null) return;
    const canvas = canvasRef.current;
    const currentContext: CanvasRenderingContext2D = canvas.getContext("2d");
    setContext(currentContext);
    render(currentContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  useEffect(() => {
    render(context);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, context]);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        style={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
        ref={canvasRef}
        width={props.canvas.width}
        height={props.canvas.height}
      ></canvas>
      {children !== null ? children.map((e: any) => <Renderer {...e} />) : null}
    </div>
  );
};

export default Renderer;
