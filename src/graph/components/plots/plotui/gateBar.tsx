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
import { snackbarService } from "uno-material-ui";
import useForceUpdate from "hooks/forceUpdate";

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
  const forceUpdate = useForceUpdate();
  const [gates, setGates] = React.useState([]);
  const [observers, setObservers] = React.useState([]);
  const plot: Plot = props.plot;

  const changeGatePlotState = (gateId: string, selected: boolean) => {
    try {
      const gateID = gates.find((gate) => gate.id === gateId).id;
      if (selected) {
        dataManager.unlinkGateFromPlot(plot.plotData.id, gateID);
      } else {
        dataManager.linkGateToPlot(plot.plotData.id, gateID);
      }
      update();
    } catch {
      snackbarService.showSnackbar(
        "There was an error updating gates, please try again.",
        "error"
      );
    }
  };

  const update = () => {
    if (
      !dataManager.ready() ||
      plot === undefined ||
      plot.plotData === undefined
    )
      return;
    let cgates: Gate[] = dataManager.getAllGates().map((e) => e.gate);
    setGates(cgates);
    forceUpdate();
  };

  useEffect(() => {
    update();
    const obs = [
      "addNewGateToWorkspace",
      "removeGateFromWorkspace",
      "linkGateToPlot",
      "unlinkGateFromPlot",
      "linkPopulationToPlot",
      "unlinkPopulationFromPlot",
      "clearWorkspace",
    ];
    const obsWithValues = obs.map((e) => {
      return {
        value: dataManager.addObserver(e, update),
        target: e,
      };
    });
    setObservers(obsWithValues);
    return () => {
      observers.forEach((e) => {
        dataManager.removeObserver(e.terget, e.value);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gateInPopulation = (gateId: string) =>
    dataManager
      .getPlot(plot.plotData.id)
      .population.filter((e) => e.gate.id === gateId).length > 0;

  const gateInPlotGates = (gateId: string) => {
    return (
      dataManager
        .getPlot(plot.plotData.id)
        .gates.filter((e) => e.gate.id === gateId).length > 0
    );
  };

  const addGateToPopulation = (gateId: string) => {
    if (gateInPopulation(gateId)) throw Error("Gate already in population");
    dataManager.linkPopulationToPlot(plot.plotData.id, gateId);
  };

  const removeGateFromPopulation = (gateId: string) => {
    if (!gateInPopulation(gateId)) throw Error("Gate is not in population");
    dataManager.unlinkPopulationFromPlot(plot.plotData.id, gateId);
  };

  const addGateToPlotGates = (gateId: string) => {
    if (gateInPlotGates(gateId)) throw Error("Gate already in plot gates");
    dataManager.linkGateToPlot(plot.plotData.id, gateId);
  };

  const removeGateFromPlotGates = (gateId: string) => {
    if (!gateInPlotGates(gateId)) throw Error("Gate is not in plot gates");
    dataManager.unlinkGateFromPlot(plot.plotData.id, gateId);
  };

  const populationSelect = (id: string) => {
    const pop = gateInPopulation(id);
    const plotGates = gateInPlotGates(id);
    if (pop && plotGates)
      throw Error("This gate is both population and plot gates");
    else if (plotGates) {
      removeGateFromPlotGates(id);
      addGateToPopulation(id);
    } else if (pop) {
      removeGateFromPopulation(id);
    } else {
      addGateToPopulation(id);
    }
    update();
  };

  const plotGatesSelect = (id: string) => {
    const pop = gateInPopulation(id);
    const plotGates = gateInPlotGates(id);
    if (pop && plotGates)
      throw Error("This gate is both population and plot gates");
    else if (plotGates) {
      removeGateFromPlotGates(id);
    } else if (pop) {
      throw Error("This gate is already population");
    } else {
      addGateToPlotGates(id);
    }
    update();
  };

  return (
    <Grid
      xs={12}
      item
      container
      direction="column"
      style={{
        ...classes.bar,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridGap: 10,
      }}
    >
      <Grid item>
        <Autocomplete
          multiple
          options={gates}
          value={gates.filter((e: any) => gateInPopulation(e.id))}
          noOptionsText={"All"}
          disableCloseOnSelect
          getOptionLabel={(option) => option.name}
          renderOption={(option, { selected }) => (
            <Button
              onClick={() => {
                populationSelect(option.id);
              }}
              style={{
                flex: 1,
                justifyContent: "left",
                textTransform: "none",
              }}
            >
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8, textAlign: "left", padding: 0 }}
                checked={selected || gateInPopulation(option.id)}
              />
              {option.name} - ({option.xAxis}, {option.yAxis})
            </Button>
          )}
          style={{ flex: 1 }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              variant="outlined"
              label={
                gates.length > 0
                  ? `Population (${plot.plotData.population.length})`
                  : "Population: All"
              }
            />
          )}
          renderTags={(tagValue, _) => {
            return tagValue.map((option) => (
              <Chip
                label={option.name}
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
                {...props}
                style={{ marginLeft: 5 }}
                onDelete={() => {
                  if (gateInPopulation(option.id)) {
                    removeGateFromPopulation(option.id);
                  }
                }}
              />
            ));
          }}
        />
      </Grid>
      <Grid item>
        <Autocomplete
          multiple
          options={gates.filter((e) => !gateInPopulation(e.id))}
          value={gates.filter((e: any) => gateInPlotGates(e.id))}
          disableCloseOnSelect
          getOptionLabel={(option) => option.name}
          renderOption={(option, { selected }) => (
            <Button
              onClick={() => {
                if (gateInPopulation(option.id)) return;
                plotGatesSelect(option.id);
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
                checked={
                  selected ||
                  gateInPlotGates(option.id) ||
                  gateInPopulation(option.id)
                }
              />
              {option.name} - ({option.xAxis}, {option.yAxis})
            </Button>
          )}
          style={{ flex: 1 }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              variant="outlined"
              label={`Gates (${
                gates.filter((e) => !gateInPopulation(e.id)).length
              })`}
            />
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
                    changeGatePlotState(option.id, true);
                  }
                }}
                {...props}
                style={{ marginLeft: 5 }}
              />
            ));
          }}
        />
      </Grid>
    </Grid>
  );
}
