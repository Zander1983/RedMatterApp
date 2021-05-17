import React from "react";
import axios from "axios";
import { NavLink, useHistory } from "react-router-dom";
import { Grid, Button } from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import WorkspaceCard from "./WorkspaceCard";
import CreateWorkspaceModal from "./modals/CreateWorkspaceModal";

import { WorkspacesApiFetchParamCreator } from "api_calls/nodejsback/api";
import userManager from "Components/users/userManager";
import { snackbarService } from "uno-material-ui";

const styles = {
  header: {
    textAlign: "center",
  },
  fileSelectDivider: {
    marginTop: 10,
    marginBottom: 10,
  },
  topButton: {
    marginLeft: 20,
  },
  root: {
    minWidth: 275,
    flexGrow: 1,
  },
  title: {
    fontSize: 14,
    color: "#222",
  },
  addButton: {
    marginLeft: 30,
  },
  zeroMargin: {
    margin: 0,
  },
  zeroPadding: {
    padding: 0,
  },
};

const Workspaces = () => {
  const history = useHistory();
  const isLoggedIn = userManager.isLoggedIn();
  if (!isLoggedIn) {
    if (history.length > 0) {
      history.goBack();
    } else {
      history.push("/");
    }
  }

  const [workspaces, setWorkspaces] = React.useState([]);
  const [createWorkspaceModal, setCreateWorkspaceModal] = React.useState(false);

  const fetchWorkspaces = () => {
    if (!isLoggedIn) return;
    const fetchArgs = WorkspacesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).appWorkspace(userManager.getOrganiztionID(), userManager.getToken());
    axios.get(fetchArgs.url, fetchArgs.options).then((e) => {
      e.data.workspaces.fileCount = "Loading...";
      setWorkspaces(e.data.workspaces);
    });
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  React.useEffect(() => {
    fetchWorkspaces();
  }, []);

  return !isLoggedIn ? (
    <></>
  ) : (
    <>
      <CreateWorkspaceModal
        open={createWorkspaceModal}
        closeCall={{
          f: handleClose,
          ref: setCreateWorkspaceModal,
        }}
        created={() => {
          fetchWorkspaces();
          snackbarService.showSnackbar("Workspace created", "success");
        }}
        workspaces={workspaces.map((e) => e.name)}
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
              <h1 style={{ ...styles.zeroMargin, color: "#ddd" }}>
                Workspaces
              </h1>
              <Button
                variant="contained"
                style={{ ...styles.addButton, backgroundColor: "#fafafa" }}
                onClick={() => setCreateWorkspaceModal(true)}
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
              {workspaces.length > 0 ? (
                workspaces.map((data: any) => {
                  return <WorkspaceCard data={data} update={fetchWorkspaces} />;
                })
              ) : (
                <div>You workspace is empty!</div>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default Workspaces;
