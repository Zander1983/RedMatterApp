import { useRef, useEffect } from "react";
import Plot from "../../plotManagement/plot";

const CanvasComponent = (props: { plot: Plot; plotIndex: string }) => {
  const canvas = props.plot.canvas;
  let canvasRef = useRef(null);

  useEffect(() => {
    canvasRef = canvas.useCanvas(canvasRef);
  });

  const id = `canvas-${props.plotIndex}`;
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
