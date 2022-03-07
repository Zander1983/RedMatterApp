import Plot from "./Plot";
import Histogram from "./Histogram";
import React from "react";
import { Divider, Grid } from "@material-ui/core";
import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";

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
    <div>
      <div
        style={{
          color: "#fff",
          backgroundColor: "#66ccff",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        CONTROL FILE
      </div>

      <table className="workspace">
        <tbody style={{ width: "100%" }}>
          <tr>
            {controlEnrichedFile.plots.map((plot, plotIindex) => {
              return (
                <th key={`td-${plotIindex}`}>
                  <div
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {controlEnrichedFile.label}
                  </div>
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
        </tbody>
      </table>
      <div
        style={{
          color: "#000",
          backgroundColor: "#ffff99",
          border: "1px solid #000",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        OTHER FILES
      </div>
      <table>
        <tbody>
          <tr
            style={{
              border: "1px solid #32a1ce",
            }}
          >
            {controlEnrichedFile.plots.map((plot, plotIindex) => {
              return (
                <td
                  key={`td-population-sorter-${plotIindex}`}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {plot.population}
                  <img
                    onClick={() => {
                      props.sortByGate(plot.population, "asc");
                    }}
                    src={downArrow}
                    alt="down-arrow"
                    style={{
                      width: 10,
                      marginLeft: 5,
                      cursor: "pointer",
                    }}
                  />
                  <img
                    onClick={() => {
                      props.sortByGate(plot.population, "dsc");
                    }}
                    src={upArrow}
                    alt="up-arrow"
                    style={{
                      width: 10,
                      marginLeft: 5,
                      cursor: "pointer",
                    }}
                  />
                </td>
              );
            })}
          </tr>
          {nonControlEnrichedFiles.map((enrichedFile, fileIndex) => {
            // LOOPING THROUGH NON-CONTROL FILES
            return (
              <tr
                key={`tr-${fileIndex}`}
                style={{
                  border: "4px solid #32a1ce",
                }}
              >
                {enrichedFile.plots.map((plot, plotIindex) => {
                  return (
                    <td
                      style={{
                        paddingLeft: 15,
                      }}
                      key={`td-${plotIindex + 1}`}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {plot.population != "All"
                          ? `${enrichedFile.gateStats
                              .filter((gateStat) => {
                                return gateStat.gateName == plot.population;
                              })
                              .map((gateStat) => {
                                return gateStat && gateStat.percentage;
                              })}%`
                          : enrichedFile.label}
                      </div>
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
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
