import React, { useRef, useEffect } from "react";
import Plot from "graph/renderers/plotRender";

const CanvasComponent = (props: { plot: Plot; plotIndex: string }) => {
  const [useCanvasCalled, setUseCanvasCalled] = React.useState(false);
  const canvas = props.plot.canvas;
  let canvasRef = useRef(null);

  useEffect(() => {
    if (!useCanvasCalled) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      canvasRef = canvas.useCanvas(canvasRef);
      setUseCanvasCalled(true);
    }
    return () => {
      canvas.setUseCanvasUsed(false);
    };
  }, []);

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
