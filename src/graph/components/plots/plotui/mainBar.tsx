import { Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
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
  const [rangeResizeModalAxis, setRangeResizeModalAxis] = React.useState("");
  const [rangeResizeModalTargetMin, setRangeResizeModalTargetMin] =
    React.useState(0);
  const [rangeResizeModalTargetMax, setRangeResizeModalTargetMax] =
    React.useState(0);
  const [polygonGating, setPolygonGating] = React.useState(false);
  const plot = props.plot;
  const [lastUpdate, setLastUpdate] = React.useState(null);
  const setAxisRange = (min: number, max: number, axis: string) => {
    if (min === 69 && max === 420) props.plot.plotData.resetOriginalRanges();
    else props.plot.plotData.ranges.set(axis, [min, max]);
    if (lastUpdate + 40 < new Date().getTime()) {
      dataManager.updateWorkspace();
      setLastUpdate(new Date().getTime());
    }
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
          axis: rangeResizeModalAxis,
          min: rangeResizeModalTargetMin,
          max: rangeResizeModalTargetMax,
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
        <Button
          variant="contained"
          size="medium"
          onClick={() => polygonGatingSetter()}
          style={{
            flex: "2 2 auto",
            width: "75%",
            fontSize: 12,
            color: "white",
            marginRight: 5,
            marginLeft: 5,
            backgroundColor: polygonGating ? "#6666ee" : "#6666aa",
          }}
        >
          Draw gate
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={() => {
            const ranges = plot.plotData.ranges.get(plot.plotData.yAxis);
            setRangeResizeModalTargetMin(ranges[0]);
            setRangeResizeModalTargetMax(ranges[1]);
            setOpenResize(true);
            setRangeResizeModalAxis(plot.plotData.yAxis + " (Y Axis)");
          }}
          style={{
            // flex: "1 1 auto",
            width: "47%",
            fontSize: 12,
            color: "white",
            marginTop: 5,
            marginRight: 5,
            marginLeft: 5,
            backgroundColor: "#ffb300",
          }}
        >
          Edit Y axis
        </Button>

        <Button
          variant="contained"
          size="medium"
          onClick={() => {
            const ranges = plot.plotData.ranges.get(plot.plotData.xAxis);
            setRangeResizeModalTargetMin(ranges[0]);
            setRangeResizeModalTargetMax(ranges[1]);
            setOpenResize(true);
            setRangeResizeModalAxis(plot.plotData.xAxis + " (X Axis)");
          }}
          style={{
            width: "47%",
            fontSize: 12,
            color: "white",
            marginTop: 5,
            marginRight: 5,
            marginLeft: 5,
            backgroundColor: "#0277bd",
          }}
        >
          Edit X axis
        </Button>
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
