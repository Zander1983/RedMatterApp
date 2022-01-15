import React from "react";
import {Gate, PlotID } from "graph/resources/types";
import PopulationSelectorGateBar from "./PopulationSelectorGateBar";

const GateBar = React.memo(
  (props: {
    plotId: PlotID;
    populationGates: { gate: Gate; inverseGating: boolean }[];
    plotGates: Gate[];
    editWorkspace: boolean;
  }) => {
    return <PopulationSelectorGateBar {...props} />;
    // return <PopAndGatesGateBar {...props} />;
  }
);

export default GateBar;
