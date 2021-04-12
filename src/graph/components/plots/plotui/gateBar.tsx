import React, { useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import dataManager from "../../../dataManagement/dataManager";
import Plot from "graph/renderers/plotRender";

import Gate from "../../../dataManagement/gate/gate";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const classes = {
  bar: {
    marginTop: 10,
    marginBottom: 10,
  },
  root: {
    borderRadius: 0,
    color: "#0f0",
    boxSizing: "border-box",
    border: "1px solid",
    borderColor: "#bddaff",
  },
};

export default function GateBar(props: any) {
  const [gates, setGates] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const plot: Plot = props.plot;
  let idPlotGateUpdate: any = null;
  let idGateUpdate: any = null;
  let idLinkNewPlot: any = null;

  const getPlotGates = () => {
    setSelected(plot.plotData.gates.map((e) => e.gate.name));
  };

  const getAllGates = () => {
    const cgates: Gate[] = [];
    dataManager.getAllGates().forEach((v) => {
      cgates.push(v.gate);
    });
    setGates(cgates);
  };

  const changeGatePlotState = (gateName: string, selected: boolean) => {
    const gateID = gates.find((gate) => gate.name === gateName).id;
    if (selected) {
      dataManager.unlinkGateFromPlot(plot.plotData.id, gateID);
    } else {
      dataManager.linkGateToPlot(plot.plotData.id, gateID, true);
    }
    update();
  };

  const update = () => {
    getAllGates();
    getPlotGates();
  };

  useEffect(() => {
    idPlotGateUpdate = dataManager.addObserver("addNewGateToWorkspace", update);
    idGateUpdate = dataManager.addObserver("linkGateToPlot", update);
    update();
  }, []);

  return (
    <Grid xs={12} container direction="column" style={classes.bar}>
      <Autocomplete
        multiple
        options={gates.map((e) => e.name)}
        value={selected.map((e) => e)}
        disableCloseOnSelect
        getOptionLabel={(option) => option}
        renderOption={(option, { selected }) => (
          <Button
            onClick={() => changeGatePlotState(option, selected)}
            style={{ flex: 1, justifyContent: "left" }}
          >
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8, textAlign: "left", padding: 0 }}
              checked={selected}
            />
            {option}
          </Button>
        )}
        style={{ flex: 1 }}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Gates" />
        )}
        renderTags={(tagValue, _) => {
          return tagValue.map((option) => (
            <Chip
              label={option}
              onDelete={() => changeGatePlotState(option, true)}
              {...props}
            />
          ));
        }}
      />
    </Grid>
  );
}
