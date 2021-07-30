import CanvasEngine from "./engine/renderManager";
import { GateType, PlotType } from "./Types";

export interface PlotProps {
  gates: GateType[];
  plot: PlotType;
}

const Plot = (props: { plotData: PlotProps }) => {
  return (
    <CanvasEngine
      root={"graphRenderer"}
      width={300}
      height={300}
      props={{ ...props.plotData.plot, num: 1 }}
    />
  );
};

export default Plot;
