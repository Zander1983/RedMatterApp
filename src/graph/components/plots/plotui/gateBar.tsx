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
  const [population, setPopulation] = React.useState([]);
  const plot: Plot = props.plot;
  let idPlotGateUpdate: any = null;
  let idGateUpdate: any = null;
  let idLinkNewPlot: any = null;

  const changeGatePlotState = (gateName: string, selected: boolean) => {
    const gateID = gates.find((gate) => gate.name === gateName).id;
    if (selected) {
      dataManager.unlinkGateFromPlot(plot.plotData.id, gateID);
    } else {
      dataManager.linkGateToPlot(plot.plotData.id, gateID);
    }
    update();
  };

  const update = () => {
    let gates = plot.plotData.gates.map((e) => e.gate);
    const pop = plot.plotData.population.map((e) => e.gate);
    setPopulation(pop);
    gates = gates.filter((e: any) => {
      for (const gate of pop) {
        if (gate.id === e.id) return false;
      }
      return true;
    });
    setSelected(gates);
    let cgates: Gate[] = [];
    dataManager.getAllGates().forEach((v) => {
      cgates.push(v.gate);
    });
    // cgates = cgates.filter((e: any) => {
    //   for (const gate of pop) {
    //     if (gate.id === e.id) return false;
    //   }
    //   return true;
    // });
    setGates(cgates);
  };

  useEffect(() => {
    idPlotGateUpdate = dataManager.addObserver("addNewGateToWorkspace", update);
    idGateUpdate = dataManager.addObserver("linkGateToPlot", update);
    update();
  }, []);

  const gateInPopulation = (id: string) => {
    for (const gate of population) if (gate.id === id) return true;
    return false;
  };

  return (
    <Grid xs={12} container direction="column" style={classes.bar}>
      <Autocomplete
        multiple
        options={gates}
        value={gates.filter((e: any) => {
          for (const gate of population) {
            if (gate.id === e.id) return true;
          }
          for (const gate of selected) {
            if (gate.id === e.id) return true;
          }
          return false;
        })}
        disableCloseOnSelect
        getOptionLabel={(option) => option.name}
        renderOption={(option, { selected }) => (
          <Button
            onClick={() => {
              if (!gateInPopulation(option.id)) {
                changeGatePlotState(option.name, selected);
              }
            }}
            style={{
              flex: 1,
              justifyContent: "left",
              textTransform: "none",
            }}
          >
            <Checkbox
              icon={icon}
              disabled={gateInPopulation(option.id)}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8, textAlign: "left", padding: 0 }}
              checked={selected || gateInPopulation(option.id)}
            />
            {option.name} - ({option.xAxis}, {option.yAxis})
          </Button>
        )}
        style={{ flex: 1 }}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Population" />
        )}
        renderTags={(tagValue, _) => {
          return tagValue.map((option) => (
            <Chip
              label={option.name}
              disabled={gateInPopulation(option.id)}
              avatar={
                <div
                  style={{
                    borderRadius: "50%",
                    width: 15,
                    height: 15,
                    marginLeft: 7,
                    border: "solid 2px #999",
                    backgroundColor: option.color,
                  }}
                ></div>
              }
              onDelete={() => {
                if (!gateInPopulation(option.id)) {
                  changeGatePlotState(option.name, true);
                }
              }}
              {...props}
              style={{ marginLeft: 5 }}
            />
          ));
        }}
      />
    </Grid>
  );
}
