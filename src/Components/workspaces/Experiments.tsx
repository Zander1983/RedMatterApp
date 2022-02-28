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
import { ExperimentApiFetchParamCreator } from "api_calls/nodejsback";
import userManager from "Components/users/userManager";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { snackbarService } from "uno-material-ui";
import IOSSwitch from "Components/common/Switch";
import { createButtonDisable } from "./UserAuthorizationRules";
import SecurityUtil from "../../utils/Security.js";
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
  const isLoggedIn = userManager.isLoggedIn();
  if (!isLoggedIn || process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/login");
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
  let rules: any = userManager.getRules();

  const updateExperiment = async (experimentId: any) => {
    const cacheData = SecurityUtil.decryptData(
      sessionStorage.getItem("experimentData"),
      process.env.REACT_APP_DATA_SECRET_SOLD
    );
    if (cacheData) {
      await doStaff(cacheData, experimentId);
    }
  };

  const doStaff = async (data: any, expId: any) => {
    //link view code here
    let { requiredUpdateExperiments, targetExperiment } =
      await getTargetExperiments(data, expId);
    if (requiredUpdateExperiments && requiredUpdateExperiments.length > 0) {
      const updatedExperiments = requiredUpdateExperiments.filter(
        (experiment: any) => experiment.id !== expId
      );
      switch (targetExperiment) {
        case "user":
          setPrivateExperiments(updatedExperiments);
          let userData: any = {
            oldExperiments: [...data?.experiments?.oldExperiments],
            organisationExperiments: [
              ...data?.experiments?.organisationExperiments,
            ],
            userExperiments: [...updatedExperiments],
          };
          sessionStorage.setItem(
            "experimentData",
            SecurityUtil.encryptData(
              { experiments: userData },
              process.env.REACT_APP_DATA_SECRET_SOLD
            )
          );
          break;
        case "org":
          setExperiments(updatedExperiments);
          let orgData: any = {
            oldExperiments: [...data?.experiments?.oldExperiments],
            organisationExperiments: [...updatedExperiments],
            userExperiments: [...data?.experiments?.userExperiments],
          };
          sessionStorage.setItem(
            "experimentData",
            SecurityUtil.encryptData(
              { experiments: orgData },
              process.env.REACT_APP_DATA_SECRET_SOLD
            )
          );
          break;
        case "old":
          setOldExperiments(updatedExperiments);
          let oldData: any = {
            oldExperiments: [...updatedExperiments],
            organisationExperiments: [
              ...data?.experiments?.organisationExperiments,
            ],
            userExperiments: [...data?.experiments?.userExperiments],
          };
          sessionStorage.setItem(
            "experimentData",
            SecurityUtil.encryptData(
              { experiments: oldData },
              process.env.REACT_APP_DATA_SECRET_SOLD
            )
          );
          break;
      }
    }
  };

  const getTargetExperiments = (data: any, expId: any) => {
    let requiredUpdateExperiments: any[] = [];
    let targetExperiment = "";
    if (
      data?.experiments?.organisationExperiments.length > 0 &&
      data?.experiments?.organisationExperiments.findIndex(
        (e: any) => e.id === expId
      ) > -1
    ) {
      requiredUpdateExperiments =
        data?.experiments?.organisationExperiments?.slice();
      targetExperiment = "org";
    } else if (
      data?.experiments?.userExperiments.length > 0 &&
      data?.experiments?.userExperiments.findIndex((e: any) => e.id === expId) >
        -1
    ) {
      requiredUpdateExperiments = data?.experiments?.userExperiments?.slice();
      targetExperiment = "user";
    } else {
      requiredUpdateExperiments = data?.experiments?.oldExperiments?.slice();
      targetExperiment = "old";
    }
    return { requiredUpdateExperiments, targetExperiment };
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  const handleError = async (error: any) => {
    if (
      error?.name === "Error" ||
      error?.message.toString() === "Network Error"
    ) {
      showMessageBox({
        message: "Connectivity Problem, please check your internet connection",
        saverity: "error",
      });
    } else if (error?.response) {
      if (error.response?.status == 401 || error.response.status == 419) {
        setTimeout(() => {
          userManager.logout();
          history.replace("/login");
        }, 3000);
        showMessageBox({
          message: "Authentication Failed Or Session Time out",
          saverity: "error",
        });
      }
    } else {
      showMessageBox({
        message: error?.message || "Request Failed. May be Time out",
        saverity: error.saverity || "error",
      });
    }
  };

  const showMessageBox = (response: any) => {
    switch (response.saverity) {
      case "error":
        snackbarService.showSnackbar(response?.message, "error");
        break;
      case "success":
        snackbarService.showSnackbar(response?.message, "success");
        break;
      default:
        break;
    }
  };

  const reload = async () => {
    if (!isLoggedIn) return;
    try {
      const fetchArgs = ExperimentApiFetchParamCreator({
        accessToken: userManager.getToken(),
      }).getAllExperiments(
        userManager.getOrganiztionID(),
        userManager.getToken()
      );
      const response = await axios.get(fetchArgs.url, fetchArgs.options);
      if (response?.status) {
        setExperiments(response?.data?.organisationExperiments);
        setPrivateExperiments(response?.data?.userExperiments);
        setOldExperiments(response?.data?.oldExperiments);
        setDisabled(
          createButtonDisable(
            response?.data?.userExperiments.length,
            rules?.experiment?.unLimitedPublic,
            rules?.experiment?.number
          )
        );
        setTimeout(() => {
          sessionStorage.setItem(
            "experimentData",
            SecurityUtil.encryptData(
              { experiments: response.data },
              process.env.REACT_APP_DATA_SECRET_SOLD
            )
          );
          sessionStorage.setItem("e_cache_version", "" + 1);
          setFetchExperimentsComplete(true);
        }, 0);
      } else {
        await handleError({
          message: "Information Missing",
          saverity: "error",
        });
      }
    } catch (err) {
      await handleError(err);
    }
  };

  React.useEffect(() => {
    if (sessionStorage.getItem("experimentData")) {
      const profileInfo = SecurityUtil.decryptData(
        sessionStorage.getItem("experimentData"),
        process.env.REACT_APP_DATA_SECRET_SOLD
      );
      if (profileInfo) {
        setExperiments(profileInfo?.experiments?.organisationExperiments);
        setPrivateExperiments(profileInfo?.experiments?.userExperiments);
        setOldExperiments(profileInfo?.experiments?.oldExperiments);
        setFetchExperimentsComplete(true);
        setDisabled(
          createButtonDisable(
            profileInfo?.experiments?.userExperiments.length,
            rules?.experiment?.unLimitedPublic,
            rules?.experiment?.number
          )
        );
        const currentVersion = +sessionStorage.getItem("e_cache_version");
        sessionStorage.setItem("e_cache_version", "" + (currentVersion + 1));
      } else {
        sessionStorage.removeItem("e_cache_version");
        (async () => {
          await reload();
        })();
      }
    } else {
      sessionStorage.removeItem("e_cache_version");
      sessionStorage.removeItem("experimentData");
      (async () => {
        await reload();
      })();
    }
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

  const setExperimentsToBeDisplayed = () => {
    let toDisplay: RemoteExperiment[] = [];
    if (privateExperimentsSwitch) {
      toDisplay = toDisplay?.concat(
        privateExperiments.map((e) => {
          return { ...e, source: "personal" };
        })
      );
    }
    if (organizationExperimentsSwitch) {
      toDisplay = toDisplay?.concat(
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
          reload();
        }}
        userExperimentName={privateExperiments?.map((e) => e.name)}
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
                  label={"My Experiments (" + privateExperiments?.length + ")"}
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
              {displayExperiments?.length > 0 ? (
                displayExperiments.map((experiment: any, index: number) => {
                  return (
                    <ExperimentCard
                      key={`pvt${index}`}
                      data={experiment}
                      update={() => updateExperiment(experiment.id)}
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
            {oldExperiments?.length > 0 ? (
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
                    You may send us email at support@redmatterapp.com to recover
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
                  {oldExperiments?.map((data: any, index: number) => {
                    return (
                      <Grid
                        item
                        style={{
                          padding: 5,
                        }}
                        xs={6}
                        md={4}
                        lg={3}
                        key={`old-${index}`}
                      >
                        <Grid item>
                          <Card
                            style={{
                              boxShadow: "unset",
                            }}
                          >
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
                                }}
                              >
                                <Typography
                                  style={{
                                    fontWeight: "bold",
                                    color: "#fff",
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
                              {/* <div
                                style={{ paddingBottom: 10, paddingTop: 10 }}
                              >
                                <Button
                                  variant="outlined"
                                  style={{ color: "grey" }}
                                  onClick={() => {
                                    sendRecoveryEmail(data._id);
                                  }}
                                >
                                  Recover
                                </Button>
                              </div> */}
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
