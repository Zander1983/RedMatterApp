import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, TextField } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import React, { useCallback, useEffect } from "react";
import { snackbarService } from "uno-material-ui";

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

function RangeResizeModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  inits: {
    axisX: string;
    axisY: string;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  callback: (
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    axisX: string,
    axisY: string
  ) => void;
}): JSX.Element {
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
      if (isNaN(iMinX + iMinY + iMaxX + iMaxX)) throw "";
      props.callback(
        iMinX,
        iMaxX,
        iMinY,
        iMaxY,
        props.inits.axisX.split(" ")[0],
        props.inits.axisY.split(" ")[0]
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
          style={{ padding: "2rem 1rem" }}
        >
          <Grid item xs={12} md={6} style={{ marginBottom: "2rem" }}>
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
          </Grid>

          <Grid item xs={12} md={6} style={{ marginBottom: "2rem" }}>
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
          </Grid>

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

            {/* <Button
              variant="contained"
              style={{
                backgroundColor: "#6666aa",
                color: "white",
                marginLeft: 20,
              }}
              onClick={() => {
                props.callback(69, 420, props.inits.axis.split(" ")[0]);
                props.closeCall.f(props.closeCall.ref);
              }}
            >
              Set Default
            </Button> */}
          </Grid>
        </Grid>
      </div>
    </Modal>
  );
}

export default RangeResizeModal;
