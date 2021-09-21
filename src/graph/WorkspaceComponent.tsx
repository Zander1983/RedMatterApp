import { useSelector, useStore } from "react-redux";
import React, { useEffect, useState } from "react";
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
import AutorenewRoundedIcon from "@material-ui/icons/AutorenewRounded";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";

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
import Plots, { resetPlotSizes } from "./components/workspaces/PlotController";
import SideMenus from "./components/static/SideMenus";
import {
  dowloadAllFileEvents,
  downloadFileEvent,
  downloadFileMetadata,
} from "services/FileService";
import {
  loadWorkspaceFromRemoteIfExists,
  saveWorkspaceToRemote,
} from "./utils/workspace";
import { Workspace as WorkspaceType } from "./resources/types";
import PlotController from "./components/workspaces/PlotController";
import XML from "xml-js";
import { ParseFlowJoJson } from "services/FlowJoParser";
import { Typography } from "antd";
import IOSSwitch from "Components/common/Switch";
import { memResetDatasetCache } from "./resources/dataset";

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
}));

const WorkspaceInnerComponent = (props: {
  experimentId: string;
  shared: boolean;
}) => {
  const store = useStore();
  const classes = useStyles();
  const history = useHistory();
  const isLoggedIn = userManager.isLoggedIn();

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

  const handleOpen = (func: Function) => {
    func(true);
  };
  const handleClose = (func: Function) => {
    func(false);
  };

  // TODO ONLY UPDATE WHEN STATE IS CHANGED!!!
  //@ts-ignore
  const workspace: WorkspaceType = useSelector((state) => state.workspace);

  useEffect(() => {
    store.dispatch({
      type: "workspace.RESET",
    });

    initializeWorkspace();

    return () => {
      store.dispatch({
        type: "workspace.RESET",
      });
      memResetDatasetCache();
    };
  }, []);

  const initializeWorkspace = async () => {
    try {
      await downloadFileMetadata(props.shared, props.experimentId);
      await loadWorkspaceFromRemoteIfExists(props.shared, props.experimentId);
    } catch {}
    setAutosaveEnabled(true);
  };

  const saveWorkspace = async () => {
    setSavingWorkspace(true);
    await saveWorkspaceToRemote(workspace, props.shared, props.experimentId);
    setSavingWorkspace(false);
  };

  var onLinkShareClick = async () => {
    if (isLoggedIn) {
      saveWorkspace();
    } else if (props.shared) {
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
      setFileUploadInputValue("");
      let downloadedFiles = workspace.files.filter((x) => x.downloaded);
      if (workspace.files.length == downloadedFiles.length) {
        initiateParseFlowJo(result);
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
      await downloadFileEvent(props.shared, fileIds[i], props.experimentId);
    }
    let downlodedFiles = workspace.files.filter((x) => x.downloaded);
    if (workspace.files.length == downlodedFiles.length)
      initiateParseFlowJo(flowJoJson);
  };

  const initiateParseFlowJo = async (flowJoJson: any) => {
    await dowloadAllFileEvents(props.shared, props.experimentId);
    try {
      await ParseFlowJoJson(flowJoJson, workspace.files);
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
    <div
      style={{
        height: "100%",
        padding: 0,
      }}
    >
      {/* == MODALS == */}
      <div>
        <GateNamePrompt />

        <AddFileModal
          open={addFileModalOpen}
          closeCall={{ f: handleClose, ref: setAddFileModalOpen }}
          isShared={props.shared}
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
            store.dispatch({
              type: "workspace.RESET_EVERYTHING_BUT_FILES",
            });
          },
          no: () => {
            handleClose(setClearModal);
          },
        }}
      />

      {/* == STATIC ELEMENTS == */}
      <SideMenus workspace={workspace}></SideMenus>

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
                backgroundColor: "#66a",
                paddingTop: 2,
                paddingBottom: 6,
                WebkitBorderBottomLeftRadius: 0,
                WebkitBorderBottomRightRadius: 0,
              }}
              container
            >
              <Grid container>
                {props.shared ? null : (
                  <Button
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
                )}

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleOpen(setAddFileModalOpen)}
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                  }}
                >
                  Plot sample
                </Button>

                {/* <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleOpen(setGenerateReportModalOpen)}
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                  }}
                >
                  Generate report
                </Button> */}
                {/* <HowToUseModal /> */}

                <Button
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
                    value={fileUploadInputValue}
                    accept=".wsp"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      importFlowJoFunc(e);
                    }}
                  />
                  Import FlowJo (experimental)
                </Button>

                {props.shared === false ? (
                  <Button
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
                ) : null}
                {props.shared === false ? (
                  props.shared ? null : (
                    <div>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => saveWorkspace()}
                        className={classes.topButton}
                        style={{
                          backgroundColor: "#fafafa",
                          width: 137,
                        }}
                      >
                        {savingWorkspace ? (
                          <CircularProgress
                            style={{ width: 20, height: 20 }}
                          ></CircularProgress>
                        ) : (
                          <Typography>Save Workspace</Typography>
                        )}
                      </Button>
                      <FormControlLabel
                        style={{
                          marginLeft: 0,
                          height: 20,
                          marginTop: 4,
                          color: "#fff",
                        }}
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
                    </div>
                  )
                ) : null}
                {/* <Grid style={{ textAlign: "right" }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpen(setClearModal)}
                    className={classes.topButton}
                    style={{
                      backgroundColor: "#fafafa",
                    }}
                  >
                    Themme
                  </Button>
                </Grid> */}
              </Grid>
              {process.env.REACT_APP_NO_WORKSPACES === "true" ? null : (
                <Grid
                  style={{
                    textAlign: "right",
                    paddingRight: 20,
                  }}
                >
                  {props.shared === true ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => onLinkShareClick()}
                      className={classes.topButton}
                      style={{
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <ShareIcon
                        fontSize="small"
                        style={{
                          marginRight: 10,
                        }}
                      ></ShareIcon>
                      Share Workspace
                    </Button>
                  ) : null}
                </Grid>
              )}
            </Grid>

            <Grid style={{ marginTop: 43 }}>
              {/* == NOTICES == */}
              <SmallScreenNotice />
              <PrototypeNotice experimentId={props.experimentId} />

              {!loading ? (
                <PlotController
                  sharedWorkspace={props.shared}
                  experimentId={props.experimentId}
                  workspace={workspace}
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

const WorkspaceComponent = (props: {
  experimentId: string;
  shared: boolean;
}) => {
  return <WorkspaceInnerComponent {...props} />;
};

export default WorkspaceComponent;
