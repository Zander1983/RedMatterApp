import { useRef, useState } from "react";
import { Divider } from "@material-ui/core";

import GateBar from "./GateBar";
import MainBar from "./MainBar";
import SideSelector from "./SideSelector";
import { Gate, Plot, PlotSpecificWorkspaceData } from "graph/resources/types";
import * as PlotResource from "graph/resources/plots";
import PlotRenderer from "graph/components/PlotRenderer";

const classes = {
  itemOuterDiv: {
    flex: 1,
    backgroundColor: "#eef",
    border: "solid 0.5px #bbb",
    boxShadow: "1px 3px 4px #bbd",
    borderRadius: 5,
  },
  itemInnerDiv: {
    width: "100%",
    height: "100%",
  },
  mainContainer: {
    width: "100%",
    height: "100%",
    padding: "8px 10px 10px 10px",
  },
  utilityBar: {
    width: "100%",
  },
  canvasDisplay: {
    borderRadius: 5,
    boxShadow: "1px 3px 4px #bbd",
    backgroundColor: "#dfd",
    flexGrow: 1,
  },
};

function PlotComponent(props: {
  plotRelevantResources: PlotSpecificWorkspaceData;
  sharedWorkspace: boolean;
  experimentId: string;
}) {
  const { plot, file, gates, population } = props.plotRelevantResources;

  const xAxis = plot.xAxis;
  const yAxis = plot.yAxis;
  const plotId = plot.id;

  const displayRef = useRef();
  const barRef = useRef();

  const [oldAxis, setOldAxis] = useState({
    x: null,
    y: null,
  });

  const [lastSelectEvent, setLastSelectEvent] = useState(0);

  const isPlotHistogram = () => {
    return xAxis === yAxis;
  };

  const onGateDoubleClick = (
    xAxis: String,
    xAxisType: String,
    yAxis: String,
    yAxisType: String
  ) => {
    const setHistogram = (axis: "x" | "y", value: boolean) => {
      if (value) {
        axis === "x"
          ? setOldAxis({ ...oldAxis, y: yAxis })
          : setOldAxis({ ...oldAxis, x: xAxis });
        axis === "x"
          ? PlotResource.xAxisToHistogram(plot)
          : PlotResource.yAxisToHistogram(plot);
      } else {
        axis === "x"
          ? PlotResource.setYAxis(plot, oldAxis.y)
          : PlotResource.setXAxis(plot, oldAxis.x);

        PlotResource.disableHistogram(plot);
      }
    };
    const handleSelectEvent = (e: any, axis: "x" | "y", func: Function) => {
      if (lastSelectEvent + 500 < new Date().getTime()) {
        func(e);
        setLastSelectEvent(new Date().getTime());
      }

      if (plot.histogramAxis === "vertical") {
        setHistogram("x", true);
      } else if (plot.histogramAxis === "horizontal") {
        setHistogram("y", true);
      }
    };
    if (isPlotHistogram()) {
      PlotResource.disableHistogram(plot);
    }

    handleSelectEvent({ axis: xAxis, type: xAxisType }, "x", (e: any) => {
      PlotResource.setXAxis(plot, e.axis);
      PlotResource.setXAxisPlotType(plot, e.type);
    });

    handleSelectEvent({ axis: yAxis, type: yAxisType }, "y", (e: any) => {
      PlotResource.setYAxis(plot, e.axis);
      PlotResource.setYAxisPlotType(plot, e.type);
    });
  };

  return (
    <div
      id={`display-ref-${plotId}`}
      style={classes.mainContainer}
      ref={displayRef}
    >
      <div id={`bar-ref-${plotId}`} style={classes.utilityBar} ref={barRef}>
        <MainBar plot={plot}></MainBar>

        <Divider></Divider>

        <GateBar plot={plot} onGateDoubleClick={onGateDoubleClick}></GateBar>

        <Divider style={{ marginBottom: 10 }}></Divider>
      </div>

      <SideSelector
        {...props}
        canvasComponent={
          <PlotRenderer
            plot={plot}
            plotGates={gates}
            population={population}
          ></PlotRenderer>
        }
      ></SideSelector>
    </div>
  );
}

export default PlotComponent;
