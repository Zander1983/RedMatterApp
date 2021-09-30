import React, { useCallback, useEffect, useRef } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useSelector } from "react-redux";
import { Gate } from "graph/resources/types";
import { store } from "redux/store";
import WorkspaceDispatch from "graph/resources/dispatchers";
import { getWorkspace } from "graph/utils/workspace";
import { nextFrame } from "@amcharts/amcharts4/core";

let name = "";

export default function GateNamePrompt() {
  let gates: Gate[] = [];
  const [open, setOpen] = React.useState<boolean>(false);
  const [nameError, setNameError] = React.useState(false);

  useSelector((e: any) => {
    const newGates = e.workspace.gates;
    if (gates === newGates || newGates === undefined) return;
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
    setOpen(false);
    name = "";
    const gates = getWorkspace().gates;
    let gate = gates[gates.length - 1];
    gate.name = newName;
    WorkspaceDispatch.UpdateGate(gate);
  };

  const escFunction = useCallback(
    (event: any) => {
      if (event.key === "Enter") {
        if (name === "") {
          setNameError(true);
        } else {
          renameGate(name);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, gates]
  );

  useEffect(() => {
    if (open === true) {
      const inp = document.getElementById("gate-name-textinput");
      if (inp !== null) {
        inp.focus();
      } else {
        setTimeout(() => {
          const inp = document.getElementById("gate-name-textinput");
          if (inp !== null) {
            inp.focus();
          }
        }, 50);
      }
    }
  }, [open]);

  return (
    <div
      onKeyDown={(e: any) => {
        if (e.code === "Enter") {
          renameGate(name);
        }
      }}
    >
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle>Name Your Gate</DialogTitle>
        <DialogContent>
          <TextField
            error={nameError}
            helperText="This Field Is Required"
            autoFocus
            margin="dense"
            id="gate-name-textinput"
            label="Gate Name"
            type="email"
            onChange={(e: any) => {
              name = e.target.value;
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
