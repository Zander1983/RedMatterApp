import React, { useCallback, useEffect, useRef } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useSelector } from "react-redux";
import { Gate, Plot } from "graph/resources/types";
import WorkspaceDispatch from "graph/resources/dispatchers";
import {
  getGate,
  getPlot,
  getPopulation,
  getWorkspace,
} from "graph/utils/workspace";
import { createSubpopPlot } from "graph/resources/plots";

let name = "";

export default function GateNamePrompt() {
  let gates: Gate[] = [];
  const [open, setOpen] = React.useState<boolean>(false);
  const [nameError, setNameError] = React.useState(false);

  useSelector((e: any) => {
    const newGates = e.workspace.gates;
    if (gates === newGates || newGates === undefined || newGates.length === 0)
      return;
    const newGateName: string = newGates[newGates.length - 1].name;
    if (
      !open &&
      newGates.length > gates.length &&
      newGateName.includes("Unammed gate from plot")
    ) {
      setOpen(true);
    }
    gates = newGates;
  });

  const renameGate = async (newName: string) => {
    setOpen(false);
    name = "";
    const gates = getWorkspace().gates;
    let gate = gates[gates.length - 1];
    const plotID = gate.name.split(" ")[4];
    gate.name = newName;
    WorkspaceDispatch.UpdateGate(gate);
    instancePlot(getPlot(plotID), gate);
  };

  const quit = () => {
    setOpen(false);
    name = "";
    const gates = getWorkspace().gates;
    let gate = gates[gates.length - 1];
    WorkspaceDispatch.DeleteGate(gate);
  };

  const instancePlot = async (plot: Plot, gate: Gate) => {
    plot.gates = [...plot.gates, gate.id];
    plot.gatingActive = "";
    await WorkspaceDispatch.UpdatePlot(plot);
    let basedOffPlot = { ...plot };
    basedOffPlot.gates = [];
    await createSubpopPlot(basedOffPlot, [
      { gate: gate.id, inverseGating: false },
    ]);
    const popGates = getPopulation(plot.population).gates.map((e) => e.gate);
    for (let popGate of popGates) {
      let popIGate = getGate(popGate);
      popIGate.children.push(gate.id);
      WorkspaceDispatch.UpdateGate(popIGate);
    }
  };

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
          <Button onClick={quit} color="primary">
            Cancel
          </Button>
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
