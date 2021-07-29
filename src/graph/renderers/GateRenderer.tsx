import { useCallback, useEffect, useRef, useState } from "react";
import CanvasProps from "./CanvasProps";

export interface GateRendererProps extends CanvasProps {}

const gateRender = (
  state: GateRendererProps,
  context: CanvasRenderingContext2D
) => {
  /* === THIS IS WHERE THE DRAWING HAPENS === */
};

const GateRenderer = (props: GateRendererProps) => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  const render = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (context === null || context === undefined) return;
      gateRender(props, context);
    },
    [props]
  );

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
    />
  );
};

export default GateRenderer;
