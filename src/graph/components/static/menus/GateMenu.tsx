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

import dataManager from "graph/dataManagement/dataManager";
import Gate from "graph/dataManagement/gate/gate";
import PlotData from "graph/dataManagement/plotData";
import { snackbarService } from "uno-material-ui";

const classes = {
  table: {},
};

export default function GateMenu() {
  const [gates, setGates] = React.useState(dataManager.getAllGates());
  const [observersSetup, setObserversSetup] = React.useState(false);
  const [observerIds, setObserverIds] = React.useState([]);

  const resetAll = () => {
    setGates(dataManager.getAllGates());
  };

  const resetGates = (gateID: string) => {
    const subGate = {
      gate: dataManager.getGate(gateID),
      gateID: gateID,
    };
    const newGates = gates.map((g) => {
      if (g.gateID === gateID) {
        return subGate;
      } else {
        return g;
      }
    });
    setGates(newGates);
  };

  const setGateColor = (gate: Gate, color: any) => {
    gate.update({
      color: `rgb(${color.rgb.r},${color.rgb.g},${color.rgb.b})`,
    });
    resetGates(gate.id);
  };

  const deleteGate = (gate: Gate) => {
    dataManager.removeGateFromWorkspace(gate.id);
  };

  const cloneGate = (gate: Gate) => {
    const { constructor } = gate;
    const gateState = JSON.parse(JSON.stringify(gate.getState()));
    gateState.name = gateState.name + " clone";
    //@ts-ignore
    const newGate = new constructor(gateState);
    dataManager.addNewGateToWorkspace(newGate);
  };

  useEffect(() => {
    if (!observersSetup) {
      setObserversSetup(true);
      setObserverIds([
        {
          target: "addNewGateToWorkspace",
          value: dataManager.addObserver("addNewGateToWorkspace", () => {
            resetAll();
          }),
        },
        {
          target: "removeGateFromWorkspace",
          value: dataManager.addObserver("removeGateFromWorkspace", () => {
            resetAll();
          }),
        },
        {
          target: "clearWorkspace",
          value: dataManager.addObserver("clearWorkspace", () => {
            resetAll();
          }),
        },
      ]);
    }
    return () => {
      observerIds.forEach((e) => {
        dataManager.removeObserver(e.terget, e.value);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyGateToAllFiles = async (params: {
    gateID: string;
    gate: Gate;
  }) => {
    const { gate, gateID } = params;
    let downloadSnackbar = false;
    const promises = dataManager.files
      .filter((e) => {
        for (const file of dataManager.getAllFiles()) {
          if (e.id === file.fileID) return false;
        }
        return true;
      })
      .map((e) => {
        if (downloadSnackbar === false) {
          downloadSnackbar = true;
          snackbarService.showSnackbar("Downloading files...", "info");
        }
        return dataManager.downloadFileEvent(e.id);
      });
    await Promise.all(promises);
    let files = dataManager.getAllFiles();
    const plots = dataManager.getAllPlots();
    // Check gates that already
    plots.forEach((plot) => {
      if (
        plot.plot.population.length === 1 &&
        plot.plot.population.filter((plotGate) => plotGate.gate.id === gateID)
          .length > 0
      ) {
        files = files.filter((file) => file.fileID !== plot.plot.file.id);
      }
    });

    for (const file of files) {
      const plot = new PlotData();
      plot.file = file.file;
      plot.population = [
        {
          inverseGating: false,
          gate: gate,
        },
      ];
      plot.setXAxis(gate.xAxis);
      plot.setYAxis(gate.yAxis);
      plot.setXAxisPlotType(gate.xAxisType);
      plot.setYAxisPlotType(gate.yAxisType);
      dataManager.addNewPlotToWorkspace(plot);
    }
    dataManager.updateWorkspace();
  };

  return (
    <TableContainer component={Paper}>
      <Table style={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            {dataManager.files.length > 1 ? <TableCell></TableCell> : null}
            <TableCell>Name</TableCell>
            <TableCell>Color</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>X Axis</TableCell>
            <TableCell>Y Axis</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {gates.map((gate) => (
            <TableRow key={gate.gateID}>
              <TableCell>
                <Button
                  style={{
                    display: "inline-block",
                    padding: 0,
                    minWidth: 0,
                  }}
                  onClick={() => deleteGate(gate.gate)}
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
                  onClick={() => cloneGate(gate.gate)}
                >
                  <FileCopy></FileCopy>
                </Button>
              </TableCell>
              {dataManager.files.length > 1 ? (
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
                  value={gate.gate.name}
                  inputProps={{ "aria-label": "naked" }}
                  style={{
                    fontSize: 14,
                  }}
                  onChange={(e) => {
                    const newName = e.target.value;
                    gate.gate.update({ name: newName });
                    resetGates(gate.gateID);
                  }}
                />
              </TableCell>
              <TableCell>
                <HuePicker
                  color={gate.gate.color}
                  width="150px"
                  onChange={(color, _) => {
                    gate.gate.color =
                      `rgba(${color.rgb.r},${color.rgb.g},` +
                      `${color.rgb.b},${color.rgb.a})`;
                    setGateColor(gate.gate, color);
                  }}
                />
              </TableCell>
              <TableCell>{gate.gate.getGateType()}</TableCell>
              <TableCell>{gate.gate.xAxis}</TableCell>
              <TableCell>{gate.gate.yAxis}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
