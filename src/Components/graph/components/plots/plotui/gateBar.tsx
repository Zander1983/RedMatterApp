import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Grid from "@material-ui/core/Grid";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const classes = {
  bar: {
    marginTop: 10,
    marginBottom: 10,
  },
};

export default function GateBar(props: any) {
  return (
    <Grid xs={12} container direction="column" style={classes.bar}>
      <Autocomplete
        multiple
        options={["Gate a", "Gate b", "Gate c"]}
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
