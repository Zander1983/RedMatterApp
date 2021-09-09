import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, TextField } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import React, { useEffect } from "react";
import { snackbarService } from "uno-material-ui";
import { Divider } from "antd";
import { HistogramAxisType, Plot } from "graph/resources/types";
import * as PlotResource from "graph/resources/plots";

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
  inits: {
    histogramAxis: HistogramAxisType;
    axisX: string;
    axisY: string;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    plot: Plot;
  };
  callback: (
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    axisX: string,
    axisY: string
  ) => void;
}) => {
  const classes = useStyles();
  const [minX, setMinX] = React.useState("0");
  const [maxX, setMaxX] = React.useState("0");
  const [minY, setMinY] = React.useState("0");
  const [maxY, setMaxY] = React.useState("0");

  useEffect(() => {
    setMinX(props.inits.minX.toString());
    setMaxX(props.inits.maxX.toString());
    setMinY(props.inits.minY.toString());
    setMaxY(props.inits.maxY.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.inits.minX, props.inits.minY, props.inits.maxX, props.inits.maxY]);

  const commitRangeChange = () => {
    try {
      const iMinX = parseFloat(minX);
      const iMaxX = parseFloat(maxX);
      const iMinY = parseFloat(minY);
      const iMaxY = parseFloat(maxY);
      if (isNaN(iMinX + iMinY + iMaxX + iMaxX)) throw Error("Invalid ranges");
      props.callback(
        iMinX,
        iMaxX,
        iMinY,
        iMaxY,
        props.inits.axisX,
        props.inits.axisY
      );
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
    const allData = PlotResource.getXandYData(props.inits.plot);
    const data = axis === "x" ? allData[0] : allData[1];
    const ranges = PlotResource.findRangeBoundries(props.inits.plot, data);
    if (axis === "x") {
      setMinX(ranges[0].toString());
      setMaxX(ranges[1].toString());
    } else {
      setMinY(ranges[0].toString());
      setMaxY(ranges[1].toString());
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
          {props.inits.histogramAxis !== "horizontal" ? (
            <Grid item xs={12} md={props.inits.histogramAxis ? 12 : 6}>
              <h3>Edit {props.inits.axisX} range</h3>
              <TextField
                label="Range min"
                value={minX}
                onChange={(e) => {
                  setMinX(e.target.value);
                }}
              />
              <br />
              <TextField
                label="Range max"
                value={maxX}
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

          {props.inits.histogramAxis !== "vertical" ? (
            <Grid item xs={12} md={props.inits.histogramAxis ? 12 : 6}>
              <h3>Edit {props.inits.axisY} range</h3>
              <TextField
                label="Range min"
                value={minY}
                onChange={(e) => {
                  setMinY(e.target.value);
                }}
              />
              <br />
              <TextField
                label="Range max"
                value={maxY}
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
