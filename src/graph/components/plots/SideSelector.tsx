import React, { ReactNode, useEffect } from "react";
import {
  Divider,
  MenuItem,
  Select,
  CircularProgress,
  Button,
} from "@material-ui/core";
import { snackbarService } from "uno-material-ui";
import GetAppIcon from "@material-ui/icons/GetApp";
import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import useForceUpdate from "hooks/forceUpdate";
import {
  Plot,
  PlotSpecificWorkspaceData,
  PlotType,
} from "graph/resources/types";
import { getFile, getPopulation } from "graph/utils/workspace";
import * as PlotResource from "graph/resources/plots";

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

var filePlotIdDict: any = {};
var plotDownloadingFiles: any = {};

function PlotComponent(props: {
  plotRelevantResources: PlotSpecificWorkspaceData;
  sharedWorkspace: boolean;
  experimentId: string;
  canvasComponent: ReactNode;
}) {
  const { plot, file, gates, population } = props.plotRelevantResources;

  const rerender = useForceUpdate();
  const xAxis = plot.xAxis;
  const yAxis = plot.yAxis;
  const axes = getFile(getPopulation(plot.population).file).axes;

  const displayRef = React.useRef();
  const barRef = React.useRef();

  const yPlotType = plot.yPlotType;
  const xPlotType = plot.xPlotType;

  let oldXAxisValue: string | null = null;
  let oldYAxisValue: string | null = null;

  // var files = dataManager.files.filter((x) => x.id !== plotFileId);

  const [plotSetup, setPlotSetup] = React.useState(false);
  const [oldAxis, setOldAxis] = React.useState({
    x: null,
    y: null,
  });

  // const [downloadedFiles, setDownloadedFiles] = React.useState(
  //   dataManager.downloaded
  // );

  // const [downloadingFiles, setDownloadingFiles] = React.useState(
  //   dataManager.downloadingFiles
  // );

  const [lastSelectEvent, setLastSelectEvent] = React.useState(0);
  const [histogramOverlayOpen, setHistogramOverlayOpen] = React.useState(false);

  const [plotMoving, setPlotMoving] = React.useState(true);

  const [lastUpdate, setLastUpdate] = React.useState(null);

  const setPlotType = (axis: "x" | "y", value: PlotType) => {
    axis === "x"
      ? PlotResource.setXAxisPlotType(plot, value)
      : PlotResource.setYAxisPlotType(plot, value);
  };

  const updatePlotSize = () => {
    if (displayRef === null || displayRef.current === null) return;
    //@ts-ignore
    const br = displayRef.current.getBoundingClientRect();
    //@ts-ignore
    const bar = barRef.current.getBoundingClientRect();
    return { w: br.width - 20, h: br.height - bar.height - 40 };
  };

  const plotUpdater = () => {
    if (plot) {
      const plotDimensions = updatePlotSize();
      if (
        plotDimensions !== undefined &&
        plot !== undefined &&
        plot !== undefined
      ) {
        const { w, h } = plotDimensions;
        PlotResource.setWidthAndHeight(plot, w, h);
      }
    }
  };

  const setHistogram = (axis: "x" | "y", value: boolean) => {
    if (value) {
      axis === "x"
        ? setOldAxis({ ...oldAxis, y: yAxis })
        : setOldAxis({ ...oldAxis, x: xAxis });
      axis === "x"
        ? PlotResource.xAxisToHistogram(plot)
        : PlotResource.yAxisToHistogram(plot);
    } else {
      axis === "x"
        ? PlotResource.setXAxis(plot, oldAxis.y)
        : PlotResource.setYAxis(plot, oldAxis.x);

      PlotResource.disableHistogram(plot);
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
        PlotResource.setXAxis(plot, value);
        PlotResource.setYAxis(plot, value);
      } else {
        axis === "x"
          ? PlotResource.setXAxis(plot, value)
          : PlotResource.setYAxis(plot, value);
      }
    }
  };

  const isAxisDisabled = (axis: "x" | "y") => {
    return axis === "x"
      ? plot.histogramAxis === "horizontal"
      : plot.histogramAxis === "vertical";
  };

  const handleSelectEvent = (e: any, axis: "x" | "y", func: Function) => {
    if (lastSelectEvent + 500 < new Date().getTime()) {
      func(e);
      setLastSelectEvent(new Date().getTime());
    }

    if (plot.histogramAxis === "horizontal") {
      setHistogram("x", true);
    } else if (plot.histogramAxis === "vertical") {
      setHistogram("y", true);
    }
  };

  // const addFile = (fileId: string, type: string, plotSource: string) => {
  //   addHistogramOverlay(fileId, getFile(fileId), true, {}, type, plotSource);
  // };

  // const downloadFile = (fileId: string) => {
  //   dataManager.downloadFileEvents([fileId]);
  //   let plotDataId = props.plot.id;
  //   if (plotDownloadingFiles[plotDataId]) {
  //     plotDownloadingFiles[plotDataId] =
  //       plotDownloadingFiles[plotDataId].concat(fileId);
  //     s;
  //   } else {
  //     plotDownloadingFiles[plotDataId] = [fileId];
  //   }
  //   snackbarService.showSnackbar(
  //     "Overlay will be added after file events download",
  //     "warning"
  //   );
  // };

  // const isDownloading = (fileId: string) => {
  //   let downloadingFileId = downloadingFiles.find((x) => x === fileId);
  //   if (downloadingFileId) return true;
  //   return false;
  // };

  // const isDownloaded = (fileId: string) => {
  //   let donwloadedFileId = downloadedFiles.find((x) => x.id === fileId);
  //   if (donwloadedFileId) return true;
  //   return false;
  // };

  // const updatePlotMovement = () => {
  //   setPlotMoving(!dataManager.dragLock);
  //   rerender();
  // };

  // useEffect(() => {
  //   if (!filePlotIdDict[props.plot.id])
  //     filePlotIdDict[props.plot.id] = {};
  //   let updateWorkspaceListner = dataManager.addObserver(
  //     "updateWorkspace",
  //     () => {
  //       if (
  //         dataManager.letUpdateBeCalledForAutoSave &&
  //         plot &&
  //         props.plot &&
  //         (dataManager.redrawPlotIds.includes(plot?.plotData?.id) ||
  //           dataManager.redrawPlotIds.includes(
  //             plot?.plotData?.parentPlotId
  //           ))
  //       ) {
  //         plotUpdater();
  //         let inx = dataManager.redrawPlotIds.findIndex(
  //           (x) => x == props.plot.id
  //         );
  //         delete dataManager.redrawPlotIds[inx];
  //       }
  //     }
  //   );

  //   let workspaceDragLockListner = dataManager.addObserver(
  //     "workspaceDragLock",
  //     () => {
  //       if (
  //         dataManager.letUpdateBeCalledForAutoSave &&
  //         (dataManager.redrawPlotIds.includes(plot?.plotData?.id) ||
  //           dataManager.redrawPlotIds.includes(
  //             plot?.plotData?.parentPlotId
  //           ))
  //       ) {
  //         updatePlotMovement();
  //         let inx = dataManager.redrawPlotIds.findIndex(
  //           (x) => x == props.plot.id
  //         );
  //         delete dataManager.redrawPlotIds[inx];
  //       }
  //     }
  //   );
  //   let plotRemoveListner: any;
  //   if (!plotSetup) {
  //     plotRemoveListner = dataManager.addObserver(
  //       "removePlotFromWorkspace",
  //       () => {
  //         if (plot && props.plot) {
  //           let filePlotDataIds: any = filePlotIdDict
  //             ? Object.values(filePlotIdDict[props.plot.id]) &&
  //               Object.values(filePlotIdDict[props.plot.id]).length > 0
  //               ? Object.values(filePlotIdDict[props.plot.id]).map(
  //                   (x: any) => x.id
  //                 )
  //               : []
  //             : [];
  //           let plots = dataManager.getAllPlots();
  //           let existingPlotDataIds = plots.map((x: any) => x.plotID);
  //           let plotData: any = [];
  //           plotData = plotData.concat(
  //             props.plot.histogramBarOverlays.filter(
  //               (x: any) =>
  //                 !existingPlotDataIds.includes(x.plotId) &&
  //                 !filePlotDataIds.includes(x.plotId)
  //             )
  //           );
  //           plotData = plotData.concat(
  //             props.plot.histogramOverlays.filter(
  //               (x: any) =>
  //                 !existingPlotDataIds.includes(x.plotId) &&
  //                 !filePlotDataIds.includes(x.plotId)
  //             )
  //           );
  //           if (plotData && plotData.length > 0) {
  //             props.plot.removeAnyOverlay(plotData[0].plotId);
  //             plotUpdater();
  //           }
  //         }

  //         tryKillComponent();
  //       }
  //     );

  //     plot.setup();
  //     setPlotSetup(true);
  //     plotUpdater();
  //   }

  //   let downloadedListner = dataManager.addObserver("updateDownloaded", () => {
  //     if (
  //       Object.keys(plotDownloadingFiles).length > 0 &&
  //       plotDownloadingFiles[props.plot.id]
  //     ) {
  //       let plotDownFiles = plotDownloadingFiles[props.plot.id];
  //       let files = dataManager.downloaded.filter((x) =>
  //         plotDownFiles.includes(x.id)
  //       );
  //       if (
  //         files &&
  //         files.length > 0 &&
  //         filePlotIdDict[props.plot.id] &&
  //         filePlotIdDict[props.plot.id][files[0].id]
  //       ) {
  //         snackbarService.showSnackbar("Overlay added", "success");
  //         addFile(
  //           files[0].id,
  //           filePlotIdDict[props.plot.id][files[0].id].type,
  //           COMMON_CONSTANTS.FILE
  //         );
  //         plotDownFiles = plotDownFiles.filter((x: any) => x !== files[0].id);
  //         plotDownloadingFiles[props.plot.id] = plotDownFiles;
  //       }
  //     }
  //     setDownloadedFiles(dataManager.downloaded);
  //   });

  //   let downloadingListner = dataManager.addObserver(
  //     "updateDownloadingFiles",
  //     () => {
  //       setDownloadingFiles(dataManager.downloadingFiles);
  //     }
  //   );

  //   window.addEventListener("click", (e) => {
  //     let event: any = e.target;
  //     if (event && event.id !== "hist_overlay") {
  //       setHistogramOverlayOpen(false);
  //     }
  //   });
  //   let fileHistOverlay: any = [];
  //   fileHistOverlay = fileHistOverlay.concat(
  //     props.plot.histogramBarOverlays
  //       .filter((x) => x.plotSource === COMMON_CONSTANTS.FILE)
  //       .map((y) => {
  //         return { histObj: y, type: COMMON_CONSTANTS.Bar };
  //       })
  //   );
  //   fileHistOverlay = fileHistOverlay.concat(
  //     props.plot.histogramOverlays
  //       .filter((x) => x.plotSource === COMMON_CONSTANTS.FILE)
  //       .map((y) => {
  //         return { histObj: y, type: COMMON_CONSTANTS.Line };
  //       })
  //   );
  //   for (let i = 0; i < fileHistOverlay.length; i++) {
  //     let obj = fileHistOverlay[i];
  //     if (!filePlotIdDict[props.plot.id])
  //       filePlotIdDict[props.plot.id] = {};
  //     filePlotIdDict[props.plot.id][obj.histObj.plot.file.id] = {
  //       id: obj.histObj.plotId,
  //       type: obj.type,
  //     };
  //   }
  //   return () => {
  //     dataManager.removeObserver("updateDownloadingFiles", downloadingListner);
  //     dataManager.removeObserver("updateDownloaded", downloadedListner);
  //     dataManager.removeObserver("workspaceDragLock", workspaceDragLockListner);
  //     dataManager.removeObserver("updateWorkspace", updateWorkspaceListner);
  //     dataManager.removeObserver("removePlotFromWorkspace", plotRemoveListner);
  //   };
  // }, []);

  const getMinMax = (ranges: [number, number], newRanges: [number, number]) => {
    let min = ranges[0] > newRanges[0] ? newRanges[0] : ranges[0];
    let max = ranges[1] > newRanges[1] ? ranges[1] : newRanges[1];
    return { min: min, max: max };
  };

  // const handleMultiPlotHistogram = (
  //   plotSource: string,
  //   plotType: string,
  //   pltFlObj: any
  // ) => {
  //   setHistogramOverlayOpen(false);
  //   switch (plotSource) {
  //     case COMMON_CONSTANTS.FILE:
  //       if (
  //         filePlotIdDict[props.plot.id] &&
  //         filePlotIdDict[props.plot.id][pltFlObj.id] &&
  //         filePlotIdDict[props.plot.id][pltFlObj.id].id
  //       ) {
  //         let plotObj = isHistogramSelected(
  //           filePlotIdDict[props.plot.id][pltFlObj.id].id
  //         );
  //         let plotData = plotObj.plot.plot;
  //         if (plotObj.type === plotType) {
  //           removeOverlayAsPerType(plotType, plotData.id);
  //           filePlotIdDict[props.plot.id][pltFlObj.id] = null;
  //         } else {
  //           addOverlayAsPerType(
  //             plotType,
  //             plotData,
  //             plotObj.plot.color,
  //             COMMON_CONSTANTS.FILE
  //           );
  //         }
  //       } else {
  //         if (isDownloaded(pltFlObj.id)) {
  //           addFile(pltFlObj.id, plotType, COMMON_CONSTANTS.FILE);
  //         } else {
  //           if (!filePlotIdDict[props.plot.id])
  //             filePlotIdDict[props.plot.id] = {};
  //           if (!filePlotIdDict[props.plot.id][pltFlObj.id])
  //             filePlotIdDict[props.plot.id][pltFlObj.id] = {
  //               id: "",
  //               type: plotType,
  //             };
  //           downloadFile(pltFlObj.id);
  //           return;
  //         }
  //       }
  //       break;
  //     case COMMON_CONSTANTS.PLOT:
  //       let plotData = pltFlObj.plotData;
  //       let plotObj = isHistogramSelected(plotData.id);
  //       if (plotObj) {
  //         if (plotObj.type === plotType) {
  //           removeOverlayAsPerType(plotType, plotData.id);
  //         } else {
  //           addOverlayAsPerType(
  //             plotType,
  //             pltFlObj.plotData,
  //             plotObj.plot.color,
  //             COMMON_CONSTANTS.PLOT
  //           );
  //         }
  //       } else {
  //         addHistogramOverlay(
  //           plotData.id,
  //           plotData.file,
  //           false,
  //           pltFlObj.plotData,
  //           plotType,
  //           COMMON_CONSTANTS.PLOT
  //         );
  //       }
  //       break;
  //   }
  //   setTimeout(() => {
  //     plotUpdater();
  //   }, 0);
  // };

  // const addHistogramOverlay = (
  //   id: string,
  //   file: any,
  //   addNewPlot: boolean,
  //   plotData: any = {},
  //   plotType: string,
  //   plotSource: string
  // ) => {
  //   let newPlotData: any = {};
  //   if (addNewPlot) {
  //     newPlotData = new PlotData();
  //     newPlotData.file = file;
  //     newPlotData.setupPlot();
  //     newPlotData.getXandYRanges();
  //   } else {
  //     newPlotData = plotData;
  //   }

  //   let plotRanges = props.plot.ranges.get(props.plot.xAxis);
  //   let newPlotRanges = newPlotData.ranges.get(props.plot.xAxis);

  //   let obj = getMinMax(plotRanges, newPlotRanges);
  //   setAxisRange(obj.min, obj.max, props.plot.xAxis);

  //   addOverlayAsPerType(plotType, newPlotData, "", plotSource);

  //   if (addNewPlot) {
  //     if (!filePlotIdDict[props.plot.id])
  //       filePlotIdDict[props.plot.id] = {};
  //     if (!filePlotIdDict[props.plot.id][id])
  //       filePlotIdDict[props.plot.id][id] = {};

  //     filePlotIdDict[props.plot.id][id] = {
  //       id: newPlotData.id,
  //       type: plotType,
  //     };
  //   }
  // };

  // const isHistogramSelected = (plotId: string) => {
  //   let plot1 = props.plot.histogramBarOverlays.find(
  //     (x) => x.plotId === plotId
  //   );
  //   let plot2 = props.plot.histogramOverlays.find(
  //     (x) => x.plotId === plotId
  //   );

  //   if (plot1) {
  //     return { type: COMMON_CONSTANTS.Bar, plot: plot1 };
  //   } else if (plot2) {
  //     return { type: COMMON_CONSTANTS.Line, plot: plot2 };
  //   }
  //   return null;
  // };

  // const isOptionSelected = (plotId: string, type: string = "") => {
  //   let plot = isHistogramSelected(plotId);
  //   if (plot && type === plot.type) {
  //     return "#6666aa";
  //   }
  //   return "#66d";
  // };

  // const getHistogramSelectedColor = (
  //   plotId: string,
  //   type: string = ""
  // ): string => {
  //   let plot = isHistogramSelected(plotId);
  //   if (plot) {
  //     if (type) {
  //       if (type === plot.type) {
  //         return plot.plot.color;
  //       } else {
  //         return "#fff";
  //       }
  //     }
  //     return plot.plot.color;
  //   }

  //   return "#fff";
  // };

  const handleHist = (targetAxis: "x" | "y") => {
    if (isPlotHistogram()) {
      plot.histogramAxis = "";
      if (targetAxis === "x") {
        const axis =
          oldYAxisValue && oldYAxisValue !== xAxis
            ? oldYAxisValue
            : axes.filter((e) => e !== xAxis)[0];
        setAxis("y", axis, true);
      } else {
        const axis =
          oldXAxisValue && oldXAxisValue !== yAxis
            ? oldXAxisValue
            : axes.filter((e) => e !== yAxis)[0];
        setAxis("x", axis, true);
      }
      rerender();
    } else {
      filePlotIdDict[plot.id] = {};
      plot.histogramBarOverlays = [];
      plot.histogramOverlays = [];
      if (targetAxis === "x") {
        oldYAxisValue = yAxis;
        setAxis("y", xAxis);
      } else {
        oldXAxisValue = xAxis;
        setAxis("x", yAxis);
      }
    }
  };

  // const addOverlayAsPerType = (
  //   type: string,
  //   plotData: PlotData,
  //   color: string = "",
  //   plotSource: string = ""
  // ) => {
  //   switch (type) {
  //     case COMMON_CONSTANTS.Bar:
  //       props.plot.addBarOverlay(
  //         plotData,
  //         color,
  //         plotData.id,
  //         plotSource
  //       );
  //       props.plot.removeOverlay(plotData.id);
  //       break;
  //     case COMMON_CONSTANTS.Line:
  //       props.plot.addOverlay(plotData, color, plotData.id, plotSource);
  //       props.plot.removeBarOverlay(plotData.id);
  //       break;
  //   }
  // };

  // const removeOverlayAsPerType = (type: string, plotDataId: string) => {
  //   switch (type) {
  //     case COMMON_CONSTANTS.Bar:
  //       props.plot.removeBarOverlay(plotDataId);
  //       break;
  //     case COMMON_CONSTANTS.Line:
  //       props.plot.removeOverlay(plotDataId);
  //       break;
  //   }
  // };

  // const setAxisRange = (min: number, max: number, axis: string) => {
  //   if (min === 69 && max === 420) props.plot.resetOriginalRanges();
  //   else props.plot.ranges.set(axis, [min, max]);
  //   if (lastUpdate + 100 < new Date().getTime()) {
  //     dataManager.redrawPlotIds.push(props.plot.id);
  //     if (props.plot.parentPlotId) {
  //       dataManager.redrawPlotIds.push(props.plot.parentPlotId);
  //     }
  //     dataManager.updateWorkspace();
  //     setLastUpdate(new Date().getTime());
  //   }
  // };

  return (
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
          disabled={plot.histogramAxis === "vertical"}
          value={yAxis}
        >
          {axes.map((e: any) => (
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
        {/* //TODO */}
        {/* <RangeSliders plot={plot} /> */}
        {props.canvasComponent}
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
              disabled={plot.histogramAxis === "horizontal"}
              value={xAxis}
            >
              {Object.keys(getPopulation(plot.population).defaultRanges).map(
                (e: any) => (
                  <MenuItem value={e}>{e}</MenuItem>
                )
              )}
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
            {/* {isPlotHistogram() ? (
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
                  <MenuItem value={"0"}>Histogram overlays</MenuItem> */}
            {/* {plots.map((e: any) => (
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
                    ))} */}
            {/* {files.map((e: any) => (
                    <MenuItem
                      id="hist_overlay"
                      value={e}
                      style={{
                        backgroundColor: getHistogramSelectedColor(
                          filePlotIdDict[props.plot.id]
                            ? filePlotIdDict[props.plot.id][e.id]
                              ? filePlotIdDict[props.plot.id][e.id].id
                              : ""
                            : ""
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
                              filePlotIdDict[props.plot.id][e.id] &&
                              filePlotIdDict[props.plot.id][e.id].id
                            ) {
                              let plotObj = isHistogramSelected(
                                filePlotIdDict[props.plot.id][e.id].id
                              );
                              if (plotObj) {
                                removeOverlayAsPerType(
                                  plotObj.type,
                                  plotObj.plot.plotId
                                );
                                setHistogramOverlayOpen(false);
                              }
                              filePlotIdDict[props.plot.id][e.id] = null;
                            }
                          }}
                        >
                          {e.label}
                        </span>
                        <Button
                          id={`${props.plot.id}_${e.id}_bar_file`}
                          style={{
                            backgroundColor: isOptionSelected(
                              filePlotIdDict[props.plot.id]
                                ? filePlotIdDict[props.plot.id][e.id]
                                  ? filePlotIdDict[props.plot.id][e.id].id
                                  : ""
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
                          id={`${props.plot.id}_${e.id}_line_file`}
                          style={{
                            backgroundColor: isOptionSelected(
                              filePlotIdDict[props.plot.id]
                                ? filePlotIdDict[props.plot.id][e.id]
                                  ? filePlotIdDict[props.plot.id][e.id].id
                                  : ""
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
            ) : null} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlotComponent;
