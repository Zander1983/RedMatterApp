import React from "react";

import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import { snackbarService } from "uno-material-ui";

import { Plot, Gate, GateID, Gate2D } from "graph/resources/types";
import * as GateResource from "graph/resources/gates";
import * as PlotResource from "graph/resources/plots";
import * as PopulationResource from "graph/resources/populations";
import { getGate, getPopulation } from "graph/utils/workspace";
import { useDispatch, useStore } from "react-redux";

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
  chip_hover: {
    border: "1px solid black",
  },
};

export default function GateBar(props: {
  plot: Plot;
  onGateDoubleClick: (
    xAxis: String,
    xAxisType: String,
    yAxis: String,
    yAxisType: String
  ) => void;
}) {
  const plot = props.plot;
  const population = getPopulation(plot.population);
  const plotGates = plot.gates;
  const populationGates = population.gates.map((e) => e.gate);
  const allGates = plotGates.concat(populationGates);
  const [gateChipHover, setGateChipHover] = React.useState(false);

  const changeGatePlotState = (gateId: string, selected: boolean) => {
    try {
      if (selected) {
        PlotResource.removeGate(props.plot, gateId);
      } else {
        PlotResource.addGate(props.plot, gateId);
      }
    } catch {
      snackbarService.showSnackbar(
        "There was an error updating gates, please try again.",
        "error"
      );
    }
  };

  const gateInPopulation = (gateId: GateID) => {
    return !!population.gates.find((e) => e.gate === gateId);
  };

  const gateInPlotGates = (gateId: GateID) => {
    return !!plot.gates.find((e) => e === gateId);
  };

  const addGateToPopulation = (gateId: string) => {
    if (gateInPopulation(gateId)) throw Error("Gate already in population");
    PopulationResource.addGate(population, gateId);
  };

  const removeGateFromPopulation = (gateId: string) => {
    if (!gateInPopulation(gateId)) throw Error("Gate is not in population");
    PopulationResource.removeGate(population, gateId);
  };

  const addGateToPlotGates = (gateId: string) => {
    if (gateInPlotGates(gateId)) throw Error("Gate already in plot gates");
    PlotResource.addGate(plot, gateId);
  };

  const removeGateFromPlotGates = (gateId: string) => {
    if (!gateInPlotGates(gateId)) throw Error("Gate is not in plot gates");
    PlotResource.removeGate(plot, gateId);
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
  };

  const onGateChipClick = (option: Gate2D) => {
    props.onGateDoubleClick(
      option.xAxis,
      option.xAxisType,
      option.yAxis,
      option.yAxisType
    );
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
          options={allGates.map((e) => getGate(e) as Gate2D)}
          value={allGates.filter((e: any) => gateInPopulation(e.id))}
          noOptionsText={"All"}
          onChange={(e, o) => {
            if (o.length === 0) {
              for (const gate of allGates.filter((e: GateID) =>
                gateInPopulation(e)
              )) {
                removeGateFromPopulation(gate);
              }
            }
          }}
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
          style={{ flex: 1, height: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              variant="outlined"
              label={
                allGates.length > 0
                  ? `Population (${
                      getPopulation(props.plot.population).gates.length
                    })`
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
                      width: 12,
                      height: 12,
                      marginLeft: 7,
                      border: "solid 2px #999",
                      backgroundColor: option.color,
                    }}
                  ></div>
                }
                {...props}
                style={{
                  marginLeft: 5,
                  marginTop: 5,
                  height: 27,
                }}
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
          options={allGates
            .filter((e) => !gateInPopulation(e))
            .map((e) => getGate(e) as Gate2D)}
          value={allGates.filter((e: any) => gateInPlotGates(e))}
          disableCloseOnSelect
          getOptionLabel={(option) => option.name}
          onChange={(e, o) => {
            if (o.length === 0) {
              for (const gate of allGates.filter((e: any) =>
                gateInPlotGates(e.id)
              )) {
                changeGatePlotState(gate, true);
              }
            }
          }}
          onReset={() => console.log("emptied")}
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
                allGates.filter((e) => !gateInPopulation(e)).length
              })`}
            />
          )}
          renderTags={(tagValue, _) => {
            return tagValue.map((option) => (
              <Chip
                onClick={() => {
                  onGateChipClick(option);
                }}
                onMouseEnter={() => {
                  setGateChipHover(true);
                }}
                onMouseLeave={() => {
                  setGateChipHover(false);
                }}
                className={`chip_hover`}
                label={option.name}
                disabled={gateInPopulation(option.id)}
                avatar={
                  <div
                    style={{
                      borderRadius: "50%",
                      width: 12,
                      height: 12,
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
                style={{
                  marginLeft: 5,
                  marginTop: 5,
                  height: 27,
                  backgroundColor: `${gateChipHover ? "#BAC1C1" : "#E0E0E0"}`,
                }}
              />
            ));
          }}
        />
      </Grid>
    </Grid>
  );
}
