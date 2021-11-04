// const GateBuilder = () => {
//   return <div> this is gateBuilder </div>;
// };
// export default GateBuilder;
import { useSelector, useStore } from "react-redux";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router";

import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  FormControlLabel,
  Menu,
  MenuItem,
  Fade,
} from "@material-ui/core";

import Grid from "@material-ui/core/Grid";
import { snackbarService } from "uno-material-ui";
import { ArrowLeftOutlined } from "@ant-design/icons";
import CircularProgress from "@material-ui/core/CircularProgress";
import ShareIcon from "@material-ui/icons/Share";
import { green } from "@material-ui/core/colors";

import userManager from "Components/users/userManager";
import { Debounce } from "services/Dbouncer";
import HowToUseModal from "./HowToUseModal";
import SmallScreenNotice from "./SmallScreenNotice";
import PrototypeNotice from "./PrototypeNotice";
import MessageModal from "./components/modals/MessageModal";
import AddFileModal from "./components/modals/AddFileModal";
import GateNamePrompt from "./components/modals/GateNamePrompt";
import GenerateReportModal from "./components/modals/GenerateReportModal";
import LinkShareModal from "./components/modals/linkShareModal";
import SideMenus from "./components/static/SideMenus";
import { downloadFileEvent, downloadFileMetadata } from "services/FileService";
import {
  getAllFiles,
  loadWorkspaceFromRemoteIfExists,
  saveWorkspaceToRemote,
  getFile,
} from "./utils/workspace";
import { Workspace as WorkspaceTypem, File } from "./resources/types";
import PlotController from "./components/workspaces/PlotController";
import XML from "xml-js";
import { ParseFlowJoJson } from "services/FlowJoParser";
import { Typography } from "antd";
import IOSSwitch from "Components/common/Switch";
import { memResetDatasetCache } from "./resources/dataset";
import NotificationsOverlay, { Notification } from "./resources/notifications";
import { initialState } from "./workspaceRedux/graphReduxActions";
import WorkspaceDispatch from "./workspaceRedux/workspaceDispatchers";
import * as PlotResource from "./resources/plots";

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
    backgroundColor: "#fafafa",
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
  mainContainer: {
    minHeight: "100%",
    padding: 0,
    background: "white",
  },
  headerGrid: {
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
  },
  innerHeaderGrid: {
    backgroundColor: "#fafafa",
    marginLeft: 0,
    marginRight: 0,
    boxShadow: "2px 3px 3px #ddd",
  },
  headerGridContainer: {
    position: "fixed",
    zIndex: 100,
    top: 64,
    backgroundColor: "#66a",
    paddingTop: 2,
    paddingBottom: 6,
    WebkitBorderBottomLeftRadius: 0,
    WebkitBorderBottomRightRadius: 0,
    minHeight: "43px",
  },
  headerSpan: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  circularLoader: {
    width: 20,
    height: 20,
  },
  autoSave: {
    marginLeft: 0,
    height: 20,
    marginTop: 4,
    color: "#fff",
  },
}));

const WorkspaceInnerComponent = (props: {
  experimentId: string;
  shared: boolean;
}) => {
  const store = useStore();
  const classes = useStyles();
  const history = useHistory();
  const isLoggedIn = userManager.isLoggedIn();
  // TODO ONLY UPDATE WHEN STATE IS CHANGED!!!
  //@ts-ignore
  const workspace: WorkspaceType = useSelector((state) => state.workspace);

  const [newWorkspaceId, setNewWorkspaceId] = React.useState("");
  const [savingWorkspace, setSavingWorkspace] = React.useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = React.useState(false);
  const inputFile = React.useRef(null);
  const [fileUploadInputValue, setFileUploadInputValue] = React.useState("");

  const [loading, setLoading] = React.useState(false);
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
  const [currentPlot, setCurrentPlot] = React.useState("");

  // Theme Dropdown Code
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const dropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const dropDownClose = () => {
    setAnchorEl(null);
  };

  // Select File DropDown
  const [selectFileAnchorEl, setSelectFileAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const selectFileOpen = Boolean(selectFileAnchorEl);
  const selectFileDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setSelectFileAnchorEl(event.currentTarget);
  };
  const selectFileDropDownClose = () => {
    setSelectFileAnchorEl(null);
  };

  const handleOpen = (func: Function) => {
    func(true);
  };
  const handleClose = (func: Function) => {
    func(false);
  };

  useEffect(() => {
    if (workspace.editWorkspace != editWorkspace) {
      setEditWorkspace(workspace.editWorkspace);
    }
  }, [workspace.editWorkspace]);

  useEffect(() => {
    WorkspaceDispatch.ResetWorkspace();

    if (props.shared) WorkspaceDispatch.SetEditWorkspace(false);
    WorkspaceDispatch.SetWorkspaceShared(props.shared);
    setSharedWorkspace(props.shared);
    initializeWorkspace(props.shared, props.experimentId);

    return () => {
      WorkspaceDispatch.ResetWorkspace();
      memResetDatasetCache();
    };
  }, []);

  useEffect(() => {
    workspace?.files.map((item: File) =>
      WorkspaceDispatch.AddFileIdToGatebuilder(item.id)
    );
  }, [workspace.files]);

  const initializeWorkspace = async (shared: boolean, experimentId: string) => {
    const notification = new Notification("Loading workspace");
    await downloadFileMetadata(shared, experimentId);
    // const loadStatus = await loadWorkspaceFromRemoteIfExists(
    //   shared,
    //   experimentId
    // );
    // if (!loadStatus.requestSuccess) {
    //   snackbarService.showSnackbar("Workspace created", "success");
    // } else {
    //   snackbarService.showSnackbar("Workspace loaded", "success");
    // }

    // if (!loadStatus.loaded && shared) {
    // }

    setAutosaveEnabled(shared ? false : true);
    notification.killNotification();
  };

  const saveWorkspace = async (shared: boolean = false) => {
    setSavingWorkspace(true);
    await saveWorkspaceToRemote(workspace, shared, props.experimentId);
    setSavingWorkspace(false);
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

  const downloadFile = async (fileId: string) => {
    setSelectFileAnchorEl(null);
    const plot =
      currentPlot &&
      workspace.plots.find((plot: any) => plot.id === currentPlot);
    plot && WorkspaceDispatch.DeletePlot(plot);
    let file: File = getFile(fileId);
    if (!file.downloaded) {
      const newId = await downloadFileEvent(
        props.shared,
        fileId,
        props.experimentId,
        true,
        true
      );
      if (typeof newId !== "string") {
        throw Error("wtf?");
      }
      file = getFile(newId);
    }
    const plotId = await PlotResource.createNewPlotFromFile(
      file,
      undefined,
      true
    );
    setCurrentPlot(plotId);
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
      setFileUploadInputValue("");
      let downloadedFiles = workspace.files.filter((x: any) => x.downloaded);
      if (workspace.files.length == downloadedFiles.length) {
        initiateParseFlowJo(result, downloadedFiles);
      } else {
        let filetoBeDownloaded = workspace.files.filter(
          (x: any) => !x.downloaded
        );
        let fileIds = filetoBeDownloaded.map((x: any) => x.id);
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
    }
    setTimeout(() => {
      setLoading(false);
    }, 4000);
  };

  if (autosaveEnabled) {
    Debounce(() => saveWorkspace(), 5000);
  }

  return (
    <div className={classes.mainContainer}>
      {/* == MODALS == */}
      <div>
        <GateNamePrompt />

        <AddFileModal
          open={addFileModalOpen}
          closeCall={{ f: handleClose, ref: setAddFileModalOpen }}
          isShared={sharedWorkspace}
          experimentId={props.experimentId}
          files={workspace.files}
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

      {/* <MessageModal
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
      /> */}

      {/* == STATIC ELEMENTS == */}
      <SideMenus workspace={workspace}></SideMenus>
      <NotificationsOverlay />

      {/* == MAIN PANEL == */}
      <Grid className={classes.headerGrid}>
        <Grid className={classes.innerHeaderGrid}>
          <div>
            <Grid className={classes.headerGridContainer} container>
              <Grid container>
                {editWorkspace ? (
                  <span className={classes.headerSpan}>
                    {/* Header */}
                    <div>
                      {/* Back */}
                      <Button
                        size="small"
                        variant="contained"
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

                      {/* Select Uploaded Files */}
                      <Button
                        variant="contained"
                        className={classes.topButton}
                        id="fade-button"
                        aria-controls="fade-menu"
                        aria-haspopup="true"
                        aria-expanded={selectFileOpen ? "true" : undefined}
                        onClick={selectFileDropDownClick}
                      >
                        Select Files
                      </Button>

                      <Menu
                        id="fade-menu"
                        MenuListProps={{
                          "aria-labelledby": "fade-button",
                        }}
                        anchorEl={selectFileAnchorEl}
                        open={selectFileOpen}
                        onClose={selectFileDropDownClose}
                        TransitionComponent={Fade}
                      >
                        {workspace.files.map((item: File, index: number) => (
                          <MenuItem
                            key={index}
                            onClick={() => downloadFile(item.id)}
                          >
                            {item.name}
                          </MenuItem>
                        ))}
                      </Menu>

                      {/* Import Flowjo */}
                      <Button
                        variant="contained"
                        size="small"
                        className={classes.topButton}
                        onClick={() => {
                          inputFile.current.click();
                        }}
                      >
                        <input
                          type="file"
                          id="file"
                          ref={inputFile}
                          value={fileUploadInputValue}
                          accept=".wsp"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            importFlowJoFunc(e);
                          }}
                        />
                        Import FlowJo (experimental)
                      </Button>

                      {/* Clear */}
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpen(setClearModal)}
                        className={classes.topButton}
                      >
                        Clear
                      </Button>

                      {/* Save WorkSpace */}
                      <span>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => saveWorkspace()}
                          className={classes.topButton}
                        >
                          {savingWorkspace ? (
                            <CircularProgress
                              className={classes.circularLoader}
                            ></CircularProgress>
                          ) : (
                            <Typography>Save Workspace</Typography>
                          )}
                        </Button>

                        {/* Theme Dropdown */}
                        <Button
                          variant="contained"
                          className={classes.topButton}
                          id="fade-button"
                          aria-controls="fade-menu"
                          aria-haspopup="true"
                          aria-expanded={open ? "true" : undefined}
                          onClick={dropDownClick}
                        >
                          Theme
                        </Button>

                        <Menu
                          id="fade-menu"
                          MenuListProps={{
                            "aria-labelledby": "fade-button",
                          }}
                          anchorEl={anchorEl}
                          open={open}
                          onClose={dropDownClose}
                          TransitionComponent={Fade}
                        >
                          <MenuItem
                            onClick={() =>
                              history.push(
                                `/experiment/${props.experimentId}/gateBuilder`
                              )
                            }
                          >
                            GateBuilder
                          </MenuItem>
                          <MenuItem onClick={dropDownClose}>
                            Previous Gates
                          </MenuItem>
                          <MenuItem onClick={dropDownClose}>All Gates</MenuItem>
                        </Menu>

                        <FormControlLabel
                          className={classes.autoSave}
                          label={"Autosave"}
                          control={
                            <IOSSwitch
                              checked={autosaveEnabled}
                              onChange={() =>
                                setAutosaveEnabled(!autosaveEnabled)
                              }
                            />
                          }
                        />
                      </span>
                    </div>
                    <div>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => onLinkShareClick()}
                        className={classes.topButton}
                        style={{ marginRight: 10 }}
                      >
                        <ShareIcon
                          fontSize="small"
                          style={{ marginRight: 10 }}
                        ></ShareIcon>
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

              {!loading ? (
                <PlotController
                  sharedWorkspace={sharedWorkspace}
                  experimentId={props.experimentId}
                  workspace={workspace}
                  comingFromGateBuilder={true}
                ></PlotController>
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
                  <CircularProgress></CircularProgress>
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

class GateBuilder extends React.Component<WorkspaceProps> {
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

export default GateBuilder;
