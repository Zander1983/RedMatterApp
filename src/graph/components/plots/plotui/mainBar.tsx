import React, { useEffect, useState } from "react";
import { Button, Tooltip } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import useForceUpdate from "hooks/forceUpdate";
import CancelIcon from "@material-ui/icons/Cancel";

import MessageModal from "../../modals/MessageModal";
import dataManager from "../../../dataManagement/dataManager";
import RangeResizeModal from "../../modals/rangeResizeModal";

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

export default function MainBar(props: any) {
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

  const [polygonGating, setPolygonGating] = React.useState(false);
  const plot = props.plot;
  const setAxisRange = (
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    axisX: string,
    axisY: string
  ) => {
    if (minX === 69 && maxX === 420) {
      props.plot.plotData.resetOriginalRanges();
    } else {
      props.plot.plotData.ranges.set(axisX, [minX, maxX]);
    }

    if (minY === 69 && maxY === 420) props.plot.plotData.resetOriginalRanges();
    else props.plot.plotData.ranges.set(axisY, [minY, maxY]);
    console.log("PLOT", plot);
    dataManager.updateWorkspace();
    plot.update();
  };

  const deletePlot = () => {
    dataManager.removePlotFromWorkspace(plot.plotData.id);
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  // const ovalGatingSetter = () => {
  //   if (ovalGating) {
  //     plot.setGating("Oval", false);
  //     setOvalGating(false);
  //   } else {
  //     plot.setGating("Oval", true);
  //     setOvalGating(true);
  //   }
  // };

  const polygonGatingSetter = () => {
    if (polygonGating) {
      plot.setGating("Polygon", false);
      setPolygonGating(false);
    } else {
      plot.setGating("Polygon", true);
      setPolygonGating(true);
    }
  };

  useEffect(() => {
    plot.unsetGating = () => {
      setPolygonGating(false);
      // setOvalGating(false);
    };
  }, [plot]);

  // const downloadCanvasAsImage = () => {
  //   let downloadLink = document.createElement("a");
  //   downloadLink.setAttribute(
  //     "download",
  //     `workspacename-filename-${plot.plotData.id}.png`
  //   );
  //   let canvas = document.getElementById(`canvas-${plot.plotData.id}`);
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
    <Grid container direction="row" xs={12} style={classes.main}>
      <RangeResizeModal
        open={openResize}
        closeCall={{
          f: handleClose,
          ref: setOpenResize,
        }}
        inits={{
          axisX: rangeResizeModalAxisX,
          axisY: rangeResizeModalAxisY,
          minX: rangeResizeModalTargetMinX,
          maxX: rangeResizeModalTargetMaxX,
          minY: rangeResizeModalTargetMinY,
          maxY: rangeResizeModalTargetMaxY,
        }}
        callback={setAxisRange}
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
          // border: "1px solid black",
          // display: "table",
          display: "flex",
          justifyContent: "space-between",
        }}
        direction="row"
      >
        <Button
          onClick={() => setDeleteModalOpen(true)}
          style={{
            backgroundColor: "#c45",
            fontSize: 12,
            marginRight: 5,
            marginLeft: 5,
            flex: "1 1 auto",
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
            onClick={() => polygonGatingSetter()}
            style={{
              flex: "1 1 auto",
              fontSize: 12,
              color: "white",
              marginRight: 5,
              marginLeft: 5,
              backgroundColor: polygonGating ? "#6666ee" : "#6666aa",
            }}
          >
            {polygonGating ? "Drawing gate..." : "Draw gate"}
          </Button>
        </Tooltip>
        <Button
          variant="contained"
          size="medium"
          onClick={() => {
            const rangesX = plot.plotData.ranges.get(plot.plotData.xAxis);
            setRangeResizeModalTargetMinX(rangesX[0]);
            setRangeResizeModalTargetMaxX(rangesX[1]);
            const rangesY = plot.plotData.ranges.get(plot.plotData.yAxis);
            setRangeResizeModalTargetMinY(rangesY[0]);
            setRangeResizeModalTargetMaxY(rangesY[1]);
            setRangeResizeModalAxisX(plot.plotData.xAxis + " (X Axis)");
            setRangeResizeModalAxisY(plot.plotData.yAxis + " (Y Axis)");
            setOpenResize(true);
          }}
          style={{
            // flex: "1 1 auto",
            width: "100%",
            fontSize: 12,
            color: "white",
            marginTop: 5,
            marginRight: 5,
            marginLeft: 5,
            backgroundColor: "#6666aa",
          }}
        >
          Edit Axes
        </Button>

        {/* <Button
          variant="contained"
          size="medium"
          onClick={() => {
            const ranges = plot.plotData.ranges.get(plot.plotData.xAxis);
            setRangeResizeModalTargetMinY(ranges[0]);
            setRangeResizeModalTargetMaxY(ranges[1]);
            setOpenResize(true);
            setRangeResizeModalAxisX(plot.plotData.xAxis + " (X Axis)");
          }}
          style={{
            width: "47%",
            fontSize: 12,
            color: "white",
            marginTop: 5,
            marginRight: 5,
            marginLeft: 5,
            backgroundColor: "#6666aa",
          }}
        >
          Edit X axis
        </Button> */}
        {/* <Button
          style={{
            backgroundColor: "#66a",
            flex: "1 1 auto",
            color: "white",
            marginRight: 5,
            marginLeft: 5,
            fontSize: 12,
          }}
          variant="contained"
          size="medium"
          onClick={() => {
            if (plot.plotData.gates.length === 0) {
              setEmptySubpopModalOpen(true);
              return;
            }
            dataManager.createSubpopFromGatesInPlot(plot.plotData.id);
          }}
        >
          Subpop
        </Button>
        <Button
          style={{
            ...classes.mainButton,
            flex: "1 1 auto",
            marginRight: 5,
            marginLeft: 5,
            color: "white",
            fontSize: 12,
          }}
          variant="contained"
          size="medium"
          onClick={() => {
            if (plot.plotData.gates.length === 0) {
              setEmptySubpopModalOpen(true);
              return;
            }
            dataManager.createSubpopFromGatesInPlot(plot.plotData.id, true);
          }}
        >
          Inverse Subpop
        </Button> */}
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
