import React, { useEffect } from "react";
import {
  Divider,
  MenuItem,
  Select,
  CircularProgress,
  Button,
} from "@material-ui/core";
import { snackbarService } from "uno-material-ui";
import GateBar from "./plotui/gateBar";
import MainBar from "./plotui/mainBar";
import GetAppIcon from "@material-ui/icons/GetApp";
import CanvasComponent from "../canvas/CanvasComponent";
import Plot from "graph/renderers/plotRender";
import dataManager from "graph/dataManagement/dataManager";
import PlotData from "graph/dataManagement/plotData";
import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import useForceUpdate from "hooks/forceUpdate";
import RangeSliders from "./RangeSliders";

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

let interval: any = {};
var plotDownloadingFiles: any[] = [];
var filePlotIdDict: any = {};

function PlotComponent(props: {
  index: number;
  plot: Plot;
  plotIndex: string;
  plotFileId: string;
  plots: any;
  sharedWorkspace: boolean;
  experimentId: string;
}) {
  const [plotSetup, setPlotSetup] = React.useState(false);
  const [oldAxis, setOldAxis] = React.useState({
    x: null,
    y: null,
  });

  const setPlotType = (axis: "x" | "y", value: string) => {
    axis === "x"
      ? props.plot.plotData.setXAxisPlotType(value)
      : props.plot.plotData.setYAxisPlotType(value);
    rerender();
  };

  const rerender = useForceUpdate();
  var plot = props.plot;
  const xAxis = plot.plotData.xAxis;
  const yAxis = plot.plotData.yAxis;

  const displayRef = React.useRef();
  const barRef = React.useRef();

  const yPlotType = plot.plotData.yPlotType;
  const xPlotType = plot.plotData.xPlotType;

  const updatePlotSize = () => {
    if (displayRef === null || displayRef.current === null) return;
    //@ts-ignore
    const br = displayRef.current.getBoundingClientRect();
    //@ts-ignore
    const bar = barRef.current.getBoundingClientRect();
    return { w: br.width - 20, h: br.height - bar.height - 40 };
  };

  const plotUpdater = () => {
    if (props.plot && props.plot.plotData) {
      if (dataManager.ready()) {
        const plotDimensions = updatePlotSize();
        if (
          plotDimensions !== undefined &&
          plot !== undefined &&
          plot.plotData !== undefined
        )
          props.plot.plotData.setWidthAndHeight(
            plotDimensions.w,
            plotDimensions.h
          );

        plot = dataManager.getPlotRendererForPlot(plot.plotData.id);

        plot.draw();
      }
    }
  };

  const tryKillComponent = () => {
    try {
      dataManager.getPlotRendererForPlot(props.plotIndex);
    } catch {
      clearInterval(interval[props.plotIndex]);
      interval[props.plotIndex] = undefined;
    }
  };

  const setHistogram = (axis: "x" | "y", value: boolean) => {
    if (value) {
      axis === "x"
        ? setOldAxis({ ...oldAxis, y: yAxis })
        : setOldAxis({ ...oldAxis, x: xAxis });
      axis === "x"
        ? props.plot.plotData.xAxisToHistogram()
        : props.plot.plotData.yAxisToHistogram();
    } else {
      axis === "x"
        ? props.plot.plotData.setYAxis(oldAxis.y)
        : props.plot.plotData.setXAxis(oldAxis.x);

      props.plot.plotData.disableHistogram(axis);
    }
  };

  const isPlotHistogram = () => {
    return xAxis === yAxis;
  };

  const setAxis = (
    axis: "x" | "y",
    value: string,
    stopHist: boolean = false
  ) => {
    const otherAxisValue = axis === "x" ? yAxis : xAxis;
    if (value === otherAxisValue && !isPlotHistogram()) {
      setHistogram(axis === "x" ? "y" : "x", true);
    } else {
      if (isPlotHistogram() && !stopHist) {
        props.plot.plotData.setXAxis(value);
        props.plot.plotData.setYAxis(value);
      } else {
        axis === "x"
          ? props.plot.plotData.setXAxis(value)
          : props.plot.plotData.setYAxis(value);
      }
    }
    dataManager.updateWorkspace();
    rerender();
    props.plot.plotData.plotUpdated();
  };

  const isAxisDisabled = (axis: "x" | "y") => {
    return axis === "x" ? plot.plotData.yHistogram : plot.plotData.xHistogram;
  };

  const [lastSelectEvent, setLastSelectEvent] = React.useState(0);
  const [histogramOverlayOpen, setHistogramOverlayOpen] = React.useState(false);

  const handleSelectEvent = (e: any, axis: "x" | "y", func: Function) => {
    if (lastSelectEvent + 500 < new Date().getTime()) {
      func(e);
      setLastSelectEvent(new Date().getTime());
    }

    if (plot.plotData.xHistogram) setHistogram("x", true);
    else if (plot.plotData.yHistogram) setHistogram("y", true);
  };

  const [downloadedFiles, setDownloadedFiles] = React.useState(
    dataManager.downloaded
  );

  const [downloadingFiles, setDownloadingFiles] = React.useState(
    dataManager.downloadingFiles
  );

  var files = dataManager.files.filter((x) => x.id !== props.plotFileId);

  const addFile = (fileId: string, type: string, plotSource: string) => {
    addHistogrmOverlay(
      fileId,
      dataManager.getFile(fileId),
      true,
      {},
      type,
      plotSource
    );
  };

  const downloadFile = (fileId: string) => {
    dataManager.downloadFileEvents([fileId]);
    plotDownloadingFiles = plotDownloadingFiles.concat(fileId);
    snackbarService.showSnackbar(
      "Overlay will be added after file events download",
      "warning"
    );
  };

  const isDownloading = (fileId: string) => {
    let downloadingFileId = downloadingFiles.find((x) => x === fileId);
    if (downloadingFileId) return true;
    return false;
  };

  const isDownloaded = (fileId: string) => {
    let donwloadedFileId = downloadedFiles.find((x) => x.id === fileId);
    if (donwloadedFileId) return true;
    return false;
  };
  const [plotMoving, setPlotMoving] = React.useState(true);
  const updatePlotMovement = () => {
    dataManager.updateWorkspace();
    setPlotMoving(!dataManager.dragLock);
    rerender();
  };
  useEffect(() => {
    let updateWorkspaceListner = dataManager.addObserver(
      "updateWorkspace",
      () => {
        if (
          dataManager.letUpdateBeCalledForAutoSave &&
          props.plot &&
          props.plot.plotData &&
          (dataManager.redrawPlotIds.includes(props.plot?.plotData?.id) ||
            dataManager.redrawPlotIds.includes(
              props.plot?.plotData?.parentPlotId
            ))
        ) {
          plotUpdater();
          let inx = dataManager.redrawPlotIds.findIndex(
            (x) => x == props.plot.plotData.id
          );
          delete dataManager.redrawPlotIds[inx];
        }
      }
    );
    let workspaceDragLockListner = dataManager.addObserver(
      "workspaceDragLock",
      () => {
        if (
          dataManager.letUpdateBeCalledForAutoSave &&
          (dataManager.redrawPlotIds.includes(props.plot?.plotData?.id) ||
            dataManager.redrawPlotIds.includes(
              props.plot?.plotData?.parentPlotId
            ))
        ) {
          updatePlotMovement();
          let inx = dataManager.redrawPlotIds.findIndex(
            (x) => x == props.plot.plotData.id
          );
          delete dataManager.redrawPlotIds[inx];
        }
      }
    );
    let plotRemoveListner: any;
    if (!plotSetup) {
      //plot.plotData.addObserver("plotUpdated", () => rerender());
      plotRemoveListner = dataManager.addObserver(
        "removePlotFromWorkspace",
        () => {
          if (props.plot && props.plot.plotData) {
            let filePlotDataIds: any[] = filePlotIdDict
              ? Object.values(filePlotIdDict)
                ? Object.values(filePlotIdDict).map((x: any) => x.id)
                : []
              : [];
            let plots = dataManager.getAllPlots();
            let existingPlotDataIds = plots.map((x: any) => x.plotID);
            let plotData: any = [];
            plotData = plotData.concat(
              props.plot.plotData.histogramBarOverlays.filter(
                (x: any) =>
                  !existingPlotDataIds.includes(x.plotId) &&
                  !filePlotDataIds.includes(x.plotId)
              )
            );
            plotData = plotData.concat(
              props.plot.plotData.histogramOverlays.filter(
                (x: any) =>
                  !existingPlotDataIds.includes(x.plotId) &&
                  !filePlotDataIds.includes(x.plotId)
              )
            );
            if (plotData && plotData.length > 0) {
              props.plot.plotData.removeAnyOverlay(plotData[0].plotId);
              plotUpdater();
            }
          }

          tryKillComponent();
        }
      );

      plot.setup();
      setPlotSetup(true);
      plotUpdater();
    }

    let downloadedListner = dataManager.addObserver("updateDownloaded", () => {
      if (plotDownloadingFiles.length > 0) {
        let files = dataManager.downloaded.filter((x) =>
          plotDownloadingFiles.includes(x.id)
        );
        if (files && files.length > 0) {
          snackbarService.showSnackbar("Overlay added", "success");
          setTimeout(() => {
            addFile(
              files[0].id,
              filePlotIdDict[files[0].id].type,
              COMMON_CONSTANTS.FILE
            );
          }, 0);
          plotDownloadingFiles = plotDownloadingFiles.filter(
            (x) => x !== files[0].id
          );
        }
      }
      setDownloadedFiles(dataManager.downloaded);
    });

    let downloadingListner = dataManager.addObserver(
      "updateDownloadingFiles",
      () => {
        setDownloadingFiles(dataManager.downloadingFiles);
      }
    );

    window.addEventListener("click", (e) => {
      let event: any = e.target;
      if (event && event.id !== "hist_overlay") {
        setHistogramOverlayOpen(false);
      }
    });
    let fileHistOverlay: any = [];
    fileHistOverlay = fileHistOverlay.concat(
      props.plot.plotData.histogramBarOverlays
        .filter((x) => x.plotSource === COMMON_CONSTANTS.FILE)
        .map((y) => {
          return { histObj: y, type: COMMON_CONSTANTS.Bar };
        })
    );
    fileHistOverlay = fileHistOverlay.concat(
      props.plot.plotData.histogramOverlays
        .filter((x) => x.plotSource === COMMON_CONSTANTS.FILE)
        .map((y) => {
          return { histObj: y, type: COMMON_CONSTANTS.Line };
        })
    );
    for (let i = 0; i < fileHistOverlay.length; i++) {
      let obj = fileHistOverlay[i];
      filePlotIdDict[obj.histObj.plot.file.id] = {
        id: obj.histObj.plotId,
        type: obj.type,
      };
    }
    return () => {
      dataManager.removeObserver("updateDownloadingFiles", downloadingListner);
      dataManager.removeObserver("updateDownloaded", downloadedListner);
      dataManager.removeObserver("workspaceDragLock", workspaceDragLockListner);
      dataManager.removeObserver("updateWorkspace", updateWorkspaceListner);
      dataManager.removeObserver("removePlotFromWorkspace", plotRemoveListner);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let oldXAxisValue: string | null = null;
  let oldYAxisValue: string | null = null;

  const getMinMax = (ranges: [number, number], newRanges: [number, number]) => {
    let min = ranges[0] > newRanges[0] ? newRanges[0] : ranges[0];
    let max = ranges[1] > newRanges[1] ? ranges[1] : newRanges[1];
    return { min: min, max: max };
  };

  const handleMultiPlotHistogram = (
    plotSource: string,
    plotType: string,
    pltFlObj: any
  ) => {
    setHistogramOverlayOpen(false);
    switch (plotSource) {
      case COMMON_CONSTANTS.FILE:
        if (filePlotIdDict[pltFlObj.id] && filePlotIdDict[pltFlObj.id].id) {
          let plotObj = isHistogramSelected(filePlotIdDict[pltFlObj.id].id);
          let plotData = plotObj.plot.plot;
          if (plotObj.type === plotType) {
            removeOverlayAsPerType(plotType, plotData.id);
            filePlotIdDict[pltFlObj.id] = null;
          } else {
            addOverlayAsPerType(
              plotType,
              plotData,
              plotObj.plot.color,
              COMMON_CONSTANTS.FILE
            );
          }
        } else {
          if (isDownloaded(pltFlObj.id)) {
            addFile(pltFlObj.id, plotType, COMMON_CONSTANTS.FILE);
          } else {
            if (!filePlotIdDict[pltFlObj.id])
              filePlotIdDict[pltFlObj.id] = { id: "", type: plotType };
            downloadFile(pltFlObj.id);
            return;
          }
        }
        break;
      case COMMON_CONSTANTS.PLOT:
        let plotData = pltFlObj.plotData;
        let plotObj = isHistogramSelected(plotData.id);
        if (plotObj) {
          if (plotObj.type === plotType) {
            removeOverlayAsPerType(plotType, plotData.id);
          } else {
            addOverlayAsPerType(
              plotType,
              pltFlObj.plotData,
              plotObj.plot.color,
              COMMON_CONSTANTS.PLOT
            );
          }
        } else {
          addHistogrmOverlay(
            plotData.id,
            plotData.file,
            false,
            pltFlObj.plotData,
            plotType,
            COMMON_CONSTANTS.PLOT
          );
        }
        break;
    }
    setTimeout(() => {
      plotUpdater();
    }, 0);
  };

  const addHistogrmOverlay = (
    id: string,
    file: any,
    addNewPlot: boolean,
    plotData: any = {},
    plotType: string,
    plotSource: string
  ) => {
    let newPlotData: any = {};
    if (addNewPlot) {
      newPlotData = new PlotData();
      newPlotData.file = file;
      newPlotData.setupPlot();
      newPlotData.getXandYRanges();
    } else {
      newPlotData = plotData;
    }

    let plotRanges = props.plot.plotData.ranges.get(props.plot.plotData.xAxis);
    let newPlotRanges = newPlotData.ranges.get(props.plot.plotData.xAxis);

    let obj = getMinMax(plotRanges, newPlotRanges);
    setAxisRange(obj.min, obj.max, props.plot.plotData.xAxis);

    addOverlayAsPerType(plotType, newPlotData, "", plotSource);

    if (addNewPlot) {
      if (!filePlotIdDict[id]) filePlotIdDict[id] = {};
      filePlotIdDict[id] = { id: newPlotData.id, type: plotType };
    }
  };

  const isHistogramSelected = (plotId: string) => {
    let plot1 = props.plot.plotData.histogramBarOverlays.find(
      (x) => x.plotId === plotId
    );
    let plot2 = props.plot.plotData.histogramOverlays.find(
      (x) => x.plotId === plotId
    );

    if (plot1) {
      return { type: COMMON_CONSTANTS.Bar, plot: plot1 };
    } else if (plot2) {
      return { type: COMMON_CONSTANTS.Line, plot: plot2 };
    }
    return null;
  };

  const isOptionSelected = (plotId: string, type: string = "") => {
    let plot = isHistogramSelected(plotId);
    if (plot && type === plot.type) {
      return "#6666aa";
    }
    return "#66d";
  };

  const getHistogramSelectedColor = (
    plotId: string,
    type: string = ""
  ): string => {
    let plot = isHistogramSelected(plotId);
    if (plot) {
      if (type) {
        if (type === plot.type) {
          return plot.plot.color;
        } else {
          return "#fff";
        }
      }
      return plot.plot.color;
    }

    return "#fff";
  };

  const handleHist = (targetAxis: "x" | "y") => {
    if (isPlotHistogram()) {
      plot.plotData.yHistogram = plot.plotData.xHistogram = false;
      if (targetAxis === "x") {
        const axis =
          oldYAxisValue && oldYAxisValue !== xAxis
            ? oldYAxisValue
            : plot.plotData.file.axes.filter((e) => e !== xAxis)[0];
        setAxis("y", axis, true);
      } else {
        const axis =
          oldXAxisValue && oldXAxisValue !== yAxis
            ? oldXAxisValue
            : plot.plotData.file.axes.filter((e) => e !== yAxis)[0];
        setAxis("x", axis, true);
      }
      rerender();
    } else {
      filePlotIdDict = {};
      props.plot.plotData.histogramBarOverlays = [];
      props.plot.plotData.histogramOverlays = [];
      if (targetAxis === "x") {
        oldYAxisValue = yAxis;
        setAxis("y", xAxis);
      } else {
        oldXAxisValue = xAxis;
        setAxis("x", yAxis);
      }
    }
  };

  const addOverlayAsPerType = (
    type: string,
    plotData: PlotData,
    color: string = "",
    plotSource: string = ""
  ) => {
    switch (type) {
      case COMMON_CONSTANTS.Bar:
        props.plot.plotData.addBarOverlay(
          plotData,
          color,
          plotData.id,
          plotSource
        );
        props.plot.plotData.removeOverlay(plotData.id);
        break;
      case COMMON_CONSTANTS.Line:
        props.plot.plotData.addOverlay(
          plotData,
          color,
          plotData.id,
          plotSource
        );
        props.plot.plotData.removeBarOverlay(plotData.id);
        break;
    }
  };

  const removeOverlayAsPerType = (type: string, plotDataId: string) => {
    switch (type) {
      case COMMON_CONSTANTS.Bar:
        props.plot.plotData.removeBarOverlay(plotDataId);
        break;
      case COMMON_CONSTANTS.Line:
        props.plot.plotData.removeOverlay(plotDataId);
        break;
    }
  };

  const [lastUpdate, setLastUpdate] = React.useState(null);
  const setAxisRange = (min: number, max: number, axis: string) => {
    if (min === 69 && max === 420) props.plot.plotData.resetOriginalRanges();
    else props.plot.plotData.ranges.set(axis, [min, max]);
    if (lastUpdate + 100 < new Date().getTime()) {
      dataManager.redrawPlotIds.push(props.plot.plotData.id);
      if (props.plot.plotData.parentPlotId) {
        dataManager.redrawPlotIds.push(props.plot.plotData.parentPlotId);
      }
      dataManager.updateWorkspace();
      setLastUpdate(new Date().getTime());
    }
  };
  const MINW = 10;
  const MINH = 12;
  const STDW = 15;
  const standardGridPlotItem = (index: number, plotData: any) => {
    let x = plotData.positions.x;
    let y = plotData.positions.y;
    let w = plotData.dimensions.w;
    let h = plotData.dimensions.h;
    return {
      x: x < 0 ? (index * STDW) % 30 : x,
      y: y < 0 ? 100 : y,
      w: w,
      h: h,
      minW: MINW,
      minH: MINH,
      isDraggable: plotMoving,
      // static: true,
    };
  };

  return (
    <div
      id={`display-ref-${props.plot.plotData.id}`}
      style={classes.mainContainer}
      ref={displayRef}
    >
      <div
        id={`bar-ref-${props.plot.plotData.id}`}
        style={classes.utilityBar}
        ref={barRef}
      >
        <MainBar
          plotIndex={props.plotIndex}
          plot={plot}
          rerender={rerender}
        ></MainBar>

        <Divider></Divider>

        <GateBar plot={plot}></GateBar>
        <Divider style={{ marginBottom: 10 }}></Divider>
      </div>

      <div
        className="plot-canvas"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="pc-y"
          style={{
            marginTop: 100,
            marginRight: 20,
            transform: "rotate(270deg)",
            height: "min-content",
            width: "2%",
            display: "flex",
          }}
        >
          <Select
            style={{
              width: 100,
              marginRight: 15,
              flex: "1 1 auto",
            }}
            onChange={(e) => {
              if (e.target.value === "hist") {
                handleHist("y");
                return;
              }
              handleSelectEvent(e, "y", (e: any) => {
                setAxis("y", e.target.value);
              });
            }}
            disabled={plot.plotData.xHistogram}
            value={yAxis}
          >
            {plot.plotData.file.axes.map((e: any) => (
              <MenuItem value={e}>{e}</MenuItem>
            ))}
            <Divider style={{ marginTop: 0, marginBottom: 5 }}></Divider>
            <MenuItem
              value={"hist"}
              style={{
                backgroundColor: isPlotHistogram() ? "#ddf" : "#fff",
              }}
            >
              Histogram
            </MenuItem>
          </Select>
          <Select
            style={{
              width: 100,
              marginRight: 15,
              flex: "1 1 auto",
            }}
            value={yPlotType}
            disabled={isAxisDisabled("y")}
            //@ts-ignore
            onChange={(e) => setPlotType("y", e.target.value)}
          >
            <MenuItem value={"lin"}>Linear</MenuItem>
            <MenuItem value={"bi"}>Logicle</MenuItem>
          </Select>
        </div>
        <div
          className="pc-x"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingRight: 0,
          }}
        >
          <RangeSliders plot={plot} />
          <CanvasComponent plot={plot} plotIndex={props.plotIndex} />
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div></div>
            <div>
              <Select
                style={{ width: 100, marginTop: "10px", flex: "1 1 auto" }}
                onChange={(e) => {
                  if (e.target.value === "hist") {
                    handleHist("x");
                    return;
                  }
                  handleSelectEvent(e, "x", (e: any) =>
                    setAxis("x", e.target.value)
                  );
                }}
                disabled={plot.plotData.yHistogram}
                value={xAxis}
              >
                {plot.plotData.file.axes.map((e: any) => (
                  <MenuItem value={e}>{e}</MenuItem>
                ))}
                <Divider style={{ marginTop: 0, marginBottom: 5 }}></Divider>
                <MenuItem
                  value={"hist"}
                  style={{
                    backgroundColor: isPlotHistogram() ? "#ddf" : "#fff",
                  }}
                >
                  Histogram
                </MenuItem>
              </Select>
              <Select
                style={{
                  width: 100,
                  marginTop: "10px",
                  marginLeft: 10,
                  flex: "1 1 auto",
                }}
                value={xPlotType}
                disabled={isAxisDisabled("x")}
                //@ts-ignore
                onChange={(e) => setPlotType("x", e.target.value)}
              >
                <MenuItem value={"lin"}>Linear</MenuItem>
                <MenuItem value={"bi"}>Logicle</MenuItem>
              </Select>
            </div>
            <div>
              {isPlotHistogram() ? (
                <div>
                  <Select
                    id="hist_overlay"
                    open={histogramOverlayOpen}
                    onClick={() => {
                      if (!histogramOverlayOpen) setHistogramOverlayOpen(true);
                    }}
                    style={{
                      marginTop: "10px",
                      marginLeft: "10px",
                    }}
                    value={"0"}
                  >
                    <MenuItem value={"0"}>Histogram overlays</MenuItem>
                    {props.plots.map((e: any) => (
                      <MenuItem
                        id="hist_overlay"
                        value={e}
                        style={{
                          backgroundColor: getHistogramSelectedColor(
                            e.plotData.id
                          ),
                        }}
                      >
                        <div
                          id="hist_overlay"
                          style={{
                            margin: -16,
                            paddingTop: 5,
                            paddingBottom: 5,
                            paddingRight: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <span
                            id="hist_overlay"
                            style={{
                              padding: 16,
                              width: "100%",
                            }}
                            onClick={() => {
                              let plotObj = isHistogramSelected(e.plotData.id);
                              if (plotObj && Object.keys(plotObj).length > 0) {
                                removeOverlayAsPerType(
                                  plotObj.type,
                                  plotObj.plot.plotId
                                );
                                setHistogramOverlayOpen(false);
                              }
                            }}
                          >
                            {e.plotData.label}
                          </span>
                          <span>
                            <Button
                              style={{
                                backgroundColor: isOptionSelected(
                                  e.plotData.id,
                                  COMMON_CONSTANTS.Bar
                                ),
                                color: "#fff",
                                fontSize: 13,
                              }}
                              onClick={() => {
                                handleMultiPlotHistogram(
                                  COMMON_CONSTANTS.PLOT,
                                  COMMON_CONSTANTS.Bar,
                                  e
                                );
                              }}
                            >
                              Bar
                            </Button>
                            <Button
                              style={{
                                backgroundColor: isOptionSelected(
                                  e.plotData.id,
                                  COMMON_CONSTANTS.Line
                                ),
                                color: "#fff",
                                fontSize: 13,
                                marginLeft: 20,
                              }}
                              onClick={() => {
                                handleMultiPlotHistogram(
                                  COMMON_CONSTANTS.PLOT,
                                  COMMON_CONSTANTS.Line,
                                  e
                                );
                              }}
                            >
                              line
                            </Button>
                          </span>
                        </div>
                      </MenuItem>
                    ))}
                    {files.map((e: any) => (
                      <MenuItem
                        id="hist_overlay"
                        value={e}
                        style={{
                          backgroundColor: getHistogramSelectedColor(
                            filePlotIdDict[e.id] ? filePlotIdDict[e.id].id : ""
                          ),
                        }}
                      >
                        <div
                          id="hist_overlay"
                          style={{
                            margin: -16,
                            paddingTop: 5,
                            paddingBottom: 5,
                            paddingRight: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <span
                            id="hist_overlay"
                            style={{
                              padding: 16,
                              width: "100%",
                            }}
                            onClick={() => {
                              if (
                                filePlotIdDict[e.id] &&
                                filePlotIdDict[e.id].id
                              ) {
                                let plotObj = isHistogramSelected(
                                  filePlotIdDict[e.id].id
                                );
                                if (plotObj) {
                                  removeOverlayAsPerType(
                                    plotObj.type,
                                    plotObj.plot.plotId
                                  );
                                  setHistogramOverlayOpen(false);
                                }
                                filePlotIdDict[e.id] = null;
                              }
                            }}
                          >
                            {e.label}
                          </span>
                          <Button
                            style={{
                              backgroundColor: isOptionSelected(
                                filePlotIdDict[e.id]
                                  ? filePlotIdDict[e.id].id
                                  : "",
                                COMMON_CONSTANTS.Bar
                              ),
                              color: "#fff",
                              fontSize: 13,
                            }}
                            onClick={() => {
                              handleMultiPlotHistogram(
                                COMMON_CONSTANTS.FILE,
                                COMMON_CONSTANTS.Bar,
                                e
                              );
                            }}
                          >
                            Bar
                            {isDownloaded(e.id) ? null : (
                              <div
                                style={{
                                  display: "flex",
                                }}
                              >
                                {isDownloading(e.id) ? (
                                  <CircularProgress
                                    style={{
                                      color: "white",
                                      width: 23,
                                      height: 23,
                                      marginLeft: 5,
                                    }}
                                  />
                                ) : (
                                  <GetAppIcon fontSize="small"></GetAppIcon>
                                )}
                              </div>
                            )}
                          </Button>
                          <Button
                            style={{
                              backgroundColor: isOptionSelected(
                                filePlotIdDict[e.id]
                                  ? filePlotIdDict[e.id].id
                                  : "",
                                COMMON_CONSTANTS.Line
                              ),
                              color: "#fff",
                              fontSize: 13,
                              marginLeft: 20,
                            }}
                            onClick={() => {
                              handleMultiPlotHistogram(
                                COMMON_CONSTANTS.FILE,
                                COMMON_CONSTANTS.Line,
                                e
                              );
                            }}
                          >
                            line
                            {isDownloaded(e.id) ? null : (
                              <div
                                style={{
                                  display: "flex",
                                }}
                              >
                                {isDownloading(e.id) ? (
                                  <CircularProgress
                                    style={{
                                      color: "white",
                                      width: 23,
                                      height: 23,
                                      marginLeft: 5,
                                    }}
                                  />
                                ) : (
                                  <GetAppIcon fontSize="small"></GetAppIcon>
                                )}
                              </div>
                            )}
                          </Button>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlotComponent;
