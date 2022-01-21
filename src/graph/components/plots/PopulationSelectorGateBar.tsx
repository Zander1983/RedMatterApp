import React from "react";

import { Gate, GateID, Gate2D, PlotID } from "graph/resources/types";
import * as PopulationResource from "graph/resources/populations";
import { getGate, getPlot, getPopulation } from "graph/utils/workspace";
import { useSelector } from "react-redux";
import { MenuItem, Select, Tooltip } from "@material-ui/core";

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
              populationGates.length > 0 ? populationGates[0].gate.id : ""
            }
            displayEmpty={true}
            renderValue={(value: unknown) => {
              //@ts-ignore
              return value === null ? "All" : getGate(value)?.name;
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
