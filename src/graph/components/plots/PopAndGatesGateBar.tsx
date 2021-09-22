import React, { useEffect } from "react";

import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import { snackbarService } from "uno-material-ui";

import { Plot, Gate, GateID, Gate2D, PlotID } from "graph/resources/types";
import * as PlotResource from "graph/resources/plots";
import * as PopulationResource from "graph/resources/populations";
import { getPlot, getPopulation } from "graph/utils/workspace";
import { useSelector } from "react-redux";
import { store } from "redux/store";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const classes = {
  bar: {
    marginTop: 10,
    marginBottom: 5,
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

const PopAndGatesGateBar = React.memo(
  (props: {
    plotId: PlotID;
    populationGates: { gate: Gate; inverseGating: boolean }[];
    plotGates: Gate[];
  }) => {
    const allGates: Gate2D[] = useSelector((e: any) => e.workspace.gates);
    const plot = getPlot(props.plotId);
    const population = getPopulation(plot.population);
    const populationGates = props.populationGates;
    const plotGates = props.plotGates;

    const changeGatePlotState = (gateId: GateID, selected: boolean) => {
      try {
        if (selected) {
          PlotResource.removeGate(plot, gateId);
        } else {
          PlotResource.addGate(plot, gateId);
        }
      } catch {
        snackbarService.showSnackbar(
          "There was an error updating gates, please try again.",
          "error"
        );
      }
    };

    const gateInPopulation = (gateId: GateID) => {
      return !!populationGates.find((e) => e.gate.id === gateId);
    };

    const gateInPlotGates = (gateId: GateID) => {
      return !!plotGates.find((e) => e.id === gateId);
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

    const onGateChipClick = (gate: Gate2D) => {
      let cPlot: Plot = plot;
      cPlot.xAxis = gate.xAxis;
      cPlot.xPlotType = gate.xAxisType;
      cPlot.yAxis = gate.yAxis;
      cPlot.yPlotType = gate.yAxisType;
      store.dispatch({
        type: "workspace.UPDATE_PLOT",
        payload: {
          plot: cPlot,
        },
      });
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
            options={allGates}
            value={allGates.filter((e: any) => gateInPopulation(e.id))}
            noOptionsText={"All"}
            onChange={(e, o) => {
              if (o.length === 0) {
                for (const gate of allGates.filter((e) =>
                  gateInPopulation(e.id)
                )) {
                  removeGateFromPopulation(gate.id);
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
                {option.name} -{" "}
                {option.gateType === "histogram"
                  ? //@ts-ignore
                    "(" + option.axis + ")"
                  : `(${option.xAxis}, ${option.yAxis})`}
              </Button>
            )}
            style={{ flex: 1, height: "100%" }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                variant="outlined"
                label={
                  populationGates.length > 0
                    ? `Population (${populationGates.length})`
                    : "Population: All"
                }
              />
            )}
            renderTags={(tagValue, _) => {
              return tagValue.map((option) => (
                <Chip
                  onClick={() => {
                    onGateChipClick(option);
                  }}
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
            options={allGates.filter((e) => !gateInPopulation(e.id))}
            value={allGates.filter(
              (e) => gateInPlotGates(e.id) && !gateInPopulation(e.id)
            )}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            onChange={(e, o) => {
              if (o.length === 0) {
                for (const gate of allGates.filter((e: any) =>
                  gateInPlotGates(e.id)
                )) {
                  changeGatePlotState(gate.id, true);
                }
              }
            }}
            onReset={() => {}}
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
                {option.name} -{" "}
                {option.gateType === "histogram"
                  ? //@ts-ignore
                    "(" + option.axis + ")"
                  : `(${option.xAxis}, ${option.yAxis})`}
              </Button>
            )}
            style={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                variant="outlined"
                label={`Gates (${
                  allGates.filter((e) => !gateInPopulation(e.id)).length
                })`}
              />
            )}
            renderTags={(tagValue, _) => {
              return tagValue.map((option) => (
                <Chip
                  onClick={() => {
                    onGateChipClick(option);
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
                    backgroundColor: "#BAC1C1",
                  }}
                />
              ));
            }}
          />
        </Grid>
      </Grid>
    );
  }
);

export default PopAndGatesGateBar;
