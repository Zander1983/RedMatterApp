import { useSelector } from "react-redux";
import React, { useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router";

import { makeStyles } from "@material-ui/core/styles";
import { Button, FormControlLabel } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { snackbarService } from "uno-material-ui";
import { ArrowLeftOutlined } from "@ant-design/icons";
import CircularProgress from "@material-ui/core/CircularProgress";
import ShareIcon from "@material-ui/icons/Share";
import { green } from "@material-ui/core/colors";

import userManager from "Components/users/userManager";
import { Debounce } from "services/Dbouncer";
import SmallScreenNotice from "./SmallScreenNotice";
import PrototypeNotice from "./PrototypeNotice";
import MessageModal from "./components/modals/MessageModal";
import AddFileModal from "./components/modals/AddFileModal";
import GateNamePrompt from "./components/modals/GateNamePrompt";
import GenerateReportModal from "./components/modals/GenerateReportModal";
import LinkShareModal from "./components/modals/linkShareModal";
import { useXarrow } from "react-xarrows";

import {
  downloadFileEvent,
  downloadFileMetadata,
  dowloadAllFileEvents,
} from "services/FileService";

import {
  getAllFiles,
  loadWorkspaceFromRemoteIfExists,
  saveWorkspaceToRemote,
} from "./utils/workspace";
import {
  PlotsRerender,
  Workspace as WorkspaceType,
  WorkspaceEvent,
} from "./resources/types";
import PlotController from "./components/workspaces/PlotController";
import XML from "xml-js";
import { ParseFlowJoJson } from "services/FlowJoParser";
import { Typography } from "antd";
import IOSSwitch from "Components/common/Switch";
import { memResetDatasetCache } from "./resources/dataset";
import NotificationsOverlay, { Notification } from "./resources/notifications";
import { initialState } from "./workspaceRedux/graphReduxActions";
import WorkspaceDispatch from "./workspaceRedux/workspaceDispatchers";
import EventQueueDispatch from "graph/workspaceRedux/eventQueueDispatchers";

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
}));
let i = 0;
const WorkspaceInnerComponent = (props: {
  experimentId: string;
  shared: boolean;
}) => {
  const classes = useStyles();
  const history = useHistory();
  const isLoggedIn = userManager.isLoggedIn();
  const [customPlotRerender, setCustomPlotRerender] = React.useState([]);
  // TODO ONLY UPDATE WHEN STATE IS CHANGED!!!
  //@ts-ignore
  const workspace: WorkspaceType = useSelector((state) => state.workspace);

  useSelector((e: any) => {
    const eventQueue = e.workspaceEventQueue.queue;
    let eventPlotsRerenderArray = eventQueue.filter(
      (x: WorkspaceEvent) => x.type === "plotsRerender"
    );
    if (eventPlotsRerenderArray.length > 0) {
      let event: PlotsRerender = eventPlotsRerenderArray[0];
      setCustomPlotRerender(event.plotIDs);
      EventQueueDispatch.DeleteQueueItem(event.id);
      setTimeout(() => {
        setCustomPlotRerender([]);
      }, 0);
    }
  });
  const updateXarrow = useXarrow();
  const [newWorkspaceId, setNewWorkspaceId] = React.useState("");
  const [savingWorkspace, setSavingWorkspace] = React.useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = React.useState(false);
  const inputFile = React.useRef(null);
  const [fileUploadInputValue, setFileUploadInputValue] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [workspaceLoading, setWorkspaceLoading] = React.useState(false);
  const [linkShareModalOpen, setLinkShareModalOpen] = React.useState(false);
  const [addFileModalOpen, setAddFileModalOpen] = React.useState(false);
  const [generateReportModalOpen, setGenerateReportModalOpen] =
    React.useState(false);
  const [loadModal, setLoadModal] = React.useState(false);
  const [clearModal, setClearModal] = React.useState(false);
  const [editWorkspace, setEditWorkspace] = React.useState(
    workspace.editWorkspace
  );
  const [sharedWorkspace, setSharedWorkspace] = React.useState(false);
  const [lastSavedTime, setLastSavedTime] = React.useState(null);

  const [plotCallNeeded, setPlotCallNeeded] = React.useState(false);
  const [initState, setInitState] = React.useState(true);
  const [isConnectivity, setConnectivity] = React.useState(true);

  const handleOpen = (func: Function) => {
    func(true);
  };
  const handleClose = (func: Function) => {
    func(false);
  };

  useEffect(() => {
    (async () => {
      WorkspaceDispatch.ResetWorkspace();
      if (props.shared) WorkspaceDispatch.SetEditWorkspace(false);
      WorkspaceDispatch.SetWorkspaceShared(props.shared);
      setSharedWorkspace(props.shared);
      setAutosaveEnabled(false);
      try {
        await initializeWorkspace(props.shared, props.experimentId);
      } catch (e) {
        setInitState(true);
        setPlotCallNeeded(false);
        await handleError(e);
      }
      return () => {
        WorkspaceDispatch.ResetWorkspace();
        memResetDatasetCache();
      };
    })();
  }, []);

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

  const downloadAllEvents = async (
    fileIds: any[],
    isInitTime: boolean = false
  ) => {
    if (isInitTime && setPlotCallNeeded) return;
    setPlotCallNeeded(false);
    setAutosaveEnabled(false);
    dowloadAllFileEvents(sharedWorkspace, props.experimentId, fileIds)
      .then((result) => {
        if (result?.length > 0) {
          setPlotCallNeeded(true);
        }
      })
      .catch((err) => {
        setPlotCallNeeded(false);
        setAutosaveEnabled(false);
        snackbarService.showSnackbar(
          "File downloading failed. due to retry completed",
          "error"
        );
      });
  };

  // Loading the files on creating the experiment
  useEffect(() => {
    if (!workspaceLoading) {
      setWorkspaceLoading(false);
      try {
        downloadAllEvents(workspace.files.map((file) => file.id)).then();
      } catch (e) {
        setPlotCallNeeded(false);
        snackbarService.showSnackbar(
          "File downloading failed. due to retry completed",
          "error"
        );
      }
    }
  }, [workspace.files.length]);

  useEffect(() => {
    if (workspace.editWorkspace !== editWorkspace) {
      setEditWorkspace(workspace.editWorkspace);
      //setInitState(true);
    }
  }, [workspace.editWorkspace]);

  // saves the workSpace when a new plot is added or deleted
  useEffect(() => {
      if(!initState && plotCallNeeded && autosaveEnabled) {
          const timer = setTimeout(async () => {
              await saveWorkspace();
          }, 1000);
          updateXarrow();
          return () => {
              if (timer !== null) clearTimeout(timer);
          };
      }

  }, [workspace.plots.length]);

  const initializeWorkspace = async (shared: boolean, experimentId: string) => {
    const notification = new Notification("Loading workspace");
    setWorkspaceLoading(true);
    const loadStatus = await loadWorkspaceFromRemoteIfExists(
      shared,
      experimentId
    );

    if (!loadStatus.requestSuccess) {
      snackbarService.showSnackbar("Workspace created", "success");
    } else {
      snackbarService.showSnackbar("Workspace loaded", "success");
    }

    if (!loadStatus.loaded && shared) {
    }

    setAutosaveEnabled(!shared);
    notification.killNotification();
    setWorkspaceLoading(false);
    await downloadFileMetadata(shared, experimentId);
    setInitState(false);
  };

  const saveWorkspace = async (shared: boolean = false) => {
    setSavingWorkspace(true);
    setLastSavedTime(new Date().toLocaleString());
    await saveWorkspaceToRemote(workspace, shared, props.experimentId);
    setSavingWorkspace(false);
    updateXarrow();
  };

  var onLinkShareClick = async () => {
    if (isLoggedIn) {
      saveWorkspace(true);
    } else if (sharedWorkspace) {
      let stateJson = JSON.stringify(workspace);
      let newWorkspaceDB;
      try {
        newWorkspaceDB = await axios.post(
          "/api/upsertSharedWorkspace",
          {
            workspaceId: newWorkspaceId,
            experimentId: props.experimentId,
            state: stateJson,
          },
          {}
        );
        setNewWorkspaceId(newWorkspaceDB.data);
      } catch (e) {
        snackbarService.showSnackbar(
          "Could not save shared workspace, reload the page and try again!",
          "error"
        );
      }
    }
    handleOpen(setLinkShareModalOpen);
  };

  const importFlowJoFunc = async (e: any) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      let text: any = e.target.result;
      var options = {
        compact: true,
        ignoreComment: true,
        alwaysChildren: true,
      };
      var result = XML.xml2json(text, options);
      result = JSON.parse(result);
      setLoading(true);
      setWorkspaceLoading(true);
      setFileUploadInputValue("");
      let downloadedFiles = workspace.files.filter((x) => x.downloaded);
      if (workspace.files.length === downloadedFiles.length) {
        initiateParseFlowJo(result, downloadedFiles);
      } else {
        let filetoBeDownloaded = workspace.files.filter((x) => !x.downloaded);
        let fileIds = filetoBeDownloaded.map((x) => x.id);
        handleDownLoadFileEvents(fileIds, result);
        snackbarService.showSnackbar(
          "File events are getting downloaded then import will happen!!",
          "warning"
        );
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  const handleDownLoadFileEvents = async (
    fileIds: Array<string>,
    flowJoJson: any
  ) => {
    for (let i = 0; i < fileIds.length; i++) {
      await downloadFileEvent(sharedWorkspace, fileIds[i], props.experimentId);
    }
    let downlodedFiles = getAllFiles().filter((x) => x.downloaded);
    if (workspace.files.length == downlodedFiles.length)
      initiateParseFlowJo(flowJoJson, downlodedFiles);
    else {
      snackbarService.showSnackbar(
        "Could not parse FlowJo workspace",
        "warning"
      );
      setTimeout(() => {
        setLoading(false);
        setWorkspaceLoading(false);
      }, 4000);
    }
  };

  const initiateParseFlowJo = async (flowJoJson: any, files: any) => {
    try {
      await ParseFlowJoJson(flowJoJson, files);
    } catch (e) {
      snackbarService.showSnackbar(
        "Could not parse FlowJo workspace",
        "warning"
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
        setWorkspaceLoading(false);
      }, 0);
    }
  };

  if (autosaveEnabled) {
      if(!initState && plotCallNeeded) {
          Debounce(() => saveWorkspace(), 5000)
      }
  }

  return (
    <div
      style={{
        height: "100%",
        padding: 0,
      }}
      // onKeyDown={(e: any) => {
      //   try {
      //     if (e.key === "Enter") {
      //     }
      //   } catch {}
      // }}
    >
      {/* == MODALS == */}
      <div>
        <GateNamePrompt />

        <AddFileModal
          open={addFileModalOpen}
          closeCall={{ f: handleClose, ref: setAddFileModalOpen }}
          isShared={sharedWorkspace}
          experimentId={props.experimentId}
          files={workspace.files}
          selectedFile={workspace.selectedFile}
        />

        <GenerateReportModal
          open={generateReportModalOpen}
          closeCall={{ f: handleClose, ref: setGenerateReportModalOpen }}
        />

        <LinkShareModal
          open={linkShareModalOpen}
          workspaceId={newWorkspaceId}
          closeCall={{ f: handleClose, ref: setLinkShareModalOpen }}
        />
      </div>

      <MessageModal
        open={loadModal}
        closeCall={{ f: handleClose, ref: setLoadModal }}
        message={
          <div>
            <h2>Loading workspace</h2>
            <h4 style={{ color: "#777" }}>
              Please wait, we are collecting your files from the servers...
            </h4>
            <CircularProgress style={{ marginTop: 20, marginBottom: 20 }} />
          </div>
        }
        noButtons={true}
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

      {/* == STATIC ELEMENTS == */}
      {/* <SideMenus workspace={workspace}></SideMenus> */}
      <NotificationsOverlay />

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
                        startIcon={
                          <ArrowLeftOutlined style={{ fontSize: 15 }} />
                        }
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
                        className={classes.topButton}
                        style={{
                          backgroundColor: "#fafafa",
                        }}
                        onClick={() => {
                          inputFile.current.click();
                        }}
                      >
                        <input
                          type="file"
                          id="file"
                          ref={inputFile}
                          value={
                            fileUploadInputValue == null
                              ? ""
                              : fileUploadInputValue
                          }
                          accept=".wsp"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            importFlowJoFunc(e);
                          }}
                        />
                        Import FlowJo (experimental)
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
                            <CircularProgress
                              style={{ width: 20, height: 20 }}
                            />
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
                              checked={autosaveEnabled}
                              onChange={() =>
                                setAutosaveEnabled(!autosaveEnabled)
                              }
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
                        <ShareIcon
                          fontSize="small"
                          style={{ marginRight: 10 }}
                        />
                        Share Workspace
                      </Button>
                    </div>
                  </span>
                ) : (
                  <span className={classes.sharedHeaderText}>
                    Shared Workspace
                  </span>
                )}
              </Grid>
            </Grid>

            <Grid style={{ marginTop: 43 }}>
              <SmallScreenNotice />
              <PrototypeNotice experimentId={props.experimentId} />

              {plotCallNeeded && !initState ? (
                <PlotController
                  sharedWorkspace={sharedWorkspace}
                  experimentId={props.experimentId}
                  workspace={workspace}
                  workspaceLoading={workspaceLoading}
                  customPlotRerender={customPlotRerender}
                  arrowFunc={updateXarrow}
                />
              ) : (
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
                  {workspaceLoading && isConnectivity ? (
                    <CircularProgress />
                  ) : (
                    isConnectivity ? "Wait preparing......" : "Internet connection failed. Check your connection"
                  )}
                </Grid>
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

class WorkspaceComponent extends React.Component<WorkspaceProps> {
  render() {
    return (
      <ErrorBoundary
        experimentId={this.props.experimentId}
        shared={this.props.shared}
      >
        <WorkspaceInnerComponent
          experimentId={this.props.experimentId}
          shared={this.props.shared}
        />
      </ErrorBoundary>
    );
  }
}

export default WorkspaceComponent;
