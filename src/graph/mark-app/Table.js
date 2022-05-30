import { useEffect, useState } from "react";
import Plot from "./Plot";
import Histogram from "./Histogram";
import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";
import { Button } from "@material-ui/core";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import { DSC_SORT, ASC_SORT } from "./Helper";
import { Tooltip } from "@material-ui/core";

function Table(props) {
  let controlEnrichedFile = props.enrichedFiles.find(
    (enrichedFile) => enrichedFile.isControlFile
  );

  let nonControlEnrichedFiles = props.enrichedFiles.filter(
    (enrichedFile) => !enrichedFile.isControlFile
  );

  // let editedFiles = getWorkspace().workspaceState?.files;
  // let editedFileIds = Object.keys(editedFiles);

  let allFileMinObj = props.enrichedFiles.map((enrichedFile) => {
    return { id: enrichedFile.fileId, name: enrichedFile.label };
  });
  const [shouldFileRender, setShouldFileRender] = useState(
    props.workspaceState?.openFiles || []
  );

  const fileViewHideHandler = (fileId) => {
    if (shouldFileRender.includes(fileId)) {
      setShouldFileRender((prev) => prev.filter((item) => item !== fileId));
    } else {
      setShouldFileRender((prev) => [...prev, fileId]);
    }
    setTimeout(() => WorkspaceDispatch.UpdateOpenFiles(fileId, false), 0);
  };

  useEffect(() => {
    setShouldFileRender(props.workspaceState.openFiles || []);
    if (props.workspaceState.sortingState?.sortingState) {
      props.sortByGate(
        props.workspaceState.sortingState?.gateName,
        props.workspaceState.sortingState?.sortingState
      );
    } else {
      // const files = props.workspaceState.files;
      // const newFiles = [];
      // for (const id of props.workspaceState.fileIds) {
      //   newFiles.push(files.find((file) => file.id === id));
      // }
      // WorkspaceDispatch.SetFiles(newFiles);
    }
  }, []);

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
        ></div>
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
      <table
        style={{ maxWidth: "100%", overflowX: "auto", display: "block" }}
        className="workspace"
      >
        <tbody>
          <tr>
            {controlEnrichedFile?.plots?.map((plot, plotIindex) => {
              return (
                <th
                  id={`entire-canvas-0-${plotIindex}`}
                  key={`td-${plotIindex}`}
                >
                  <Tooltip
                    title={
                      plot.population === "All" &&
                      controlEnrichedFile?.label.length > 21
                        ? controlEnrichedFile?.label
                        : ""
                    }
                  >
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        maxWidth: plot.width,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        fontWeight: "bold",
                        margin: "auto",
                      }}
                    >
                      {plot.population !== "All"
                        ? `${controlEnrichedFile?.gateStats
                            .filter((gateStat) => {
                              return gateStat.gateName === plot.population;
                            })
                            .map((gateStat) => {
                              return gateStat && gateStat.percentage;
                            })}%`
                        : controlEnrichedFile?.label}
                    </div>
                  </Tooltip>

                  {(() => {
                    if (plot?.plotType === "scatter") {
                      return (
                        <Plot
                          name="control-file"
                          key={`plot-${plotIindex}`}
                          plot={plot}
                          enrichedFile={controlEnrichedFile}
                          workspaceState={props.workspaceState}
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
                          onResize={props.onResize}
                          enrichedFile={controlEnrichedFile}
                          workspaceState={props.workspaceState}
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
          <tr>
            <td colSpan="100">
              <div
                style={{
                  color: "#000",
                  backgroundColor: "#ffff99",
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: 5,
                  border: "1px solid #000",
                }}
              >
                {/* <span
                  style={{
                    float: "left",
                    marginLeft: 20,
                    cursor: shouldFileRender.length && "pointer",
                    color: shouldFileRender.length ? "#000" : "gray",
                    fontWeight: shouldFileRender.length ? "bolder" : "bold",
                  }}
                  onClick={() => {
                    if (shouldFileRender.length) {
                      setShouldFileRender([]);
                      WorkspaceDispatch.UpdateOpenFiles("", "close");
                    }
                  }}
                >
                  {"Close All"}
                </span>
                <span
                  style={{
                    float: "left",
                    marginLeft: 20,
                    cursor:
                      shouldFileRender.length !==
                        props.workspaceState.files.length - 1 && "pointer",
                    color:
                      shouldFileRender.length !==
                      props.workspaceState.files.length - 1
                        ? "#000"
                        : "gray",
                    fontWeight:
                      shouldFileRender.length !==
                      props.workspaceState.files.length - 1
                        ? "bolder"
                        : "bold",
                  }}
                  onClick={() => {
  
                    setShouldFileRender(
                      props.workspaceState.files
                        ?.map((file) => file?.id)
                        .filter(
                          (fileId) =>
                            fileId !== props.workspaceState.controlFileId
                        )
                    );
                    WorkspaceDispatch.UpdateOpenFiles("", "view");
                  }}
                >
                  {"View All"}
                </span> */}
                OTHER FILES
              </div>
            </td>
          </tr>
          <tr>
            {controlEnrichedFile.plots.map((plot, plotIindex) => {
              return (
                <td
                  key={`td-population-sorter-${plotIindex}`}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    minWidth: plot.width + 180,
                    padding: 5,
                    margin: 0.5,
                    border: "1px solid gray",
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
                          props.sortByGate(plot.population, ASC_SORT);
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
                          props.sortByGate(plot.population, DSC_SORT);
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
              <tr key={`tr-${fileIndex}`}>
                {enrichedFile.plots.map((plot, plotIindex) => {
                  return (
                    <td
                      key={`td-${plotIindex + 1}`}
                      id={`entire-canvas-${fileIndex + 1}-${plotIindex}`}
                      style={{
                        padding: 4,
                        border: "1px solid gray",
                        margin: 0.5,
                      }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        <Tooltip
                          title={
                            plot.population === "All" &&
                            enrichedFile?.label.length > 21
                              ? enrichedFile?.label
                              : ""
                          }
                        >
                          <div
                            style={{
                              whiteSpace: "nowrap",
                              width: plot.width + 170,
                              maxWidth: plot.width + 170,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              textAlign: "center",
                              fontWeight: "bold",
                              margin: "auto",
                            }}
                          >
                            {plot.population !== "All"
                              ? `${enrichedFile.gateStats
                                  .filter((gateStat) => {
                                    return (
                                      gateStat.gateName === plot.population
                                    );
                                  })

                                  .map((gateStat) => {
                                    return gateStat && gateStat.percentage;
                                  })}%`
                              : enrichedFile.label}
                          </div>
                        </Tooltip>

                        {/* {plot.population === "All" &&
                          editedFileIds.includes(enrichedFile.fileId) && (
                            <Button
                              size="small"
                              variant="contained"
                              style={{
                                backgroundColor: "#FCBA05",
                              }}
                              onClick={() =>
                                props.onResetToControl(enrichedFile.fileId)
                              }
                            >
                              Reset To Control
                            </Button>
                          )} */}
                      </div>

                      {shouldFileRender.includes(enrichedFile?.fileId) &&
                        (() => {
                          if (plot.plotType === "scatter") {
                            return (
                              <Plot
                                name="non-control-file"
                                key={`plot-${plotIindex + 1}`}
                                plot={plot}
                                enrichedFile={enrichedFile}
                                workspaceState={props.workspaceState}
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
                                onResize={props.onResize}
                                enrichedFile={enrichedFile}
                                workspaceState={props.workspaceState}
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
                <td
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    onClick={() => fileViewHideHandler(enrichedFile?.fileId)}
                    style={{
                      cursor: "pointer",
                      fontWeight: "bold",
                      paddingRight: 5,
                    }}
                  >
                    {shouldFileRender.includes(enrichedFile?.fileId)
                      ? "Hide"
                      : "View"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
