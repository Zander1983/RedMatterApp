import Plot from "../Plots";
import canvasManager from "../../classes/canvas/canvasManager";

const plotFactory = (): JSX.Element[] => {
  const canvas = canvasManager.getCanvas();
  const plots: JSX.Element[] = [];
  canvas.forEach((v, k) => {
    const newPlot = <Plot />;
    plots.push(newPlot);
  });
  return plots;
};

export default plotFactory;
