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

interface PlotInput {
  canvas: JSX.Element;
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
    backgroundColor: "white",
    borderRadius: 5,
    boxShadow: "1px 3px 4px #bbd",
    width: "100%",
    height: "100% - 207",
    backgroundColor: "#dfd",
    flexGrow: 1,
  },
};

function Plot(props: PlotInput) {
  // Delete plot modal
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const deletePlot = () => {
    console.log("delete plot called on id = ", props.canvasIndex);
    dataManager.removeFile(props.canvasIndex);
  };

  // == General modal logic ==
  const handleOpen = (func: Function) => {
    func(true);
  };
  const handleClose = (func: Function) => {
    func(false);
  };

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
              <Select style={{ width: 100, marginLeft: 10 }}>
                <MenuItem value={"lin"}>Linear</MenuItem>
                <MenuItem value={"log"}>Log</MenuItem>
                <MenuItem value={"bin"}>Bilinear</MenuItem>
              </Select>
            </Grid>
            <Grid>
              <b>Axis:</b>
              <Select style={{ width: 100, marginLeft: 10 }}>
                <MenuItem value={"lin"}>FCA-1</MenuItem>
                <MenuItem value={"log"}>FCA-1</MenuItem>
                <MenuItem value={"bin"}>FTP-69</MenuItem>
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
              <Select style={{ width: 100, marginLeft: 10 }}>
                <MenuItem value={"lin"}>Linear</MenuItem>
                <MenuItem value={"log"}>Log</MenuItem>
                <MenuItem value={"bin"}>Bilinear</MenuItem>
              </Select>
            </Grid>
            <Grid>
              <b>Axis:</b>
              <Select style={{ width: 100, marginLeft: 10 }}>
                <MenuItem value={"lin"}>FCA-1</MenuItem>
                <MenuItem value={"log"}>FCA-1</MenuItem>
                <MenuItem value={"bin"}>FTP-69</MenuItem>
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
              />
            </Grid>
          </Grid>
        </Grid>
        <Divider style={{ marginTop: 10, marginBottom: 10 }}></Divider>
      </div>

      {/* CANVAS DISPLAY */}
      <div style={classes.canvasDisplay}>{props.canvas}</div>
    </div>
  );
}

export default Plot;
