import Plot from "./Plot";
import canvasManager from "../../classes/canvas/canvasManager";

const plotFactory = (): any => {
  const canvas = canvasManager.getAllCanvas();
  const plots: JSX.Element[] = [];
  canvas.forEach((v, k) => {
    plots.push(<Plot key={k} canvas={v} canvasIndex={k}></Plot>);
  });
  return plots;
};

export default plotFactory;
