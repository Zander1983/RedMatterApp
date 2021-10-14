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
import { getGate, getPlot, getPopulation } from "graph/utils/workspace";
import { useSelector } from "react-redux";
import { store } from "redux/store";
import { MenuItem, Select, Tooltip } from "@material-ui/core";

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

const PopulationSelectorGateBar = React.memo(
  (props: {
    plotId: PlotID;
    populationGates: { gate: Gate; inverseGating: boolean }[];
    plotGates: Gate[];
    editWorkspace: boolean;
  }) => {
    const allGates: Gate2D[] = useSelector((e: any) => e.workspace.gates);
    const plot = getPlot(props.plotId);
    const population = getPopulation(plot.population);
    const populationGates = props.populationGates;
    const plotGates = props.plotGates;

    const gateInPopulation = (gateId: GateID) => {
      return !!populationGates.find((e) => e.gate.id === gateId);
    };

    const gateInPlotGates = (gateId: GateID) => {
      return !!plotGates.find((e) => e.id === gateId);
    };

    const addGateToPopulation = (gateId: string) => {
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

    const setPopulation = (gateId: GateID | null) => {
      for (const pop of props.populationGates) {
        removeGateFromPopulation(pop.gate.id);
      }
      if (gateId !== null) {
        addGateToPopulation(gateId);
      }
    };

    return (
      <span
        style={{
          flex: 1,
          flexGrow: 1,
        }}
      >
        <Tooltip
          title={
            <React.Fragment>
              <h3 style={{ color: "white" }}>Population selector</h3>
            </React.Fragment>
          }
        >
          <Select
            disabled={!props.editWorkspace}
            style={{
              width: "100%",
            }}
            value={
              populationGates.length > 0 ? populationGates[0].gate.id : null
            }
            displayEmpty={true}
            renderValue={(value: unknown) => {
              //@ts-ignore
              return value === null ? "All" : getGate(value).name;
            }}
            onChange={(e) => {
              //@ts-ignore
              setPopulation(e.target.value);
            }}
          >
            <MenuItem value={null}>All</MenuItem>
            {allGates
              .filter((e) => !gateInPlotGates(e.id))
              .map((e) => {
                return (
                  <MenuItem value={e.id} key={e.id}>
                    {e.name}
                  </MenuItem>
                );
              })}
          </Select>
        </Tooltip>
      </span>
    );
  }
);

export default PopulationSelectorGateBar;
