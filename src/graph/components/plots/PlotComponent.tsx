import React, { useEffect } from "react";
import {
  Divider,
  MenuItem,
  Select,
  CircularProgress,
  Button,
} from "@material-ui/core";

import GateBar from "./plotui/gateBar";
import MainBar from "./plotui/mainBar";
import AxisBar from "./plotui/axisBar";
import GetAppIcon from "@material-ui/icons/GetApp";
import fileService from "services/FileService";
import CanvasComponent from "../canvas/CanvasComponent";
import Plot from "graph/renderers/plotRender";
import dataManager from "graph/dataManagement/dataManager";
import FCSFile from "graph/dataManagement/fcsFile";
import PlotData from "graph/dataManagement/plotData";
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

const minDrawInterval = 30;
let interval: any = {};

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
  const handleSelectEvent = (e: any, axis: "x" | "y", func: Function) => {
    if (lastSelectEvent + 500 < new Date().getTime()) {
      func(e);
      setLastSelectEvent(new Date().getTime());
    }

    if (plot.plotData.xHistogram) setHistogram("x", true);
    else if (plot.plotData.yHistogram) setHistogram("y", true);
  };

  const [downloadedFiles, setDownloadedFiles] = React.useState(
    fileService.downloaded
  );

  const [downloadingFiles, setDownloadingFiles] = React.useState(
    fileService.downloadingFiles
  );

  const [plotDownloadingFiles, setPlotDownloadingFiles] = React.useState([]);
  const [keepMultiHistogramOpen, setKeepMultiHistogramOpen] =
    React.useState(false);

  var files = fileService.files.filter((x) => x.id != props.plotFileId);
  var filePlotIdDict: any = {};
  const addFile = (file: any) => {
    // const file: any = remoteWorkspace
    //   ? downloadedFiles[index]
    //   : staticFiles[index];
    let newFile: FCSFile;
    if (file?.fromStatic) {
      //newFile = staticFileReader(file.fromStatic);
    } else {
      newFile = new FCSFile({
        name: file.title,
        id: file.id,
        src: "remote",
        axes: file.channels.map((e: any) => e.value),
        data: file.events,
        plotTypes: file.channels.map((e: any) => e.display),
        remoteData: file,
      });
    }
    //const fileID = dataManager.addNewFileToWorkspace(newFile);
    const plot = new PlotData();
    plot.file = newFile;
    plot.setupPlot(true);
    props.plot.plotData.addBarOverlay(plot);
    if (!filePlotIdDict[newFile.id]) filePlotIdDict[newFile.id] = "";
    filePlotIdDict[newFile.id] = plot.id;
    //dataManager.addNewPlotToWorkspace(plot);
  };

  fileService.addObserver("updateDownloaded", () => {
    setDownloadedFiles(fileService.downloaded);
    // setTimeout(()=>{
    //   if (plotDownloadingFiles.length > 0) {
    //     let files = fileService.downloaded.filter((x) =>
    //       plotDownloadingFiles.includes(x.id)
    //     );
    //     if (files && files.length > 0 && !filePlotIdDict[files[0].id]) {
    //       addFile(files[0]);
    //       // let newplotDownloadingFiles = plotDownloadingFiles.filter(
    //       //   (x) => x != files[0].id
    //       // );
    //       // setPlotDownloadingFiles(newplotDownloadingFiles);
    //     }
    //   }
    // }, 0)
  });

  fileService.addObserver("updateDownloadingFiles", () => {
    setDownloadingFiles(fileService.downloadingFiles);
  });

  const downloadFile = (fileId: string) => {
    setPlotDownloadingFiles(plotDownloadingFiles.concat(fileId));
    fileService.downloadFileEvents(
      props.sharedWorkspace,
      [fileId],
      props.experimentId
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
      dataManager.addObserver("removePlotFromWorkspace", () =>
        tryKillComponent()
      );
      dataManager.addObserver("clearWorkspace", () => {
        clearInterval(interval[props.plotIndex]);
        interval[props.plotIndex] = undefined;
      });
      plot.setup();
      setPlotSetup(true);
    }
  }, []);

  let oldXAxisValue: string | null = null;
  let oldYAxisValue: string | null = null;

  const handleMultiPlotHistogram = (plot: any) => {
    if (plot) {
      if (isHistogramSelected(plot.plotData.id)) {
        props.plot.plotData.removeBarOverlay(plot.plotData.id);
      } else {
        props.plot.plotData.addBarOverlay(plot.plotData);
      }
    }
  };
  const isHistogramSelected = (plotId: string) => {
    return props.plot.plotData.histogramBarOverlays.find(
      (x) => x.plot.id == plotId
    );
  };

  const getHistogramSelectedColor = (plotId: string): string => {
    let plot = isHistogramSelected(plotId);
    if (plot) {
      return plot.color;
    }

    return "#fff";
  };

  const getHistograValue = (e: any, type: string): any => {
    return { val: e, type: type };
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
      props.plot.plotData.histogramBarOverlays = [];
      if (targetAxis === "x") {
        oldYAxisValue = yAxis;
        setAxis("y", xAxis);
      } else {
        oldXAxisValue = xAxis;
        setAxis("x", yAxis);
      }
    }
  };

  return (
    <div style={classes.mainContainer} ref={displayRef}>
      <div style={classes.utilityBar} ref={barRef}>
        <MainBar plotIndex={props.plotIndex} plot={plot}></MainBar>
        <Divider></Divider>

        <GateBar plot={plot}></GateBar>
        <Divider style={{ marginBottom: 10 }}></Divider>

        {/* <AxisBar
          plot={plot}
          oldAxis={oldAxis}
          histogramCallback={setHistogram}
        ></AxisBar> */}
        {/* <Divider style={{ marginTop: 10, marginBottom: 10 }}></Divider> */}
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
                <Select
                  style={{
                    marginTop: "10px",
                  }}
                  value={"0"}
                  onChange={(e) => {
                    let data: any = e.target.value;
                    if (data["type"] == "plot") {
                      handleMultiPlotHistogram(data["val"]);
                    }
                  }}
                >
                  <MenuItem value={"0"}>Histogram overlays</MenuItem>
                  {props.plots.map((e: any) => (
                    <MenuItem
                      value={getHistograValue(e, "plot")}
                      style={{
                        backgroundColor: getHistogramSelectedColor(
                          e.plotData.id
                        ),
                      }}
                    >
                      {e.plotData.label}
                    </MenuItem>
                  ))}
                  {files.map((e: any) => (
                    <MenuItem
                      value={getHistograValue(e, "file")}
                      style={{
                        backgroundColor: getHistogramSelectedColor(
                          filePlotIdDict[e.id]
                        ),
                      }}
                    >
                      <div
                        onClick={() => {
                          if (filePlotIdDict[e.id]) {
                            props.plot.plotData.removeBarOverlay(
                              filePlotIdDict[e.id]
                            );
                            filePlotIdDict[e.id] = "";
                          } else {
                            if (isDownloaded(e.id)) {
                              setKeepMultiHistogramOpen(false);
                              addFile(
                                downloadedFiles.find((x) => x.id == e.id)
                              );
                            } else {
                              setKeepMultiHistogramOpen(true);
                              downloadFile(e.id);
                            }
                          }
                        }}
                      >
                        {e.label}
                        {isDownloaded(e.id) ? null : (
                          <Button
                            style={{
                              backgroundColor: "#66d",
                              color: "white",
                              fontSize: 13,
                              marginLeft: 20,
                            }}
                          >
                            {isDownloading(e.id) ? (
                              <CircularProgress
                                style={{
                                  color: "white",
                                  width: 23,
                                  height: 23,
                                }}
                              />
                            ) : (
                              <GetAppIcon fontSize="small"></GetAppIcon>
                            )}
                          </Button>
                        )}
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlotComponent;
