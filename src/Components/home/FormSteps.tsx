import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { NavLink } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import DirectionsIcon from "@material-ui/icons/Directions";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import { FormControlLabel } from "@material-ui/core";

import { fluorophoresData, deviceData } from "./quesData";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    button: {
      marginRight: theme.spacing(1),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    marginButton: {
      margin: theme.spacing(1),
      width: 300,
      height: 50,
      backgroundColor: "rgb(210, 230, 240)",
    },
    deviceTypeContent: {
      padding: "2px 4px",
      display: "flex",
      alignItems: "center",
      width: 400,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
  })
);

function getSteps() {
  return [
    "Device selection",
    "Cell type",
    "Particle size",
    "Fluorophores category",
    "Description",
  ];
}

function FormDeviceType() {
  const classes = useStyles();
  const [deviceType, setDeviceType] = React.useState(null);
  const [notFound, setNotFound] = React.useState(false);

  const getData = () => {
    return deviceType;
  };

  return (
    <div
      style={{
        fontFamily: "Quicksand",
        textAlign: "center",
        display: "grid",
        placeItems: "center",
        marginTop: 30,
      }}
    >
      <Autocomplete
        value={deviceType}
        id="combo-box-demo"
        options={deviceData}
        getOptionLabel={(option) => option.value}
        style={{ width: 400 }}
        renderInput={(params) => (
          <TextField {...params} label="Device" variant="outlined" />
        )}
      />
      <FormControlLabel
        style={{
          marginTop: 20,
        }}
        control={
          <Checkbox
            color="primary"
            inputProps={{ "aria-label": "secondary checkbox" }}
            checked={notFound}
            onChange={(e) => setNotFound(!notFound)}
          />
        }
        label="Could not find my device"
      />
      {notFound ? (
        <div
          style={{
            marginBottom: -30,
          }}
        >
          Send us an email at{" "}
          <a href="mailto:redmatterapp@gmail.com">
            <b>redmatterapp@gmail.com</b>
          </a>
          <p style={{ fontSize: 17 }}>
            Provide the name of your device and we will add it to our database!
          </p>
        </div>
      ) : null}
    </div>
  );
}

function FormCellType() {
  const classes = useStyles();
  const [cellType, setCellType] = React.useState(null);

  const getData = () => {
    return cellType;
  };

  return (
    <div
      style={{
        fontFamily: "Quicksand",
        textAlign: "center",
        display: "grid",
        placeItems: "center",
        marginTop: 30,
      }}
    >
      <Autocomplete
        value={cellType}
        id="combo-box-demo"
        options={[
          { id: 1, key: 1, value: "Single cells" },
          { id: 2, key: 2, value: "Heterogenous population" },
        ]}
        getOptionLabel={(option) => option.value}
        style={{ width: 400 }}
        renderInput={(params) => (
          <TextField {...params} label="Cell type" variant="outlined" />
        )}
      />
    </div>
  );
}

function FormParticleSize() {
  const classes = useStyles();
  const [particleSize, setParticleSize] = React.useState(null);

  const getData = () => {
    return particleSize;
  };

  return (
    <div
      style={{
        fontFamily: "Quicksand",
        textAlign: "center",
        display: "grid",
        placeItems: "center",
        marginTop: 30,
      }}
    >
      <Autocomplete
        id="combo-box-demo"
        value={particleSize}
        options={[
          { id: 1, key: "Below 1µm", value: "Below 1µm" },
          { id: 2, key: "1-3 µm", value: "1-3 µm" },
          { id: 3, key: "2µm+", value: "2µm+" },
        ]}
        getOptionLabel={(option) => option.value}
        style={{ width: 400 }}
        renderInput={(params) => (
          <TextField {...params} label="Cell size" variant="outlined" />
        )}
      />
    </div>
  );
}

function FormFluorophores() {
  const classes = useStyles();
  const [fluorophoresType, setFluorophoresType] = React.useState(null);
  const [notFound, setNotFound] = React.useState(false);

  const getData = () => {
    return fluorophoresType;
  };

  return (
    <div
      style={{
        fontFamily: "Quicksand",
        textAlign: "center",
        display: "grid",
        placeItems: "center",
        marginTop: 30,
      }}
    >
      <Autocomplete
        value={fluorophoresType}
        id="combo-box-demo"
        options={fluorophoresData}
        getOptionLabel={(option) => option.value}
        style={{ width: 400 }}
        renderInput={(params) => (
          <TextField {...params} label="Fluorophores" variant="outlined" />
        )}
      />
      <FormControlLabel
        style={{
          marginTop: 20,
        }}
        control={
          <Checkbox
            color="primary"
            inputProps={{ "aria-label": "secondary checkbox" }}
            checked={notFound}
            onChange={(e) => setNotFound(!notFound)}
          />
        }
        label="Could not find the fluorophores"
      />
      {notFound ? (
        <div
          style={{
            marginBottom: -30,
          }}
        >
          Send us an email at{" "}
          <a href="mailto:redmatterapp@gmail.com">
            <b>redmatterapp@gmail.com</b>
          </a>
          <p style={{ fontSize: 17 }}>
            Provide the name of your fluorophores and we will add it to our
            database!
          </p>
        </div>
      ) : null}
    </div>
  );
}

function FormDescription() {
  const classes = useStyles();
  const [description, setdescription] = React.useState(null);

  const getData = () => {
    return description;
  };

  return (
    <TextField
      value={description}
      id="outlined-multiline-static"
      label="Description"
      multiline
      rows={6}
      placeholder="..."
      variant="outlined"
      style={{
        marginTop: 30,
        width: 600,
      }}
    />
  );
}

export default {
  formDeviceType: {
    component: <FormDeviceType />,
    optional: false,
    title: "To optimize your analysis, what device are you using?",
  },
  formCellType: {
    component: <FormCellType />,
    optional: false,
    title:
      "What is the cell type you are measuring? (Helps us automate gates later)",
  },
  formParticleSize: {
    component: <FormParticleSize />,
    optional: false,
    title: "How big are your cells/particles?",
  },
  formFlurophores: {
    component: <FormFluorophores />,
    optional: false,
    title: "What are the fluorophores? (Helps us select the FL-channels)",
  },
  formDescription: {
    component: <FormDescription />,
    optional: true,
    title:
      "Enter a brief description of your experiment. You can skip if you like!",
  },
};
