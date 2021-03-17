import React from "react";
import { Button } from "@material-ui/core";
import { Divider } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import DeleteIcon from "@material-ui/icons/Delete";

import MessageModal from "../modals/MessageModal";
import dataManager from "../../classes/dataManager";
import Canvas from "../../classes/canvas/canvas";

interface PlotInput {
  canvas: Canvas;
  canvasIndex: number;
}

const classes = {
  mainContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  utilityBar: {
    width: "100%",
  },
  buttonBar: {
    marginBottom: 10,
    paddingLeft: 2,
    paddingRight: 2,
    height: 40,
  },
  buttonBarDelete: {
    backgroundColor: "#6666aa",
  },
  buttonBarButton: {
    backgroundColor: "#66a",
    color: "white",
    marginLeft: 10,
  },
  axisBar: {
    marginTop: 10,
    marginBottom: 10,
  },
  axisBarAxis: {
    textAlign: "left",
    border: "solid 0.5px #ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fafafa",
    boxShadow: "1px 3px 4px #bbd",
  },
  canvasDisplay: {
    borderRadius: 5,
    boxShadow: "1px 3px 4px #bbd",
    width: "100%",
    height: "100% - 207",
    backgroundColor: "#dfd",
    flexGrow: 1,
  },
};

function Plot(props: PlotInput) {
  // == Setup canvas + metadata ==
  const [renderCount, setRenderCount] = React.useState(0);
  const canvas = props.canvas;
  canvas.rerender = () => setRenderCount(renderCount + 1);

  const xAxis = canvas.xAxis;
  const yAxis = canvas.yAxis;
  const xPlotType = canvas.xPlotType;
  const yPlotType = canvas.yPlotType;
  const [xHistogram, setXHistogram] = React.useState(false);
  const [yHistogram, setYHistogram] = React.useState(false);
  const [oldXAxis, setOldXAxis] = React.useState(null);
  const [oldYAxis, setOldYAxis] = React.useState(null);

  // == Canvas state management ==

  const isAxisDisabled = (axis: "x" | "y") => {
    return axis === "x" ? yHistogram : xHistogram;
  };

  const isCanvasHistogram = () => {
    return isAxisDisabled("y") || isAxisDisabled("x");
  };

  const setHistogram = (axis: "x" | "y", value: boolean) => {
    axis === "x" ? setXHistogram(value) : setYHistogram(value);

    if (value) {
      axis === "x" ? setOldYAxis(yAxis) : setOldXAxis(xAxis);
      axis === "x"
        ? props.canvas.xAxisToHistogram()
        : props.canvas.yAxisToHistogram();
    } else {
      axis === "x"
        ? props.canvas.setYAxis(oldYAxis)
        : props.canvas.setXAxis(oldXAxis);
    }
  };

  const setAxis = (axis: "x" | "y", value: string) => {
    const otherAxisValue = axis == "x" ? yAxis : xAxis;
    if (value == otherAxisValue && !isCanvasHistogram()) {
      setHistogram(axis == "x" ? "y" : "x", true);
    } else {
      axis == "x" ? props.canvas.setXAxis(value) : props.canvas.setYAxis(value);
    }
  };

  const setPlotType = (axis: "x" | "y", value: string) => {
    axis == "x"
      ? props.canvas.setXAxisPlotType(value)
      : props.canvas.setYAxisPlotType(value);
  };

  // == General modal logic ==
  const handleOpen = (func: Function) => {
    func(true);
  };
  const handleClose = (func: Function) => {
    func(false);
  };
  // Delete plot modal
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const deletePlot = () => {
    dataManager.removeFile(props.canvasIndex);
  };

  console.log(`plot ${props.canvasIndex} rendered for the ${renderCount} time`);
  return (
    <div id="workspace" style={classes.mainContainer}>
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

      {/* UTILITY BAR DISPLAY */}
      <div style={classes.utilityBar}>
        {/* BUTTONBAR DISPLAY */}
        <Grid container direction="row" xs={12} style={classes.buttonBar}>
          <Button
            onClick={() => setDeleteModalOpen(true)}
            style={classes.buttonBarDelete}
          >
            <DeleteIcon fontSize="small" style={{ color: "#fff" }}></DeleteIcon>
          </Button>
          {/* <Button
            variant="contained"
            size="medium"
            // onClick={}
            style={classes.buttonBarButton}
          >
            Polygon Gate
          </Button> */}
          <Button
            variant="contained"
            size="medium"
            // onClick={}
            style={classes.buttonBarButton}
          >
            Oval Gate
          </Button>
          {/* <Button
            variant="contained"
            size="medium"
            // onClick={}
            style={classes.buttonBarButton}
          >
            Quadrant
          </Button> */}
        </Grid>
        <Divider></Divider>

        {/* AXISBAR DISPLAY */}
        <Grid xs={12} container direction="column" style={classes.axisBar}>
          <Grid
            container
            direction="row"
            justify="space-evenly"
            style={classes.axisBarAxis}
          >
            <Grid>
              <h3
                style={{
                  marginTop: 1,
                }}
              >
                X axis
              </h3>
            </Grid>
            <Grid>
              <b>Type:</b>
              <Select
                style={{ width: 100, marginLeft: 10 }}
                disabled={isAxisDisabled("x") || isCanvasHistogram()}
                value={xPlotType}
                onChange={(e) => setPlotType("x", e.target.value)}
              >
                <MenuItem value={"lin"}>Linear</MenuItem>
                <MenuItem value={"log"}>Log</MenuItem>
                {/* <MenuItem value={"bin"}>Bilinear</MenuItem> */}
              </Select>
            </Grid>
            <Grid>
              <b>Axis:</b>
              <Select
                style={{ width: 100, marginLeft: 10 }}
                onChange={(e) => setAxis("x", e.target.value)}
                disabled={isAxisDisabled("x")}
                value={canvas.xAxis}
              >
                {canvas.getFile().axes.map((e) => (
                  <MenuItem value={e}>{e}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid>
              <b
                style={{
                  marginRight: 10,
                }}
              >
                Histogram:
              </b>
              <Switch
                color="primary"
                name="checkedB"
                inputProps={{ "aria-label": "primary checkbox" }}
                checked={xHistogram}
                disabled={isAxisDisabled("x")}
                onChange={(_, checked) => setHistogram("x", checked)}
              />
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            justify="space-evenly"
            style={{ ...classes.axisBarAxis, marginTop: 10 }}
          >
            <Grid>
              <h3
                style={{
                  marginTop: 1,
                }}
              >
                Y axis
              </h3>
            </Grid>
            <Grid>
              <b>Type:</b>
              <Select
                style={{ width: 100, marginLeft: 10 }}
                value={yPlotType}
                disabled={isAxisDisabled("y") || isCanvasHistogram()}
                onChange={(e) => setPlotType("y", e.target.value)}
              >
                <MenuItem value={"lin"}>Linear</MenuItem>
                <MenuItem value={"log"}>Log</MenuItem>
                {/* <MenuItem value={"bin"}>Bilinear</MenuItem> */}
              </Select>
            </Grid>
            <Grid>
              <b>Axis:</b>
              <Select
                style={{ width: 100, marginLeft: 10 }}
                onChange={(e) => setAxis("y", e.target.value)}
                disabled={isAxisDisabled("y")}
                value={yAxis}
              >
                {canvas.getFile().axes.map((e) => (
                  <MenuItem value={e}>{e}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid>
              <b
                style={{
                  marginRight: 10,
                }}
              >
                Histogram:
              </b>
              <Switch
                color="primary"
                name="checkedB"
                inputProps={{ "aria-label": "primary checkbox" }}
                checked={yHistogram}
                disabled={isAxisDisabled("y")}
                onChange={(_, checked) => setHistogram("y", checked)}
              />
            </Grid>
          </Grid>
        </Grid>
        <Divider style={{ marginTop: 10, marginBottom: 10 }}></Divider>
      </div>

      {/* CANVAS DISPLAY */}
      <div style={classes.canvasDisplay}>{canvas.getCanvas()}</div>
    </div>
  );
}

export default Plot;
