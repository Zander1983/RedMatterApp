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

// const Canvas = ({ style, scale, plotter, ...rest }: CanvasInput) => {
//   const canvasRef = useCanvas(plotter, scale);

//   return <canvas ref={canvasRef} {...rest} />;
// };

const Canvas = (props: any) => {
  // const canvasRef = useCanvas(plotter, scale);

  // return <canvas ref={canvasRef} {...rest} />;
  return (
    <div style={{ width: 400, height: 400, backgroundColor: "#afa" }}>
      <h1>I'm a canvas with id = {props.canvasIndex}!</h1>
    </div>
  );
};

export default Canvas;
