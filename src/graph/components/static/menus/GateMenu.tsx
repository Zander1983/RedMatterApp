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
import { getGate, getPopulation, getWorkspace } from "graph/utils/workspace";
import { Gate, HistogramGate, PolygonGate } from "graph/resources/types";
import { store } from "redux/store";
import { createGate } from "graph/resources/gates";
import { dowloadAllFileEvents } from "services/FileService";
import { createPlot } from "graph/resources/plots";
import { createPopulation } from "graph/resources/populations";

const classes = {
  table: {},
};

export default function GateMenu(props: { gates: Gate[] }) {
  const setGateColor = (gate: Gate, color: any) => {
    gate.color = color.hex;
    store.dispatch({
      type: "workspace.UPDATE_GATE",
      payload: { gate },
    });
  };

  const setGateName = (gate: Gate, name: any) => {
    gate.name = name;
    store.dispatch({
      type: "workspace.UPDATE_GATE",
      payload: { gate },
    });
  };

  const deleteGate = (gate: Gate) => {
    store.dispatch({
      type: "workspace.DELETE_GATE",
      payload: { gate: gate },
    });
  };

  const cloneGate = (gate: PolygonGate) => {
    let newGate = createGate({
      cloneGate: gate,
    });
    newGate.name = gate.name + " clone";
    store.dispatch({
      type: "workspace.ADD_GATE",
      payload: { gate: newGate },
    });
  };

  const applyGateToAllFiles = async (gate: Gate) => {
    let downloadSnackbar = false;
    await dowloadAllFileEvents();
    let files = getWorkspace().files;
    const plots = getWorkspace().plots;

    // Check gates that already
    plots.forEach((plot) => {
      const pop = getPopulation(plot.population);
      if (
        pop.gates.length === 1 &&
        pop.gates.filter((e) => e.gate === gate.id).length > 0
      ) {
        files = files.filter((file) => file.id !== pop.file);
      }
    });

    for (const file of files) {
      const population = createPopulation({ file: file.id });
      const plot = createPlot({ population });
      population.gates = [
        {
          inverseGating: false,
          gate: gate.id,
        },
      ];
      if (gate.gateType === "polygon") {
        plot.xAxis = (gate as PolygonGate).xAxis;
        plot.yAxis = (gate as PolygonGate).yAxis;
        plot.xPlotType = (gate as PolygonGate).xAxisType;
        plot.yPlotType = (gate as PolygonGate).yAxisType;
      }
      if (gate.gateType === "histogram") {
        plot.xAxis = (gate as HistogramGate).axis;
        plot.yAxis = (gate as HistogramGate).axis;
        plot.xPlotType = (gate as HistogramGate).axisType;
        plot.yPlotType = (gate as HistogramGate).axisType;
        plot.histogramAxis = "vertical";
      }
      await store.dispatch({
        type: "workspace.ADD_POPULATION",
        payload: { population },
      });
      await store.dispatch({
        type: "workspace.ADD_PLOT",
        payload: { plot },
      });
    }
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
                  onClick={() => cloneGate(gate as PolygonGate)}
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
              <TableCell>{(gate as PolygonGate).xAxis}</TableCell>
              <TableCell>{(gate as PolygonGate).yAxis}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
