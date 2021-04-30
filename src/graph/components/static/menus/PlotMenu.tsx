import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { HuePicker } from "react-color";

import KeyboardBackspace from "@material-ui/icons/KeyboardBackspace";

import dataManager from "graph/dataManagement/dataManager";

const classes = {
  table: {},
};

export default function PlotMenu() {
  const [plots, setPlots] = React.useState(dataManager.getAllPlots());
  const [observersSetup, setObserversSetup] = React.useState(false);

  const resetAll = () => {
    setPlots(dataManager.getAllPlots());
  };

  const resetPlots = (plotID: string) => {
    const subPlot = {
      plot: dataManager.getPlot(plotID),
      plotID: plotID,
    };
    const newPlots = plots.map((g) => {
      if (g.plotID === plotID) {
        return subPlot;
      } else {
        return g;
      }
    });
    setPlots(newPlots);
  };

  useEffect(() => {
    if (!observersSetup) {
      setObserversSetup(true);
      dataManager.addObserver("addNewPlotToWorkspace", () => {
        resetAll();
      });
      dataManager.addObserver("removePlotFromWorkspace", () => {
        resetAll();
      });
    }
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table style={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>From file</TableCell>
            <TableCell>Population</TableCell>
            <TableCell>Gates</TableCell>
            <TableCell>STATS</TableCell>
            <TableCell>Mean X</TableCell>
            <TableCell>Mean Y</TableCell>
            <TableCell>Percentage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plots.map((plot) => (
            <TableRow key={plot.plotID}>
              <TableCell>
                <TextField
                  value={plot.plot.label}
                  inputProps={{ "aria-label": "naked" }}
                  style={{
                    fontSize: 14,
                  }}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    plot.plot.update({ label: newLabel });
                    resetPlots(plot.plotID);
                  }}
                />
              </TableCell>
              <TableCell>{plot.plot.file.name}</TableCell>
              <TableCell>
                {plot.plot.gates.map((e) => e.gate.name).join(", ")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
