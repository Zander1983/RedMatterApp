import { useEffect, useState } from "react";
import CanvasEngine from "./engine/renderManager";
import { GateType, PlotType } from "./Types";

export interface PlotProps {
  gates: GateType[];
  plot: PlotType;
}

const Plot = (props: { plotData: PlotProps }) => {
  const [calls, setCalls] = useState(0);

  useEffect(() => {
    setInterval(() => {
      console.log("old", calls);
      const newp = (calls + 1) % 100;
      console.log("new", newp);
      setCalls(newp);
    }, 500);
  }, []);

  return (
    <CanvasEngine
      root={"graphRenderer"}
      width={300}
      height={300}
      props={{ ...props.plotData.plot, num: calls }}
    />
  );
};

export default Plot;
