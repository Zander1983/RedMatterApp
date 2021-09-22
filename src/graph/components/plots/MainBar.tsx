import React, { useEffect, useState } from "react";
import { Button, Tooltip } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CancelIcon from "@material-ui/icons/Cancel";

import TuneIcon from "@material-ui/icons/Tune";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import MessageModal from "../modals/MessageModal";
import RangeResizeModal from "../modals/rangeResizeModal";
import normalGatingIcon from "../../../assets/images/normalGatingIcon.png";
import inverseGatingIcon from "../../../assets/images/inverseGatingIcon.png";
import gate from "../../../assets/images/gate.png";
import { Plot, PopulationGateType } from "graph/resources/types";
import { getWorkspace } from "graph/utils/workspace";
import * as PlotResource from "graph/resources/plots";
import { store } from "redux/store";

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
    width: 20,
  },
  mainButton: {
    backgroundColor: "#66a",
    color: "white",
    marginLeft: 5,
    fontSize: 12,
  },
};

export default function MainBar(props: { plot: Plot }) {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [emptySubpopModalOpen, setEmptySubpopModalOpen] = React.useState(false);
  // const [ovalGating, setOvalGating] = React.useState(false);
  const [openResize, setOpenResize] = useState(false);
  const [rangeResizeModalAxisX, setRangeResizeModalAxisX] = React.useState("");
  const [rangeResizeModalAxisY, setRangeResizeModalAxisY] = React.useState("");
  const [rangeResizeModalTargetMinX, setRangeResizeModalTargetMinX] =
    React.useState(0);
  const [rangeResizeModalTargetMaxX, setRangeResizeModalTargetMaxX] =
    React.useState(0);
  const [rangeResizeModalTargetMinY, setRangeResizeModalTargetMinY] =
    React.useState(0);
  const [rangeResizeModalTargetMaxY, setRangeResizeModalTargetMaxY] =
    React.useState(0);

  //cambie los min y max para que ahora reciban los parametros para X e Y

  const plot = props.plot;

  const deletePlot = () => {
    store.dispatch({
      type: "workspace.DELETE_PLOT",
      payload: { plot: plot },
    });
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  const gatingSetter = () => {
    let plot = props.plot;
    if (plot.gatingActive) {
      plot.gatingActive = "";
    } else if (plot.histogramAxis === "") {
      plot.gatingActive = "polygon";
    } else {
      plot.gatingActive = "histogram";
    }
    store.dispatch({
      type: "workspace.UPDATE_PLOT",
      payload: { plot: plot },
    });
  };

  // const downloadCanvasAsImage = () => {
  //   let downloadLink = document.createElement("a");
  //   downloadLink.setAttribute(
  //     "download",
  //     `workspacename-filename-${props.plot.id}.png`
  //   );
  //   let canvas = document.getElementById(`canvas-${props.plot.id}`);
  //   //@ts-ignore
  //   let dataURL = canvas.toDataURL("image/png");
  //   let url = dataURL.replace(
  //     /^data:image\/png/,
  //     "data:application/octet-stream"
  //   );
  //   downloadLink.setAttribute("href", url);
  //   downloadLink.click();
  // };

  return (
    <Grid container direction="row" xs={12} item style={classes.main}>
      <RangeResizeModal
        open={openResize}
        closeCall={{
          f: handleClose,
          ref: setOpenResize,
        }}
        plot={props.plot}
      ></RangeResizeModal>
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
        <Button
          variant="contained"
          size="small"
          onClick={() => setDeleteModalOpen(true)}
          style={{
            backgroundColor: "#c45",
            fontSize: 12,
            height: "1.7rem",
          }}
        >
          <CancelIcon
            fontSize="small"
            style={{
              ...classes.iconButtonIcon,
            }}
          ></CancelIcon>
        </Button>
        <Tooltip
          title={
            <React.Fragment>
              <h3 style={{ color: "white" }}>
                This button enables/disables gate drawing
              </h3>
              <br />
              Click anywhere on plot below to create gate points. <br />
              Connect the final point with the first to create your gate. <br />
              A new plot will be created with the population inside your gate.
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
              height: "1.7rem",
              fontSize: "12",
              backgroundColor: plot.gatingActive !== "" ? "#6666ee" : "#6666aa",
            }}
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
        <Tooltip
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
              height: "1.7rem",
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
            {/* Subpop */}
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
              height: "1.7rem",
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
            {/* Inverse Subpop */}
            <img
              src={inverseGatingIcon}
              alt={"Suppopulation"}
              style={{ width: 20, height: 20 }}
            />
          </Button>
        </Tooltip>
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
              const rangesX = props.plot.ranges[props.plot.xAxis];
              setRangeResizeModalTargetMinX(rangesX[0]);
              setRangeResizeModalTargetMaxX(rangesX[1]);
              const rangesY = props.plot.ranges[props.plot.yAxis];
              setRangeResizeModalTargetMinY(rangesY[0]);
              setRangeResizeModalTargetMaxY(rangesY[1]);
              setRangeResizeModalAxisX(props.plot.xAxis);
              setRangeResizeModalAxisY(props.plot.yAxis);
              setOpenResize(true);
            }}
            style={{
              flex: 1,
              height: "1.7rem",
              fontSize: 12,
              color: "white",
              backgroundColor: "#6666aa",
            }}
          >
            <TuneIcon />
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
      {/* <Button style={{ display: "inline-block"}}
        onClick={() => downloadCanvasAsImage()}
        style={{ ...classes.iconButton, marginLeft: 5 }}
      >
        <CameraAltIcon
          fontSize="small"
          style={classes.iconButtonIcon}
        ></CameraAltIcon>
      </Button> */}
    </Grid>
  );
}
