import CanvasEngine from "./engine/renderManager";

export interface PlotProps {
  id: string;
  plots: PlotType;
}

const Plot = (props: PlotProps) => {
  return (
    <CanvasEngine
      root={"graphRenderer"}
      width={300}
      height={300}
      props={props}
    />
  );
};

export default Plot;
