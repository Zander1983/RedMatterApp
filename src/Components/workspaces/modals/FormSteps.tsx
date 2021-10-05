import React, { useEffect } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import { FormControlLabel } from "@material-ui/core";

import { fluorophoresData, deviceData } from "../../../assets/staticData/quesData";
import { useDispatch, useStore } from "react-redux";

import ClearIcon from "@material-ui/icons/Clear";

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
          <span style={{ fontSize: "13px", marginTop: "-10px", color: '#777' }}>
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
          onChange={async (e) => {
            //@ts-ignore
            await dispatch({
              type: "EXPERIMENT_FORM_DATA",
              payload: {
                formitem: {
                  key: "cellType",
                  //@ts-ignore
                  value: e.target.outerText || e.target.innerText,
                },
              },
            });
            if (store.getState().user.experiment.cellType !== "") {
              setCellTypeError(false);
            }
          }}
          onBlur={(e) => {
            if (
              store.getState().user.experiment.cellType === "" ||
              store.getState().user.experiment.cellType == null
            ) {
              setCellTypeError(true);
            }
          }}
          options={[
            { id: 1, key: 1, value: "Single cells" },
            { id: 2, key: 2, value: "Heterogenous population" },
            { id: 3, key: 3, value: "Lymphocytes" },
            { id: 4, key: 4, value: "Other" },
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
              formitem: {
                key: "particleSize",
                //@ts-ignore
                value: e.target.outerText || e.target.innerText,
              },
            },
          });

          if (store.getState().user.experiment.particleSize !== "") {
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
  const [notFound, setNotFound] = React.useState(false);

  useEffect(() => {
    dispatch({
      type: "EXPERIMENT_FORM_DATA",
      payload: {
        formitem: {
          key: "fluorophoresCategory",
          //@ts-ignore
          value: null,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        multiple
        disableClearable={true}
        id="fluorosphores"
        disableCloseOnSelect
        onChange={(e, list, reason, detail) => {
          let previous = store.getState().user.experiment.fluorophoresCategory;
          const option = detail.option.value;
          if (reason === "remove-option" && previous !== undefined) {
            previous = previous.split(",").filter((e: string) => e !== option);
            previous = previous.join(",");
            dispatch({
              type: "EXPERIMENT_FORM_DATA",
              payload: {
                formitem: {
                  key: "fluorophoresCategory",
                  value: previous,
                },
              },
            });
          } else {
            if (previous !== "" && previous !== null) {
              setFluorosphoresCategoryError(false);
              dispatch({
                type: "EXPERIMENT_FORM_DATA",
                payload: {
                  formitem: {
                    key: "fluorophoresCategory",
                    value: `${previous},${option}`,
                  },
                },
              });
            } else {
              dispatch({
                type: "EXPERIMENT_FORM_DATA",
                payload: {
                  formitem: {
                    key: "fluorophoresCategory",
                    value: option,
                  },
                },
              });
            }
          }
        }}
        onBlur={(e) => {
          if (
            store.getState().user.experiment.fluorophoresCategory === "" ||
            store.getState().user.experiment.fluorophoresCategory == null
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
            label="Fluorophores"
            placeholder="Placeholder"
            helperText="This Field is Required"
            variant="outlined"
          />
        )}
      />

      {store.getState().user.experiment.fluorophoresCategory != null ? (
        <div
          style={{
            fontSize: 12,
            backgroundColor: "#dedede",
            textAlign: "left",
            color: "black",
            padding: "2px 8px",
            borderRadius: "20px",
          }}
        >
          <i>{store.getState().user.experiment.fluorophoresCategory}</i>{" "}
          <ClearIcon
            style={{ height: 15, float: "right", position: "relative", top: 2 }}
            onClick={() => {
              dispatch({
                type: "EXPERIMENT_FORM_DATA",
                payload: {
                  formitem: {
                    key: "fluorophoresCategory",
                    //@ts-ignore
                    value: null,
                  },
                },
              });
              setFluorosphoresCategoryError(true);
            }}
          ></ClearIcon>
        </div>
      ) : null}

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

export const FormSteps = [
  {
    component: <FormDeviceType />,
    optional: false,
    title: "To optimize your analysis, what device are you using?",
  },
  {
    component: <FormCellType />,
    optional: false,
    title:
      "What is the cell type you are measuring? (Helps us automate gates later)",
  },
  {
    component: <FormParticleSize />,
    optional: false,
    title: "How big are your cells/particles?",
  },
  {
    component: <FormFluorophores />,
    optional: false,
    title: "What are the fluorophores? (Helps us select the FL-channels)",
  },
  {
    component: <FormDescription />,
    optional: true,
    title:
      "Enter a brief description of your experiment. You can skip if you like!",
  },
]


