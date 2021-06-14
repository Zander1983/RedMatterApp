import React from "react";
import { Button, FormControlLabel, Switch } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useDispatch, useStore } from "react-redux";

import userManager from "Components/users/userManager";
import {
  ExperimentApiFetchParamCreator,
  WorkspacesApiFetchParamCreator,
} from "api_calls/nodejsback";

// THIS COMPONENT IS A SUMMARY SO THE USER CAN SEE THEIR EXPERIMENT SETTINGS BERFORE PROCEEDING
function CreateExperimentDialog(props: {
  open: boolean;
  // PROP TO CLOSE DIAGLOG
  closeCall: {
    f: Function;
    ref: Function;
  };
  name: string;
  // THE FUNCTION WE PASSED FROM CREATEWORKSPACEMODAL TO CREATE THE EXPERIMENT FROM THIS COMPONENT
  sendFunction: {
    f: Function;
    ref: Function;
  };
}): JSX.Element {
  const store = useStore();
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <Dialog
        open={props.open}
        onClose={() => {
          props.closeCall.f(props.closeCall.ref);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Experiment Summary"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <strong>Device:</strong>
            {store.getState().user.experiment.device}
            <br></br>
            <strong>Cell Type:</strong>
            {store.getState().user.experiment.cellType}
            <br></br>
            <strong>Particle Size:</strong>
            {store.getState().user.experiment.particleSize}
            <br></br>
            <strong>Fluorophores Category:</strong>
            {store.getState().user.experiment.fluorophoresCategory}
            <br></br>
            <strong>Description:</strong>
            {store.getState().user.experiment.description}
            <br></br>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              props.closeCall.f(props.closeCall.ref);
            }}
            color="primary"
          >
            Change
          </Button>
          <Button
            onClick={() => {
              props.sendFunction.f(props.sendFunction.ref);
              props.closeCall.f(props.closeCall.ref);
            }}
            color="primary"
            autoFocus
          >
            Create Experiment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CreateExperimentDialog;
