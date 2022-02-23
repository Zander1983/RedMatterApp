import React, { useState } from "react";
import { Button, Tooltip } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CancelIcon from "@material-ui/icons/Cancel";

import TuneIcon from "@material-ui/icons/Tune";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import MessageModal from "../modals/MessageModal";
import RangeResizeModal from "../modals/rangeResizeModal";
import gate from "../../../assets/images/gate.png";
import { Plot, PlotsRerender } from "graph/resources/types";
import {
  getFile,
  getGate,
  getPopulation,
  getWorkspace,
} from "graph/utils/workspace";
import * as PlotResource from "graph/resources/plots";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import { CameraFilled } from "@ant-design/icons";
import EventQueueDispatch from "graph/workspaceRedux/eventQueueDispatchers";

const classes = {
  main: {
    marginBottom: 10,
    paddingLeft: 2,
    paddingRight: 2,
  },
  iconButton: {
    backgroundColor: "#6666aa",
    maxWidth: 20,
    boxShadow: "1px 1px 2px #555",
  },
  iconButtonIcon: {
    color: "#fff",
  },
  mainButton: {
    backgroundColor: "#66a",
    color: "white",
    marginLeft: 5,
    fontSize: 12,
  },
};

export const deleteAllPlotsAndPopulationOfNonControlFile = () => {
  const workspace = getWorkspace();
  workspace.files.map((file) => {
    if (file.id !== workspace.selectedFile) {
      file.view = false;
      WorkspaceDispatch.UpdateFile(file);
    }
  });
  const plots: string[] = [];
  const populations: string[] = [];
  workspace.files.map((file) => {
    if (file.id !== workspace.selectedFile) {
      workspace.populations.map((pop) => {
        if (pop.file === file.id) {
          populations.push(pop.id);
          workspace.plots.map((plot) => {
            if (plot.population === pop.id) {
              plots.push(plot.id);
            }
          });
        }
      });
    }
  });
  WorkspaceDispatch.DeletePlotsAndPopulations(plots, populations);
};

export const deleteSpecificPlotsFromAllFiles = (plot: Plot) => {
  const workspace = getWorkspace();
  const plotFile = getFile(getPopulation(plot.population).file);
  if (plotFile.id === workspace.selectedFile) {
    const index = workspace.plots.findIndex((plt) => plt.id === plot.id);
    let selectedFilePlotLength = 0;
    workspace.plots.map((plot) => {
      if (
        getFile(getPopulation(plot.population).file).id ===
        workspace.selectedFile
      ) {
        selectedFilePlotLength += 1;
      }
    });
    const plots: string[] = [];
    for (
      let i = index;
      i < workspace.plots.length;
      i += selectedFilePlotLength
    ) {
      plots.push(workspace.plots[i].id);
    }
    WorkspaceDispatch.DeletePlots(plots);
  }
};

export const deletePlotAndPopulationOfFile = (fileId: string) => {
  const workspace = getWorkspace();
  const plots: string[] = [];
  const populations: string[] = [];
  workspace.files.map((file) => {
    if (file.id === fileId) {
      workspace.populations.map((pop) => {
        if (pop.file === file.id) {
          populations.push(pop.id);
          workspace.plots.map((plot) => {
            if (plot.population === pop.id) {
              plots.push(plot.id);
            }
          });
        }
      });
    }
  });
  WorkspaceDispatch.DeletePlotsAndPopulations(plots, populations);
};

export default function MainBar(props: { plot: Plot; editWorkspace: boolean }) {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [emptySubpopModalOpen, setEmptySubpopModalOpen] = React.useState(false);
  // const [ovalGating, setOvalGating] = React.useState(false);
  const [openResize, setOpenResize] = useState(false);
  const [, setRangeResizeModalAxisX] = React.useState("");
  const [, setRangeResizeModalAxisY] = React.useState("");
  const [, setRangeResizeModalTargetMinX] = React.useState(0);
  const [, setRangeResizeModalTargetMaxX] = React.useState(0);
  const [, setRangeResizeModalTargetMinY] = React.useState(0);
  const [, setRangeResizeModalTargetMaxY] = React.useState(0);

  //cambie los min y max para que ahora reciban los parametros para X e Y

  const plot = props.plot;
  const workspace = getWorkspace();

  const deletePlot = () => {
    let selectedFilePlotLength = 0;
    workspace.plots.map((plot) => {
      if (
        getFile(getPopulation(plot.population).file).id ===
        workspace.selectedFile
      ) {
        selectedFilePlotLength += 1;
      }
    });
    if (selectedFilePlotLength === 1) {
      WorkspaceDispatch.ResetWorkspaceExceptFiles();
    } else {
      deleteSpecificPlotsFromAllFiles(props.plot);
    }
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  const gatingSetter = () => {
    let plot = props.plot;
    if (plot.gatingActive) {
      plot.gatingActive = "";
      let plotsRerenderQueueItem: PlotsRerender = {
        id: "",
        used: false,
        type: "plotsRerender",
        plotIDs: [plot.id],
      };
      EventQueueDispatch.AddQueueItem(plotsRerenderQueueItem);
    } else if (plot.histogramAxis === "") {
      plot.gatingActive = "polygon";
    } else {
      plot.gatingActive = "histogram";
    }
    WorkspaceDispatch.UpdatePlot(plot);
  };

  const downloadCanvasAsImage = () => {
    let downloadLink = document.createElement("a");
    const file = PlotResource.getPlotFile(props.plot);
    const fileLabel = file.label.includes(".fcs")
      ? file.label.split(".fcs")[0]
      : file.label;
    const population = getPopulation(props.plot.population);
    const gateName =
      population.gates.length > 0
        ? getGate(population.gates[0].gate).name
        : null;
    const plotName = props.plot.label;
    downloadLink.setAttribute(
      "download",
      `${
        gateName ? gateName + "-" : plotName ? plotName + "-" : ""
      }${fileLabel}.png`
    );

    // selecting the canvas from dom
    const canvas: HTMLCanvasElement = document.getElementById(
      `canvas-${props.plot.id}`
    ) as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");

    // Adding x-axis
    context.font = "16px Roboto black";
    context.fillText(
      `X-AxisName: ${props.plot.xAxis}`,
      canvas.offsetWidth / 2 + 35,
      canvas.offsetHeight * 2 - 10
    );

    // Adding y-axis
    context.font = "16px Roboto black";
    context.fillText(`Y-AxisName: ${props.plot.yAxis}`, 20, 20);

    //@ts-ignore
    let dataURL = canvas.toDataURL("image/png");
    let url = dataURL.replace(
      /^data:image\/png/,
      "data:application/octet-stream"
    );
    downloadLink.setAttribute("href", url);
    downloadLink.click();

    // Clearing the X-Axis
    context.clearRect(
      canvas.offsetWidth / 2,
      canvas.offsetHeight * 2 - 30,
      canvas.offsetWidth,
      32
    );
    context.fillStyle = "white";
    context.fillRect(
      canvas.offsetWidth / 2,
      canvas.offsetHeight * 2 - 30,
      canvas.offsetWidth,
      32
    );

    // Clearing the Y-Axis
    context.clearRect(0, 0, canvas.offsetWidth, 32);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.offsetWidth, 32);
  };

  return (
    <Grid direction="row" style={classes.main} container component={"div"}>
      <RangeResizeModal
        open={openResize}
        closeCall={{
          f: handleClose,
          ref: setOpenResize,
        }}
        plot={props.plot}
      />
      <MessageModal
        open={deleteModalOpen}
        closeCall={{
          f: handleClose,
          ref: setDeleteModalOpen,
        }}
        message={<h2>Are you sure you want to delete this panel?</h2>}
        options={{
          yes: () => {
            deletePlot();
          },
          no: () => {
            handleClose(setDeleteModalOpen);
          },
        }}
      />

      <MessageModal
        open={emptySubpopModalOpen}
        closeCall={{
          f: handleClose,
          ref: setEmptySubpopModalOpen,
        }}
        message={
          <h2 style={{ fontSize: 23, fontWeight: 400 }}>
            You cannot create a subpopulation of a plot that is not gated!
          </h2>
        }
      />

      <Grid
        container
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          gap: 3,
        }}
        direction="row"
      >
        {workspace.selectedFile ===
          getFile(getPopulation(plot.population).file).id && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setDeleteModalOpen(true)}
            style={{
              backgroundColor: "#c45",
              fontSize: 12,
              height: "2rem",
            }}
            disabled={!props.editWorkspace}
          >
            <CancelIcon
              fontSize="small"
              style={{
                ...classes.iconButtonIcon,
              }}
            />
          </Button>
        )}

        {/* Drawing Polygon Gate */}
        {workspace.selectedFile ===
          getFile(getPopulation(plot.population).file).id && (
          <Tooltip
            title={
              <React.Fragment>
                <h3 style={{ color: "white" }}>
                  This button enables/disables gate drawing
                </h3>
                <br />
                Click anywhere on plot below to create gate points. <br />
                Connect the final point with the first to create your gate.{" "}
                <br />A new plot will be created with the population inside your
                gate.
              </React.Fragment>
            }
          >
            <Button
              variant="contained"
              size="small"
              onClick={gatingSetter}
              style={{
                flex: 1,
                color: "white",
                height: "2rem",
                fontSize: "12",
                backgroundColor:
                  plot.gatingActive !== "" ? "#6666ee" : "#6666aa",
              }}
              disabled={!props.editWorkspace}
            >
              {plot.gatingActive !== "" ? (
                <TouchAppIcon />
              ) : (
                <img
                  src={gate}
                  alt={"gate"}
                  style={{
                    height: "1.2rem",
                    fill: "none",
                    strokeWidth: 3,
                    stroke: "#491EC4",
                  }}
                ></img>
              )}
            </Button>
          </Tooltip>
        )}
        {/* <Tooltip
          title={
            <React.Fragment>
              <h3 style={{ color: "white" }}>
                This button creates a subpopulation given your current gates
              </h3>
            </React.Fragment>
          }
        >
          <Button
            variant="contained"
            size="small"
            style={{
              flex: 1,
              height: "2rem",
              fontSize: 12,
              color: "white",
              backgroundColor: "#6666aa",
            }}
            onClick={() => {
              if (props.plot.gates.length === 0) {
                setEmptySubpopModalOpen(true);
                return;
              }
              const gates: PopulationGateType[] = props.plot.gates.map((e) => {
                return {
                  gate: e,
                  inverseGating: false,
                };
              });
              PlotResource.createSubpopPlot(plot, gates);
            }}
          >
            <img
              src={normalGatingIcon}
              alt={"Suppopulation"}
              style={{ width: 20, height: 20 }}
            />
          </Button>
        </Tooltip>
        <Tooltip
          title={
            <React.Fragment>
              <h3 style={{ color: "white" }}>
                This button creates a inverse subpopulation given your current
                gates
              </h3>
            </React.Fragment>
          }
        >
          <Button
            variant="contained"
            size="small"
            style={{
              flex: 1,
              height: "2rem",
              fontSize: 12,
              color: "white",
              backgroundColor: "#6666aa",
            }}
            onClick={() => {
              if (props.plot.gates.length === 0) {
                setEmptySubpopModalOpen(true);
                return;
              }
              const gates: PopulationGateType[] = props.plot.gates.map((e) => {
                return {
                  gate: e,
                  inverseGating: true,
                };
              });
              PlotResource.createSubpopPlot(plot, gates);
            }}
          >
            <img
              src={inverseGatingIcon}
              alt={"Suppopulation"}
              style={{ width: 20, height: 20 }}
            />
          </Button>
        </Tooltip> */}
        <Tooltip
          title={
            <React.Fragment>
              <h3 style={{ color: "white" }}>
                This button opens a page for editing details of your plot, such
                as ranges
              </h3>
            </React.Fragment>
          }
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              const axes = PlotResource.getXandYRanges(plot);
              const rangesX = axes.x;
              setRangeResizeModalTargetMinX(rangesX[0]);
              setRangeResizeModalTargetMaxX(rangesX[1]);
              const rangesY = axes.y;
              setRangeResizeModalTargetMinY(rangesY[0]);
              setRangeResizeModalTargetMaxY(rangesY[1]);
              setRangeResizeModalAxisX(props.plot.xAxis);
              setRangeResizeModalAxisY(props.plot.yAxis);
              setOpenResize(true);
            }}
            style={{
              flex: 1,
              height: "2rem",
              fontSize: 12,
              color: "white",
              backgroundColor: "#6666aa",
            }}
            disabled={!props.editWorkspace}
          >
            <TuneIcon />
          </Button>
        </Tooltip>
        <Tooltip
          title={
            <React.Fragment>
              <h3 style={{ color: "white" }}>
                This button downloads the plot as a png picture
              </h3>
            </React.Fragment>
          }
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => downloadCanvasAsImage()}
            style={{
              flex: 1,
              height: "2rem",
              fontSize: 12,
              color: "white",
              backgroundColor: "#6666aa",
            }}
            disabled={!props.editWorkspace}
          >
            <CameraFilled style={classes.iconButtonIcon} />
          </Button>
        </Tooltip>
      </Grid>
      {/* <Button style={{ display: "inline-block"}}
        variant="contained"
        size="medium"
        onClick={() => ovalGatingSetter()}
        style={{
          ...classes.mainButton,
          backgroundColor: ovalGating ? "#6666ee" : "#6666aa",
        }}
        >
        Oval
      </Button> */}
      {/* <Button style={{ display: "inline-block"}}
              variant="contained"
              size="medium"
              // onClick={}
              style={classes.mainButton}
            >
              Quadrant
            </Button> */}
    </Grid>
  );
}
