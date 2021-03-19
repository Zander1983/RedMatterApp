import React from "react";
import Plotter from "../plotters/plotter";
import { useRef, useEffect } from "react";
import ScatterPlotter from "../plotters/scatterPlotter";
import MouseInteractor from "../mouseInteractors/mouseInteractor";

interface CanvasInput {
  style: object;
  scale: number;
  plotter: Plotter;
}

function useCanvas(
  plotter: any,
  scale: number,
  mouseInteractor: MouseInteractor
) {
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

    // canvas.addEventListener("mousemove", mouseInteractor.registerMouseEvent);
    // canvas.addEventListener("mousedown", mouseInteractor.registerMouseEvent);
    // canvas.addEventListener("mouseup", mouseInteractor.registerMouseEvent);

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

const CanvasComponent = (props: any) => {
  const { data, width, height, mouseInteractor, ...rest } = props;
  const [eWidth, setEWidth] = React.useState(0);
  const [eHeight, setEHeight] = React.useState(0);
  const scale = 2;

  const sizeUpdater = (w, h) => {
    setEWidth(w);
    setEHeight(h);
  };

  props.sizeupdatersetter(sizeUpdater);

  const plotter =
    props.histogram == "true"
      ? new ScatterPlotter({
          xAxis: data.x,
          yAxis: data.y,
          width: eWidth,
          height: eHeight,
          scale: scale,
        })
      : // Should have been histogram plotter
        new ScatterPlotter({
          xAxis: data.x,
          yAxis: data.y,
          width: eWidth,
          height: eHeight,
          scale: scale,
        });

  const canvasRef = useCanvas(plotter, scale, mouseInteractor);

  return (
    <canvas
      style={{
        backgroundColor: "#fcc",
        textAlign: "center",
        width: eWidth,
        height: eHeight,
        borderRadius: 5,
        boxShadow: "1px 3px 4px #bbd",
        flexGrow: 1,
      }}
      ref={canvasRef}
      {...rest}
    />
  );
};

export default CanvasComponent;
