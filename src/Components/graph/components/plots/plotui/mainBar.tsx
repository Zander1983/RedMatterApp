import { Button } from "@material-ui/core";
import React from "react";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";

import MessageModal from "../../modals/MessageModal";
import dataManager from "../../../classes/dataManager";

const classes = {
  main: {
    marginBottom: 10,
    paddingLeft: 2,
    paddingRight: 2,
  },
  mainDelete: {
    backgroundColor: "#6666aa",
  },
  mainButton: {
    backgroundColor: "#66a",
    color: "white",
    marginLeft: 10,
  },
};

export default function MainBar(props: any) {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const deletePlot = () => {
    dataManager.removeFile(props.canvasIndex);
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  return (
    <Grid container direction="row" xs={12} style={classes.main}>
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

      <Button
        onClick={() => setDeleteModalOpen(true)}
        style={classes.mainDelete}
      >
        <DeleteIcon fontSize="small" style={{ color: "#fff" }}></DeleteIcon>
      </Button>
      {/* <Button
            variant="contained"
            size="medium"
            // onClick={}
            style={classes.mainButton}
          >
            Polygon Gate
          </Button> */}
      <Button
        variant="contained"
        size="medium"
        // onClick={}
        style={classes.mainButton}
      >
        Oval Gate
      </Button>
      {/* <Button
            variant="contained"
            size="medium"
            // onClick={}
            style={classes.mainButton}
          >
            Quadrant
          </Button> */}
      <Button
        variant="contained"
        size="medium"
        // onClick={}
        style={classes.mainButton}
      >
        Subpop
      </Button>
      <Button
        variant="contained"
        size="medium"
        // onClick={}
        style={classes.mainButton}
      >
        Inverse Subpop
      </Button>
    </Grid>
  );
}
