import React, { useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Grid from "@material-ui/core/Grid";
import dataManager from "../../../classes/dataManager";
import Canvas from "../../../classes/canvas/canvas";
import Gate from "../../../classes/gate/gate";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const classes = {
  bar: {
    marginTop: 10,
    marginBottom: 10,
  },
};

export default function GateBar(props: any) {
  const [gates, setGates] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const canvas: Canvas = props.canvas;

  const getCanvasGates = () => {
    console.log("getCanvasGates");
    return canvas.gates;
  };

  const getAllGates = () => {
    console.log("getAllGates");
    const cgates: Gate[] = [];
    dataManager.getAllGates().forEach((v, k) => {
      cgates.push(v);
    });
    setGates(cgates);
  };

  const update = () => {
    getAllGates();
    getCanvasGates();
  };

  useEffect(() => {
    update();
  }, [canvas.gates, dataManager.gates]);

  return (
    <Grid xs={12} container direction="column" style={classes.bar}>
      <Autocomplete
        multiple
        options={gates.map((e) => e.name)}
        disableCloseOnSelect
        getOptionLabel={(option) => option}
        renderOption={(option, { selected }) => (
          <React.Fragment>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option}
          </React.Fragment>
        )}
        style={{ flex: 1 }}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Gates" />
        )}
      />
    </Grid>
  );
}
