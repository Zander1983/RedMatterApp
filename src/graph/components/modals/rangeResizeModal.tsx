import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, TextField } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import React, { useEffect } from "react";
import { snackbarService } from "uno-material-ui";
import { Divider } from "antd";
import { Plot, Range } from "graph/resources/types";
import * as PlotResource from "graph/resources/plots";
import { store } from "redux/store";
import { getPopulation, getWorkspace } from "graph/utils/workspace";
import WorkspaceDispatch from "graph/resources/dispatchers";

const useStyles = makeStyles((theme) => ({
  modal: {
    backgroundColor: "#fafafa",
    boxShadow: theme.shadows[6],
    padding: 20,
    width: "800px",
    position: "absolute",
    left: "50%",
    top: "30%",
    marginLeft: "-400px",
    marginTop: "-150px",
    textAlign: "center",
    borderRadius: 10,
  },
  linkArea: {
    backgroundColor: "#dadada",
    borderRadius: 5,
    width: 400,
    height: 50,
    padding: 10,
    marginTop: 30,
  },
}));

const RangeResizeModal = (props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  plot: Plot;
}) => {
  const plot = props.plot;
  const classes = useStyles();
  const [minX, setMinX] = React.useState("0");
  const [maxX, setMaxX] = React.useState("0");
  const [minY, setMinY] = React.useState("0");
  const [maxY, setMaxY] = React.useState("0");

  const xAxis = plot.xAxis;
  const yAxis = plot.yAxis;

  const plotMinX = plot.ranges[xAxis][0];
  const plotMaxX = plot.ranges[xAxis][1];
  const plotMinY = plot.ranges[yAxis][0];
  const plotMaxY = plot.ranges[yAxis][1];

  useEffect(() => {
    setMinX(plotMinX.toString());
    setMaxX(plotMaxX.toString());
    setMinY(plotMinY.toString());
    setMaxY(plotMaxY.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.plot, props.open]);

  const setPlotsAxisRanges = (xRange: Range, yRange: Range) => {
    const histogramAxis = plot.histogramAxis;
    const targetPlots: Plot[] = [];
    const plots = getWorkspace().plots;
    plots.forEach((tPlot) => {
      if (
        tPlot.xAxis === props.plot.xAxis &&
        tPlot.yAxis === props.plot.yAxis &&
        tPlot.xPlotType === props.plot.xPlotType &&
        tPlot.yPlotType === props.plot.yPlotType &&
        tPlot.histogramAxis === histogramAxis
      ) {
        targetPlots.push(tPlot);
      }
    });

    targetPlots.forEach((tplot) => {
      if (histogramAxis !== "horizontal") {
        tplot.ranges[xAxis] = xRange;
        WorkspaceDispatch.UpdatePlot(tplot);
      }

      if (histogramAxis !== "vertical") {
        tplot.ranges[yAxis] = yRange;
        WorkspaceDispatch.UpdatePlot(tplot);
      }
    });
  };

  const commitRangeChange = () => {
    try {
      const iMinX = parseFloat(minX);
      const iMaxX = parseFloat(maxX);
      const iMinY = parseFloat(minY);
      const iMaxY = parseFloat(maxY);
      if (
        isNaN(iMinX + iMinY + iMaxX + iMaxY) ||
        iMinX >= iMaxX ||
        iMinY >= iMaxY
      )
        throw Error("Invalid ranges");

      setPlotsAxisRanges([iMinX, iMaxX] as Range, [iMinY, iMaxY] as Range);

      setMinX(iMinX.toString());
      setMaxX(iMaxX.toString());
      setMinY(iMinY.toString());
      setMaxY(iMaxY.toString());
      props.closeCall.f(props.closeCall.ref);
    } catch {
      snackbarService.showSnackbar("Invalid ranges", "error");
    }
  };

  const setDefaultRanges = (axis: "x" | "y") => {
    const population = getPopulation(plot.population);
    const ranges = population.defaultRanges[axis === "x" ? xAxis : yAxis];
    if (axis === "x") {
      setMinX(ranges[0].toString());
      setMaxX(ranges[1].toString());
      setPlotsAxisRanges(ranges, [plotMinY, plotMaxY] as Range);
    } else {
      setMinY(ranges[0].toString());
      setMaxY(ranges[1].toString());
      setPlotsAxisRanges([plotMinX, plotMaxX] as Range, ranges);
    }
  };

  return (
    <Modal
      open={props.open}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onClose={() => {
        props.closeCall.f(props.closeCall.ref);
      }}
    >
      <div className={classes.modal}>
        <Grid
          container
          alignItems="center"
          direction="row"
          style={{ padding: "2rem 1rem 1rem 1rem" }}
        >
          {plot.histogramAxis !== "horizontal" ? (
            <Grid item xs={12} md={plot.histogramAxis ? 12 : 6}>
              <h3>Edit {plot.xAxis} range</h3>
              <TextField
                label="Range min"
                value={minX}
                type={"number"}
                onChange={(e) => {
                  setMinX(e.target.value);
                }}
              />
              <br />
              <TextField
                label="Range max"
                value={maxX}
                type={"number"}
                onChange={(e) => {
                  setMaxX(e.target.value);
                }}
              />
              <br />
              <Button
                variant="contained"
                style={{
                  marginTop: 15,
                  backgroundColor: "#6666aa",
                  color: "white",
                  marginLeft: 20,
                }}
                onClick={() => setDefaultRanges("x")}
              >
                Set Default
              </Button>
            </Grid>
          ) : null}

          {plot.histogramAxis !== "vertical" ? (
            <Grid item xs={12} md={plot.histogramAxis ? 12 : 6}>
              <h3>Edit {plot.yAxis} range</h3>
              <TextField
                label="Range min"
                value={minY}
                type={"number"}
                onChange={(e) => {
                  setMinY(e.target.value);
                }}
              />
              <br />
              <TextField
                label="Range max"
                value={maxY}
                type={"number"}
                onChange={(e) => {
                  setMaxY(e.target.value);
                }}
              />
              <br />
              <Button
                variant="contained"
                style={{
                  marginTop: 15,
                  backgroundColor: "#6666aa",
                  color: "white",
                  marginLeft: 20,
                }}
                onClick={() => setDefaultRanges("y")}
              >
                Set Default
              </Button>
            </Grid>
          ) : null}
          <Divider></Divider>
          <br />
          <Grid
            container
            direction="row"
            justify="center"
            style={{ textAlign: "center" }}
          >
            <Button
              variant="contained"
              color="primary"
              style={{
                backgroundColor: "#6666aa",
              }}
              onClick={() => {
                commitRangeChange();
              }}
            >
              Confirm
            </Button>

            <Button
              variant="contained"
              style={{
                backgroundColor: "#d77",
                marginLeft: 20,
                color: "white",
              }}
              onClick={() => {
                props.closeCall.f(props.closeCall.ref);
              }}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </div>
    </Modal>
  );
};

export default RangeResizeModal;
