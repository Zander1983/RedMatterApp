import { useEffect, useState } from "react";
import { useStyles } from "./style";
import { Button, FormControlLabel } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import userManager from "Components/users/userManager";
import { ExperimentApiFetchParamCreator } from "api_calls/nodejsback";
import axios from "axios";
import { snackbarService } from "uno-material-ui";
import { useDispatch, useStore, useSelector } from "react-redux";
import CreateExperimentDialog from "../CreateExperimentDialog";
import useForceUpdate from "hooks/forceUpdate";
import { FormSteps } from "../FormSteps";

interface CreateExperimentType {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  created: Function;
  experiments: string[];
  organizationId: any;
}

function CreateExperimentModal({
  closeCall,
  created,
  experiments,
  open,
  organizationId,
}: CreateExperimentType): JSX.Element {
  const store = useStore();
  const dispatch = useDispatch();
  const classes = useStyles();
  const forceUpdate = useForceUpdate();

  const [name, setName] = useState("");
  const [privateExperiment, setPrivateExperiment] = useState(false);
  const [formData, setFormData] = useState(null);
  const [createExperimentDialog, setCreateExperimentDialog] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [enablePrivateExperiment, setEnablePrivateExperiment] = useState(false);
  const subscriptionType = store.getState().user.profile.subscriptionType;
  console.log(subscriptionType);
  const experimentNameHandler = (userInput: string) => {
    setName(userInput);
    userInput && setNameError(false);
  };

  const experimentNameErrorHandler = (userInput: string) => {
    !userInput && setNameError(true);
  };

  useEffect(() => {
    dispatch({
      type: "EXPERIMENT_FORM_DATA_CLEAR",
    });
    for (const item of [
      "device",
      "cellType",
      "particleSize",
      "fluorophoresCategory",
      "description",
    ]) {
      dispatch({
        type: "EXPERIMENT_FORM_DATA",
        payload: {
          formitem: { key: item, value: null },
        },
      });
    }

    setEnablePrivateExperiment(
      subscriptionType === "Free" || subscriptionType === null ? false : true
    );
  }, [dispatch, open]);

  const createExperiment = () => {
    const req = ExperimentApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).createExperiment(
      {
        details: formData,
        name: name,
        privateExp: privateExperiment,
        organisationId: organizationId,
      },
      userManager.getToken()
    );
    axios
      .post(req.url, req.options.body, req.options)
      .then((e) => {
        closeCall.f(closeCall.ref);
        created(e.data.id);
        setName("");
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Could not create experiment, reload the page and try again!",
          "error"
        );
      });
    dispatch({
      type: "EXPERIMENT_FORM_DATA_CLEAR",
    });
  };

  //THIS FUNCTION VALIDATES THAT REQUIRED FIELDS ARE NOT EMPTY AND OPENS THE SUMMARY DIALOG
  const handleSubmit = () => {
    if (name === "" || name === undefined || name === null) {
      snackbarService.showSnackbar(
        "Experiment name cannot not be empty",
        "warning"
      );
      return;
    }

    if (experiments.includes(name)) {
      snackbarService.showSnackbar(
        "An experiment with this name already exists",
        "warning"
      );
      return;
    }

    const valuesToCheck = {
      1: store.getState().user.experiment.cellType,
      2: store.getState().user.experiment.particleSize,
      3: store.getState().user.experiment.fluorophoresCategory,
    };

    //THIS IS A VERY HANDY ES7 WAY TO CHECK ALL ITEMS FROM AN OBJECT
    if (
      Object.values(valuesToCheck).every((item) => item != null) &&
      name != null
    ) {
      setCreateExperimentDialog(true);
    } else {
      snackbarService.showSnackbar(
        "There are still some required fields empty",
        "error"
      );
      return;
    }
    //SET THE FROM DATA STATE SO WE CAN CREATE THE EXPERIMENT FROM THE CREATEWORKSPACE FUNCTION
    setFormData(store.getState().user.experiment);
  };

  const confirmEnabled = () => {
    const valuesToCheck = {
      1: store.getState().user.experiment.cellType,
      2: store.getState().user.experiment.particleSize,
      3: store.getState().user.experiment.fluorophoresCategory,
      4: name,
    };
    return Object.values(valuesToCheck).every(
      (item) => item != null && item !== ""
    );
  };

  store.subscribe(() => {
    forceUpdate();
  });

  const handleClose = (func: Function) => {
    func(false);
  };
  const createExperimentFromSummary = (func: Function) => {
    func();
  };
  return (
    <div>
      <CreateExperimentDialog
        open={createExperimentDialog}
        closeCall={{
          f: handleClose,
          ref: setCreateExperimentDialog,
        }}
        name={name}
        sendFunction={{
          f: createExperimentFromSummary,
          ref: createExperiment,
        }}
      />

      <Modal
        open={open}
        disableScrollLock={true}
        className={classes.modalContainer}
      >
        <div className={classes.modal}>
          {/* Header Title */}
          <div className={classes.modalHeader}>
            <h2 className={classes.modalHeaderTitle}>Create Experiment</h2>
          </div>

          <div className={classes.modalHeaderTitle}>
            <Grid container spacing={3} className={classes.gridContainer}>
              {/* Experiment Name */}
              <Grid container className={classes.innerGrid}>
                <Grid item xs={5}>
                  <Typography className={classes.inputlabel}>
                    Your Experiment's Name
                  </Typography>
                </Grid>

                <Grid item xs={7}>
                  <TextField
                    error={nameError}
                    size="small"
                    variant="outlined"
                    helperText="This Field is Required"
                    label="Experiment Name"
                    onBlur={(e) => experimentNameErrorHandler(e.target.value)}
                    onChange={(e) => experimentNameHandler(e.target.value)}
                    value={name}
                    className={classes.inputWidth}
                  ></TextField>
                </Grid>
              </Grid>

              {/* Private Experiance */}
              {enablePrivateExperiment && (
                <Grid container className={classes.innerGrid}>
                  <Grid item xs={5}>
                    <Typography className={classes.inputlabel}>
                      Private experiment
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <FormControlLabel
                      style={{
                        float: "left",
                      }}
                      control={
                        <Checkbox
                          //@ts-ignore
                          color="primary"
                          inputProps={{ "aria-label": "secondary checkbox" }}
                          checked={privateExperiment}
                          onChange={() =>
                            setPrivateExperiment(!privateExperiment)
                          }
                          name="Private workspace"
                        />
                      }
                      label={
                        <span className={classes.privateExperimentStyle}>
                          Private Experiment
                        </span>
                      }
                    />
                    {privateExperiment && (
                      <p className={classes.privateExperimentText}>
                        No one in your workspace will be able to see this
                        experiment
                      </p>
                    )}
                  </Grid>
                </Grid>
              )}

              {/* Others */}
              {FormSteps.map((item, index) => (
                <Grid container className={classes.innerGrid} key={index}>
                  <Grid item xs={5}>
                    <Typography className={classes.inputlabel}>
                      {item.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    {item.component}
                  </Grid>
                </Grid>
              ))}
            </Grid>

            {/* Buttons */}
            <div className={classes.btns}>
              <Button
                variant="contained"
                className={classes.cancelButton}
                onClick={() => closeCall.f(closeCall.ref)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!confirmEnabled()}
                style={{
                  backgroundColor: confirmEnabled() ? "#6666A9" : "#aaaadb",
                  color: "white",
                }}
                onClick={() => handleSubmit()}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CreateExperimentModal;
