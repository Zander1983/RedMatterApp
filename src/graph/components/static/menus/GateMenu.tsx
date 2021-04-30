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

import dataManager from "graph/dataManagement/dataManager";
import Gate from "graph/dataManagement/gate/gate";

const classes = {
  table: {},
};

export default function GateMenu() {
  const [gates, setGates] = React.useState(dataManager.getAllGates());
  const [observersSetup, setObserversSetup] = React.useState(false);

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
    console.log("setGateColor");
    gate.update({
      color:
        `rgba(${color.rgb.r},${color.rgb.g},` +
        `${color.rgb.b},${color.rgb.a})`,
    });
    resetGates(gate.id);
  };

  useEffect(() => {
    if (!observersSetup) {
      setObserversSetup(true);
      dataManager.addObserver("addNewGateToWorkspace", () => {
        resetAll();
      });
      dataManager.addObserver("removeGateFromWorkspace", () => {
        resetAll();
      });
    }
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table style={classes.table}>
        <TableHead>
          <TableRow>
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
