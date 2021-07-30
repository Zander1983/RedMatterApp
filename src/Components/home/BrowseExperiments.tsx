import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, Button, CircularProgress, TextField } from "@material-ui/core";
import useForceUpdate from "hooks/forceUpdate";

import ExperimentCard from "../workspaces/ExperimentCard";

import { ExperimentApiFetchParamCreator } from "api_calls/nodejsback";
import userManager from "Components/users/userManager";
import {
  withStyles,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch, { SwitchClassKey, SwitchProps } from "@material-ui/core/Switch";
import { snackbarService } from "uno-material-ui";

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiOutlinedInput-root": {
      color: "white",
    },
    "& .MuiInputLabel-root": {
      color: "white",
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "white",
    },
  },
  features: {
    display: "inline-block",
    margin: "0px 20px 0px 0px",
    fontSize: "11px",
    fontStyle: "italic",
    color: "#333",
  },
  experiment: {
    padding: "25px 30px",
    margin: "10px 0",
    width: "100%",
    "&:hover": {
      background: "#efefef",
      borderRadius: "20px",
      cursor: "pointer",
    },
  },
}));

interface Props extends SwitchProps {
  classes: Styles;
}

interface RemoteExperiment {
  id: string;
  details: {
    description: string;
    fluorophoresCategory: string;
    particleSize: string;
    cellType: string;
    device: string;
  };
  name: string;
  fileCount: number;
  source: string;
}

const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 42,
      height: 26,
      padding: 0,
      margin: theme.spacing(1),
    },
    switchBase: {
      padding: 1,
      "&$checked": {
        transform: "translateX(16px)",
        color: theme.palette.common.white,
        "& + $track": {
          backgroundColor: "#bbd",
          opacity: 1,
          border: "none",
        },
      },
      "&$focusVisible $thumb": {
        color: "#ddd",
        border: "6px solid #fafafa",
      },
    },
    thumb: {
      width: 24,
      height: 24,
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: "#ddd",
      opacity: 1,
      transition: theme.transitions.create(["background-color", "border"]),
    },
    checked: {},
    focusVisible: {},
  })
)(({ classes, ...props }: Props) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const BrowseExperiments = (props: { backFromQuestions?: boolean }) => {
  const history = useHistory();
  const classes = useStyles();
  const isLoggedIn = userManager.isLoggedIn();
  const forceUpdate = useForceUpdate();
  if (!isLoggedIn || process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/login");
  }
  if (process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/");
  }

  const [experiments, setExperiments] = useState(null);
  const [name, setName] = useState("");
  const [skip, setSkip] = useState(0);

  const getExperiments = useCallback(
    (name: string, skip: number) => {
      axios
        .post(
          "/browse-experiments",
          {
            name: name,
            items: 1,
            skip: skip,
          },
          {
            headers: {
              token: userManager.getToken(),
            },
          }
        )
        .then((response) => {
          if (skip === 0) {
            setExperiments(response.data);
            console.log(experiments);
          } else {
            let aux = experiments;
            console.log("INITIAL AUX", aux);
            //@ts-ignore
            response.data.map((experiment) => {
              return aux.push(experiment);
            });

            setExperiments(aux);
            console.log(experiments);
            forceUpdate();
          }
        });
    },
    [name, skip]
  );

  useEffect(() => {
    getExperiments(name, skip);
  }, [getExperiments, name, skip]);

  return !isLoggedIn ? (
    <></>
  ) : (
    <>
      <Grid
        style={{
          justifyContent: "center",
          display: "flex",
          marginTop: 30,
          marginLeft: "auto",
          marginRight: "auto",
        }}
        container
        xs={12}
        md={10}
        lg={8}
      >
        <Grid
          style={{
            backgroundColor: "#fafafa",
            borderRadius: 10,
            marginLeft: 40,
            marginRight: 40,
            boxShadow: "2px 3px 3px #ddd",
          }}
          xs={12}
        >
          <Grid style={{ borderRadius: 5 }}>
            <Grid
              container
              lg={12}
              sm={12}
              style={{
                backgroundColor: "#66a",
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                padding: 20,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 18,
                  padding: "0 .5em 0 .5em",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <h3
                  style={{
                    color: "#fff",
                    marginBottom: 0,
                    display: "inline-block",
                  }}
                >
                  Browse Experiments
                </h3>

                <TextField
                  id="outlined-basic"
                  className={classes.root}
                  label="Search "
                  variant="outlined"
                  size="small"
                  onChange={(e) => {
                    setSkip(0);
                    setName(e.target.value);
                  }}
                  style={{
                    width: "70%",
                    color: "white",
                  }}
                />
              </div>
            </Grid>

            <Grid
              container
              style={{
                padding: "10px 30px",
                margin: "auto",
                width: "100%",
              }}
              xs={12}
            >
              {experiments == null ? (
                <h3>Loading experiments...</h3>
              ) : (
                //@ts-ignore
                experiments.map((experiment, i) => {
                  return (
                    <div
                      style={{
                        width: "100%",
                      }}
                    >
                      <div className={classes.experiment}>
                        <div>
                          <h3 style={{ marginBottom: 0, color: "#333" }}>
                            <strong>Name: {experiment.name}</strong>
                          </h3>
                        </div>

                        <div>
                          <div className={classes.features}>
                            Device: <strong>{experiment.details.device}</strong>
                          </div>
                          <div className={classes.features}>
                            Cell Type:{" "}
                            <strong>{experiment.details.cellType}</strong>
                          </div>
                          <div className={classes.features}>
                            Particle Size:{" "}
                            <strong>{experiment.details.particleSize}</strong>
                          </div>
                          <div className={classes.features}>
                            Fluorophores:{" "}
                            <strong>
                              {experiment.details.fluorophoresCategory}
                            </strong>
                          </div>
                          <div
                            style={{
                              overflow: "hidden",
                              fontSize: "11px",
                            }}
                          >
                            <i>
                              Description:{" "}
                              <strong>{experiment.details.description}</strong>
                            </i>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          height: "2px",
                          backgroundColor: "gray",
                          width: "100%",
                          borderRadius: "40px",
                        }}
                      ></div>
                    </div>
                  );
                })
              )}

              {experiments == null ? null : (
                <div style={{ display: "flex", width: "100%", margin: "20px" }}>
                  <Button
                    color="primary"
                    variant="contained"
                    style={{
                      margin: "0 auto",
                    }}
                    onClick={() => {
                      setSkip(skip + 1);
                    }}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default BrowseExperiments;
