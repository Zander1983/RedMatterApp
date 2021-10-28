import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import {
  Grid,
  Button,
  CircularProgress,
  Tooltip,
  CardContent,
  Card,
  Typography,
} from "@material-ui/core";
import ExperimentCard from "./ExperimentCard";
import CreateExperimentModal from "./modals/ExperimentModal/CreateExperimentModal";
import { useDispatch } from "react-redux";
import { ExperimentApiFetchParamCreator } from "api_calls/nodejsback";
import userManager from "Components/users/userManager";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { snackbarService } from "uno-material-ui";
import IOSSwitch from "Components/common/Switch";
import { createButtonDisable } from "./UserAuthorizationRules";

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

const Experiments = (props: { backFromQuestions?: boolean }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const isLoggedIn = userManager.isLoggedIn();
  if (!isLoggedIn || process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/login");
  }
  if (process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/");
  }

  const gettingOrganizationId = () => {
    try {
      return userManager.getOrganiztionID();
    } catch (error) {
      history.replace("/login");
      return null;
    }
  };
  const [organizationExperiments, setExperiments] = useState([]);
  const [privateExperiments, setPrivateExperiments] = useState([]);
  const [fetchExperimentsComplete, setFetchExperimentsComplete] =
    useState<boolean>(false);
  const [createExperimentModal, setCreateExperimentModal] =
    useState<boolean>(false);
  const [privateExperimentsSwitch, setPrivateExperimentsSwitch] =
    useState<boolean>(true);
  const [organizationExperimentsSwitch, setOrganizationExperimentsSwitch] =
    useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [displayExperiments, setDisplayExperiments] = useState([]);
  const [oldExperiments, setOldExperiments] = useState([]);
  const organizationId = gettingOrganizationId();
  let rules = userManager.getRules();

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
        setOldExperiments(response.data.oldExperiments);
        setFetchExperimentsComplete(true);
        setDisabled(
          createButtonDisable(
            response.data.userExperiments.length,
            rules.experiment.unLimitedPublic,
            rules.experiment.number
          )
        );
      })
      .catch((e) => {
        console.log(e);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setExperimentsToBeDisplayed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    privateExperimentsSwitch,
    organizationExperimentsSwitch,
    privateExperiments,
    organizationExperiments,
  ]);

  const sendRecoveryEmail = (experimentId: String) => {
    axios
      .post(
        "/api/addRecoveryExperiment",
        {
          experimentId: experimentId,
        },
        {
          headers: {
            token: userManager.getToken(),
          },
        }
      )
      .then((response) => {
        snackbarService.showSnackbar(
          "Successfully Added in recovery bucket.",
          "success"
        );
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Failed to Add in recovery bucket",
          "error"
        );
      });
  };

  const setExperimentsToBeDisplayed = () => {
    let toDisplay: RemoteExperiment[] = [];
    if (privateExperimentsSwitch) {
      toDisplay = toDisplay.concat(
        privateExperiments.map((e) => {
          return { ...e, source: "personal" };
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
          padding: "20px 4em",
        }}
        container
      >
        <Grid
          style={{
            backgroundColor: "#fafafa",
            borderRadius: 10,
            marginLeft: 40,
            marginRight: 40,
            boxShadow: "2px 3px 3px #ddd",
            width: "75%",
          }}
          // xs={12}
        >
          <Grid style={{ borderRadius: 5 }}>
            <Grid
              container
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
                {/* Here */}
                {rules?.createOrganizations && (
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
                  />
                )}
              </div>

              {/* Create Button */}
              <Tooltip
                disableFocusListener={!disabled}
                disableHoverListener={!disabled}
                disableTouchListener={!disabled}
                title={
                  <React.Fragment>
                    <h3 style={{ color: "white" }}>
                      The Create Button is disabled, upgrade your plan to enable
                      it
                    </h3>
                  </React.Fragment>
                }
              >
                <span>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: "#fafafa",
                      maxHeight: 40,
                    }}
                    disabled={disabled}
                    onClick={() => setCreateExperimentModal(true)}
                  >
                    Create
                  </Button>
                </span>
              </Tooltip>
            </Grid>

            <Grid
              container
              style={{
                padding: "10px",
                margin: "auto",
                width: "100%",
              }}
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
            {oldExperiments.length > 0 ? (
              <div>
                <div
                  style={{
                    backgroundColor: "#66a",
                    padding: 20,
                    textAlign: "center",
                  }}
                >
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 26 }}>
                    Experiments from old version
                  </div>
                  <div style={{ color: "#fff", fontSize: 14 }}>
                    You may send us email at admin@redmatterapp.com to recover
                    these experiments
                  </div>
                </div>
                <Grid
                  container
                  style={{
                    padding: "10px",
                    margin: "auto",
                    width: "100%",
                  }}
                >
                  {oldExperiments.map((data: any, index: number) => {
                    return (
                      <Grid
                        item
                        style={{
                          padding: 5,
                        }}
                        xs={6}
                        md={4}
                        lg={3}
                      >
                        <Grid item>
                          <Card>
                            <CardContent
                              style={{
                                margin: 0,
                                padding: 0,
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: "#6666AA",
                                  borderRadius: 10,
                                  borderBottomLeftRadius: 0,
                                  borderBottomRightRadius: 0,
                                }}
                              >
                                <Typography
                                  style={{
                                    fontWeight: "bold",
                                    color: "#fff",
                                    marginBottom: "5px",
                                    fontSize: 18,
                                    padding: 5,
                                  }}
                                  color="textPrimary"
                                  align="center"
                                  gutterBottom
                                  noWrap
                                >
                                  {data.name}
                                </Typography>
                              </div>
                              <div
                                style={{ paddingBottom: 10, paddingTop: 10 }}
                              >
                                {/* <Button
                                  variant="outlined"
                                  style={{ color: "grey" }}
                                  onClick={() => {
                                    sendRecoveryEmail(data._id);
                                  }}
                                >
                                  Recover
                                </Button> */}
                              </div>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    );
                  })}
                </Grid>
              </div>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default Experiments;
