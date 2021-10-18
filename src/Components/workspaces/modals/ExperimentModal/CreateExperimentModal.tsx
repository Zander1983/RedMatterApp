import { useEffect, useState } from "react";
import { useStyles } from "./style";
import { Button, FormControlLabel } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { deviceData } from "assets/staticData/CreateExperimentModalData";

import userManager from "Components/users/userManager";
import { ExperimentApiFetchParamCreator } from "api_calls/nodejsback";
import axios from "axios";
import { snackbarService } from "uno-material-ui";
import { useStore } from "react-redux";
import { fluorophoresData } from "../../../../assets/staticData/CreateExperimentModalData";
import { filterArrayAsPerInput } from "utils/searchFunction";

interface CreateExperimentType {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  created: Function;
  experiments: string[];
  organizationId: any;
}

const filterOptions = (options: any, { inputValue }: any) =>
  filterArrayAsPerInput(options, inputValue);

function CreateExperimentModal({
  closeCall,
  created,
  experiments,
  open,
  organizationId,
}: CreateExperimentType): JSX.Element {
  const store = useStore();
  const classes = useStyles();

  const [formData, setFormData] = useState(null);
  const rules = userManager.getRules();
  const subscriptionType = userManager.getSubscriptionType();

  // Name
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [uniqueNameError, setUniqueNameError] = useState(false);

  // Private Experiment
  const [privateExperiment, setPrivateExperiment] = useState(false);
  const [enablePrivateExperiment, setEnablePrivateExperiment] = useState(false);

  // Device Type
  const [deciveType, setDeviceType] = useState("");
  const [deviceNotFound, setDeviceNotFound] = useState(false);

  // Cell Type
  const [cellType, setCellType] = useState<string>("");
  const [cellError, setCellError] = useState(false);

  // Particle size
  const [particleSize, setParticleSize] = useState("");
  const [particleSizeError, setParticleSizeError] = useState(false);

  // Fluorophores Type
  const [fluorophoresType, setFluorophoresType] = useState("");
  const [fluorophoresTypeError, setFluorophoresTypeError] = useState(false);
  const [fluorophoresTypeNotFound, setFluorophoresTypeNotFound] =
    useState(false);

  // Description
  const [description, setDescription] = useState("");

  // Name Validation
  const onChangeValidator = (userInput: string) => {
    setName(userInput);
    userInput && setNameError(false);
  };

  const onBlurValidator = (userInput: string) => {
    !userInput && setNameError(true);
  };

  useEffect(() => {
    setEnablePrivateExperiment(rules?.experiment?.unlimitedPrivate);

    // Clearing out the values then the form is closed
    if (!open) {
      setName("");
      setDeviceType("");
      setCellType("");
      setParticleSize("");
      setFluorophoresType("");
      setPrivateExperiment(false);
    }
    //eslint-disable-next-line
  }, [open]);

  // if there's a form with valid data
  // then it calls the createExperiment function
  useEffect(() => {
    formData && createExperiment();
    //eslint-disable-next-line
  }, [formData]);

  // it handles the unique name error
  useEffect(() => {
    setUniqueNameError(experiments.includes(name));
    setNameError(experiments.includes(name));
    //eslint-disable-next-line
  }, [name]);

  const createExperiment = () => {
    const req = ExperimentApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).createExperiment(
      {
        details: formData,
        name: name,
        organisationId: organizationId,
        experimentLength: experiments.length,
        privateExp: privateExperiment,
      },
      userManager.getToken()
    );
    axios
      .post(req.url, req.options.body, req.options)
      .then((e) => {
        closeCall.f(closeCall.ref);
        created(e.data.id);
        // Clearing Data Can also be done here too...
        setName("");
      })
      .catch((e) => {
        console.log(e);
        snackbarService.showSnackbar(
          "Could not create experiment, reload the page and try again!",
          "error"
        );
      });
  };

  //THIS FUNCTION VALIDATES THAT REQUIRED FIELDS ARE NOT EMPTY AND OPENS THE SUMMARY DIALOG
  const handleSubmit = () => {
    //SET THE FROM DATA STATE SO WE CAN CREATE THE EXPERIMENT FROM THE CREATEWORKSPACE FUNCTION
    setFormData({
      device: deciveType,
      cellType,
      particleSize,
      fluorophoresCategory: fluorophoresType,
      description,
      privateExp: privateExperiment,
    });
  };

  const confirmEnabled = () => {
    return (
      name.trim() &&
      cellType &&
      particleSize &&
      fluorophoresType &&
      !uniqueNameError
    );
  };

  return (
    <div>
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
                    helperText={
                      uniqueNameError
                        ? "This name is not Unique"
                        : "This Field is Required"
                    }
                    label="Experiment Name"
                    onChange={(e) => onChangeValidator(e.target.value)}
                    onBlur={(e) => onBlurValidator(e.target.value)}
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

              {/* Device Type */}
              <Grid container className={classes.innerGrid}>
                <Grid item xs={5}>
                  <Typography className={classes.inputlabel}>
                    {"To optimize your analysis, what device are you using?"}
                  </Typography>
                </Grid>

                <Grid item xs={7}>
                  <div className={classes.componentContainer}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={deviceData}
                      onChange={(e: React.ChangeEvent<{}>, value) => {
                        setDeviceType(value);
                      }}
                      filterOptions={filterOptions}
                      getOptionLabel={(option) => option}
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
                      className={classes.formControlLabel}
                      control={
                        <Checkbox
                          style={{
                            transform: "scale(0.6)",
                          }}
                          color="primary"
                          inputProps={{ "aria-label": "secondary checkbox" }}
                          checked={deviceNotFound}
                          onChange={(e) => {
                            setDeviceNotFound(!deviceNotFound);
                          }}
                        />
                      }
                      label={
                        <span className={classes.notFoundLabel}>
                          Could not find my device
                        </span>
                      }
                    />
                    {deviceNotFound && (
                      <div className={classes.notFoundContainer}>
                        Send us an email at{" "}
                        <a href="mailto:redmatterapp@gmail.com">
                          <b>redmatterapp@gmail.com</b>
                        </a>
                        <p style={{ fontSize: 10, marginBottom: 30 }}>
                          Provide the name of your device and we will add it to
                          our database!
                        </p>
                      </div>
                    )}
                  </div>
                </Grid>
              </Grid>

              {/* Cell Type */}
              <Grid container className={classes.innerGrid}>
                <Grid item xs={5}>
                  <Typography className={classes.inputlabel}>
                    {
                      "What is the cell type you are measuring? (Helps us automate gates later)"
                    }
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <div className={classes.componentContainer}>
                    <Autocomplete
                      id="cell"
                      onChange={(e: React.ChangeEvent<{}>, value) => {
                        setCellType(value);
                        value && setCellError(false);
                      }}
                      onBlur={(e) => {
                        !cellType && setCellError(true);
                      }}
                      filterOptions={filterOptions}
                      options={[
                        "Single cells",
                        "Heterogenous population",
                        "Lymphocytes",
                        "Other",
                      ]}
                      getOptionLabel={(option) => option}
                      style={{ width: 400 }}
                      renderInput={(params) => (
                        <TextField
                          required
                          {...params}
                          error={cellError}
                          label="Cell type"
                          size="small"
                          placeholder="Placeholder"
                          helperText="This Field is Required"
                          variant="outlined"
                        />
                      )}
                    />
                  </div>
                  {/* {item.component} */}
                </Grid>
              </Grid>

              {/* Particle Size */}
              <Grid container className={classes.innerGrid}>
                <Grid item xs={5}>
                  <Typography className={classes.inputlabel}>
                    {"How big are your cells/particles?"}
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <div className={classes.componentContainer}>
                    <Autocomplete
                      id="particle"
                      //value={particleSize}
                      onChange={(e: React.ChangeEvent<{}>, value) => {
                        setParticleSize(value);
                        value && setParticleSizeError(false);
                      }}
                      filterOptions={filterOptions}
                      onBlur={(e) =>
                        !particleSize && setParticleSizeError(true)
                      }
                      options={["Below 1µm", "1-3 µm", "2µm+"]}
                      getOptionLabel={(option) => option}
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
                </Grid>
              </Grid>

              {/* Fluorophores */}
              <Grid container className={classes.innerGrid}>
                <Grid item xs={5}>
                  <Typography className={classes.inputlabel}>
                    {
                      "What are the fluorophores? (Helps us select the FL-channels)"
                    }
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <div className={classes.componentContainer}>
                    <Autocomplete
                      multiple
                      disableClearable={true}
                      id="fluorosphores"
                      disableCloseOnSelect
                      onChange={(e: React.ChangeEvent<{}>, reason) => {
                        setFluorophoresType(reason.join());
                        setFluorophoresTypeError(reason.length ? false : true);
                      }}
                      filterOptions={filterOptions}
                      onBlur={(e) => {
                        !fluorophoresType.length &&
                          setFluorophoresTypeError(true);
                      }}
                      options={fluorophoresData}
                      getOptionLabel={(option) => option}
                      style={{ width: 400 }}
                      renderInput={(params) => (
                        <TextField
                          required
                          {...params}
                          error={fluorophoresTypeError}
                          size="small"
                          label="Fluorophores"
                          placeholder="Placeholder"
                          helperText="This Field is Required"
                          variant="outlined"
                        />
                      )}
                    />

                    <FormControlLabel
                      className={classes.formControlLabel}
                      control={
                        <Checkbox
                          color="primary"
                          style={{
                            transform: "scale(0.6)",
                          }}
                          inputProps={{ "aria-label": "secondary checkbox" }}
                          checked={fluorophoresTypeNotFound}
                          onChange={(e) => {
                            setFluorophoresTypeNotFound(
                              !fluorophoresTypeNotFound
                            );
                          }}
                        />
                      }
                      label={
                        <span style={{ fontSize: "13px" }}>
                          Could not find the fluorophores
                        </span>
                      }
                    />
                    {fluorophoresTypeNotFound && (
                      <div
                        className={classes.notFoundContainer}
                        style={{
                          marginLeft: "-15%",
                        }}
                      >
                        Send us an email at{" "}
                        <a href="mailto:redmatterapp@gmail.com">
                          <b>redmatterapp@gmail.com</b>
                        </a>
                        <p style={{ fontSize: 10, marginBottom: 30 }}>
                          Provide the name of your fluorophores and we will add
                          it to our database!
                        </p>
                      </div>
                    )}
                  </div>
                </Grid>
              </Grid>

              {/* Description */}
              <Grid container className={classes.innerGrid}>
                <Grid item xs={5}>
                  <Typography className={classes.inputlabel}>
                    {
                      "Enter a brief description of your experiment. You can skip if you like!"
                    }
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    helperText="This Field is Optional"
                    value={description}
                    id="outlined-multiline-static"
                    label="Description"
                    multiline
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
                    size="small"
                    placeholder="..."
                    variant="outlined"
                    className={classes.description}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Buttons */}
            <div className={classes.btns}>
              <Button
                variant="contained"
                className={classes.cancelButton}
                onClick={() => {
                  setFluorophoresTypeError(false);
                  closeCall.f(closeCall.ref);
                  setName("");
                }}
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
