import Plotter from "../plotters/plotter";
import { useRef, useEffect } from "react";

interface CanvasInput {
  style: object;
  scale: number;
  plotter: Plotter;
}

function useCanvas(plotter: any, scale: any) {
  const canvasRef = useRef(null);

  function resizeCanvasToDisplaySize(canvas: any) {
    const { width, height } = canvas.getBoundingClientRect();

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width * scale;
      canvas.height = height * scale;
      return true;
    }

    return false;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let frameCount = 0;
    let animationFrameId = 0;

    canvas.addEventListener("mousemove", plotter.registerMouseEvent);
    canvas.addEventListener("mousedown", plotter.registerMouseEvent);
    canvas.addEventListener("mouseup", plotter.registerMouseEvent);

    const render = () => {
      frameCount++;
      resizeCanvasToDisplaySize(canvas);
      plotter.draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [plotter.draw]);

  return canvasRef;
}

// const CanvasComponent = ({ style, scale, plotter, ...rest }: CanvasInput) => {
//   const canvasRef = useCanvas(plotter, scale);

//   return <canvas ref={canvasRef} {...rest} />;
// };

const CanvasComponent = (props: any) => {
  // const canvasRef = useCanvas(plotter, width, height);

  // return <canvas ref={canvasRef} {...rest} />;
  return (
    <div
      style={{
        width: props.width,
        height: props.height,
        backgroundColor: "#afa",
        textAlign: "center",
        display: "table-cell",
        verticalAlign: "middle",
      }}
    >
      <h1>I'm a canvas with id = {props.canvasIndex}!</h1>
    </div>
  );
};

export default CanvasComponent;
