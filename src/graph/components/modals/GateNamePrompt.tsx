import React, { useCallback, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function GetNamePrompt(props: {
  sendName: Function;
  open: boolean;
}) {
  const [name, setName] = React.useState(null);
  const [nameError, setNameError] = React.useState(false);

  const handleClose = () => {
    // setOpen(false);
  };

  const escFunction = useCallback((event) => {
    if (event.key === "Enter") {
      if (name === "" || name == null) {
        setNameError(true);
      } else {
        props.sendName(name);
        handleClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);

    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Name Your Gate</DialogTitle>
        <DialogContent>
          <TextField
            error={nameError}
            helperText="This Field Is Required"
            autoFocus
            margin="dense"
            id="name"
            label="Gate Name"
            type="email"
            onChange={(textField: any) => {
              setName(textField.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (name === "" || name == null) {
                setNameError(true);
              } else {
                props.sendName(name);
              }
            }}
            color="primary"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
