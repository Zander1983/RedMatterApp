import { cssNumber } from "jquery";
import React from "react";
import { useRef, useEffect } from "react";
import Canvas from "../../classes/canvas/canvas";

const CanvasComponent = (props: { canvas: Canvas }) => {
  const canvas = props.canvas;
  let canvasRef = useRef(null);

  useEffect(() => {
    canvasRef = canvas.useCanvas(canvasRef);
  });

  return (
    <canvas
      style={{
        backgroundColor: "#fff",
        textAlign: "center",
        width: canvas.width,
        height: canvas.height,
        borderRadius: 5,
        boxShadow: "1px 3px 4px #bbd",
        flexGrow: 1,
      }}
      ref={canvasRef}
    />
  );
};

export default CanvasComponent;
