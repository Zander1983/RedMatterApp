import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import { Button, FormControlLabel } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { snackbarService } from "uno-material-ui";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import { green } from "@material-ui/core/colors";
import { ArrowLeftOutlined } from "@ant-design/icons";

import userManager from "Components/users/userManager";
import SmallScreenNotice from "./SmallScreenNotice";
import PrototypeNotice from "./PrototypeNotice";

import { dowloadAllFileEvents } from "services/FileService";

import {
  loadWorkspaceFromRemoteIfExists,
  saveWorkspaceToRemote,
} from "./utils/workspace";
import { Typography } from "antd";
import { memResetDatasetCache } from "./resources/dataset";
import { initialState } from "./workspaceRedux/graphReduxActions";
import WorkspaceDispatch from "./workspaceRedux/workspaceDispatchers";
import SecurityUtil from "../utils/Security";
import IOSSwitch from "../Components/common/Switch";
import ShareIcon from "@material-ui/core/SvgIcon/SvgIcon";
import { Workspace as WorkspaceType } from "./resources/types";
import { useSelector } from "react-redux";
import NewPlotController from "./components/workspaces/NewPlotController";
import MessageModal from "./components/modals/MessageModal";
import AddFileModal from "./components/modals/AddFileModal";
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

const NewWorkspaceInnerComponent = (props: {
  experimentId: string;
  shared: boolean;
}) => {
  const classes = useStyles();
  const history = useHistory();
  //@ts-ignore
  const workspace: WorkspaceType = useSelector((state) => state.workspace);

  const [open, setOpen] = React.useState(true);
  const [plotCallNeeded, setPlotCallNeeded] = React.useState(false);
  const [isConnectivity, setConnectivity] = React.useState(true);
  const [isReloadMessage, setReloadMessage] = React.useState("");
  const [isMessage, setMessage] = React.useState("");

  const [editWorkspace, setEditWorkspace] = React.useState(
    workspace.editWorkspace
  );
  const [sharedWorkspace, setSharedWorkspace] = React.useState(false);
  const [lastSavedTime, setLastSavedTime] = React.useState(null);
  const [savingWorkspace, setSavingWorkspace] = React.useState(false);
  const [addFileModalOpen, setAddFileModalOpen] = React.useState(false);
  const [clearModal, setClearModal] = React.useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = React.useState(false);
  const [customPlotRerender, setCustomPlotRerender] = React.useState([]);

  let pageLoaderSubscription: any = null;

  useEffect(() => {
    pageLoaderSubscription = setTimeout(function run() {
      setOpen(false);
      if (pageLoaderSubscription) {
        clearTimeout(pageLoaderSubscription);
        pageLoaderSubscription = null;
      }
    }, 12000);

    (async () => {
      try {
        await getAll(props.shared, props.experimentId);
      } catch (e) {
        await handleError(e);
      }
    })();

    return () => {
      WorkspaceDispatch.ResetWorkspace();
      memResetDatasetCache();
    };
  }, []);

  const getAll = async (shared: boolean, experimentId: any) => {
    WorkspaceDispatch.ResetWorkspace();
    if (props.shared) WorkspaceDispatch.SetEditWorkspace(false);
    WorkspaceDispatch.SetWorkspaceShared(props.shared);
    setSharedWorkspace(props.shared);
    setReloadMessage("Loading...");
    loadWorkspaceFromRemoteIfExists(shared, experimentId)
      .then(async (response: any) => {
        setReloadMessage("Loading Done. wait preparing....");
        if (response.requestSuccess) {
          let files = SecurityUtil.decryptData(
            sessionStorage.getItem("experimentFiles"),
            process.env.REACT_APP_DATA_SECRET_SOLD
          );
          if (files && files?.files?.files?.length > 0) {
            let fileIds = files?.files?.files?.map((file: any) => file.id);
            if (fileIds.length > 0) {
              WorkspaceDispatch.SetFiles(files?.files?.files);
              try {
                let result = await dowloadAllFileEvents(
                  sharedWorkspace,
                  props.experimentId,
                  fileIds
                );
                if (result?.length > 0) {
                  setReloadMessage("Workspace prepared successfully.");
                  setTimeout(() => {
                    setPlotCallNeeded(true);
                  }, 2000);
                } else {
                  setMessage(
                    "Your Action is Processing. please try after few later Or wait "
                  );
                }
              } catch (err) {
                setPlotCallNeeded(false);
                if (err.toString().indexOf("FILE-MISSING") === -1) {
                  await handleError({
                    message: "File downloading failed. due to retry completed",
                    saverity: "error",
                  });
                } else {
                  setMessage(
                    "Your Action is Processing. please try after few later Or wait "
                  );
                }
              } finally {
                if (pageLoaderSubscription) {
                  setOpen(false);
                  clearTimeout(pageLoaderSubscription);
                  pageLoaderSubscription = null;
                }
              }
            }
          } else {
          }
        } else {
        }
      })
      .catch((e) => {});
  };

  const handleError = async (error: any) => {
    if (
      error?.name === "Error" ||
      error?.message.toString() === "Network Error"
    ) {
      setConnectivity(false);
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

  const handleOpen = (func: Function) => {
    func(true);
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  const saveWorkspace = async (shared: boolean = false) => {
    setSavingWorkspace(true);
    setLastSavedTime(new Date().toLocaleString());
    await saveWorkspaceToRemote(workspace, shared, props.experimentId);
    setSavingWorkspace(false);
  };

  const onLinkShareClick = async () => {};

  const _renderToolbar = () => {
    return (
      <Grid
        style={{
          position: "fixed",
          zIndex: 100,
          top: 64,
          backgroundColor: "white",
          paddingTop: 4,
          paddingBottom: 6,
          WebkitBorderBottomLeftRadius: 0,
          WebkitBorderBottomRightRadius: 0,
          minHeight: "43px",
        }}
        container
      >
        <Grid container>
          {editWorkspace ? (
            <span
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                background: "white",
              }}
            >
              <div>
                <Button
                  disabled={!plotCallNeeded}
                  size="small"
                  variant="contained"
                  style={{
                    backgroundColor: "#fafafa",
                  }}
                  className={classes.topButton}
                  startIcon={<ArrowLeftOutlined style={{ fontSize: 15 }} />}
                  onClick={() => {
                    history.goBack();
                  }}
                >
                  Back
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleOpen(setAddFileModalOpen)}
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                  }}
                  disabled={!!workspace.selectedFile || !plotCallNeeded}
                >
                  Plot sample
                </Button>
                <Button
                  disabled={!plotCallNeeded}
                  variant="contained"
                  size="small"
                  onClick={() => handleOpen(setClearModal)}
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                  }}
                >
                  Clear
                </Button>
                <span>
                  <Button
                    disabled={!plotCallNeeded}
                    variant="contained"
                    size="small"
                    onClick={() => saveWorkspace()}
                    className={classes.topButton}
                    style={{
                      backgroundColor: "#fafafa",
                      width: 137,
                    }}
                  >
                    {savingWorkspace && plotCallNeeded ? (
                      <CircularProgress style={{ width: 20, height: 20 }} />
                    ) : (
                      <Typography>Save Workspace</Typography>
                    )}
                  </Button>
                  <FormControlLabel
                    style={{
                      marginLeft: 0,
                      height: 20,
                      marginTop: 4,
                      color: "#333",
                    }}
                    label={"Autosave"}
                    control={
                      <IOSSwitch
                        disabled={!plotCallNeeded}
                        checked={autoSaveEnabled}
                        onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
                      />
                    }
                  />
                </span>
                {lastSavedTime ? (
                  <span
                    style={{
                      height: "100%",
                      display: "inline-flex",
                    }}
                  >
                    <span
                      style={{
                        color: "#333",
                        fontStyle: "italic",
                      }}
                    >
                      saved at {lastSavedTime}
                    </span>
                  </span>
                ) : null}
              </div>
              <div>
                <Button
                  disabled={!plotCallNeeded}
                  variant="contained"
                  size="small"
                  onClick={() => onLinkShareClick()}
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                    marginRight: 10,
                  }}
                >
                  <ShareIcon fontSize="small" style={{ marginRight: 10 }} />
                  Share Workspace
                </Button>
              </div>
            </span>
          ) : (
            <span className={classes.sharedHeaderText}>Shared Workspace</span>
          )}
        </Grid>
      </Grid>
    );
  };

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
      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* == MODALS == */}
      <AddFileModal
        open={addFileModalOpen}
        closeCall={{ f: handleClose, ref: setAddFileModalOpen }}
        isShared={sharedWorkspace}
        experimentId={props.experimentId}
        files={workspace.files}
        selectedFile={workspace.selectedFile}
      />
      <MessageModal
        open={clearModal}
        closeCall={{
          f: handleClose,
          ref: setClearModal,
        }}
        message={
          <div>
            <h2>Are you sure you want to delete the entire workspace?</h2>
            <p style={{ marginLeft: 100, marginRight: 100 }}>
              The links you've shared with "share workspace" will still work, if
              you want to access this in the future, make sure to store them.
            </p>
          </div>
        }
        options={{
          yes: () => {
            WorkspaceDispatch.ResetWorkspaceExceptFiles();
          },
          no: () => {
            handleClose(setClearModal);
          },
        }}
      />
      {/* == MAIN PANEL == */}
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
            {_renderToolbar()}
            <Grid style={{ marginTop: 43 }}>
              <SmallScreenNotice />
              <PrototypeNotice experimentId={props.experimentId} />
              {plotCallNeeded ? (
                <NewPlotController
                  sharedWorkspace={sharedWorkspace}
                  experimentId={props.experimentId}
                  workspace={workspace}
                  workspaceLoading={plotCallNeeded}
                  customPlotRerender={customPlotRerender}
                />
              ) : (
                _renderPageMessage()
              )}
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
                initialState,
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
        <NewWorkspaceInnerComponent
          experimentId={this.props.experimentId}
          shared={this.props.shared}
        />
      </ErrorBoundary>
    );
  }
}

export default NewWorkspaceComponent;
