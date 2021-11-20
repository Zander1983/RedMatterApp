import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function CancelSubscriptionModal(props: {
  cancelSubscription: Function;
  open: boolean;
  close: Function;
}) {
  const handleClose = () => {
    // setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Cancel Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to
            <strong> cancel </strong>
            your subscription?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              props.close();
            }}
            color="primary"
          >
            Go Back
          </Button>
          <Button
            onClick={() => {
              props.cancelSubscription();
              props.close();
            }}
            color="primary"
          >
            Cancel Subscription
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
