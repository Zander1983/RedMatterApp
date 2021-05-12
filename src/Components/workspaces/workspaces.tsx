import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { Grid, Button } from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import WorkspaceCard from "./WorkspaceCard";
import TextPromptModal from "../modals/TextPromptModal";

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
  let user = JSON.parse(localStorage?.getItem("user"));
  let organizationID = "";
  if (user) {
    organizationID = user["organisationId"];
  }

  const [workspaceData, setWorkspaceData] = React.useState<any[]>([]);

  const options = {
    headers: {
      Token: localStorage.getItem("token"),
    },
    onDownloadProgress: (progressEvent: any) => {},
  };

  const getWorkspaceByOrgid = () => {
    axios
      .get(`api/workspaces?organisationId=${organizationID}`, options)
      .then((res: any) => {
        const datatemp = res.data.workspaces;
        setWorkspaceData(datatemp);
      })
      .catch((err: any) => {});
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  const [workspaceNameModal, setWorkspaceNameModal] = React.useState(false);
  const [workspaceName, setWorkspaceName] = React.useState("");

  return (
    <>
      <TextPromptModal
        open={workspaceNameModal}
        closeCall={{
          f: handleClose,
          ref: setWorkspaceNameModal,
        }}
        title="Workspace name"
        value={() => workspaceName}
        setValue={(text: string) => {
          setWorkspaceName(text);
        }}
        placeholder="Name of your workspace"
        cancel={() => {}}
        confirm={() => {
          console.log("Creating workspace with name =", workspaceName);
        }}
        validate={(text: string): string => {
          if (text.length === 0) return "Text may not be empty";
          return "";
        }}
        invalidated={() => {}}
      />
      <Grid
        style={{
          marginLeft: 0,
          marginRight: 0,
          justifyContent: "center",
          display: "flex",
          marginBottom: 500,
          marginTop: 15,
        }}
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
                onClick={() => setWorkspaceNameModal(true)}
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
            >
              <div>You workspace is empty!</div>
              {workspaceData.length > 0 &&
                workspaceData.map((data: any) => {
                  return <WorkspaceCard data={data} />;
                })}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default Workspaces;
