import { useEffect, useState, useRef } from "react";
import Plot from "./Plot";
import Histogram from "./Histogram";
import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";
//import drag from "assets/images/drag.png";
import { Button } from "@material-ui/core";
import { getGateName, getGateNameFriendly } from "./Helper";
import Draggable from "plain-draggable";
import LeaderLine from "react-leader-line";
import { Resizable } from "re-resizable";
// import AbcOutlinedIcon from "@mui/icons-material/AbcOutlined";
// import PanToolIcon from "@mui/icons-material/PanTool";
import ZoomOutMap from "@material-ui/icons/ZoomOutMap";

// import { PlainDraggable } from "plain-draggable";

import { DSC_SORT, ASC_SORT } from "./Helper";
import { Tooltip } from "@material-ui/core";
import { CodeOutlined } from "@ant-design/icons";

let getNumberOfPlots = (plotObject, nodes) => {
  let count = 0;
  let countLine = (plot) => {
    if (plot) {
      count++;

      if (plot.gates) {
        plot.gates?.map((p) => {
          countLine(p.plot);
        });
      }
    }
  };

  countLine(plotObject);

  return count;
};

let getLines = (els, draggables, plots) => {
  let linesArr = [];

  plots.map((plot, index) => {
    if (plot.gates) {
      plot.gates.map((gate, index) => {
        let el1 = els.find((el) => el.id == plot.population);
        let el2 = els.find((el) => el.id == gate.name);

        const line = new LeaderLine(el1, el2, {
          color: "grey",
          size: 2,
          // dash: { animation: true },
          startPlug: "disc",
          endPlug: "arrow1",
          path: "grid",
        });

        linesArr.push(line);

        //lines.push(line);
      });
    } else {
    }

    // it has gates so need to add lines to the draggable
    draggables[index].onMove = function () {
      linesArr?.forEach((l) => {
        l.position();
      });
    };
  });

  return linesArr;
};

function Table(props) {
  let [containerHeight, setContainerheight] = useState(355);
  let [draggingContainer, setDraggingContainer] = useState(false);
  let [heightStart, setHeightStart] = useState(false);
  const workspaceRef = useRef(null);
  const scrollToElement = () =>
    workspaceRef.current.scrollIntoView({
      behavior: "smooth",
    });

  let nodes = [];
  let draggables = [];
  let lines = [];

  useEffect(() => {
    let els = [];

    let controlEnrichedFile = props.enrichedFiles.find(
      (enrichedFile) => enrichedFile.isControlFile
    );

    controlEnrichedFile.plots.forEach((plot, index) => {
      let plotNode = nodes.find((node) => {
        return node?.id && node.id == plot.population;
      });

      //if (nodes.current[index]) {
      const el = plotNode;

      els.push(el);

      // let elDistanceToTop =
      //   window.pageYOffset +
      //   document.getElementById("workspace-container").getBoundingClientRect()
      //     .top;

      let elDistanceToTop = 130;

      const draggable = new Draggable(el, {
        left: plot.left,
        top: plot.top + elDistanceToTop,
        handle: el.children[0],
        autoScroll: false,
        //endSocket: "right",
        onMove: () => {
          //line1.position();
        },
        position: (pos) => {},
        onMoveStart: (newPosition) => {},
        onDrag: (newPosition) => {
          props.workspaceState.files[props.workspaceState.controlFileId].plots[
            index
          ].top = newPosition.top - elDistanceToTop;
          props.workspaceState.files[props.workspaceState.controlFileId].plots[
            index
          ].left = newPosition.left;

          plot.top = newPosition.top - elDistanceToTop;
          plot.left = newPosition.left;

          // controlEnrichedFile.plots.forEach((plot, index) => {

          // });
        },
      });

      draggables.push(draggable);
      //}
    });

    lines = getLines(els, draggables, controlEnrichedFile.plots);

    return () => {
      lines?.forEach((line) => {
        line.remove();
      });
    };
  }, [
    props.workspaceState.files[props.workspaceState.controlFileId].plots.length,
    props.workspaceState.onResize,
    containerHeight,
  ]);

  // let editedFiles = getWorkspace().workspaceState?.files;
  // let editedFileIds = Object.keys(editedFiles);

  let allFileMinObj = props.enrichedFiles.map((enrichedFile) => {
    return { id: enrichedFile.fileId, name: enrichedFile.label };
  });
  const [shouldFileRender, setShouldFileRender] = useState(
    props.workspaceState?.openFiles || []
  );

  const fileViewHideHandler = (fileId) => {
    props.onOpenFileChange({ fileId: fileId });
  };

  const tableRef = useRef(null);

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

  // useEffect(() => {
  //   tableRef.current.scrollBy({
  //     top: 0,
  //     left: +500,
  //     behavior: "smooth",
  //   });
  // }, [controlEnrichedFile?.plots?.length]);

  let openEnrichedFile = props.enrichedFiles.find(
    (enrichedFile) => enrichedFile.fileId == props.workspaceState.openFile
  );

  const renderPlots = (plotObject) => {
    if (plotObject) {
      return (
        <>
          <div>{plotObject.population}</div>
        </>
      );
    }

    {
      plotObject.gates.map((gate, gateIndex) => {
        plotObject(gate.plot);
      });
    }
  };

  const handleResize = (pos) => {
    lines?.forEach((line) => {
      line.position();
    });
  };

  function PlotRender({ plots: plots, node: node }) {
    const mappedPlots = plots.map((plot) => plot.top);
    const maxTop = Math.max.apply(null, mappedPlots);

    return (
      <div>
        <div
          id="workspace-container"
          style={{
            height: props.workspaceState.workspaceContainerHeight,
          }}
        >
          {plots?.map((plot, plotIindex) => {
            return (
              <div
                ref={(element) => {
                  if (element) {
                    return nodes.push(element);
                  }
                }}
                className="node"
                // onResize={handleResize}
                id={plot.population}
                key={"resizable-plot-" + plotIindex}
              >
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      flex: "1",
                    }}
                  >
                    <ZoomOutMap
                      style={{ marginTop: 3, marginLeft: 3 }}
                    ></ZoomOutMap>
                  </div>
                  <div
                    style={{
                      flex: "1",
                    }}
                  >
                    {getGateNameFriendly(plot.population)}
                  </div>
                </div>

                {(() => {
                  if (plot.plotType === "scatter") {
                    return (
                      <Plot
                        name="control-file"
                        key={`plot-${plotIindex}`}
                        plot={plot}
                        enrichedFile={openEnrichedFile}
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
                  } else {
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
                        enrichedFile={openEnrichedFile}
                        workspaceState={props.workspaceState}
                        allFileMinObj={allFileMinObj}
                        enrichedOverlayFiles={enrichedOverlayFiles}
                        plotIndex={`0-${plotIindex}`}
                        downloadPlotAsImage={props.downloadPlotAsImage}
                      />
                    );
                  }
                })()}
              </div>
            );
          })}
        </div>

        <div id="dragger-wrapper">
          <img
            // onClick={() => {
            //   props.sortByGate(plot.population, DSC_SORT);
            // }}
            src={upArrow}
            alt="up-arrow"
            title="Drag to make workspace bigger"
            style={{
              width: 20,
              // cursor: "pointer",
              display: "block",
              margin: "auto",
            }}
          />

          <div
            id="dragger-container"
            style={{
              height: "25px",
              backgroundColor: "#333",
              cursor: "grab",
            }}
            onMouseDown={(e) => {
              setDraggingContainer(true);
              setHeightStart(e.clientY);
            }}
            onMouseMove={(e) => {
              if (draggingContainer) {
                let workspaceContainer = document.getElementById(
                  "workspace-container"
                );

                // let containerHeight = parseFloat(
                //   workspaceContainer.style.height.substring(
                //     0,
                //     workspaceContainer.style.height.length - 2
                //   )
                // );

                // // 480 is the original height of dragger-container from the top of the window
                // // 355 is the oringinal height of container-workspace

                let diff = e.clientY - heightStart;

                let newHeight = diff + containerHeight;

                workspaceContainer.style.height = newHeight + "px";

                props.workspaceState.workspaceContainerHeight = newHeight;
              }
            }}
            onMouseUp={(e) => {
              let workspaceContainer = document.getElementById(
                "workspace-container"
              );

              let containerNewHeight = parseFloat(
                workspaceContainer.style.height.substring(
                  0,
                  workspaceContainer.style.height.length - 2
                )
              );

              setContainerheight(containerNewHeight);

              setDraggingContainer(false);
            }}
            // setContainerheight(newHeight);
            onMouseLeave={(e) => {
              let workspaceContainer = document.getElementById(
                "workspace-container"
              );

              let containerNewHeight = parseFloat(
                workspaceContainer.style.height.substring(
                  0,
                  workspaceContainer.style.height.length - 2
                )
              );

              setContainerheight(containerNewHeight);

              setDraggingContainer(false);
              setDraggingContainer(false);
            }}
          >
            {/* <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={drag}
              // alt="down-arrow"
              style={{
                height: 20,
              }}
            />
          </div> */}
          </div>
        </div>
        <img
          src={downArrow}
          alt="down-arrow"
          title="Drag to make workspace bigger"
          style={{
            width: 20,
            // cursor: "pointer",
            display: "block",
            margin: "auto",
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          color: "#000",
          backgroundColor: "#f2f2f2",
          fontWeight: "bold",
          display: "flex",
          paddingLeft: "10px",
        }}
        ref={workspaceRef}
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
          {openEnrichedFile.fileId == props.workspaceState.controlFileId ? (
            <>
              <span
                style={{
                  color: "#ff8080",
                }}
              >
                CONTROL FILE
              </span>
              <span> - {openEnrichedFile.fileId}</span>
            </>
          ) : (
            <span>{openEnrichedFile.fileId}</span>
          )}
        </div>
        <div
          style={{
            width: "20%",
            order: 3,
          }}
        ></div>
      </div>
      {PlotRender({
        plots: openEnrichedFile.plots,
      })}

      <table
        style={{
          maxWidth: "100%",
          overflowX: "auto",
          scrollBhavior: "smooth",
          display: "block",
          padding: "5px",
        }}
        className="workspace"
        ref={tableRef}
      >
        <tbody>
          <tr>
            {openEnrichedFile.plots.map((plot, plotIindex) => {
              return (
                <td
                  key={`td-population-sorter-${plotIindex}`}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    // minWidth: plot.width + 170,
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
                        // backgroundColor: `${
                        //   plotIindex > 0
                        //     ? controlEnrichedFile.plots[plotIindex - 1].gate
                        //         .color
                        //     : "#000000"
                        // }`,
                        width: "15px",
                        height: "15px",
                      }}
                    ></div>
                    <div>
                      {getGateNameFriendly(plot.population)}
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
          {props.enrichedFiles.map((enrichedFile, fileIndex) => {
            // LOOPING THROUGH NON-CONTROL FILES
            return (
              <tr key={`tr-${fileIndex}`}>
                {enrichedFile.plots.map((plot, plotIindex) => {
                  let backgroundColor =
                    enrichedFile.fileId == props.workspaceState.openFile
                      ? "#f2f2f2"
                      : "#fff";
                  let disableView =
                    enrichedFile.fileId == props.workspaceState.openFile
                      ? true
                      : false;
                  return (
                    <td
                      key={`td-${plotIindex + 1}`}
                      id={`entire-canvas-${fileIndex + 1}-${plotIindex}`}
                      style={{
                        margin: 0.5,
                        border: "1px solid gray",
                        backgroundColor: backgroundColor,
                        // minWidth: plot.width + 170,
                      }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {plot.population == "All" && (
                          <Tooltip
                            title={
                              plot.population === "All" &&
                              enrichedFile?.label.length > 21
                                ? enrichedFile?.label
                                : ""
                            }
                          >
                            <div>
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
                                {props.workspaceState.controlFileId ==
                                  enrichedFile.fileId && (
                                  <span
                                    style={{
                                      color: "#ff8080",
                                    }}
                                  >
                                    (C)
                                  </span>
                                )}

                                {enrichedFile.label}
                              </div>
                              <span
                                style={{
                                  fontSize: "10px",
                                }}
                              >
                                {" " +
                                  enrichedFile.enrichedEvents.length +
                                  " events"}
                              </span>
                              <br />

                              <span
                                onClick={() => {
                                  fileViewHideHandler(enrichedFile?.fileId);
                                  scrollToElement();
                                }}
                                style={{
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                  paddingRight: 5,
                                  color: "#1890ff",
                                }}
                                disabled={disableView}
                              >
                                View
                              </span>
                            </div>
                          </Tooltip>
                        )}

                        {plot.population != "All" && (
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
                            {enrichedFile.gateStats
                              .filter((gateStat) => {
                                return gateStat.gateName === plot.population;
                              })

                              .map((gateStat) => {
                                return gateStat && gateStat.percentage;
                              })}
                            %
                            {plot.edited && (
                              <span
                                style={{
                                  color: "#f8929a",
                                }}
                              >
                                ***
                              </span>
                            )}
                          </div>
                        )}
                      </div>
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
