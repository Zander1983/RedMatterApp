import React, { useRef, useEffect } from "react";

function useCanvas(parent: any, scale: any) {
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

    canvas.addEventListener("mousemove", parent.registerMouseEvent);
    canvas.addEventListener("mousedown", parent.registerMouseEvent);
    canvas.addEventListener("mouseup", parent.registerMouseEvent);

    const render = () => {
      frameCount++;
      resizeCanvasToDisplaySize(canvas);
      parent.draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [parent.draw]);

  return canvasRef;
}

const CanvasComponent = (props: any) => {
  const { parent, scale, ...rest } = props;
  const canvasRef = useCanvas(parent, scale);

  return <canvas ref={canvasRef} {...rest} />;
};

export default CanvasComponent;
