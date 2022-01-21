import React, { ReactNode, useEffect, useState } from "react";
import {
  Divider,
  MenuItem,
  Select,
  CircularProgress,
  FormControl,
} from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import {
  FileID,
  HistogramOverlay,
  Plot,
  PlotSpecificWorkspaceData,
  PlotType,
  PlotsRerender,
} from "graph/resources/types";
import {
  getFile,
  getPopulation,
  getAllFiles,
  getWorkspace,
} from "graph/utils/workspace";
import * as PlotResource from "graph/resources/plots";
import { File } from "graph/resources/types";
import { downloadFileEvent } from "services/FileService";
import { Typography } from "antd";
import { useSelector } from "react-redux";
import EventQueueDispatch from "graph/workspaceRedux/eventQueueDispatchers";

function PlotComponent(props: {
  plotRelevantResources: PlotSpecificWorkspaceData;
  sharedWorkspace: boolean;
  experimentId: string;
  canvasComponent: ReactNode;
  editWorkspace: boolean;
}) {
  const { plot, file } = props.plotRelevantResources;
  const workspaceFiles: File[] = useSelector((e) => {
    //@ts-ignore
    return e.workspace.files.filter((e) => e.id !== file.id);
  });

  const xAxis = plot.xAxis;
  const yAxis = plot.yAxis;
  const { axes, labels } = getFile(getPopulation(plot.population).file);
  const files = getAllFiles();

  const yPlotType = plot.yPlotType;
  const xPlotType = plot.xPlotType;

  const [oldAxis, setOldAxis] = React.useState({
    x: null,
    y: null,
  });

  const [downloadedFiles, setDownloadedFiles] = React.useState([]);
  const [downloadingFiles, setDownloadingFiles] = React.useState([]);
  const [, setHistogramOverlayOpen] = React.useState(false);
  const [xWidth, setXWidth] = React.useState(100);
  const [yWidth, setYWidth] = React.useState(100);
  const [currentXIndex, setCurrentXIndex] = useState<number>(0);
  const [currentYIndex, setCurrentYIndex] = useState<number>(0);

  const setPlotType = (axis: "x" | "y", value: PlotType) => {
    axis === "x"
      ? PlotResource.setXAxisPlotType(plot, value)
      : PlotResource.setYAxisPlotType(plot, value);
  };

  const setHistogram = (value: boolean) => {
    if (value) {
      setOldAxis({ ...oldAxis, y: yAxis });
      PlotResource.xAxisToHistogram(plot);
    } else {
      PlotResource.setYAxis(plot, oldAxis.x);
      PlotResource.disableHistogram(plot);
    }
  };

  const isPlotHistogram = () => {
    return plot.histogramAxis !== "";
  };

  const setAxis = (
    axis: "x" | "y",
    value: string,
    stopHist: boolean = false
  ) => {
    if (isPlotHistogram() && !stopHist) {
      PlotResource.setXAxis(plot, value);
      PlotResource.setYAxis(plot, value);
    } else {
      axis === "x"
        ? PlotResource.setXAxis(plot, value)
        : PlotResource.setYAxis(plot, value);
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
    if (xAxis.length > 8) {
      const newWidth = 100 + (xAxis.length - 8) * 10;
      setXWidth(newWidth > 200 ? 200 : newWidth);
    } else {
      setXWidth(100);
    }
    if (xAxis) {
      let index =
        axes && axes.length > 0 && axes.findIndex((ele) => ele === xAxis);
      setCurrentXIndex(index !== -1 ? index : 0);
    }
  }, [xAxis]);

  useEffect(() => {
    const workspace = getWorkspace();
    if(workspace) {
      if (typeof workspace.files[0]?.downloaded !== 'undefined') {
        const plotsRerenderQueueItem: PlotsRerender = {
          id: "",
          used: false,
          type: "plotsRerender",
          plotIDs: workspace.plots.map((plot) => plot.id),
        };
        EventQueueDispatch.AddQueueItem(plotsRerenderQueueItem);
      }
    }
  }, [labels]);

  useEffect(() => {
    if (yAxis.length > 8) {
      const newWidth = 100 + (yAxis.length - 8) * 10;
      setYWidth(newWidth > 200 ? 200 : newWidth);
    } else {
      setYWidth(100);
    }

    if (yAxis) {
      let index =
        axes && axes.length > 0 && axes.findIndex((ele) => ele === yAxis);
      setCurrentYIndex(index !== -1 ? index : 0);
    }
  }, [yAxis]);

  const isHistogramSelected = (
    plotId: string = "",
    fileId: string = ""
  ): HistogramOverlay | null => {
    let overlayPlot = plot.histogramOverlays.find(
      (x) => x.plot === plotId || x.file === fileId
    );
    return overlayPlot ? overlayPlot : null;
  };

  const isDownloaded = (fileId: FileID) => {
    return downloadedFiles.find((x) => x === fileId);
  };

  const isDownloading = (fileId: FileID) => {
    return downloadingFiles.find((x) => x === fileId);
  };

  const handleMultiPlotHistogram = async (
    dataSource: "file" | "plot",
    addFile?: File,
    addPlot?: Plot
  ) => {
    setHistogramOverlayOpen(false);
    let histogramOverlay: HistogramOverlay;
    if (dataSource === "file") {
      if (!addFile) throw Error("File overlay of undefined file");
      histogramOverlay = isHistogramSelected(plot.id, addFile.id);
      if (histogramOverlay) {
        PlotResource.removeOverlay(plot, histogramOverlay);
      } else {
        if (!isDownloaded(addFile.id))
          await downloadFileEvent(
            props.sharedWorkspace,
            addFile.id,
            props.experimentId
          );

        PlotResource.addOverlay(plot, {
          fromFile: addFile.id,
        });
      }
    } else {
      throw Error("Plot overlays not implemented");
    }
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

  return (
    <div
      className="plot-canvas"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <div
        className="pc-y"
        style={{
          marginTop: yWidth >= 200 ? 250 : yWidth,
          marginRight: 20,
          transform: "rotate(270deg)",
          height: "min-content",
          width: "2%",
          display: "flex",
        }}
      >
        <Select
          disabled={!props.editWorkspace}
          style={{
            width: yWidth,
            marginRight: 15,
            flex: "1 1 auto",
          }}
          onChange={(e) => {
            if (e.target.value === "hist") {
              setHistogram(!isPlotHistogram());
            } else {
              if (isPlotHistogram()) setHistogram(false);
              //@ts-ignore
              const value: string = e.target.value;
              const index = labels.findIndex((ele) => ele === value);
              setCurrentYIndex(index);
              setAxis("y", axes[index]);
            }
          }}
          value={
            isPlotHistogram()
              ? "hist"
              : (labels !== null && typeof labels[currentYIndex] !== 'undefined') ? labels[currentYIndex] : plot.yAxis}
        >
          {labels &&
            labels.length &&
            labels.map((e, index) => <MenuItem value={e}>{e}</MenuItem>)}
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
          disabled={!props.editWorkspace}
          style={{
            width: 100,
            marginRight: 15,
            flex: "1 1 auto",
          }}
          value={yPlotType === "" ? "" : yPlotType}
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
        {/* TODO: Fix overlay indicator, this guy cuts space from header filename*/}
        {/* <div
          style={{
            position: "absolute",
            top: 100,
            right: 20,
            textAlign: "right",
          }}
        >
          {plot.histogramOverlays.map((e: HistogramOverlay) => {
            const intro =
              e.plotSource === "file" ? "File overlay" : "Plot overlay";
            let name: string;
            if (e.plotSource === "file") {
              const file = getFile(e.fileId);
              name = file?.name ? file.name : file.label;
            } else {
            }
            const color = e.color;
            return (
              <div>
                {e.plotSource === "file" ? (
                  //@ts-ignore
                  <Grid
                    direction="row"
                    container
                    justify="space-between"
                    style={{ float: "right" }}
                  >
                    {name}{" "}
                    <div
                      style={{
                        marginTop: 7,
                        marginLeft: 5,
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        width: 10,
                        height: 10,
                        backgroundColor: color,
                      }}
                    ></div>
                  </Grid>
                ) : null}
              </div>
            );
          })}
        </div> */}

        {/* TODO: Add range sliders back */}
        {/* <RangeSliders plot={plot} /> */}

        {props.canvasComponent}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>{/* Space between so that selectors are centralized */}</div>

          <div>
            {labels && labels.length && (
              <>
                <Select
                  disabled={!props.editWorkspace}
                  style={{
                    width: xWidth,
                    marginTop: "10px",
                    flex: "1 1 auto",
                  }}
                  onChange={(e) => {
                    //@ts-ignore
                    const value: string = e.target.value;
                    const index = labels.findIndex((ele) => ele === value);
                    setCurrentXIndex(index);
                    setAxis("x", axes[index]);
                  }}
                  value={labels[currentXIndex] !== null ? labels[currentXIndex] : plot.xAxis}
                >
                  {labels &&
                    labels.length &&
                    labels.map((e) => <MenuItem value={e}>{e} </MenuItem>)}
                </Select>

                <Select
                  disabled={!props.editWorkspace}
                  style={{
                    width: 100,
                    marginTop: "10px",
                    marginLeft: 10,
                    flex: "1 1 auto",
                  }}
                  value={xPlotType === "" ? "" : xPlotType}
                  //@ts-ignore
                  onChange={(e) => setPlotType("x", e.target.value)}
                >
                  <MenuItem value={"lin"}>Linear</MenuItem>
                  <MenuItem value={"bi"}>Logicle</MenuItem>
                </Select>
              </>
            )}
          </div>

          <div style={{ paddingRight: 6, marginTop: -5 }}>
            {isPlotHistogram() && workspaceFiles.length > 1 ? (
              <FormControl fullWidth style={{}}>
                <div style={{ marginTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontFamily: "roboto" }}>
                    Overlays
                  </Typography>
                </div>
                <Select
                  disabled={!props.editWorkspace}
                  style={{
                    width: 80,
                    height: 30,
                    marginTop: -26,
                  }}
                  value={""}
                >
                  <div style={{ textAlign: "center", width: "100%" }}>
                    File overlays
                  </div>
                  <Divider style={{ marginBottom: 5 }} />
                  {workspaceFiles.map((e: File) => (
                    <MenuItem
                      value={e.id}
                      style={{
                        backgroundColor: getHistogramSelectedColor(
                          plot.id,
                          e.id
                        ),
                        padding: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          backgroundColor: "rgba(250,250,250,0.5)",
                          padding: 5,
                        }}
                        onClick={() => {
                          handleMultiPlotHistogram("file", e);
                        }}
                      >
                        <span>
                          {e.label}
                          {isDownloaded(e.id) ? null : isDownloading(e.id) ? (
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
                        </span>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlotComponent;
