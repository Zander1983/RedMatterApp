import Plot from "./Plot";
import Histogram from "./Histogram";
import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";
import { getWorkspace } from "graph/utils/workspace";
import { Button } from "@material-ui/core";

function Table(props) {
  console.log(">>> props.enrichedFiles is ", props.enrichedFiles);
  let controlEnrichedFile = props.enrichedFiles.find(
    (enrichedFile) => enrichedFile.isControlFile
  );

  let nonControlEnrichedFiles = props.enrichedFiles.filter(
    (enrichedFile) => !enrichedFile.isControlFile
  );

  let editedFiles = getWorkspace().workspaceState?.files;
  let editedFileIds = Object.keys(editedFiles);

  let allFileMinObj = props.enrichedFiles.map((enrichedFile) => {
    return { id: enrichedFile.fileId, name: enrichedFile.label };
  });

  return (
    <div>
      <div
        style={{
          color: "#fff",
          backgroundColor: "#66ccff",
          fontWeight: "bold",
          display: "flex",
          paddingLeft: "10px",
        }}
      >
        <div
          style={{
            width: "20%",
            order: 1,
          }}
        >
          PIPELINE 1
        </div>
        <div
          style={{
            width: "60%",
            order: 2,
            textAlign: "center",
          }}
        >
          CONTROL FILE
        </div>
        <div
          style={{
            width: "20%",
            order: 3,
          }}
        ></div>
      </div>
      <table className="workspace">
        <tbody style={{ width: "100%" }}>
          <tr>
            {controlEnrichedFile?.plots?.map((plot, plotIindex) => {
              return (
                <th key={`td-${plotIindex}`}>
                  <div
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    <p>
                      {plot.population != "All"
                        ? `${
                            controlEnrichedFile?.gateStats
                              .filter((gateStat) => {
                                return gateStat.gateName === plot.population;
                              })
                              .map((gateStat) => {
                                return gateStat && gateStat.percentage;
                              }).length === 0
                              ? "0.00"
                              : controlEnrichedFile?.gateStats
                                  .filter((gateStat) => {
                                    return (
                                      gateStat.gateName === plot.population
                                    );
                                  })
                                  .map((gateStat) => {
                                    return gateStat && gateStat.percentage;
                                  })
                          }%`
                        : controlEnrichedFile?.label}
                    </p>
                    {/* {controlEnrichedFile.label} */}
                  </div>
                  {(() => {
                    if (plot?.plotType === "scatter") {
                      return (
                        <Plot
                          name="control-file"
                          key={`plot-${plotIindex}`}
                          plot={plot}
                          enrichedFile={controlEnrichedFile}
                          onAddGate={props.onAddGate}
                          onDeleteGate={props.onDeleteGate}
                          onEditGate={props.onEditGate}
                          onResize={props.onResize}
                          onChangeChannel={props.onChangeChannel}
                          plotIndex={`0-${plotIindex}`}
                          downloadPlotAsImage={props.downloadPlotAsImage}
                          testParam={props.testParam}
                        />
                      );
                    } else if (plot?.plotType === "histogram") {
                      let enrichedOverlayFiles;
                      if (plot.overlays && plot.overlays.length > 0) {
                        enrichedOverlayFiles = props.enrichedFiles.filter(
                          (enrichedFile) => {
                            //
                            return (
                              plot.overlays.findIndex(
                                (x) => x.id == enrichedFile.fileId
                              ) > -1
                            );
                          }
                        );
                      }

                      return (
                        <Histogram
                          key={`plot-${plotIindex}`}
                          plot={plot}
                          onChangeChannel={props.onChangeChannel}
                          onAddGate={props.onAddGate}
                          addOverlay={props.addOverlay}
                          onDeleteGate={props.onDeleteGate}
                          onEditGate={props.onEditGate}
                          enrichedFile={controlEnrichedFile}
                          enrichedOverlayFiles={enrichedOverlayFiles}
                          allFileMinObj={allFileMinObj}
                          plotIndex={`0-${plotIindex}`}
                          downloadPlotAsImage={props.downloadPlotAsImage}
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        marginRight: "10px",
                        backgroundColor: `${
                          plotIindex > 0
                            ? controlEnrichedFile.plots[plotIindex - 1].gate
                                .color
                            : "#000000"
                        }`,
                        width: "15px",
                        height: "15px",
                      }}
                    ></div>
                    <div>
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
                    </div>
                  </div>
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
                  border:
                    editedFileIds.includes(enrichedFile.fileId) &&
                    "4px solid #FCBA05",
                }}
              >
                {enrichedFile.plots.map((plot, plotIindex) => {
                  return (
                    <td key={`td-${plotIindex + 1}`}>
                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        <p>
                          {plot.population != "All"
                            ? `${
                                enrichedFile.gateStats
                                  .filter((gateStat) => {
                                    return (
                                      gateStat.gateName === plot.population
                                    );
                                  })
                                  .map((gateStat) => {
                                    return gateStat && gateStat.percentage;
                                  }).length === 0
                                  ? "0.00"
                                  : enrichedFile.gateStats
                                      .filter((gateStat) => {
                                        return (
                                          gateStat.gateName === plot.population
                                        );
                                      })
                                      .map((gateStat) => {
                                        return gateStat && gateStat.percentage;
                                      })
                              }%`
                            : enrichedFile.label}
                        </p>

                        {plot.population === "All" &&
                          editedFileIds.includes(enrichedFile.fileId) && (
                            <Button
                              size="small"
                              variant="contained"
                              style={{
                                backgroundColor: "#fafafa",
                              }}
                              onClick={() =>
                                props.onResetToControl(enrichedFile.fileId)
                              }
                            >
                              Reset To Control
                            </Button>
                          )}
                      </div>
                      {(() => {
                        if (plot.plotType === "scatter") {
                          return (
                            <Plot
                              name="non-control-file"
                              key={`plot-${plotIindex + 1}`}
                              plot={plot}
                              enrichedFile={enrichedFile}
                              onAddGate={props.onAddGate}
                              onEditGate={props.onEditGate}
                              onResize={props.onResize}
                              onChangeChannel={props.onChangeChannel}
                              plotIndex={`${fileIndex + 1}-${plotIindex}`}
                              testParam={props.testParam}
                              downloadPlotAsImage={props.downloadPlotAsImage}
                            />
                          );
                        } else if (plot.plotType === "histogram") {
                          let enrichedOverlayFiles;
                          if (plot.overlays && plot.overlays.length > 0) {
                            enrichedOverlayFiles = props.enrichedFiles.filter(
                              (enrichedFile) => {
                                //
                                return (
                                  plot.overlays.findIndex(
                                    (x) => x.id == enrichedFile.fileId
                                  ) > -1
                                );
                              }
                            );
                          }
                          return (
                            <Histogram
                              key={`plot-${plotIindex + 1}`}
                              plot={plot}
                              onChangeChannel={props.onChangeChannel}
                              onAddGate={props.onAddGate}
                              onEditGate={props.onEditGate}
                              addOverlay={props.addOverlay}
                              enrichedFile={enrichedFile}
                              allFileMinObj={allFileMinObj}
                              enrichedOverlayFiles={enrichedOverlayFiles}
                              plotIndex={`${fileIndex + 1}-${plotIindex}`}
                              downloadPlotAsImage={props.downloadPlotAsImage}
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
