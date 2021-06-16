import React from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, Button } from "@material-ui/core";

import WorkspaceCard from "./WorkspaceCard";
import CreateWorkspaceModal from "./modals/CreateWorkspaceModal";

import { WorkspacesApiFetchParamCreator } from "api_calls/nodejsback";
import userManager from "Components/users/userManager";
import { snackbarService } from "uno-material-ui";

const Workspaces = (props: { backFromQuestions?: boolean }) => {
  const history = useHistory();
  const isLoggedIn = userManager.isLoggedIn();
  if (!isLoggedIn || process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/login");
  }
  if (process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/");
  }

  const [workspaces, setWorkspaces] = React.useState([]);
  const [createWorkspaceModal, setCreateWorkspaceModal] = React.useState(false);

  const fetchWorkspaces = () => {
    if (!isLoggedIn) return;
    const fetchArgs = WorkspacesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).appWorkspace(userManager.getOrganiztionID(), userManager.getToken());
    axios
      .get(fetchArgs.url, fetchArgs.options)
      .then((e) => {
        e.data.workspaces.fileCount = "Loading...";
        setWorkspaces(e.data.workspaces);
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Failed to find experiment information",
          "error"
        );
        userManager.logout();
      });
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  React.useEffect(() => {
    fetchWorkspaces();
    if (props.backFromQuestions) {
      snackbarService.showSnackbar("Experiment created", "success");
    }
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
        created={(workspaceID: string) => {
          fetchWorkspaces();
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
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 20 }}>
                Experiments
              </div>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "#fafafa",
                  maxHeight: 40,
                }}
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
                <div
                  style={{ textAlign: "center", width: "100%", padding: 50 }}
                >
                  There are no experiments
                </div>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default Workspaces;
