import React, { useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

import {
  Grid,
  Button,
  CircularProgress,
  Divider,
  TextField,
  withStyles,
} from "@material-ui/core";

import userManager from "Components/users/userManager";
import { snackbarService } from "uno-material-ui";
import {
  WorkspaceFilesApiFetchParamCreator,
  WorkspacesApiFetchParamCreator,
} from "api_calls/nodejsback";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import UploadFileModal from "./modals/UploadFileModal";
import { getHumanReadableTimeDifference } from "utils/time";

const styles = {
  input: {
    color: "white",
    borderBottom: "solid 1px white",
    height: 30,
  },
};

const Workspace = (props: any) => {
  const { classes } = props;
  const history = useHistory();

  const isLoggedIn = userManager.isLoggedIn();
  if (!isLoggedIn) {
    history.replace("/login");
  }

  if (process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/");
  }

  const allowedInThisWorkspace = userManager.canAccessWorkspace(props.id);
  if (!allowedInThisWorkspace) {
    snackbarService.showSnackbar(
      "You are not allowed in this workspace",
      "warning"
    );
    history.replace("/workspaces");
  }

  const [workspaceData, setWorkpsaceData] = React.useState(null);
  const [editingName, setEditingName] = React.useState(false);
  const [experiments, setExperiments] = React.useState([]);

  const fetchWorkspaceData = (snack = true) => {
    const fetchWorkspaces = WorkspaceFilesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).workspaceFiles(
      userManager.getOrganiztionID(),
      props.id,
      userManager.getToken()
    );

    axios
      .get(fetchWorkspaces.url, fetchWorkspaces.options)
      .then((e) => {
        setWorkpsaceData(e.data);
      })
      .catch((e) => {
        if (snack)
          snackbarService.showSnackbar(
            "Failed to find this workspace, reload the page to try again!",
            "error"
          );
        userManager.logout();
      });
  };

  const updateWorkspace = (snack = true) => {
    const updateWorkspace = WorkspacesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).editWorkspace(
      props.id,
      workspaceData.workspaceName,
      userManager.getToken()
    );

    axios
      .put(updateWorkspace.url, {}, updateWorkspace.options)
      .then((e) => {
        if (snack) snackbarService.showSnackbar("Workspace updated", "success");
      })
      .catch((e) => {
        if (snack)
          snackbarService.showSnackbar(
            "Failed to update this workspace, reload the page to try again!",
            "error"
          );
      });
  };

  const getExperiments = () => {
    axios
      .get("/api/workspace/" + props.id + "/experiments/", {
        headers: {
          token: userManager.getToken(),
        },
      })
      .then((e) => {
        setExperiments(e.data);
      })
      .catch((e) => {});
  };

  useEffect(() => {
    fetchWorkspaceData();
    getExperiments();
  }, []);

  const handleClose = (func: Function) => {
    func(false);
  };
  const [uploadFileModalOpen, setUploadFileModalOpen] = React.useState(false);

  return (
    <>
      {}
      <UploadFileModal
        open={uploadFileModalOpen}
        closeCall={{
          f: handleClose,
          ref: setUploadFileModalOpen,
        }}
        added={() => {
          fetchWorkspaceData(false);
        }}
        workspace={{
          ...workspaceData,
          id: props.id,
        }}
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
              <Button
                variant="contained"
                style={{
                  backgroundColor: "#fafafa",
                  maxHeight: 50,
                  marginRight: 20,
                }}
                startIcon={<ArrowLeftOutlined style={{ fontSize: 15 }} />}
                onClick={() => {
                  history.goBack();
                }}
              >
                Back
              </Button>
              <div>
                {workspaceData === null ? (
                  <CircularProgress
                    style={{ width: 20, height: 20, color: "white" }}
                  />
                ) : (
                  <Grid
                    xs={12}
                    direction="row"
                    style={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 20,
                    }}
                  >
                    {editingName ? (
                      <TextField
                        InputProps={{
                          className: classes.input,
                        }}
                        value={workspaceData.workspaceName}
                        onChange={(e: any) => {
                          setWorkpsaceData({
                            ...workspaceData,
                            workspaceName: e.target.value,
                          });
                        }}
                        onKeyDown={(e: any) => {
                          if (e.keyCode === 13) {
                            setEditingName(false);
                            updateWorkspace();
                          }
                        }}
                      ></TextField>
                    ) : (
                      workspaceData.workspaceName
                    )}
                    <Button
                      style={{ fontSize: 20, marginLeft: 20 }}
                      onClick={() => setEditingName(!editingName)}
                    >
                      <EditOutlined
                        style={{
                          color: "white",
                          borderRadius: 5,
                          marginTop: -4,
                          border: "solid 1px #fff",
                          padding: 3,
                        }}
                      />
                    </Button>
                  </Grid>
                )}
              </div>
              <Button
                variant="contained"
                style={{ backgroundColor: "#fafafa", maxHeight: 50 }}
                onClick={() =>
                  history.push("/workspace/" + props.id + "/plots")
                }
              >
                Plots
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: "#fafafa", maxHeight: 50 }}
                onClick={() => setUploadFileModalOpen(true)}
              >
                Upload File
              </Button>
            </Grid>
            <Grid
              style={{
                backgroundColor: "#fafafa",
                borderBottomRightRadius: 10,
                borderBottomLeftRadius: 10,
                padding: 10,
              }}
            >
              <Grid xs={12} style={{ textAlign: "center" }}>
                {/*@ts-ignore*/}
                {experiments.length > 0
                  ? JSON.stringify(experiments[0].details)
                  : null}
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  alignContent="center"
                  justify="center"
                >
                  <h1>Files</h1>
                </Grid>
                <Divider style={{ marginBottom: 10 }}></Divider>
                {workspaceData === null ? (
                  <CircularProgress />
                ) : workspaceData.files.length === 0 ? (
                  <h3 style={{ color: "#777" }}>
                    There are no files in this workspace
                  </h3>
                ) : (
                  workspaceData.files.map((e: any, i: number) => {
                    return (
                      <>
                        <Grid item xs={12} style={{ textAlign: "left" }}>
                          <h3>File label: {e.label}</h3>
                          <div style={{ marginLeft: 20 }}>
                            <h4>
                              Date:{" "}
                              {getHumanReadableTimeDifference(
                                new Date(e.createdOn),
                                new Date()
                              )}
                            </h4>
                            {JSON.stringify(e)}
                          </div>
                        </Grid>
                        {i !== workspaceData.files.length - 1 ? (
                          <Divider
                            style={{ marginTop: 15, marginBottom: 15 }}
                          ></Divider>
                        ) : null}
                      </>
                    );
                  })
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default withStyles(styles)(Workspace);
