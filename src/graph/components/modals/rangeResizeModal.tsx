import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, TextField } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import React, { useEffect } from "react";

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
    axis: string;
    min: number;
    max: number;
  };
  callback: (min: number, max: number, axis: string) => void;
}): JSX.Element {
  const classes = useStyles();
  const [min, setMin] = React.useState(0);
  const [max, setMax] = React.useState(0);

  useEffect(() => {
    setMin(props.inits.min);
    setMax(props.inits.max);
  }, [props.inits.min]);

  return (
    <Modal
      open={props.open}
      onClose={() => {
        props.closeCall.f(props.closeCall.ref);
      }}
    >
      <div className={classes.modal}>
        <Grid container alignItems="center" direction="column">
          <h2>Edit {props.inits.axis} range</h2>
          <TextField
            label="Range min"
            value={min}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (isNaN(v)) setMin(0);
              else setMin(parseInt(e.target.value));
            }}
          />
          <br />
          <TextField
            label="Range max"
            value={max}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (isNaN(v)) setMax(0);
              else setMax(parseInt(e.target.value));
            }}
          />
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
                props.callback(min, max, props.inits.axis.split(" ")[0]);
                props.closeCall.f(props.closeCall.ref);
              }}
            >
              Confirm
            </Button>

            <Button
              variant="contained"
              style={{
                backgroundColor: "#faa",
                marginLeft: 20,
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
}

export default RangeResizeModal;
