import { cssNumber } from "jquery";
import React from "react";
import { useRef, useEffect } from "react";
import Canvas from "../../canvasManagement/canvas";

const CanvasComponent = (props: { canvas: Canvas; canvasIndex: number }) => {
  const canvas = props.canvas;
  let canvasRef = useRef(null);

  useEffect(() => {
    canvasRef = canvas.useCanvas(canvasRef);
  });

  const id = `canvas-${props.canvasIndex}`;
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
      id={id}
    />
  );
};

export default CanvasComponent;
