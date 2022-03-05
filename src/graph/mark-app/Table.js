import Plot from "./Plot";
import Histogram from "./Histogram";
import React from "react";
import { Divider, Grid } from "@material-ui/core";

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
    flex: 1,
    border: "solid 0.5px #bbb",
    boxShadow: "1px 3px 4px #bbd",
    borderRadius: "5px",
    paddingBottom: "8px",
    backgroundColor: "rgb(238, 238, 255)",
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

function Table(props) {
  console.log(">> table props is ", props);

  return (
    <table className="workspace">
      <tbody>
        {props.enrichedFiles.map((enrichedFile, fileIndex) => {
          return (
            <tr key={`tr-${fileIndex}`}>
              {props.workspaceState.plots.map((plot, plotIindex) => {
                return (
                  <td key={`td-${plotIindex}`}>
                    <div key={props.plotIndex} style={classes.mainContainer}>
                      <div style={classes.utilityBar}>
                        <Grid
                          container
                          direction="row"
                          style={{
                            gap: 3,
                          }}
                        >
                          <div>File name</div>
                          {/* <MainBar plot={plot} editWorkspace={true} /> */}
                          {/* <GateBar
              plotId={plot.id}
              plotGates={plot.gates.map((e: any) => getGate(e))}
              file={population.file}
              populationGates={population.gates.map((e: any) => {
                return {
                  gate: getGate(e.gate),
                  inverseGating: e.inverseGating,
                };
              })}
              editWorkspace={editWorkspace}
            /> */}
                        </Grid>
                      </div>
                      {plot.population != "All"
                        ? `Stats: ${
                            enrichedFile.gateStats[
                              plot.population + "_percentage"
                            ]
                          }%`
                        : ""}
                      {(() => {
                        if (plot.plotType === "scatter") {
                          return (
                            <Plot
                              key={`plot-${plotIindex}`}
                              plot={plot}
                              enrichedFile={enrichedFile}
                              onAddGate={props.onAddGate}
                              onEditGate={props.onEditGate}
                              onResize={props.onResize}
                              onChangeChannel={props.onChangeChannel}
                              plotIndex={`${fileIndex}-${plotIindex}`}
                              testParam={props.testParam}
                            />
                          );
                        } else if (plot.plotType === "histogram") {
                          return (
                            <Histogram
                              key={`plot-${plotIindex}`}
                              plot={plot}
                              enrichedFile={enrichedFile}
                              plotIndex={`${fileIndex}-${plotIindex}`}
                            />
                          );
                        }
                      })()}
                    </div>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Table;
