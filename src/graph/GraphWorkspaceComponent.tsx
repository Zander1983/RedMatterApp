import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { snackbarService } from "uno-material-ui";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import { green } from "@material-ui/core/colors";
import userManager from "Components/users/userManager";
import PrototypeNotice from "./PrototypeNotice";
// import SideMenus from "./components/static/SideMenus";

import { downloadEvents, downloadFileMetadata } from "services/FileService";
import {
  getWorkspace,
  loadWorkspaceFromRemoteIfExists,
  getWorkspaceStateFromServer,
  saveWorkspaceToRemote,
} from "./utils/workspace";

import { Typography } from "antd";
import { memResetDatasetCache } from "./resources/dataset";
import WorkspaceDispatch from "./workspaceRedux/workspaceDispatchers";
import SecurityUtil from "../utils/Security";
import GraphPlotController from "./mark-app/GraphPlotController";
import WorkspaceTopBar from "../graph/components/WorkspaceTopBar";

const useStyles = makeStyles((theme) => ({
  header: {
    textAlign: "center",
  },
  title: {},
  fileSelectModal: {
    backgroundColor: "#efefef",
    boxShadow: theme.shadows[6],
    padding: 20,
    width: "800px",
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: "-400px",
    marginTop: "-150px",
    textAlign: "center",
  },
  fileSelectFileContainer: {
    backgroundColor: "#efefef",
    padding: 10,
    borderRadius: 5,
  },
  fileSelectDivider: {
    marginTop: 10,
    marginBottom: 10,
  },
  topButton: {
    marginLeft: 10,
    marginTop: 5,
    height: "1.9rem",
  },
  savingProgress: {
    marginLeft: "-5px",
    display: "flex",
    marginRight: "3px",
    animation: "App-logo-spin 1.4s linear infinite",
  },
  saved: {
    marginLeft: "-5px",
    display: "flex",
    marginRight: "3px",
    color: green[500],
  },
  sharedHeaderText: {
    width: "100%",
    textAlign: "center",
    paddingTop: "5px",
    fontSize: "19px",
    fontWeight: 500,
    color: "white",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const GraphWorkspaceComponent = (props: {
  experimentId: string;
  shared: boolean;
}) => {
  console.log(">>>in GraphWorkspaceComponent");
  const classes = useStyles();
  const history = useHistory();

  const [open, setOpen] = React.useState(true);
  const [plotCallNeeded, setPlotCallNeeded] = React.useState(false);
  const [isConnectivity, setConnectivity] = React.useState(true);
  const [isReloadMessage, setReloadMessage] = React.useState("");
  const [isMessage, setMessage] = React.useState("");
  const [renderPlotController, setRenderPlotController] = React.useState<
    boolean
  >(false);
  const [sharedWorkspace, setSharedWorkspace] = React.useState(false);

  let pageLoaderSubscription: any = null;

  const _renderPageMessage = () => {
    return (
      <Grid
        container
        style={{
          height: 400,
          backgroundColor: "#fff",
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          textAlign: "center",
        }}
        justify="center"
        alignItems="center"
        alignContent="center"
      >
        {!isConnectivity && "Internet connection failed. Check your connection"}
        <Typography
          style={{
            color: "#248e0d",
            textAlign: "center",
          }}
        >
          {" "}
          {isReloadMessage && isReloadMessage}{" "}
        </Typography>

        {isMessage && (
          <>
            {isMessage || ""}
            <a
              style={{ marginLeft: "5px" }}
              onClick={(event) => {
                event.preventDefault();
                window.location.reload();
              }}
            >
              Reload...
            </a>
          </>
        )}
      </Grid>
    );
  };

  return (
    <div
      style={{
        height: "100%",
        padding: 0,
      }}
    >
      {/* <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop> */}
      {/* <SideMenus workspace={getWorkspace()} /> */}
      <Grid
        style={{
          marginTop: 0,
          marginLeft: 0,
          marginRight: 0,
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Grid
          style={{
            backgroundColor: "#fafafa",
            marginLeft: 0,
            marginRight: 0,
            boxShadow: "2px 3px 3px #ddd",
          }}
        >
          <div>
            {plotCallNeeded || renderPlotController}

            {/* <WorkspaceTopBar
              // setLoader={setOpen}
              sharedWorkspace={props.shared}
              experimentId={props.experimentId}

              // controlFileId={setPlotCallNeeded}
            /> */}

            <Grid style={{ marginTop: 5 }}>
              <GraphPlotController
                sharedWorkspace={sharedWorkspace}
                experimentId={props.experimentId}
                //workspace={workspace}
                workspaceLoading={plotCallNeeded}
                // customPlotRerender={customPlotRerender}
              />
            </Grid>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

type WorkspaceProps = {
  experimentId: string;
  shared: boolean;
};

class ErrorBoundary extends React.Component<WorkspaceProps> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error("[Critical] Render failed");
    console.error(error);
    WorkspaceDispatch.ResetWorkspace();
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({
      hasError: true,
    });
  }

  render() {
    //@ts-ignore
    if (this.state.hasError) {
      return (
        <>
          <Grid
            justify="center"
            alignItems="center"
            alignContent="center"
            style={{
              textAlign: "center",
              width: "100%",
              marginTop: 20,
              justifyContent: "center",
              justifyItems: "center",
            }}
          >
            <h2>Sorry, there was an error on our end!</h2>
            <br />
            Here's what you can do to recover:
            <br />
            <br />
            <Button
              style={{ backgroundColor: "#66d", color: "white", width: 400 }}
              onClick={() => window.location.reload()}
            >
              1. Reload the page
            </Button>
            <br />
            <Button
              style={{
                backgroundColor: "#66d",
                color: "white",
                width: 400,
                marginTop: 20,
              }}
              onClick={async () => {
                snackbarService.showSnackbar("Clearing workspace...", "info");
                await saveWorkspaceToRemote(
                  this.props.shared,
                  this.props.experimentId
                );
                snackbarService.showSnackbar("Workspace cleared", "success");
                window.location.reload();
              }}
            >
              2. Clear the current workspace
            </Button>
            <br />
            <Button
              style={{
                backgroundColor: "#66d",
                color: "white",
                width: 400,
                marginTop: 20,
              }}
              onClick={() => {
                document.location.href =
                  document.location.href.split("experiment")[0] + "experiments";
              }}
            >
              3. Create a new workspace
            </Button>
          </Grid>
        </>
      );
    }

    return this.props.children;
  }
}

class NewWorkspaceComponent extends React.Component<WorkspaceProps> {
  render() {
    return (
      <ErrorBoundary
        experimentId={this.props.experimentId}
        shared={this.props.shared}
      >
        <GraphWorkspaceComponent
          experimentId={this.props.experimentId}
          shared={this.props.shared}
        />
      </ErrorBoundary>
    );
  }
}

export default NewWorkspaceComponent;
