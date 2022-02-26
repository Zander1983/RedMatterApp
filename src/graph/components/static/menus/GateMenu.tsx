import React, { useEffect, useState, useCallback } from "react";
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
import {
  FileID,
  Gate,
  HistogramGate,
  PolygonGate,
} from "graph/resources/types";
import { store } from "redux/store";
import { createGate } from "graph/resources/gates";
import { dowloadAllFileEvents } from "services/FileService";
import { createPlot } from "graph/resources/plots";
import { createPopulation } from "graph/resources/populations";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import ApplyGateToFilesModal from "graph/components/modals/applyGateToFilesModal";
import { useSelector } from "react-redux";

const classes = {
  table: {},
};

export const applyGateToAllFiles = async (gate: Gate) => {
  let files = getWorkspace().files;
  files = files.filter((file) => file.name !== getWorkspace().selectedFile);

  const plots = getWorkspace().plots;
  let population: any = null;

  plots.forEach((plot) => {
    const pop = getPopulation(plot.population);
    if (pop.gates.filter((e) => e.gate === gate.id).length > 0) {
      population = pop;
      files = files.filter((file) => file.id !== pop.file);
    }
  });

  for (const file of files) {
    const newPopulation = createPopulation({ file: file.id });
    if (population) {
      newPopulation.gates = population.gates;
    } else {
      newPopulation.gates = [
        {
          inverseGating: false,
          gate: gate.id,
        },
      ];
    }

    await WorkspaceDispatch.AddPopulation(newPopulation);
    const plot = createPlot({ population: newPopulation });
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
    await WorkspaceDispatch.AddPlot(plot);
  }
};

export default function GateMenu(props: { gates: Gate[] }) {
  const [applyGateModalOpen, setApplyGateModalOpen] = useState(false);
  const [filesMetadata, setFilesMetadata] = useState([]);
  const [gatePopulation, setGatePopulation] = useState(null);
  const [gateSelectedId, setGateSelectedId] = useState("");

  //@ts-ignore
  const workspaceGates: Gate[] = useSelector((state) => state.workspace.gates);

  const setGateColor = (gate: Gate, color: any) => {
    gate.color = color.hex;
    WorkspaceDispatch.UpdateGate(gate);
  };

  const setGateName = (gate: Gate, name: any) => {
    gate.name = name;
    WorkspaceDispatch.UpdateGate(gate);
  };

  const deleteGate = (gate: Gate) => {
    WorkspaceDispatch.DeleteGate(gate);
  };

  const cloneGate = (gate: PolygonGate) => {
    let newGate = createGate({
      cloneGate: gate,
    });
    newGate.name = gate.name + " clone";
    WorkspaceDispatch.AddGate(newGate);
  };

  const workspace = getWorkspace();

  const applyGateToFiles = (gate: Gate) => {
    setFilesMetadata([]);

    let files = getWorkspace().files;
    const plots = getWorkspace().plots;
    let alreadySelectedFileIds: FileID[] = [];
    let population: any = null;
    plots.forEach((plot) => {
      const pop = getPopulation(plot.population);
      if (pop.gates.filter((e) => e.gate === gate.id).length > 0) {
        population = pop;
        alreadySelectedFileIds.push(pop.file);
      }
    });
    setGatePopulation(population);
    let filesMetadata: any = [];
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let selected = false;
      if (alreadySelectedFileIds.includes(file.id)) selected = true;
      filesMetadata.push({
        id: file.id,
        selected: selected,
        name: file.name,
      });
    }
    setGateSelectedId(gate.id);
    setFilesMetadata(filesMetadata);
    setApplyGateModalOpen(true);
  };

  const applyGateToFilesFunc = async (fileIds: FileID[]) => {
    await dowloadAllFileEvents(false, "", fileIds);
    let files = getWorkspace().files.filter((x) => fileIds.includes(x.id));
    let gateSelected = props.gates.find((x) => x.id == gateSelectedId);
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      const newPopulation = createPopulation({ file: file.id });
      if (gatePopulation) {
        newPopulation.gates = gatePopulation.gates;
      } else {
        newPopulation.gates = [
          {
            inverseGating: false,
            gate: gateSelected.id,
          },
        ];
      }
      await WorkspaceDispatch.AddPopulation(newPopulation);
      const plot = createPlot({ population: newPopulation });
      if (gateSelected.gateType === "polygon") {
        plot.xAxis = (gateSelected as PolygonGate).xAxis;
        plot.yAxis = (gateSelected as PolygonGate).yAxis;
        plot.xPlotType = (gateSelected as PolygonGate).xAxisType;
        plot.yPlotType = (gateSelected as PolygonGate).yAxisType;
      }
      if (gateSelected.gateType === "histogram") {
        plot.xAxis = (gateSelected as HistogramGate).axis;
        plot.yAxis = (gateSelected as HistogramGate).axis;
        plot.xPlotType = (gateSelected as HistogramGate).axisType;
        plot.yPlotType = (gateSelected as HistogramGate).axisType;
        plot.histogramAxis = "vertical";
      }
      await WorkspaceDispatch.AddPlot(plot);
    }
  };

  const handleSubmitFiles = (files: FileID[]) => {
    if (files) {
      applyGateToFilesFunc(files);
    } else {
      setGatePopulation(null);
    }
    setApplyGateModalOpen(false);
  };

  return (
    <div>
      <ApplyGateToFilesModal
        filesMetadata={filesMetadata}
        modalOpen={applyGateModalOpen}
        handleSubmitFiles={handleSubmitFiles}
      />

      <TableContainer component={Paper}>
        <Table style={classes.table}>
          {/* <TableHead>
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
          </TableHead> */}
          <TableBody>
            {workspaceGates.map((gate: Gate) => (
              <TableRow key={gate.id}>
                {/* <TableCell>
                  <Button
                    style={{
                      display: "inline-block",
                      padding: 0,
                      minWidth: 0,
                      marginBottom: -3,
                    }}
                    onClick={() => deleteGate(gate)}
                  >
                    <Delete></Delete>
                  </Button>
                </TableCell> */}
                {/* <TableCell>
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
              </TableCell> */}
                {/* {workspace.files.length > 1 ? (
                  <TableCell>
                    <Button
                      style={{
                        flex: 1,
                        height: "2rem",
                        fontSize: 13,
                        color: "white",
                        backgroundColor: "#6666aa",
                      }}
                      variant="contained"
                      size="small"
                      onClick={() => applyGateToFiles(gate)}
                    >
                      Apply to files
                    </Button>
                  </TableCell>
                ) : null} */}
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
                {/* <TableCell>{gate.gateType}</TableCell>
                <TableCell>{(gate as PolygonGate).xAxis}</TableCell>
                <TableCell>{(gate as PolygonGate).yAxis}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
