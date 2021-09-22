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
import PopAndGatesGateBar from "./PopAndGatesGateBar";
import PopulationSelectorGateBar from "./PopulationSelectorGateBar";

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

const GateBar = React.memo(
  (props: {
    plotId: PlotID;
    populationGates: { gate: Gate; inverseGating: boolean }[];
    plotGates: Gate[];
  }) => {
    return <PopulationSelectorGateBar {...props} />;
    // return <PopAndGatesGateBar {...props} />;
  }
);

export default GateBar;
