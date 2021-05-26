import React, { useState } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import { FormControlLabel } from "@material-ui/core";

import { fluorophoresData, deviceData } from "./quesData";
import { useDispatch, useStore } from "react-redux";
import { store } from "redux/store";

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
  const store = useStore();
  let defaultValue = store.getState().user.experiment.device;
  if (defaultValue === undefined) defaultValue = null;
  if (defaultValue != null) {
    defaultValue = deviceData.filter((e) => e.value === defaultValue)[0];
  }
  const dispatch = useDispatch();
  const [deviceType, setDeviceType] = React.useState(defaultValue);
  const [notFound, setNotFound] = React.useState(false);

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
        onChange={(e) =>
          dispatch({
            type: "EXPERIMENT_FORM_DATA",
            //@ts-ignore
            payload: { formitem: { key: "device", value: e.target.outerText } },
          })
        }
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
            onChange={(e) => {
              setNotFound(!notFound);
              dispatch({
                type: "EXPERIMENT_FORM_DATA",
                //@ts-ignore
                payload: { formitem: { key: "device", value: null } },
              });
            }}
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
  const store = useStore();
  let defaultValue = store.getState().user.experiment.cellType;
  if (defaultValue === undefined) defaultValue = null;
  if (defaultValue != null) {
    defaultValue = [
      { id: 1, key: 1, value: "Single cells" },
      { id: 2, key: 2, value: "Heterogenous population" },
    ].filter((e) => e.value === defaultValue)[0];
  }
  const dispatch = useDispatch();
  const [cellType, setCellType] = React.useState(defaultValue);

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
        onChange={(e) => {
          dispatch({
            type: "EXPERIMENT_FORM_DATA",
            payload: {
              //@ts-ignore
              formitem: { key: "cellType", value: e.target.outerText },
            },
          });
        }}
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
  const store = useStore();
  let defaultValue = store.getState().user.experiment.particleSize;
  if (defaultValue === undefined) defaultValue = null;
  if (defaultValue != null) {
    defaultValue = [
      { id: 1, key: "Below 1µm", value: "Below 1µm" },
      { id: 2, key: "1-3 µm", value: "1-3 µm" },
      { id: 3, key: "2µm+", value: "2µm+" },
    ].filter((e) => e.value === defaultValue)[0];
  }
  const dispatch = useDispatch();
  const [particleSize, setParticleSize] = React.useState(defaultValue);

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
        onChange={(e) => {
          dispatch({
            type: "EXPERIMENT_FORM_DATA",
            payload: {
              //@ts-ignore
              formitem: { key: "particleSize", value: e.target.outerText },
            },
          });
        }}
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
  const store = useStore();
  let defaultValue = store.getState().user.experiment.fluorophoresCategory;
  if (defaultValue === undefined) defaultValue = null;
  if (defaultValue != null) {
    defaultValue = fluorophoresData.filter((e) => e.value === defaultValue)[0];
  }
  const dispatch = useDispatch();
  const [fluorophoresType, setFluorophoresType] = React.useState(defaultValue);
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
        onChange={(e) => {
          dispatch({
            type: "EXPERIMENT_FORM_DATA",
            payload: {
              formitem: {
                key: "fluorophoresCategory",
                //@ts-ignore
                value: e.target.outerText,
              },
            },
          });
        }}
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
            onChange={(e) => {
              setNotFound(!notFound);
              dispatch({
                type: "EXPERIMENT_FORM_DATA",
                payload: {
                  //@ts-ignore
                  formitem: { key: "fluorophoresCategory", value: null },
                },
              });
            }}
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
  const store = useStore();
  let defaultValue = store.getState().user.experiment.description;
  if (defaultValue === undefined) defaultValue = null;
  const dispatch = useDispatch();
  const [description, setdescription] = React.useState(defaultValue);

  const getData = () => {
    return description;
  };

  return (
    <TextField
      value={description}
      id="outlined-multiline-static"
      label="Description"
      multiline
      onChange={(e) => {
        setdescription(e.target.value);
        dispatch({
          type: "EXPERIMENT_FORM_DATA",
          payload: {
            //@ts-ignore
            formitem: { key: "description", value: e.target.value },
          },
        });
      }}
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
