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

  let controlEnrichedFile = props.enrichedFiles.find(
    (enrichedFile) => enrichedFile.isControlFile
  );

  console.log("FIND CONTROL FILE");
  console.log(controlEnrichedFile);

  let nonControlEnrichedFiles = props.enrichedFiles.filter(
    (enrichedFile) => !enrichedFile.isControlFile
  );

  console.log("NON CONTROLS FILES ");
  console.log(nonControlEnrichedFiles);

  return (
    <table className="workspace">
      <tbody>
        <tr>
          {controlEnrichedFile.plots.map((plot, plotIindex) => {
            return (
              <th key={`td-${plotIindex}`}>
                {(() => {
                  if (plot.plotType === "scatter") {
                    return (
                      <Plot
                        key={`plot-${plotIindex}`}
                        plot={plot}
                        enrichedFile={controlEnrichedFile}
                        onAddGate={props.onAddGate}
                        onEditGate={props.onEditGate}
                        onResize={props.onResize}
                        onChangeChannel={props.onChangeChannel}
                        plotIndex={`0-${plotIindex}`}
                        testParam={props.testParam}
                      />
                    );
                  } else if (plot.plotType === "histogram") {
                    return (
                      <Histogram
                        key={`plot-${plotIindex}`}
                        plot={plot}
                        onChangeChannel={props.onChangeChannel}
                        enrichedFile={controlEnrichedFile}
                        plotIndex={`0-${plotIindex}`}
                      />
                    );
                  }
                })()}
              </th>
            );
          })}
        </tr>
        {nonControlEnrichedFiles.map((enrichedFile, fileIndex) => {
          console.log(">>>>> NON CONTROL enrichedFile IS ", enrichedFile);
          return (
            <tr key={`tr-${fileIndex}`}>
              {enrichedFile.plots.map((plot, plotIindex) => {
                return (
                  <td key={`td-${plotIindex + 1}`}>
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
                              key={`plot-${plotIindex + 1}`}
                              plot={plot}
                              enrichedFile={enrichedFile}
                              onAddGate={props.onAddGate}
                              onEditGate={props.onEditGate}
                              onResize={props.onResize}
                              onChangeChannel={props.onChangeChannel}
                              plotIndex={`${fileIndex + 1}-${plotIindex}`}
                              testParam={props.testParam}
                            />
                          );
                        } else if (plot.plotType === "histogram") {
                          return (
                            <Histogram
                              key={`plot-${plotIindex + 1}`}
                              plot={plot}
                              onChangeChannel={props.onChangeChannel}
                              enrichedFile={enrichedFile}
                              plotIndex={`${fileIndex + 1}-${plotIindex}`}
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
