import React, { useEffect, useState } from "react";
import { Button, Tooltip } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CancelIcon from "@material-ui/icons/Cancel";

import TuneIcon from "@material-ui/icons/Tune";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import MessageModal from "../../modals/MessageModal";
import dataManager from "../../../dataManagement/dataManager";
import RangeResizeModal from "../../modals/rangeResizeModal";
import PlotData from "graph/dataManagement/plotData";
import normalGatingIcon from "../../../../assets/images/normalGatingIcon.png";
import inverseGatingIcon from "../../../../assets/images/inverseGatingIcon.png";
import gate from "../../../../assets/images/gate.png";

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
    const histogramAxis = plot.plotData.xHistogram
      ? "vertical"
      : plot.plotData.yHistogram
      ? "horizontal"
      : null;
    const targetPlots: PlotData[] = [];
    const plots = dataManager.getAllPlots();
    plots.forEach((res) => {
      const tPlot = res.plot;
      if (
        tPlot.xAxis === plot.plotData.xAxis &&
        tPlot.yAxis === plot.plotData.yAxis &&
        tPlot.xPlotType === plot.plotData.xPlotType &&
        tPlot.yPlotType === plot.plotData.yPlotType
      ) {
        targetPlots.push(tPlot);
      }
    });

    targetPlots.forEach((e) => {
      if (histogramAxis !== "horizontal")
        if (minX === 69 && maxX === 420) e.resetOriginalRanges();
        else e.ranges.set(axisX, [minX, maxX]);

      if (histogramAxis !== "vertical")
        if (minY === 69 && maxY === 420) e.resetOriginalRanges();
        else e.ranges.set(axisY, [minY, maxY]);
    });

    targetPlots.forEach((e) => dataManager.redrawPlotIds.push(e.id));

    dataManager.updateWorkspace();
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
          histogramAxis: plot.plotData.xHistogram
            ? "vertical"
            : plot.plotData.yHistogram
            ? "horizontal"
            : null,
          axisX: rangeResizeModalAxisX,
          axisY: rangeResizeModalAxisY,
          minX: rangeResizeModalTargetMinX,
          maxX: rangeResizeModalTargetMaxX,
          minY: rangeResizeModalTargetMinY,
          maxY: rangeResizeModalTargetMaxY,
          plot: plot.plotData as PlotData,
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
          gap: 5,
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
            onClick={() => polygonGatingSetter()}
            style={{
              flex: 1,
              color: "white",
              height: "1.7rem",
              fontSize: "12",
              backgroundColor: polygonGating ? "#6666ee" : "#6666aa",
            }}
          >
            {polygonGating ? (
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
              if (plot.plotData.gates.length === 0) {
                setEmptySubpopModalOpen(true);
                return;
              }
              dataManager.createSubpopFromGatesInPlot(plot.plotData.id);
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
              if (plot.plotData.gates.length === 0) {
                setEmptySubpopModalOpen(true);
                return;
              }
              dataManager.createSubpopFromGatesInPlot(plot.plotData.id, true);
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
              const rangesX = plot.plotData.ranges.get(plot.plotData.xAxis);
              setRangeResizeModalTargetMinX(rangesX[0]);
              setRangeResizeModalTargetMaxX(rangesX[1]);
              const rangesY = plot.plotData.ranges.get(plot.plotData.yAxis);
              setRangeResizeModalTargetMinY(rangesY[0]);
              setRangeResizeModalTargetMaxY(rangesY[1]);
              setRangeResizeModalAxisX(plot.plotData.xAxis);
              setRangeResizeModalAxisY(plot.plotData.yAxis);
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
