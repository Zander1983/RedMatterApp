import CanvasEngine from "./engine/renderManager";

export interface PlotProps {}

const Plot = (props: PlotProps) => {
  return <CanvasEngine root="graphEngine" width={300} height={300} />;
};

export default Plot;
