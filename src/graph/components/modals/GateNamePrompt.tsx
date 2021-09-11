import React, { useCallback, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useSelector } from "react-redux";
import { Gate } from "graph/resources/types";
import { store } from "redux/store";

export default function GateNamePrompt() {
  let gates: Gate[] = [];
  const [open, setOpen] = React.useState<boolean>(false);
  const [name, setName] = React.useState(null);
  const [nameError, setNameError] = React.useState(false);

  useSelector((e: any) => {
    const newGates = e.workspace.gates;
    if (
      !open &&
      newGates.length > gates.length &&
      newGates[newGates.length - 1].name === "Unammed gate"
    ) {
      setOpen(true);
    }
    gates = newGates;
  });

  const renameGate = (newName: string) => {
    let gate = gates[gates.length - 1];
    gate.name = newName;
    store.dispatch({
      type: "workspace.UPDATE_GATE",
      payload: { gate },
    });
    setOpen(false);
  };

  const escFunction = useCallback((event) => {
    if (event.key === "Enter") {
      if (name === "" || name == null) {
        setNameError(true);
      } else {
        renameGate(name);
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
      <Dialog open={open} aria-labelledby="form-dialog-title">
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
                renameGate(name);
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
