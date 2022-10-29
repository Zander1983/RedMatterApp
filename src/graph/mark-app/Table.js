import { useEffect, useState, useRef } from "react";
import Plot from "./Plot";
import Histogram from "./Histogram";
import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";
import { Select, MenuItem } from "@material-ui/core";
import {
  getGateName,
  getGateNameFriendly,
  getPlotsForFileFromWorkspaceState,
  hasCustomGate,
} from "./Helper";
import Draggable from "plain-draggable";
import LeaderLine from "react-leader-line";
import { Resizable } from "re-resizable";
import ZoomOutMap from "@material-ui/icons/ZoomOutMap";
import DeleteIcon from "@material-ui/icons/Delete";

import { DSC_SORT, ASC_SORT } from "./Helper";
import { Tooltip } from "@material-ui/core";
import GridTable from "@nadavshaar/react-grid-table";

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
  console.log("props are ", props);
  let [containerHeight, setContainerheight] = useState(500);
  let [draggingContainer, setDraggingContainer] = useState(false);
  let [heightStart, setHeightStart] = useState(false);
  let [clearAnyPoints, setClearAnyPoints] = useState(false);
  let [columns, setColumns] = useState([]);
  let [rows, setRows] = useState([]);

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

    // let controlEnrichedFile = props.enrichedFiles.find(
    //   (enrichedFile) => enrichedFile.isControlFile
    // );

    let plots = getPlotsForFileFromWorkspaceState(null, props.workspaceState);

    plots.forEach((plot, index) => {
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

      let elDistanceToTop = 150;

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
          props.workspaceState.plots[index].top =
            newPosition.top - elDistanceToTop;
          props.workspaceState.plots[index].left = newPosition.left;

          plot.top = newPosition.top - elDistanceToTop;
          plot.left = newPosition.left;

          // controlEnrichedFile.plots.forEach((plot, index) => {

          // });
        },
      });

      draggables.push(draggable);
      //}
    });

    lines = getLines(els, draggables, plots);

    return () => {
      lines?.forEach((line) => {
        line.remove();
      });
    };
  }, [
    props.workspaceState.plots.length,
    props.workspaceState.onResize,
    containerHeight,
  ]);

  const allCol = ({
    tableManager,
    value,
    field,
    data,
    column,
    colIndex,
    rowIndex,
  }) => {
    return (
      <div
        className="rgt-cell-inner"
        style={{
          display: "flex",
          // alignItems: "center",
          // overflow: "hidden",
          flexDirection: "column",
        }}
      >
        {/* <img src={data.avatar} alt="user avatar" /> */}
        <div
          className="rgt-text-truncate"
          style={{
            fontWeight: "bold",
          }}
        >
          {data.fileId}
        </div>
        <div className="rgt-text-truncate" style={{ marginLeft: 10 }}>
          {data.numEvents} events
        </div>

        <div
          className="rgt-text-truncate"
          onClick={() => {
            fileViewHideHandler(data.fileId);
            scrollToElement();
          }}
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            paddingRight: 5,
            color: "#1890ff",
            display: "block",
          }}
        >
          View
        </div>
      </div>
    );
  };

  const gateCols = ({
    tableManager,
    value,
    field,
    data,
    column,
    colIndex,
    rowIndex,
  }) => {
    console.log("value is ", value);
    console.log("field is ", field);
    console.log("data is ", data);
    return (
      <div
        className="rgt-cell-inner"
        style={{
          display: "flex",
          // alignItems: "center",
          // overflow: "hidden",
          flexDirection: "column",
        }}
      ></div>
    );
  };

  //({tableManager, column, mode, ref, checked, disabled, indeterminate, onChange}) => ( children )
  const headerCellRenderer = ({
    tableManager,
    column,
    mode,
    ref,
    checked,
    disabled,
    indeterminate,
    onChange,
  }) => {
    return (
      <div
        className="rgt-cell-inner"
        style={{
          display: "flex",
          alignItems: "center",
          // overflow: "hidden",
          // flexDirection: "column",
          textAlign: "center",
        }}
      >
        <div
          height="10"
          width="12"
          style={{
            display: column.color ? "inlineBlock" : "none",
            backgroundColor: column.color,
            padding: "8px",
            marginRight: "2px",
          }}
        ></div>
        <div
          // className="rgt-text-truncate"
          style={{
            fontWeight: "bold",
          }}
        >
          {column.label}
        </div>
      </div>
    );

    //   <div
    //   height="10"
    //   width="12"
    //   style={{
    //     display:
    //       plot.population != "All" ? "inlineBlock" : "none",
    //     backgroundColor: plot.color,
    //     padding: "8px",
    //     marginRight: "2px",
    //   }}
    // ></div>
    //headerCellRenderer
  };
  useEffect(() => {
    let cols = [];
    let col;
    props.workspaceState.plots.map((plot, plotIindex) => {
      col = {
        id: plotIindex + 1,
        field: plot.population,
        // numEvents: "",
        label: getGateNameFriendly(plot.population),
        color: getGateNameFriendly(plot.color),
      };

      if (plotIindex == 0) {
        col.cellRenderer = allCol;
      } else {
        col.sortable = true;
        col.cellRenderer = gateCols;
      }

      col.headerCellRenderer = headerCellRenderer;

      if (plot.colWidth) {
        col.width = plot.colWidth;
      }

      cols.push(col);
    });

    setColumns(cols);

    let localRows = [];
    let row;

    console.log("befpre props.enrichedFiles.map!!!!!!!!!!!");
    props.enrichedFiles.map((file, fileIndex) => {
      row = {
        fileId: file.fileId,
        id: fileIndex,
        numEvents: file.enrichedEvents.length,
      };

      console.log(">>>>>>>>file.gateStats is ", file.gateStats);

      file.plots.map((plot, plotIindex) => {
        //columns.forEach(column => {
        row.color = plot.color;
        if (
          file.gateStats &&
          file.gateStats.length > 0 &&
          file.gateStats.find(
            (gateStat) => gateStat.gateName == plot.population
          )
        ) {
          // row[plot.population] =
          //   file.gateStats.find(
          //     (gateStat) => gateStat.gateName == plot.population
          //   ).percentage + "%";

          row[plot.population] = file.gateStats.find(
            (gateStat) => gateStat.gateName == plot.population
          );
        }

        //});
      });

      // each plot is a row
      localRows.push(row);
    });

    setRows(localRows);
  }, [props.workspaceState.plots.length]);

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

    return (
      <div>
        <div
          id="workspace-container"
          style={{
            height: props.workspaceState.workspaceContainerHeight,
          }}
          onMouseDown={(e) => {
            if (e.target.id == "workspace-container") {
              setClearAnyPoints(!clearAnyPoints);
            }
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
                        onChangeGateName={props.onChangeGateName}
                        onAddGate={props.onAddGate}
                        onDeleteGate={props.onDeleteGate}
                        onEditGate={props.onEditGate}
                        onEditGateNamePosition={props.onEditGateNamePosition}
                        onResize={props.onResize}
                        onChangeChannel={props.onChangeChannel}
                        plotIndex={`0-${plotIindex}`}
                        downloadPlotAsImage={props.downloadPlotAsImage}
                        clearAnyPoints={clearAnyPoints}
                        onRangeChange={props.onRangeChange}
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
                        onChangeGateName={props.onChangeGateName}
                        onAddGate={props.onAddGate}
                        onDeleteGate={props.onDeleteGate}
                        onEditGate={props.onEditGate}
                        onEditGateNamePosition={props.onEditGateNamePosition}
                        addOverlay={props.addOverlay}
                        enrichedFile={openEnrichedFile}
                        workspaceState={props.workspaceState}
                        allFileMinObj={allFileMinObj}
                        enrichedOverlayFiles={enrichedOverlayFiles}
                        plotIndex={`0-${plotIindex}`}
                        downloadPlotAsImage={props.downloadPlotAsImage}
                        onRangeChange={props.onRangeChange}
                        clearAnyPoints={clearAnyPoints}
                      />
                    );
                  }
                })()}
              </div>
            );
          })}
        </div>

        <div
          id="dragger-wrapper"
          style={{
            height: 65,
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

              // // 480 is the original height of dragger-container from the top of the window
              // // 355 is the oringinal height of container-workspace
              let diff = e.clientY - heightStart;

              let newHeight = diff + containerHeight;

              workspaceContainer.style.height = newHeight + "px";
              // props.workspaceState.workspaceContainerHeight = newHeight;
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
          <img
            // onClick={() => {
            //   props.sortByGate(plot.population, DSC_SORT);
            // }}
            src={upArrow}
            alt="up-arrow"
            title="Drag to make workspace bigger"
            style={{
              width: 20,
              height: 20,
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
              color: "#fff",
              textAlign: "center",
            }}
          >
            Drag to expand workspace
          </div>
          <img
            src={downArrow}
            alt="down-arrow"
            title="Drag to make workspace bigger"
            style={{
              width: 20,
              height: 20,
              // cursor: "pointer",
              display: "block",
              margin: "auto",
            }}
          />
        </div>
      </div>
    );
  }

  //     {
  //         "id": 2,
  //         "username": "dbraddon2",
  //         "gender": "Female",
  //         "last_visited": "16/07/2018",
  //         "test": {"x": 3, "y": 4},
  //         "avatar":"https://robohash.org/etsedex.bmp?size=32x32&set=set1"
  //     },
  //     {
  //         "id": 3,
  //         "username": "dridett3",
  //         "gender": "Male",
  //         "last_visited": "20/11/2016",
  //         "test": {"x": 5, "y": 8},
  //         "avatar":"https://robohash.org/inimpeditquam.bmp?size=32x32&set=set1"
  //     },
  //     {
  //         "id": 4,
  //         "username": "gdefty6",
  //         "gender": "Female",
  //         "last_visited": "03/08/2019",
  //         "test": {"x": 7, "y": 4},
  //         "avatar":"https://robohash.org/nobisducimussaepe.bmp?size=32x32&set=set1"
  //     },
  //     {
  //         "id": 5,
  //         "username": "hbeyer9",
  //         "gender": "Male",
  //         "last_visited": "10/10/2016",
  //         "test": {"x": 2, "y": 2},
  //         "avatar":"https://robohash.org/etconsequatureaque.jpg?size=32x32&set=set1"
  //     }
  // ];

  // rows = [
  //   {
  //     fileId: "Single_stainings_Zombie_auqa_CD14_CD19_BV510_002.fcs",
  //     id: 0,
  //     All: "11.19",
  //     pop1timestamp1667026776138: "11.19",
  //     pop2timestamp1667026784822: "11.19",
  //   },
  //   {
  //     fileId: "Single stainings_Siglec-7 APC-Vio770_013.fcs",
  //     id: 1,
  //     All: "10.35",
  //     pop1timestamp1667026776138: "10.35",
  //     pop2timestamp1667026784822: "10.35",
  //   },
  //   {
  //     fileId: "Single stainings_Unstained_001.fcs",
  //     id: 2,
  //     All: "11.59",
  //     pop1timestamp1667026776138: "11.59",
  //     pop2timestamp1667026784822: "11.59",
  //   },
  // ];

  // columns = [
  //   {
  //     id: 1,
  //     field: "All",
  //     label: "All",
  //   },
  //   {
  //     id: 2,
  //     field: "pop1timestamp1667026776138",
  //     label: "pop1",
  //   },
  //   {
  //     id: 3,
  //     field: "pop2timestamp1667026784822",
  //     label: "pop2",
  //   },
  // ];

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
          <span>{openEnrichedFile.fileId}</span>
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

      <Select
        disableUnderline
        style={{
          // width: props.plot.width * 0.6,
          textAlign: "center",
          flex: "1 1 auto",
          fontSize: 12,
        }}
        // onChange={(e) => {
        //   props.onChange(
        //     { value: e.target.value },
        //     "x",
        //     props.plotIndex.split("-")[1]
        //   );
        // }}
        // value={props.plot.xAxisIndex}
      >
        <MenuItem key={1} name={"Percentage"} value={"Percentage"}>
          Percentage
        </MenuItem>
        <MenuItem key={2} name={"Count"} value={"Count"}>
          Count
        </MenuItem>
        <MenuItem key={3} name={"Mean"} value={"Mean"}>
          Mean
        </MenuItem>
        <MenuItem key={4} name={"Median"} value={"Median"}>
          Median
        </MenuItem>
      </Select>

      <GridTable
        showSearch={false}
        showRowsInformation={false}
        columns={columns}
        rows={rows}
        onColumnsChange={(res) => {
          //console.log("in onColumnsChange, res is ", res);
        }}
        onColumnResizeEnd={(res) => {
          //field
          props.onChangeColWidth(res.column.field, res.column.width);
          //onChangeColWidth
        }}
      />
    </div>
  );
}

export default Table;
