import React from "react";
import { Button, FormControlLabel, Switch } from "@material-ui/core";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useDispatch, useStore} from "react-redux";

function CreateExperimentDialog(props: {
    open: boolean;
    closeCall: { f: Function; ref: Function };
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
        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
          Open alert dialog
        </Button>
        <Dialog
          open={props.open}
          onClose={() => {
            props.closeCall.f(props.closeCall.ref);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Your Experiment's Settings:"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <strong>Device:</strong>   {store.getState().user.experiment.device} <br></br>
              <strong>Cell Type:</strong>   {store.getState().user.experiment.cellType}  <br></br>
              <strong>Particle Size:</strong>   {store.getState().user.experiment.particleSize} <br></br>
              <strong>Fluorophores Category:</strong>   {store.getState().user.experiment.fluorophoresCategory} <br></br>
              <strong>Description:</strong>   {store.getState().user.experiment.description} <br></br>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Disagree
            </Button>
            <Button onClick={handleClose} color="primary" autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

export default CreateExperimentDialog;