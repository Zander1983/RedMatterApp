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

function FilesBar() {
  const [files, setFiles] = React.useState(dataManager.getAllFiles());

  const resetFiles = (fileID: string) => {
    const subFile = {
      file: dataManager.getFile(fileID),
      fileID: fileID,
    };
    const newFiles = files.map((g) => {
      if (g.fileID === fileID) {
        return subFile;
      } else {
        return g;
      }
    });
    setFiles(newFiles);
  };

  return (
    <TableContainer component={Paper}>
      <Table style={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.fileID}>
              <TableCell>
                <TextField
                  value={file.file.name}
                  inputProps={{ "aria-label": "naked" }}
                  style={{
                    fontSize: 14,
                  }}
                  onChange={(e) => {
                    const newName = e.target.value;
                    file.file.update({ name: newName });
                    resetFiles(file.fileID);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function GatesBar() {
  const [gates, setGates] = React.useState(dataManager.getAllGates());

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

  return (
    <TableContainer component={Paper}>
      <Table style={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Color</TableCell>
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
              <TableCell>{gate.gate.getGateType()}</TableCell>
              <TableCell>
                <HuePicker
                  color={gate.gate.color}
                  width="150px"
                  height="5px"
                  onChangeComplete={(color, _) => {
                    gate.gate.update({
                      color:
                        `rgba(${color.rgb.r},${color.rgb.g},` +
                        `${color.rgb.b},${color.rgb.a})`,
                    });
                    resetGates(gate.gateID);
                  }}
                />
              </TableCell>
              <TableCell>{gate.gate.xAxis}</TableCell>
              <TableCell>{gate.gate.yAxis}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SideButtons() {
  const ref = React.useRef(null);
  // == General modal logic ==

  const [filesBar, setFilesBar] = React.useState(false);
  const [gatesBar, setGatesBar] = React.useState(false);

  const click = (target: string | undefined) => {
    let p = [
      { name: "files", var: filesBar, func: setFilesBar },
      {
        name: "gates",
        var: gatesBar,
        func: setGatesBar,
      },
    ];
    const r = p.filter((e) => e.name !== target);
    for (const e of r) {
      e.func(false);
    }
    if (target !== undefined) {
      const t = p.filter((e) => e.name === target)[0];
      t.func(!t.var);
    }
  };

  const handleClickOutside = (event: any) => {
    if (ref === null) return;
    console.log("testing...");
    const domNode = ref.current;
    if (!domNode || !domNode.contains(event.target)) {
      click(undefined);
    }
  };
  document.addEventListener("click", handleClickOutside, true);
  document.removeEventListener("click", handleClickOutside, true);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        zIndex: 1000,
        padding: 10,
        backgroundColor: "#eef",
        borderRight: "solid 1px #ddd",
        borderTop: "solid 1px #ddd",
        borderTopRightRadius: 10,
      }}
    >
      <div
        style={{
          marginBottom: 10,
          width: "100%",
          flex: 1,
          flexDirection: "row",
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => click("gates")}
          style={{
            backgroundColor: gatesBar ? "#77d" : "#fff",
            color: gatesBar ? "#fff" : "#000",
          }}
        >
          Gates
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => click("files")}
          style={{
            backgroundColor: filesBar ? "#77d" : "#fff",
            color: filesBar ? "#fff" : "#000",
            marginLeft: 10,
          }}
        >
          Files
        </Button>
        {filesBar || gatesBar ? (
          <Button
            style={{
              marginRight: 0,
              marginLeft: "auto",
            }}
            onClick={() => click(undefined)}
          >
            <KeyboardBackspace
              style={{
                color: "black",
              }}
            ></KeyboardBackspace>
          </Button>
        ) : null}
      </div>
      <div
        style={{
          backgroundColor: "#fafafa",
          maxHeight: "calc(100vh - 500px)",
          overflowY: "auto",
        }}
      >
        {filesBar ? <FilesBar /> : null}
        {gatesBar ? <GatesBar /> : null}
      </div>
    </div>
  );
}

export default SideButtons;
