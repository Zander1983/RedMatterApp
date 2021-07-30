import React, { useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import dataManager from "graph/old/dataManagement/dataManager";

const classes = {
  table: {},
};

export default function FileMenu() {
  const [files, setFiles] = React.useState(dataManager.getAllFiles());
  const [observersSetup, setObserversSetup] = React.useState(false);

  const resetAll = () => {
    setFiles(dataManager.getAllFiles());
  };

  useEffect(() => {
    if (!observersSetup) {
      setObserversSetup(true);
      dataManager.addObserver("addNewFileToWorkspace", () => {
        resetAll();
      });
      dataManager.addObserver("removeFileFromWorkspace", () => {
        resetAll();
      });
      dataManager.addObserver("clearWorkspace", () => {
        resetAll();
      });
    }
  }, [observersSetup]);

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
                    alert(
                      "Unfortunately we haven't implemented full support for changing the name of files as of now."
                    );
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
