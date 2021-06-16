import React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import { FormControlLabel } from "@material-ui/core";

import { fluorophoresData, deviceData } from "./quesData";
import { useDispatch, useStore } from "react-redux";

function FormDeviceType() {
  const store = useStore();
  try {
    let defaultValue = store.getState().user.experiment.device;
    if (defaultValue === undefined) defaultValue = null;
    if (defaultValue != null) {
      defaultValue = deviceData.filter((e) => e.value === defaultValue)[0];
    }
  } catch (e) {}
  const dispatch = useDispatch();
  const [notFound, setNotFound] = React.useState(false);

  return (
    <div
      style={{
        fontFamily: "Quicksand",
        textAlign: "center",
        display: "grid",
        placeItems: "center",
        marginTop: 5,
      }}
    >
      <Autocomplete
        id="combo-box-demo"
        options={deviceData}
        onChange={(e) => {
          dispatch({
            type: "EXPERIMENT_FORM_DATA",
            payload: {
              //@ts-ignore
              formitem: { key: "device", value: e.target.outerText },
            },
          });
        }}
        getOptionLabel={(option) => option.value}
        style={{ width: 400 }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Device Type"
            placeholder="Placeholder"
            helperText="This Field is Optional"
            variant="outlined"
          />
        )}
      />
      <FormControlLabel
        style={{
          marginTop: -10,
          marginLeft: "-55%",
        }}
        control={
          <Checkbox
            style={{
              transform: "scale(0.6)",
            }}
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
        label={
          <span style={{ fontSize: "13px", marginTop: "-10px" }}>
            Could not find my device
          </span>
        }
      />
      {notFound ? (
        <div
          style={{
            marginBottom: -30,
            fontSize: 10,
            textAlign: "left",
            marginTop: -10,
            marginLeft: "-20%",
          }}
        >
          Send us an email at{" "}
          <a href="mailto:redmatterapp@gmail.com">
            <b>redmatterapp@gmail.com</b>
          </a>
          <p style={{ fontSize: 10, marginBottom: 30 }}>
            Provide the name of your device and we will add it to our database!
          </p>
        </div>
      ) : null}
    </div>
  );
}

function FormCellType() {
  const store = useStore();
  const [cellTypeError, setCellTypeError] = React.useState(false);
  try {
    let defaultValue = store.getState().user.experiment.cellType;
    if (defaultValue === undefined) defaultValue = null;
    if (defaultValue != null) {
      defaultValue = [
        { id: 1, key: 1, value: "Single cells" },
        { id: 2, key: 2, value: "Heterogenous population" },
      ].filter((e) => e.value === defaultValue)[0];
    }
  } catch (e) {}
  const dispatch = useDispatch();

  return (
    <div
      style={{
        fontFamily: "Quicksand",
        textAlign: "center",
        display: "grid",
        placeItems: "center",
        marginTop: 5,
      }}
    >
      <form>
        <Autocomplete
          id="cell"
          onChange={(e) => {
            dispatch({
              type: "EXPERIMENT_FORM_DATA",
              payload: {
                //@ts-ignore
                formitem: { key: "cellType", value: e.target.outerText },
              },
            });
            if (store.getState().user.experiment.cellType != "") {
              setCellTypeError(false);
            }
          }}
          onBlur={(e) => {
            if (
              store.getState().user.experiment.cellType === "" ||
              store.getState().user.experiment.cellType === null
            ) {
              setCellTypeError(true);
            }
          }}
          options={[
            { id: 1, key: 1, value: "Single cells" },
            { id: 2, key: 2, value: "Heterogenous population" },
          ]}
          getOptionLabel={(option) => option.value}
          style={{ width: 400 }}
          renderInput={(params) => (
            <TextField
              required
              {...params}
              error={cellTypeError}
              label="Cell type"
              size="small"
              placeholder="Placeholder"
              helperText="This Field is Required"
              variant="outlined"
            />
          )}
        />
      </form>
    </div>
  );
}

function FormParticleSize() {
  const store = useStore();
  const [particleSizeError, setParticleSizeError] = React.useState(false);
  let defaultValue = store.getState().user.experiment.particleSize;
  try {
    let defaultValue = store.getState().user.experiment.particleSize;
    if (defaultValue === undefined) defaultValue = null;
    if (defaultValue != null) {
      defaultValue = [
        { id: 1, key: "Below 1µm", value: "Below 1µm" },
        { id: 2, key: "1-3 µm", value: "1-3 µm" },
        { id: 3, key: "2µm+", value: "2µm+" },
      ].filter((e) => e.value === defaultValue)[0];
    }
  } catch (e) {}
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
        marginTop: 5,
      }}
    >
      <Autocomplete
        id="particle"
        //value={particleSize}
        onChange={(e) => {
          dispatch({
            type: "EXPERIMENT_FORM_DATA",
            payload: {
              //@ts-ignore
              formitem: { key: "particleSize", value: e.target.outerText },
            },
          });

          if (store.getState().user.experiment.particleSize != "") {
            setParticleSizeError(false);
          }
        }}
        onBlur={(e) => {
          if (
            store.getState().user.experiment.particleSize === null ||
            store.getState().user.experiment.particleSize === ""
          ) {
            setParticleSizeError(true);
          }
        }}
        options={[
          { id: 1, key: "Below 1µm", value: "Below 1µm" },
          { id: 2, key: "1-3 µm", value: "1-3 µm" },
          { id: 3, key: "2µm+", value: "2µm+" },
        ]}
        getOptionLabel={(option) => option.value}
        style={{ width: 400 }}
        renderInput={(params) => (
          <TextField
            required
            {...params}
            error={particleSizeError}
            size="small"
            label="Particle Size"
            placeholder="Placeholder"
            helperText="This Field is Required"
            variant="outlined"
          />
        )}
      />
    </div>
  );
}

function FormFluorophores() {
  const store = useStore();
  const [fluorosphoresCategoryError, setFluorosphoresCategoryError] =
    React.useState(false);
  let defaultValue = store.getState().user.experiment.fluorophoresCategory;
  try {
    let defaultValue = store.getState().user.experiment.fluorophoresCategory;
    if (defaultValue === undefined) defaultValue = null;
    if (defaultValue != null) {
      defaultValue = fluorophoresData.filter(
        (e) => e.value === defaultValue
      )[0];
    }
  } catch (e) {}
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
        marginTop: 5,
      }}
    >
      <Autocomplete
        //value={fluorophoresType}
        id="fluorosphores"
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
          if (store.getState().user.experiment.fluorophoresCategory != "") {
            setFluorosphoresCategoryError(false);
          }
        }}
        onBlur={(e) => {
          if (
            store.getState().user.experiment.fluorophoresCategory === "" ||
            store.getState().user.experiment.fluorophoresCategory === null
          ) {
            setFluorosphoresCategoryError(true);
          }
        }}
        options={fluorophoresData}
        getOptionLabel={(option) => option.value}
        style={{ width: 400 }}
        renderInput={(params) => (
          <TextField
            required
            {...params}
            error={fluorosphoresCategoryError}
            size="small"
            label="Fluorosphores"
            placeholder="Placeholder"
            helperText="This Field is Required"
            variant="outlined"
          />
        )}
      />
      <FormControlLabel
        style={{
          marginTop: -10,
          marginLeft: "-47%",
        }}
        control={
          <Checkbox
            color="primary"
            style={{
              transform: "scale(0.6)",
            }}
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
        label={
          <span style={{ fontSize: "13px" }}>
            Could not find the fluorophores
          </span>
        }
      />
      {notFound ? (
        <div
          style={{
            marginBottom: -30,
            fontSize: 10,
            textAlign: "left",
            marginTop: -10,
            marginLeft: "-15%",
          }}
        >
          Send us an email at{" "}
          <a href="mailto:redmatterapp@gmail.com">
            <b>redmatterapp@gmail.com</b>
          </a>
          <p style={{ fontSize: 10, marginBottom: 30 }}>
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
  let defaultValue = store.getState().user.experiment.formDescription;
  try {
    let defaultValue = store.getState().user.experiment.description;
    if (defaultValue === undefined) defaultValue = null;
  } catch (e) {}
  const dispatch = useDispatch();
  const [description, setdescription] = React.useState(defaultValue);

  const getData = () => {
    return description;
  };

  return (
    <TextField
      helperText="This Field is Optional"
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
      size="small"
      placeholder="..."
      variant="outlined"
      style={{
        marginTop: 5,
        width: 400,
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
