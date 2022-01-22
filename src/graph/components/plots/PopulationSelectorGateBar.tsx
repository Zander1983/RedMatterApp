import React from "react";

import {
  Gate,
  GateID,
  Gate2D,
  PlotID,
  PopulationID,
  FileID,
} from "graph/resources/types";
import * as PopulationResource from "graph/resources/populations";
import { getGate, getPlot, getPopulation } from "graph/utils/workspace";
import { useSelector } from "react-redux";
import { MenuItem, Select, Tooltip } from "@material-ui/core";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";

const PopulationSelectorGateBar = React.memo(
  (props: {
    plotId: PlotID;
    populationGates: { gate: Gate; inverseGating: boolean }[];
    plotGates: Gate[];
    editWorkspace: boolean;
    file: FileID;
  }) => {
    const allGates: Gate2D[] = useSelector((e: any) => e.workspace.gates);
    const allPopulations: any[] = useSelector(
      (e: any) => e.workspace.populations
    );
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

    const setPopulation = (populationId: PopulationID | null) => {
      if (populationId == null) {
        populationId = allPopulations.find(
          (x) => x.file == props.file && x.gates.length == 0
        ).id;
      }
      let plot = getPlot(props.plotId);
      plot.population = populationId;
      WorkspaceDispatch.UpdatePlot(plot);
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
            value={populationGates.length > 0 ? populationGates[0].gate.id : ""}
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
            {allPopulations
              .filter((e) => e.file == props.file)
              .map((e) => {
                return (
                  <MenuItem value={e.id} key={e.id}>
                    {e.name}
                    {e.label}
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
