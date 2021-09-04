import React, { useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { HuePicker } from "react-color";

import Button from "@material-ui/core/Button";
import Delete from "@material-ui/icons/Delete";
import FileCopy from "@material-ui/icons/FileCopy";

import { snackbarService } from "uno-material-ui";
import { getGate, getWorkspace } from "graph/utils/workspace";
import { Gate } from "graph/resources/types";
import * as GateResource from "graph/resources/types";
import { store } from "redux/store";
import { createGate } from "graph/resources/gates";

const classes = {
  table: {},
};

export default function GateMenu(props: { gates: Gate[] }) {
  const setGateColor = (gate: Gate, color: any) => {
    gate.color = color;
    store.dispatch({
      action: "GATE_UPDATE",
      payload: { gate },
    });
  };

  const setGateName = (gate: Gate, name: any) => {
    gate.name = name;
    store.dispatch({
      action: "GATE_UPDATE",
      payload: { gate },
    });
  };

  const deleteGate = (gate: Gate) => {
    store.dispatch({
      action: "workspace.DELETE_GATE",
      payload: { gate: gate },
    });
  };

  const cloneGate = (gate: Gate) => {
    let newGate = createGate({
      cloneGate: gate,
    });
    newGate.name = gate.name + " clone";
    store.dispatch({
      action: "workspace.CREATE_GATE",
      payload: { newGate },
    });
  };

  const applyGateToAllFiles = async (gate: Gate) => {
    //TODO
    // const { gate, gateID } = params;
    // let downloadSnackbar = false;
    // const promises = dataManager.files
    //   .filter((e) => {
    //     for (const file of dataManager.getAllFiles()) {
    //       if (e.id === file.fileID) return false;
    //     }
    //     return true;
    //   })
    //   .map((e) => {
    //     if (downloadSnackbar === false) {
    //       downloadSnackbar = true;
    //       snackbarService.showSnackbar("Downloading files...", "info");
    //     }
    //     return dataManager.downloadFileEvent(e.id);
    //   });
    // await Promise.all(promises);
    // let files = dataManager.getAllFiles();
    // const plots = dataManager.getAllPlots();
    // // Check gates that already
    // plots.forEach((plot) => {
    //   if (
    //     plot.plot.population.length === 1 &&
    //     plot.plot.population.filter((plotGate) => plotGate.gate.id === gateID)
    //       .length > 0
    //   ) {
    //     files = files.filter((file) => file.fileID !== plot.plot.file.id);
    //   }
    // });
    // for (const file of files) {
    //   const plot = new PlotData();
    //   plot.file = file.file;
    //   plot.population = [
    //     {
    //       inverseGating: false,
    //       gate: gate,
    //     },
    //   ];
    //   plot.setXAxis(gate.xAxis);
    //   plot.setYAxis(gate.yAxis);
    //   plot.setXAxisPlotType(gate.xAxisType);
    //   plot.setYAxisPlotType(gate.yAxisType);
    //   dataManager.addNewPlotToWorkspace(plot);
    // }
    // dataManager.updateWorkspace();
  };
  const workspace = getWorkspace();

  return (
    <TableContainer component={Paper}>
      <Table style={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            {workspace.files.length > 1 ? <TableCell></TableCell> : null}
            <TableCell>Name</TableCell>
            <TableCell>Color</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>X Axis</TableCell>
            <TableCell>Y Axis</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.gates.map((gate) => (
            <TableRow key={gate.id}>
              <TableCell>
                <Button
                  style={{
                    display: "inline-block",
                    padding: 0,
                    minWidth: 0,
                  }}
                  onClick={() => deleteGate(gate)}
                >
                  <Delete></Delete>
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  style={{
                    display: "inline-block",
                    padding: 0,
                    minWidth: 0,
                  }}
                  onClick={() => cloneGate(gate)}
                >
                  <FileCopy></FileCopy>
                </Button>
              </TableCell>
              {workspace.files.length > 1 ? (
                <TableCell>
                  <Button
                    style={{
                      display: "inline-block",
                      padding: 0,
                      minWidth: 0,
                    }}
                    onClick={() => applyGateToAllFiles(gate)}
                  >
                    Apply to all files
                  </Button>
                </TableCell>
              ) : null}
              <TableCell>
                <TextField
                  value={gate.name}
                  inputProps={{ "aria-label": "naked" }}
                  style={{
                    fontSize: 14,
                  }}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setGateName(gate, newName);
                  }}
                />
              </TableCell>
              <TableCell>
                <HuePicker
                  color={gate.color}
                  width="150px"
                  onChange={(color, _) => {
                    gate.color =
                      `rgba(${color.rgb.r},${color.rgb.g},` +
                      `${color.rgb.b},${color.rgb.a})`;
                    setGateColor(gate, color);
                  }}
                />
              </TableCell>
              <TableCell>{gate.gateType}</TableCell>
              <TableCell>{gate.xAxis}</TableCell>
              <TableCell>{gate.yAxis}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
