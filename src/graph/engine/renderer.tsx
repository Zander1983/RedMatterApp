import { useCallback, useEffect, useRef, useState } from "react";
import { baseSetChildrenState, RendererProps } from "./renderManager";

const Renderer = (props: RendererProps) => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  const render = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (context === null || context === undefined) return;
      props.renderMethod(props, context);
    },
    [props]
  );

  const getChildren = (): JSX.Element[] => {
    const ret: JSX.Element[] = [];
    const protoChildrenState = props.setChildrenState(props);
    const childrenState = baseSetChildrenState(protoChildrenState);
    const children = Object.keys(childrenState);
    for (const childName of children) {
      const child = childrenState[childName];
      const element = <Renderer {...child} />;
      ret.push(element);
    }
    return ret;
  };

  useEffect(() => {
    if (canvasRef === null || canvasRef.current === null) return;
    const canvas = canvasRef.current;
    const currentContext: CanvasRenderingContext2D = canvas.getContext("2d");
    setContext(currentContext);
    render(currentContext);
  }, [canvasRef, render]);

  useEffect(() => {
    render(context);
  }, [props, context, render]);

  return (
    <canvas
      ref={canvasRef}
      width={props.canvas.width}
      height={props.canvas.height}
    >
      {getChildren()}
    </canvas>
  );
};

export default Renderer;
