import React, { useRef } from "react";
import { Divider, Grid } from "@material-ui/core";

import GateBar from "./GateBar";
import MainBar from "./MainBar";
import SideSelector from "./SideSelector";

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

const PlotComponent =  ({
    plotRelevantResources,
    sharedWorkspace,
    experimentId,
    editWorkspace,
    workspaceLoading,
    customPlotRerender,
    fileName,
  }:any) => {
    const { plot, gates, population } = plotRelevantResources;
    const plotId = plot.id;

    const displayRef = useRef();
    const barRef = useRef();
    // console.log("===Plot Component==");

    return (
      <div
        id={`display-ref-${plotId}`}
        key={`display-ref-${plotId}`}
        style={classes.mainContainer}
        ref={displayRef}>
        <div id={`bar-ref-${plotId}`} style={classes.utilityBar} ref={barRef}>
          <Grid
            container
            direction="row"
            style={{
              gap: 5,
            }}
          >
            <div>
              {fileName.length < 35
                ? fileName
                : `${fileName.slice(0, 35)}...`}
            </div>
            <MainBar plot={plot} editWorkspace={editWorkspace} />
            <GateBar
              plotId={plot.id}
              plotGates={plot.gates.map((e:any) => getGate(e))}
              file={population.file}
              populationGates={population.gates.map((e:any) => {
                return {
                  gate: getGate(e.gate),
                  inverseGating: e.inverseGating,
                };
              })}
              editWorkspace={editWorkspace}
            />
          </Grid>
        </div>
        <Divider
          style={{ marginBottom: 10, marginLeft: -10, marginRight: -10 }}
        />
        <SideSelector
          { ...{plotRelevantResources,
            sharedWorkspace,
            experimentId,
            editWorkspace,
            workspaceLoading,
            customPlotRerender,
            fileName}}
          canvasComponent={
            <PlotRenderer
              workspaceLoading={workspaceLoading}
              plot={plot}
              plotGates={gates}
              population={population}
              editWorkspace={editWorkspace}
              customPlotRerender={customPlotRerender}
            />
          }
        />
      </div>
    );
  };

export default PlotComponent;
