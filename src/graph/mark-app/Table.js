import Plot from "./Plot";
import Histogram from "./Histogram";
import React from "react";

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
