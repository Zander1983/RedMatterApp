import React, { useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useSelector } from "react-redux";
import {
  Gate,
  Plot,
  PlotsRerender,
  WorkspaceEvent,
  WorkspaceEventGateNaming,
} from "graph/resources/types";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import { getGate, getPlot } from "graph/utils/workspace";
import { createSubpopPlot } from "graph/resources/plots";
import EventQueueDispatch from "graph/workspaceRedux/eventQueueDispatchers";
import useGAEventTrackers from "hooks/useGAEvents";

export default function GateNamePrompt() {
  const [open, setOpen] = React.useState<boolean>(false);
  const [nameError, setNameError] = React.useState(false);
  const [name, setName] = React.useState("");
  const [gate, setGate] = React.useState<Gate>();
  const [plot, setPlot] = React.useState<Plot>();
  const [event, setEvent] = React.useState<WorkspaceEventGateNaming>();

  const eventStacker = useGAEventTrackers("Gate Created.");
  useSelector((e: any) => {
    const eventQueue = e.workspaceEventQueue.queue;
    let eventGateNamingArray = eventQueue.filter(
      (x: WorkspaceEvent) => x.type == "gateNaming" && x.used == false
    );
    if (eventGateNamingArray.length > 0) {
      let event: WorkspaceEventGateNaming = eventGateNamingArray[0];
      let gate = getGate(event.gateID);
      setName(gate.name);
      setGate(gate);
      setPlot(getPlot(event.plotID));
      setOpen(true);
      setEvent(event);
      EventQueueDispatch.UpdateUsed(event.id);
    }
  });

  const renameGate = async (newName: string) => {
    gate.name = newName;
    WorkspaceDispatch.UpdateGate(gate);
    setOpen(false);
    try {
      instancePlot(plot, gate);
    } catch {}
    EventQueueDispatch.DeleteQueueItem(event.id);
  };

  const quit = () => {
    setOpen(false);
    WorkspaceDispatch.DeleteGate(gate);
    EventQueueDispatch.DeleteQueueItem(event.id);
    let plotsRerenderQueueItem: PlotsRerender = {
      id: "",
      used: false,
      type: "plotsRerender",
      plotIDs: [plot.id],
    };
    EventQueueDispatch.AddQueueItem(plotsRerenderQueueItem);
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
    // const popGates = getPopulation(plot.population).gates.map((e) => e.gate);
    // for (let popGate of popGates) {
    if (gate.parents && gate.parents.length > 0) {
      let popIGate = getGate(gate.parents[0]);
      if (popIGate) {
        if (!popIGate.children) popIGate.children = [];
        popIGate.children.push(gate.id);
        WorkspaceDispatch.UpdateGate(popIGate);
      }
    }
    // }
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
            value={name}
            helperText="This Field Is Required"
            autoFocus
            margin="dense"
            id="gate-name-textinput"
            label="Gate Name"
            type="email"
            onChange={(e: any) => {
              setName(e.target.value);
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
                eventStacker(
                  `A gate with Name: ${name} is created on Plot:${plot.label}.`
                );
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
