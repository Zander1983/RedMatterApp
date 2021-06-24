import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, Button, CircularProgress } from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import ExperimentCard from "./ExperimentCard";
import CreateExperimentModal from "./modals/CreateExperimentModal";

import { ExperimentApiFetchParamCreator } from "api_calls/nodejsback";
import userManager from "Components/users/userManager";
import { withStyles, Theme, createStyles } from "@material-ui/core/styles";
import { purple } from "@material-ui/core/colors";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch, { SwitchClassKey, SwitchProps } from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import { snackbarService } from "uno-material-ui";

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

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

const Experiments = (props: { backFromQuestions?: boolean }) => {
  const history = useHistory();
  const isLoggedIn = userManager.isLoggedIn();
  if (!isLoggedIn || process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/login");
  }
  if (process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/");
  }

  const gettingOrganizationId = () => {
    try {
      let orgID = userManager.getOrganiztionID();
      return orgID;
    } catch (error) {
      let orgID = null;
      history.replace("/login");
      return orgID;
    }
    
  }

  const [organizationExperiments, setExperiments] = React.useState([]);
  const [privateExperiments, setPrivateExperiments] = React.useState([]);
  const [fetchExperimentsComplete, setFetchExperimentsComplete] =
    React.useState(false);
  const [createExperimentModal, setCreateExperimentModal] =
    React.useState(false);

  const [privateExperimentsSwitch, setPrivateExperimentsSwitch] =
    React.useState(true);
  const [organizationExperimentsSwitch, setOrganizationExperimentsSwitch] =
    React.useState(false);

  const [displayExperiments, setDisplayExperiments] = React.useState([]);
  const organizationId = gettingOrganizationId();

  const fetchExperiments = () => {
    if (!isLoggedIn) return;
    const fetchArgs = ExperimentApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).getAllExperiments(
      userManager.getOrganiztionID(),
      userManager.getToken()
    );
    axios
      .get(fetchArgs.url, fetchArgs.options)
      .then((response) => {
        setExperiments(response.data.organisationExperiments);
        setPrivateExperiments(response.data.userExperiments);
        setFetchExperimentsComplete(true);
      })
      .catch((e) => {
        setFetchExperimentsComplete(true);
        snackbarService.showSnackbar(
          "Failed to find experiment information or Session Expired",
          "error"
        );
        userManager.logout();
        history.replace("/login");
      });
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  React.useEffect(() => {
    fetchExperiments();
    if (props.backFromQuestions) {
      snackbarService.showSnackbar("Experiment created", "success");
    }
  }, []);

  React.useEffect(() => {
    setExperimentsToBeDisplayed();
  }, [
    privateExperimentsSwitch,
    organizationExperimentsSwitch,
    privateExperiments,
    organizationExperiments,
  ]);

  const setExperimentsToBeDisplayed = () => {
    let toDisplay: RemoteExperiment[] = [];
    if (privateExperimentsSwitch) {
      toDisplay = toDisplay.concat(
        privateExperiments.map((e) => {
          return { ...e, source: "private" };
        })
      );
    }
    if (organizationExperimentsSwitch) {
      toDisplay = toDisplay.concat(
        organizationExperiments.map((e) => {
          return { ...e, source: "organization" };
        })
      );
    }
    setDisplayExperiments(toDisplay);
  };

  return !isLoggedIn ? (
    <></>
  ) : (
    <>
      <CreateExperimentModal
        open={createExperimentModal}
        closeCall={{
          f: handleClose,
          ref: setCreateExperimentModal,
        }}
        created={(experimentID: string) => {
          fetchExperiments();
        }}
        experiments={organizationExperiments
          .concat(privateExperiments)
          .map((e) => e.name)}
        organizationId={organizationId}
      />
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
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 20 }}>
                <FormControlLabel
                  label={"My Experiments (" + privateExperiments.length + ")"}
                  control={
                    <IOSSwitch
                      checked={privateExperimentsSwitch}
                      onChange={() =>
                        setPrivateExperimentsSwitch(!privateExperimentsSwitch)
                      }
                    />
                  }
                />{" "}
                <FormControlLabel
                  label={
                    "Organization Experiments (" +
                    organizationExperiments.length +
                    ")"
                  }
                  control={
                    <IOSSwitch
                      onChange={() =>
                        setOrganizationExperimentsSwitch(
                          !organizationExperimentsSwitch
                        )
                      }
                    />
                  }
                />{" "}
              </div>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "#fafafa",
                  maxHeight: 40,
                }}
                onClick={() => setCreateExperimentModal(true)}
              >
                Create
              </Button>
            </Grid>

            <Grid
              container
              style={{
                padding: "10px",
                margin: "auto",
                width: "100%",
              }}
              xs={12}
            >
              {displayExperiments.length > 0 ? (
                displayExperiments.map((data: any, index: number) => {
                  return (
                    <ExperimentCard
                      key={`pvt${index}`}
                      data={data}
                      update={fetchExperiments}
                    />
                  );
                })
              ) : (
                <div
                  style={{ textAlign: "center", width: "100%", padding: 50 }}
                >
                  {!fetchExperimentsComplete ? (
                    <CircularProgress style={{ width: 20, height: 20 }} />
                  ) : (
                    "There are no experiments"
                  )}
                </div>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default Experiments;

