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
  FileID,
  HistogramOverlay,
  Plot,
  PlotID,
  PlotSpecificWorkspaceData,
  PlotType,
  Population,
  Range,
} from "graph/resources/types";
import { getFile, getPopulation, getAllFiles } from "graph/utils/workspace";
import * as PlotResource from "graph/resources/plots";
import { File } from "graph/resources/types";
import { downloadFileEvent } from "services/FileService";
import { createPopulation } from "graph/resources/populations";
import WorkspaceDispatch from "graph/resources/dispatchers";

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
  const files = getAllFiles();
  const displayRef = React.useRef();
  const barRef = React.useRef();

  const yPlotType = plot.yPlotType;
  const xPlotType = plot.xPlotType;

  let oldXAxisValue: string | null = null;
  let oldYAxisValue: string | null = null;

  const [plotSetup, setPlotSetup] = React.useState(false);
  const [oldAxis, setOldAxis] = React.useState({
    x: null,
    y: null,
  });

  const [downloadedFiles, setDownloadedFiles] = React.useState([]);
  const [downloadingFiles, setDownloadingFiles] = React.useState([]);
  const [filePlotIdDict, setFilePlotIdDict] = React.useState({});
  const [filesMetadata, setFilesMetadata] = React.useState([]);
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
    } else if (isPlotHistogram() && !stopHist) {
      PlotResource.setXAxis(plot, value);
      PlotResource.setYAxis(plot, value);
    } else {
      axis === "x"
        ? PlotResource.setXAxis(plot, value)
        : PlotResource.setYAxis(plot, value);
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

    if (plot.histogramAxis === "vertical") {
      setHistogram("x", true);
    } else if (plot.histogramAxis === "horizontal") {
      setHistogram("y", true);
    }
  };

  useEffect(() => {
    let downloadedFiles = files.filter((x) => x.downloaded);
    let downloadingFiles: File[] = files.filter((x) => x.downloading);

    let downloadedFileIds: string[] = [];
    let downloadingFileIds: string[] = [];

    if (downloadingFiles && downloadingFiles.length > 0) {
      downloadingFileIds = downloadingFiles.map((x) => x.id);
    }

    if (downloadedFiles && downloadedFiles.length > 0) {
      downloadedFileIds = downloadedFiles.map((x) => x.id);
    }

    setDownloadedFiles(downloadedFileIds);
    setDownloadingFiles(downloadingFileIds);
  }, [files]);

  useEffect(() => {
    let filteredFiles = files.filter((x) => x.id != file.id);
    setFilesMetadata(filteredFiles);
    window.addEventListener("click", (e) => {
      let event: any = e.target;
      if (event && event.id !== "hist_overlay") {
        setHistogramOverlayOpen(false);
      }
    });
  }, []);

  const getMinMax = (ranges: [number, number], newRanges: [number, number]) => {
    let min = ranges[0] > newRanges[0] ? newRanges[0] : ranges[0];
    let max = ranges[1] > newRanges[1] ? ranges[1] : newRanges[1];
    return { min: min, max: max };
  };

  const isHistogramSelected = (plotId: string = "", fileId: string = "") => {
    let overlayPlot = plot.histogramOverlays.find(
      (x) => x.plotId === plotId && x.fileId === fileId
    );

    return overlayPlot ? overlayPlot : null;
  };

  const isDownloaded = (fileId: FileID) => {
    return downloadedFiles.find((x) => x == fileId);
  };

  const isDownloading = (fileId: FileID) => {
    return downloadingFiles.find((x) => x == fileId);
  };

  const handleMultiPlotHistogram = async (
    plotSource: string,
    plotType: string,
    pltFlObj: File
  ) => {
    setHistogramOverlayOpen(false);
    let plotObj: HistogramOverlay;
    switch (plotSource) {
      case COMMON_CONSTANTS.FILE:
        plotObj = isHistogramSelected(plot.id, pltFlObj.id);
        if (plotObj) {
          if (plotObj.plotType === plotType) {
            PlotResource.removeOverlay(plot, plotObj.plotId, pltFlObj.id);
          } else {
            PlotResource.changeOverlayType(
              plot,
              plotObj.plotId,
              pltFlObj.id,
              plotType,
              plotObj.plotType
            );
          }
        } else {
          if (!isDownloaded(pltFlObj.id))
            await downloadFileEvent(
              props.sharedWorkspace,
              pltFlObj.id,
              props.experimentId
            );

          let population: Population = createPopulation({
            file: pltFlObj.id,
          });
          let plotPopulation = getPopulation(plot.population);
          population.gates = population.gates.concat(plotPopulation.gates);
          WorkspaceDispatch.AddPopulation(population);
          // debugger;
          // let xRanges = population.defaultRanges[plot.xAxis];
          // xRanges = utilGetNewMinMax(xRanges, plot.ranges[plot.xAxis]);
          // plot.ranges[plot.xAxis] = xRanges;
          // let yRanges = population.defaultRanges[plot.yAxis];
          // yRanges = utilGetNewMinMax(yRanges, plot.ranges[plot.yAxis]);
          // plot.ranges[plot.yAxis] = yRanges;
          // debugger;
          // WorkspaceDispatch.UpdatePlot(plot);
          PlotResource.addOverlay(
            plot,
            "",
            plot.id,
            plotSource,
            plotType,
            pltFlObj.id,
            population.id
          );
        }
        break;
      // case COMMON_CONSTANTS.PLOT:
      //   let plotData = pltFlObj.plotData;
      //   plotObj = isHistogramSelected(plotData.id);
      //   if (plotObj) {
      //     if (plotObj.type === plotType) {
      //       removeOverlayAsPerType(plotType, plotData.id);
      //     } else {
      //       addOverlayAsPerType(
      //         plotType,
      //         pltFlObj.plotData,
      //         plotObj.plot.color,
      //         COMMON_CONSTANTS.PLOT
      //       );
      //     }
      //   } else {
      //     addHistogramOverlay(
      //       plotData.id,
      //       plotData.file,
      //       false,
      //       pltFlObj.plotData,
      //       plotType,
      //       COMMON_CONSTANTS.PLOT
      //     );
      //   }
      //   break;
    }
  };

  const utilGetNewMinMax = (
    newRanges: [Number, Number],
    oldRanges: [Number, Number]
  ): any => {
    let min = newRanges[0] > oldRanges[0] ? oldRanges[0] : newRanges[0];
    let max = newRanges[1] > oldRanges[1] ? newRanges[1] : oldRanges[1];
    return [min, max];
  };

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

  const isOptionSelected = (
    plotId: string,
    fileId: string,
    type: string = ""
  ) => {
    let plot = isHistogramSelected(plotId, fileId);
    if (plot && type === plot.plotType) {
      return "#6666aa";
    }
    return "#66d";
  };

  const getHistogramSelectedColor = (
    plotId: string,
    fileId: string
  ): string => {
    let plot = isHistogramSelected(plotId, fileId);
    if (plot) {
      return plot.color;
    }
    return "#fff";
  };

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
          disabled={isAxisDisabled("y")}
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
                handleSelectEvent(e, "x", (e: any) => {
                  setAxis("x", e.target.value);
                });
              }}
              disabled={isAxisDisabled("x")}
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
                  <MenuItem value={"0"}>Overlays</MenuItem>
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
                  {filesMetadata.map((e: any) => (
                    <MenuItem
                      id="hist_overlay"
                      value={e}
                      style={{
                        backgroundColor: getHistogramSelectedColor(
                          plot.id,
                          e.id
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
                            let plotObj = isHistogramSelected(plot.id, e.id);
                            if (plotObj) {
                              PlotResource.removeOverlay(
                                plot,
                                plotObj.plotId,
                                e.id
                              );
                              setHistogramOverlayOpen(false);
                            }
                          }}
                        >
                          {e.label}
                        </span>
                        <Button
                          id={`${plot.id}_${e.id}_bar_file`}
                          style={{
                            backgroundColor: isOptionSelected(
                              plot.id,
                              e.id,
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
                          id={`${plot.id}_${e.id}_line_file`}
                          style={{
                            backgroundColor: isOptionSelected(
                              plot.id,
                              e.id,
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
  );
}

export default PlotComponent;
