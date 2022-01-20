import React, { useRef } from "react";
import { Divider, Grid } from "@material-ui/core";

import GateBar from "./GateBar";
import MainBar from "./MainBar";
import SideSelector from "./SideSelector";
import {
  PlotSpecificWorkspaceData,
  PlotID,
} from "graph/resources/types";

import PlotRenderer from "graph/components/PlotRenderer";
import { getGate } from "graph/utils/workspace";

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

const PlotComponent = React.memo(
  (props: {
    plotRelevantResources: PlotSpecificWorkspaceData;
    sharedWorkspace: boolean;
    experimentId: string;
    editWorkspace: boolean;
    workspaceLoading: boolean;
    customPlotRerender: PlotID[];
    fileName: string;
  }) => {
    const { plot, gates, population } = props.plotRelevantResources;

    const plotId = plot.id;

    const displayRef = useRef();
    const barRef = useRef();
    console.log("==== render PlotCmp =====");
    return (
      <div
        id={`display-ref-${plotId}`}
        key={`display-ref-${plotId}`}
        style={classes.mainContainer}
        ref={displayRef}
      >
        <div id={`bar-ref-${plotId}`} style={classes.utilityBar} ref={barRef}>
          <Grid
            container
            direction="row"
            style={{
              gap: 5,
            }}
          >
            <div>
              {props.fileName.length < 35
                ? props.fileName
                : `${props.fileName.slice(0, 35)}...`}
            </div>
            <MainBar plot={plot} editWorkspace={props.editWorkspace}/>
            <GateBar
              plotId={plot.id}
              plotGates={plot.gates.map((e) => getGate(e))}
              populationGates={population.gates.map((e) => {
                return {
                  gate: getGate(e.gate),
                  inverseGating: e.inverseGating,
                };
              })}
              editWorkspace={props.editWorkspace}
            />
          </Grid>
        </div>
        <Divider
          style={{ marginBottom: 10, marginLeft: -10, marginRight: -10 }}
        />

        <SideSelector
          {...props}
          canvasComponent={
            <PlotRenderer
              workspaceLoading={props.workspaceLoading}
              plot={plot}
              plotGates={gates}
              population={population}
              editWorkspace={props.editWorkspace}
              customPlotRerender={props.customPlotRerender}
            />
          }/>
      </div>
    );
  }
);

export default PlotComponent;
