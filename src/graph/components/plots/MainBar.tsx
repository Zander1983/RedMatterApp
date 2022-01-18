import React, { useState } from "react";
import { Button, Tooltip } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CancelIcon from "@material-ui/icons/Cancel";

import TuneIcon from "@material-ui/icons/Tune";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import MessageModal from "../modals/MessageModal";
import RangeResizeModal from "../modals/rangeResizeModal";
import gate from "../../../assets/images/gate.png";
import { Plot, PlotsRerender, Population } from "graph/resources/types";
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
    file.view = false;
    WorkspaceDispatch.UpdateFile(file);
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
  const deleteGateWithNoChild = () => {
    // Delete the plot
    WorkspaceDispatch.DeletePlot(plot);
    // Delete the population and take the gateId
    const gates = getPopulation(plot.population).gates;
    WorkspaceDispatch.DeletePopulation(getPopulation(plot.population));
    // Delete the gate id from parent plot
    workspace.plots.map((plt) => {
      plt.gates.map((gate) => {
        gates.map((g) => {
          if (g.gate === gate) {
            plt.gates = plt.gates.filter((gate) => gate !== g.gate);
          }
        });
      });
      WorkspaceDispatch.UpdatePlot(plt);
    });
    // Delete the gate
    gates.map((gate) => {
      workspace.populations.map((pop) => {
        pop.gates.map((g) => {
          if (g.gate === gate.gate) {
            workspace.plots.map((plt) => {
              if (plt.population === pop.id) {
                console.log("Delete Plot", pop.id);
                WorkspaceDispatch.DeletePlot(plt);
                WorkspaceDispatch.DeletePopulation(pop);
              }
            });
            // console.log("Delete Population");
          }
        });
      });
      WorkspaceDispatch.DeleteGateOnly(gate.gate);
    });
  };

  const deleteGateWithChild = () => {
    // 1. Handeling the Parent Part
    WorkspaceDispatch.DeletePlot(plot);
    plot.gates.map((gate) => WorkspaceDispatch.DeleteGateOnly(gate));
    const gates = getPopulation(plot.population).gates;
    WorkspaceDispatch.DeletePopulation(getPopulation(plot.population));
    workspace.plots.map((plt) => {
      plt.gates.map((gate) => {
        gates.map((g) => {
          if (g.gate === gate) {
            plt.gates = plt.gates.filter((gate) => gate !== g.gate);
          }
        });
      });
      WorkspaceDispatch.UpdatePlot(plt);
    });

    // 2. Handeling the Child Part
    const children: string[] = [];
    gates.map((gate) => {
      workspace.gates.map((gate) => gate.children.map((c) => children.push(c)));
      WorkspaceDispatch.DeleteGateOnly(gate.gate);
    });
    children.map((child) => {
      workspace.populations.map((pop) => {
        pop.gates.map((gate) => {
          if (gate.gate === child) {
            workspace.plots.map((plot) => {
              if (plot.population === pop.id) {
                WorkspaceDispatch.DeletePlot(plot);
                plot.gates.map((gate) =>
                  WorkspaceDispatch.DeleteGateOnly(gate)
                );
              }
            });
            WorkspaceDispatch.DeletePopulation(pop);
          }
        });
      });
    });
  };

  const deleteGateFromGateWithNoChild = () => {
    // Delete the plot
    WorkspaceDispatch.DeletePlot(plot);
    // Delete the population and take the gateId
    const gates = getPopulation(plot.population).gates[0];
    WorkspaceDispatch.DeletePopulation(getPopulation(plot.population));
    // Delete the gate id from parent plot
    workspace.plots.map((plt) => {
      plt.gates.map((gate) => {
        if (gate === gates.gate) {
          plt.gates = plt.gates.filter((gate) => gate !== gates.gate);
        }
      });
      WorkspaceDispatch.UpdatePlot(plt);
    });
    // Delete the Gate and Update Parent Gate
    workspace.gates.map((gate) => {
      if (gate.id === gates.gate) {
        gate.parents.map((parent) => {
          workspace.gates.map((g) => {
            if (g.id === parent) {
              g.children = g.children.filter((ele) => ele !== gate.id);
              WorkspaceDispatch.UpdateGate(g);
            }
          });
        });
        WorkspaceDispatch.DeleteGateOnly(gate.id);
      }
    });
  };

  const deleteGateFromGateWithChild = () => {
    // Handeling the Parent part
    // Deleting the plot
    WorkspaceDispatch.DeletePlot(plot);
    plot.gates.map((gate) => WorkspaceDispatch.DeleteGateOnly(gate));
    const gates = getPopulation(plot.population).gates[0];
    // Deleting the population
    WorkspaceDispatch.DeletePopulation(getPopulation(plot.population));
    // Removing the Gate from Parent Plot
    workspace.plots.map((plt) => {
      plt.gates.map((gate) => {
        if (gate === gates.gate) {
          plt.gates = plt.gates.filter((gate) => gate !== gates.gate);
        }
      });
      WorkspaceDispatch.UpdatePlot(plt);
    });
    // Deleting the Gate and Updating its Parent Gate
    workspace.gates.map((gate) => {
      if (gate.id === gates.gate) {
        gate.parents.map((parent) => {
          workspace.gates.map((g) => {
            if (g.id === parent) {
              g.children = g.children.filter((ele) => ele !== gate.id);
              WorkspaceDispatch.UpdateGate(g);
            }
          });
        });
        WorkspaceDispatch.DeleteGateOnly(gate.id);
      }
    });

    // Handling the Child Part
    const children: string[] = [];
    workspace.gates.map((gate) =>
      gate.parents.map((p) => {
        if (p === gates.gate) {
          children.push(p);
        }
        WorkspaceDispatch.DeleteGateOnly(gates.gate);
      })
    );

    children.map((child) => {
      workspace.populations.map((pop) => {
        pop.gates.map((gate) => {
          if (gate.gate === child) {
            workspace.plots.map((plot) => {
              if (plot.population === pop.id) {
                WorkspaceDispatch.DeletePlot(plot);
                plot.gates.map((gate) =>
                  WorkspaceDispatch.DeleteGateOnly(gate)
                );
              }
            });
            WorkspaceDispatch.DeletePopulation(pop);
          }
        });
      });
    });
  };

  const delPlot = () => {
    deleteAllPlotsAndPopulationOfNonControlFile();

    const population = getPopulation(plot.population);

    // If the plot is of Controlled file
    if (population.file === workspace.selectedFile) {
      // If the main plot is deleted of the control file
      // Clear the entire workspace
      if (population.gates.length === 0) {
        WorkspaceDispatch.ResetWorkspaceExceptFiles();
      } else if (population.gates.length === 1) {
        // Gates Created from RootFile
        if (plot.gates.length === 0) {
          // A gate from Rootfile with no clild
          deleteGateWithNoChild();
        } else {
          // A gate from Rootfile with clild
          deleteGateWithChild();
        }
      } else {
        // Gates Are created from Gates
        if (plot.gates.length === 0) {
          // A gate from Gate with no clild
          deleteGateFromGateWithNoChild();
        } else {
          // A gate from Gate with no clild
          deleteGateFromGateWithChild();
        }
      }
    }
  };

  const deletePlot = () => {
    deleteAllPlotsAndPopulationOfNonControlFile();
    WorkspaceDispatch.DeletePlot(plot);
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  const gatingSetter = () => {
    deleteAllPlotsAndPopulationOfNonControlFile();
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
