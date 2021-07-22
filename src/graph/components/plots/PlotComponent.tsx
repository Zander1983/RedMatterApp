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
import AxisBar from "./plotui/axisBar";
import GetAppIcon from "@material-ui/icons/GetApp";
import CanvasComponent from "../canvas/CanvasComponent";
import Plot from "graph/renderers/plotRender";
import dataManager from "graph/dataManagement/dataManager";
import FCSFile from "graph/dataManagement/fcsFile";
import PlotData from "graph/dataManagement/plotData";
import RangeResizeModal from "../modals/rangeResizeModal";
import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import { keys } from "lodash";
import { generateColor } from "graph/utils/color";
import { any } from "@amcharts/amcharts4/.internal/core/utils/Array";

interface overlayHistogram {
  color: string;
  plot: any;
}

const classes = {
  mainContainer: {
    width: "100%",
    height: "100%",
    padding: 10,
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

const nullOrUndefined = (obj: any) => {
  return obj === null || obj === undefined;
};

function useForceUpdate() {
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

interface Dictionary {
  [key: string]: string;
}

const minDrawInterval = 30;
let interval: any = {};
var plotDownloadingFiles: any[] = [];
var filePlotIdDict: any = {};

function PlotComponent(props: {
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
    axis == "x"
      ? props.plot.plotData.setXAxisPlotType(value)
      : props.plot.plotData.setYAxisPlotType(value);
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
    plot.plotData.setWidthAndHeight(br.width - 20, br.height - bar.height - 40);
  };

  const plotUpdater = () => {
    if (dataManager.ready()) {
      updatePlotSize();
      plot.draw();
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

  const setAxis = (axis: "x" | "y", value: string) => {
    const otherAxisValue = axis == "x" ? yAxis : xAxis;
    if (value == otherAxisValue && !isPlotHistogram()) {
      setHistogram(axis == "x" ? "y" : "x", true);
    } else {
      axis == "x"
        ? props.plot.plotData.setXAxis(value)
        : props.plot.plotData.setYAxis(value);
    }
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

  var files = dataManager.files.filter((x) => x.id != props.plotFileId);

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
    let downloadingFileId = downloadingFiles.find((x) => x == fileId);
    if (downloadingFileId) return true;
    return false;
  };

  const isDownloaded = (fileId: string) => {
    let donwloadedFileId = downloadedFiles.find((x) => x.id == fileId);
    if (donwloadedFileId) return true;
    return false;
  };

  useEffect(() => {
    if (interval[props.plotIndex] === undefined) {
      interval[props.plotIndex] = setInterval(() => {
        plotUpdater();
      }, 10);
    }
    if (!plotSetup) {
      plot.plotData.addObserver("plotUpdated", () => rerender());
      dataManager.addObserver("removePlotFromWorkspace", () => {
        if (props.plot && props.plot.plotData) {
          let filePlotDataIds: any[] = filePlotIdDict
            ? Object.values(filePlotIdDict)
              ? Object.values(filePlotIdDict).map((x: any) => x.id)
              : []
            : [];
          let existingPlotDataIds = props.plots.map((x: any) => x.plotData.id);
          let plotData: any = [];
          plotData = plotData.concat(
            props.plot.plotData.histogramBarOverlays.filter(
              (x: any) =>
                !existingPlotDataIds.includes(x.plot.id) &&
                !filePlotDataIds.includes(x.plot.id)
            )
          );
          plotData = plotData.concat(
            props.plot.plotData.histogramOverlays.filter(
              (x: any) =>
                !existingPlotDataIds.includes(x.plot.id) &&
                !filePlotDataIds.includes(x.plot.id)
            )
          );
          if (plotData && plotData.length > 0)
            props.plot.plotData.removeAnyOverlay(plotData[0].plotId);
        }

        tryKillComponent();
      });
      dataManager.addObserver("clearWorkspace", () => {
        clearInterval(interval[props.plotIndex]);
        interval[props.plotIndex] = undefined;
      });
      plot.setup();
      setPlotSetup(true);
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
            (x) => x != files[0].id
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
      if (event && event.id != "hist_overlay") {
        setHistogramOverlayOpen(false);
      }
    });
    let fileHistOverlay: any = [];
    fileHistOverlay = fileHistOverlay.concat(
      props.plot.plotData.histogramBarOverlays
        .filter((x) => x.plotSource == COMMON_CONSTANTS.FILE)
        .map((y) => {
          return { histObj: y, type: COMMON_CONSTANTS.Bar };
        })
    );
    fileHistOverlay = fileHistOverlay.concat(
      props.plot.plotData.histogramOverlays
        .filter((x) => x.plotSource == COMMON_CONSTANTS.FILE)
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
    };
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
          if (plotObj.type == plotType) {
            removeOverlayAsPerType(plotType, plotData);
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
          if (plotObj.type == plotType) {
            removeOverlayAsPerType(plotType, plotData);
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
      newPlotData.updateRanges();
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
      (x) => x.plotId == plotId
    );
    let plot2 = props.plot.plotData.histogramOverlays.find(
      (x) => x.plotId == plotId
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
    if (plot && type == plot.type) {
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
        if (type == plot.type) {
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
      if (targetAxis === "x") {
        const axis =
          oldYAxisValue && oldYAxisValue !== xAxis
            ? oldYAxisValue
            : plot.plotData.file.axes.filter((e) => e !== xAxis)[0];
        plot.plotData.xHistogram = false;
        setAxis("y", axis);
      } else {
        const axis =
          oldXAxisValue && oldXAxisValue !== yAxis
            ? oldXAxisValue
            : plot.plotData.file.axes.filter((e) => e !== yAxis)[0];
        plot.plotData.yHistogram = false;
        setAxis("x", axis);
      }
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

  const [rangeResizeModalOpen, setRangeResizeModalOpen] = React.useState(false);
  const [rangeResizeModalAxis, setRangeResizeModalAxis] = React.useState("");
  const [rangeResizeModalTargetMin, setRangeResizeModalTargetMin] =
    React.useState(0);
  const [rangeResizeModalTargetMax, setRangeResizeModalTargetMax] =
    React.useState(0);

  const handleClose = (func: Function) => {
    func(false);
  };

  const addOverlayAsPerType = (
    type: string,
    plotData: PlotData,
    color: string = "",
    plotSource: string = ""
  ) => {
    switch (type) {
      case COMMON_CONSTANTS.Bar:
        props.plot.plotData.removeOverlay(plotData.id);
        props.plot.plotData.addBarOverlay(
          plotData,
          color,
          plotData.id,
          plotSource
        );
        break;
      case COMMON_CONSTANTS.Line:
        props.plot.plotData.removeBarOverlay(plotData.id);
        props.plot.plotData.addOverlay(
          plotData,
          color,
          plotData.id,
          plotSource
        );
        break;
    }
  };

  const removeOverlayAsPerType = (type: string, plotData: PlotData) => {
    switch (type) {
      case COMMON_CONSTANTS.Bar:
        props.plot.plotData.removeBarOverlay(plotData.id);
        break;
      case COMMON_CONSTANTS.Line:
        props.plot.plotData.removeOverlay(plotData.id);
        break;
    }
  };

  const setAxisRange = (min: number, max: number, axis: string) => {
    props.plot.plotData.ranges.set(axis, [min, max]);
  };

  const [oldPos, setOldPos] = React.useState(69420);
  const calculateDragRangeChange = (
    min: number,
    max: number,
    dragValue: number,
    closerToMin: boolean
  ) => {
    const diff = dragValue - oldPos;
    setOldPos(dragValue);
    const absolute = max - min;
    const dragV = 0.01;
    if (closerToMin) {
      if (diff < 0) min += absolute * dragV;
      else min -= absolute * dragV;
    } else {
      if (diff < 0) max -= absolute * dragV;
      else max += absolute * dragV;
    }
    return [min, max];
  };

  return (
    <div style={classes.mainContainer} ref={displayRef}>
      <div style={classes.utilityBar} ref={barRef}>
        <MainBar plotIndex={props.plotIndex} plot={plot}></MainBar>
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
            transform: "rotate(270deg)",
            height: "min-content",
            width: "2%",
            marginRight: "10px",
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
              if (e.target.value == "hist") {
                handleHist("y");
                return;
              }
              handleSelectEvent(e, "y", (e: any) =>
                setAxis("y", e.target.value)
              );
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
          <RangeResizeModal
            open={rangeResizeModalOpen}
            closeCall={{
              f: handleClose,
              ref: setRangeResizeModalOpen,
            }}
            inits={{
              axis: rangeResizeModalAxis,
              min: rangeResizeModalTargetMin,
              max: rangeResizeModalTargetMax,
            }}
            callback={setAxisRange}
          ></RangeResizeModal>
          <div
            draggable="true"
            style={{
              backgroundColor: "rgba(0,0,0,0.0)",
              width: isPlotHistogram()
                ? props.plot.plotData.histogramAxis === "vertical"
                  ? 0
                  : 50
                : 50,
              height: plot.plotData.plotHeight - 100,
              cursor: "s-resize",
              position: "absolute",
              zIndex: 10000,
              left: 65,
              bottom: 100,
            }}
            onDoubleClick={() => {
              const ranges = plot.plotData.ranges.get(plot.plotData.yAxis);
              setRangeResizeModalTargetMin(ranges[0]);
              setRangeResizeModalTargetMax(ranges[1]);
              setRangeResizeModalOpen(true);
              setRangeResizeModalAxis(plot.plotData.yAxis + " (Y Axis)");
            }}
            onDrag={(e) => {
              if (e.clientX === 0 && e.clientY === 0) {
                return;
              }
              let [oldMin, oldMax] = plot.plotData.ranges.get(
                plot.plotData.yAxis
              );
              const dragValue = e.nativeEvent.offsetY;
              const closerToMin =
                dragValue > (plot.plotData.plotHeight - 100) / 2;
              const [newMin, newMax] = calculateDragRangeChange(
                oldMin,
                oldMax,
                (closerToMin ? -1 : 1) * dragValue,
                closerToMin
              );
              setAxisRange(newMin, newMax, plot.plotData.yAxis);
            }}
          ></div>
          <div
            draggable="true"
            style={{
              backgroundColor: "rgba(0,0,0,0.0)",
              width: plot.plotData.plotWidth - 120,
              cursor: "e-resize",
              height: isPlotHistogram()
                ? props.plot.plotData.histogramAxis === "horizontal"
                  ? 0
                  : 50
                : 50,
              position: "absolute",
              zIndex: 10000,
              left: 115,
              bottom: 50,
            }}
            onDoubleClick={() => {
              const ranges = plot.plotData.ranges.get(plot.plotData.xAxis);
              setRangeResizeModalTargetMin(ranges[0]);
              setRangeResizeModalTargetMax(ranges[1]);
              setRangeResizeModalOpen(true);
              setRangeResizeModalAxis(plot.plotData.xAxis + " (X Axis)");
            }}
            onDrag={(e) => {
              if (e.clientX === 0 && e.clientY === 0) {
                return;
              }
              let [oldMin, oldMax] = plot.plotData.ranges.get(
                plot.plotData.xAxis
              );
              const dragValue = e.nativeEvent.offsetX;
              const closerToMin =
                dragValue < (plot.plotData.plotWidth - 120) / 2;
              const [newMin, newMax] = calculateDragRangeChange(
                oldMin,
                oldMax,
                (closerToMin ? 1 : -1) * dragValue,
                closerToMin
              );
              setAxisRange(newMin, newMax, plot.plotData.xAxis);
            }}
          ></div>
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
                  if (e.target.value == "hist") {
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
                                  plotObj.plot.plot
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
                                    plotObj.plot.plot
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
