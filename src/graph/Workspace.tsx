import React, { useEffect } from "react";
import { useStore } from "react-redux";
import axios from "axios";
import { useHistory } from "react-router";
import { useLocation } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { snackbarService } from "uno-material-ui";
import { ArrowLeftOutlined } from "@ant-design/icons";
import CircularProgress from "@material-ui/core/CircularProgress";
import ShareIcon from "@material-ui/icons/Share";
import { green } from "@material-ui/core/colors";
import AutorenewRoundedIcon from "@material-ui/icons/AutorenewRounded";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";

import userManager from "Components/users/userManager";
import Gate from "graph/dataManagement/gate/gate";
import PlotData from "graph/dataManagement/plotData";
import { API_CALLS } from "assets/constants/apiCalls";
import { Dbouncer } from "services/Dbouncer";
import HowToUseModal from "./HowToUseModal";
import SmallScreenNotice from "./SmallScreenNotice";
import PrototypeNotice from "./PrototypeNotice";
import { WorkspacesApiFetchParamCreator } from "api_calls/nodejsback";
import staticFileReader from "graph/components/modals/staticFCSFiles/staticFileReader";
import MessageModal from "./components/modals/MessageModal";
import AddFileModal from "./components/modals/AddFileModal";
import GatetNamePrompt from "./components/modals/GateNamePrompt";
import GenerateReportModal from "./components/modals/GenerateReportModal";
import LinkShareModal from "./components/modals/linkShareModal";
import FCSFile from "graph/dataManagement/fcsFile";
import Plots from "./components/workspaces/Plots";
import dataManager from "graph/dataManagement/dataManager";
import WorkspaceStateHelper from "graph/dataManagement/workspaceStateReload";
import SideMenus from "./components/static/SideMenus";

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
    marginLeft: 20,
    height: 35,
  },
  savingProgress: {
    marginLeft: "-10px",
    display: "flex",
    marginRight: "10px",
    animation: "App-logo-spin 1.4s linear infinite",
  },
  saved: {
    marginLeft: "-10px",
    display: "flex",
    marginRight: "10px",
    color: green[500],
  },
}));

// ==== Avoid multiple listeners for screen resize ====
let setWorkspaceAlready = false;
let workspaceSharedLocal = false;
const staticFiles = [
  "transduction_1",
  "transduction_2",
  "transduction_3",
  "erica1",
  "erica2",
  "erica3",
].map((e) => {
  return {
    label: e,
    information: "...",
    fromStatic: e,
    fileSize: 0,
    eventCount: 0,
    lastModified: "X/X/X",
  };
});

function Workspace(props: { experimentId: string }) {
  const store = useStore();
  const [workspace, setWorkspace] = React.useState(null);
  console.log("GENERAL STATE =", workspace);

  useEffect(() => {
    setWorkspace(store.getState().user);
  }, [store, store.getState]);

  const remoteWorkspace = dataManager.isRemoteWorkspace();
  const history = useHistory();
  const isLoggedIn = userManager.isLoggedIn();

  const [sharedWorkspace, setSharedWorkspace] = React.useState(false);
  const [newWorkspaceId, setNewWorkspaceId] = React.useState("");
  const [savingWorkspace, setSavingWorkspace] = React.useState(false);
  const [initPlot, setInitPlot] = React.useState(false);
  const location = useLocation();

  const saveWorkspace = Dbouncer.debounce(() => upsertWorkSpace(false));

  const verifyWorkspace = async (workspaceId: string) => {
    let workspaceData;
    try {
      workspaceData = await axios.post(
        "/api/verifyWorkspace",
        {
          workspaceId: workspaceId,
          experimentId: props.experimentId,
        },
        {}
      );
      dataManager.setWorkspaceIsShared(workspaceData.data["isShared"]);
      setSharedWorkspace(workspaceData.data["isShared"]);
    } catch (e) {
      snackbarService.showSnackbar(
        "Could not verify the workspace, reload the page and try again!",
        "error"
      );
    }
    workspaceSharedLocal = workspaceData.data["isShared"];
    initPlots(workspaceData.data["isShared"]);
    if (workspaceData && workspaceData.data["isShared"])
      loadWorkspaceStatsToDM(
        workspaceData.data["isShared"],
        JSON.parse(workspaceData.data["state"])
      );
  };

  const getWorkspace = async () => {
    let workspaceData;
    try {
      workspaceData = await axios.post(
        "/api/getWorkspace",
        {
          experimentId: props.experimentId,
        },
        {
          headers: {
            token: userManager.getToken(),
          },
        }
      );
      if (workspaceData.data["state"])
        await loadWorkspaceStatsToDM(
          false,
          JSON.parse(workspaceData.data["state"])
        );
    } catch (e) {
      snackbarService.showSnackbar(
        "Could not verify the workspace, reload the page and try again!",
        "error"
      );
    }
    initPlots();
  };

  useEffect(() => {
    dataManager.setExperimentId(props.experimentId);

    let workspaceId = new URLSearchParams(location.search).get("id");
    if (workspaceId) {
      verifyWorkspace(workspaceId);
    } else {
      getWorkspace();
    }

    var downloadedListner = dataManager.addObserver("updateDownloaded", () => {
      setDownloadedFiles(dataManager.downloaded);
    });

    let addPlotListner = dataManager.addObserver(
      "addNewPlotToWorkspace",
      () => {
        autoSaveWorkspace();
      }
    );

    let removePlotListner = dataManager.addObserver(
      "removePlotFromWorkspace",
      () => {
        autoSaveWorkspace();
      }
    );

    let updateWorkspaceListner = dataManager.addObserver(
      "workspaceUpdated",
      () => {
        autoSaveWorkspace();
      }
    );

    var downloadingListner = dataManager.addObserver(
      "updateDownloadingFiles",
      () => {
        setDownloadingFiles(dataManager.downloadingFiles);
      }
    );
    dataManager.letUpdateBeCalledForAutoSave = true;
    return () => {
      setWorkspaceAlready = false;
      dataManager.clearWorkspace();
      dataManager.removeObserver("updateDownloadingFiles", downloadingListner);
      dataManager.removeObserver("updateDownloaded", downloadedListner);
      dataManager.removeObserver("workspaceUpdated", updateWorkspaceListner);
      dataManager.removeObserver("removePlotFromWorkspace", removePlotListner);
      dataManager.removeObserver("addNewPlotToWorkspace", addPlotListner);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoSaveWorkspace = () => {
    if (!workspaceSharedLocal) {
      setSavingWorkspace(true);
      saveWorkspace();
    }
  };

  const initPlots = async (workSpaceShared: boolean = false) => {
    if (observerAdded === false) {
      setObserverAdded(true);
      dataManager.addObserver(
        "addNewGateToWorkspace",
        getNameAndOpenModal,
        true
      );
    }
    if (props.experimentId !== undefined && !setWorkspaceAlready) {
      setWorkspaceAlready = true;
      dataManager.setWorkspaceID(props.experimentId);
      dataManager.addObserver("setWorkspaceLoading", () => {
        const isLoading = dataManager.isWorkspaceLoading();
        setLoading(isLoading);
        if (!isLoading) {
          setLoadModal(false);
        }
      });
    }

    if (
      !workSpaceShared &&
      process.env.REACT_APP_ENFORCE_LOGIN_TO_ANALYSE === "true" &&
      !isLoggedIn
    ) {
      history.push("/login");
    }

    await dataManager.downloadFileMetadata();

    setInitPlot(true);
  };

  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);

  const upsertWorkSpace = (isShared: boolean = false) => {
    setSavingWorkspace(true);
    let stateJson = dataManager.getWorkspaceJSON();
    const updateWorkSpace = WorkspacesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).upsertWorkSpace(userManager.getToken(), {
      experimentId: props.experimentId,
      state: stateJson,
      isShared: isShared,
    });
    axios
      .post(
        updateWorkSpace.url,
        updateWorkSpace.options.body,
        updateWorkSpace.options
      )
      .then((e) => {
        setNewWorkspaceId(e.data.workspaceId);
        setSavingWorkspace(false);
      })
      .catch((e) => {
        setSavingWorkspace(false);
        snackbarService.showSnackbar(
          "Could not save the workspace, reload the page and try again!",
          "error"
        );
      });
  };

  // == General modal logic ==
  const handleOpen = (func: Function) => {
    func(true);
  };
  const handleClose = (func: Function) => {
    func(false);
  };

  // == Add file modal logic ==
  const [linkShareModalOpen, setLinkShareModalOpen] = React.useState(false);
  const [addFileModalOpen, setAddFileModalOpen] = React.useState(false);
  const [generateReportModalOpen, setGenerateReportModalOpen] =
    React.useState(false);
  const [loadModal, setLoadModal] = React.useState(false);
  const [clearModal, setClearModal] = React.useState(false);

  const [observerAdded, setObserverAdded] = React.useState(false);
  const [gateToSend, setGateToSend] = React.useState(null);
  const [namePromptOpen, setNamePromptOpen] = React.useState(false);
  const [downloadedFiles, setDownloadedFiles] = React.useState([]);
  const [downloadingFiles, setDownloadingFiles] = React.useState([]);

  const getNameAndOpenModal = (gate: Gate) => {
    setNamePromptOpen(true);
    setGateToSend(gate);
  };

  const renameGate = (newName: String) => {
    dataManager.getGate(gateToSend[0].id).update({ name: newName });
    setNamePromptOpen(false);
  };

  var getFiles = async (isShared: boolean, fileIds: Array<string>) => {
    let url = isShared ? API_CALLS.sharedFileEvents : API_CALLS.fileEvents;
    let headers = isShared
      ? {}
      : {
          token: userManager.getToken(),
        };

    let datas = await axios.post(
      url,
      {
        experimentId: props.experimentId,
        fileIds: fileIds,
      },
      {
        headers: headers,
      }
    );

    return datas.data;
  };

  var loadWorkspaceStatsToDM = async (
    workspaceShared: boolean,
    workspaceStatearg: any
  ) => {
    if (workspaceStatearg) {
      setLoading(true);
      let workspaceStateReload = new WorkspaceStateHelper(workspaceStatearg);
      let stateFileIds = workspaceStateReload.getFileIds();
      if (stateFileIds && stateFileIds.length) {
        setDownloadingFiles(stateFileIds);
        let eventFiles = await getFiles(workspaceShared, stateFileIds);
        dataManager.updateDownloaded(eventFiles);
        if (!dataManager.ready()) {
          dataManager.createWorkspace();
        }
        for (let i = 0; i < eventFiles.length; i++) {
          workspaceStateReload.addFile(eventFiles[i]);
        }
        dataManager.loadWorkspace(JSON.stringify(workspaceStatearg));
      }
    }
    setLoading(false);
  };

  const handleDownLoadFileEvents = async (fileIds: any[]) => {
    dataManager.downloadFileEvents(fileIds);
  };

  const addFile = (index: number) => {
    if (!dataManager.ready()) {
      snackbarService.showSnackbar("Something went wrong, try again!", "error");
      return;
    }

    const file: any = remoteWorkspace
      ? downloadedFiles[index]
      : staticFiles[index];
    let newFile: FCSFile;
    if (file?.fromStatic) {
      newFile = staticFileReader(file.fromStatic);
    } else {
      newFile = new FCSFile({
        name: file.title,
        id: file.id,
        src: "remote",
        axes: file.channels.map((e: any) => e.value),
        data: file.events,
        plotTypes: file.channels.map((e: any) => e.display),
        remoteData: file,
      });
    }
    const fileID = dataManager.addNewFileToWorkspace(newFile);
    const plot = new PlotData();
    plot.file = dataManager.getFile(fileID);
    dataManager.addNewPlotToWorkspace(plot);
  };

  var onLinkShareClick = async () => {
    if (isLoggedIn) {
      upsertWorkSpace(true);
    } else if (sharedWorkspace) {
      let stateJson = dataManager.getWorkspaceJSON();
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

  return (
    <div
      style={{
        height: "100%",
        padding: 0,
      }}
    >
      {/* == MODALS == */}
      {initPlot ? (
        <div>
          <GatetNamePrompt open={namePromptOpen} sendName={renameGate} />

          <AddFileModal
            open={addFileModalOpen}
            closeCall={{ f: handleClose, ref: setAddFileModalOpen }}
            isShared={sharedWorkspace}
            downloaded={downloadedFiles}
            downloading={downloadingFiles}
            filesMetadata={dataManager.files}
            onDownloadFileEvents={(fileIds) => {
              handleDownLoadFileEvents(fileIds);
            }}
            addFileToWorkspace={(index) => {
              addFile(index);
            }}
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
      ) : null}

      <MessageModal
        open={loadModal}
        closeCall={{ f: handleClose, ref: setLoadModal }}
        message={
          <div>
            <h2>Loading workspace</h2>
            <h3 style={{ color: "#777" }}>
              Please wait, we are collecting your files from the servers...
            </h3>
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
            dataManager.clearWorkspace(true);
          },
          no: () => {
            handleClose(setClearModal);
          },
        }}
      />

      {/* == STATIC ELEMENTS == */}
      <SideMenus></SideMenus>

      {/* == NOTICES == */}
      <SmallScreenNotice />
      <PrototypeNotice experimentId={props.experimentId} />

      {/* == MAIN PANEL == */}
      <Grid
        style={{
          marginTop: 30,
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
            borderRadius: 10,
            marginLeft: 40,
            marginRight: 40,
            boxShadow: "2px 3px 3px #ddd",
          }}
          xs={12}
        >
          {initPlot ? (
            <div>
              <Grid
                style={{
                  backgroundColor: "#66a",
                  paddingTop: 20,
                  paddingBottom: 19,
                  borderRadius: 10,
                  WebkitBorderBottomLeftRadius: 0,
                  WebkitBorderBottomRightRadius: 0,
                }}
                container
              >
                <Grid container xs={9}>
                  {sharedWorkspace ? null : (
                    <Button
                      size="large"
                      variant="contained"
                      style={{
                        backgroundColor: "#fafafa",
                        marginLeft: 20,
                      }}
                      className={classes.topButton}
                      startIcon={<ArrowLeftOutlined style={{ fontSize: 15 }} />}
                      onClick={() => {
                        dataManager.letUpdateBeCalledForAutoSave = false;
                        history.goBack();
                      }}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpen(setAddFileModalOpen)}
                    className={classes.topButton}
                    style={{
                      backgroundColor: "#fafafa",
                    }}
                  >
                    + Add new file
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpen(setGenerateReportModalOpen)}
                    className={classes.topButton}
                    style={{
                      backgroundColor: "#fafafa",
                    }}
                  >
                    Generate report
                  </Button>
                  <HowToUseModal />
                  {/* Uncomment below to have a "print state" button */}

                  {sharedWorkspace ? null : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => upsertWorkSpace()}
                      className={classes.topButton}
                      style={{
                        backgroundColor: "#fafafa",
                      }}
                    >
                      {savingWorkspace ? (
                        <div className={classes.savingProgress}>
                          <AutorenewRoundedIcon />
                        </div>
                      ) : (
                        <div className={classes.saved}>
                          <CheckCircleRoundedIcon />
                        </div>
                      )}
                      Save Workspace
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpen(setClearModal)}
                    className={classes.topButton}
                    style={{
                      backgroundColor: "#fafafa",
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
                {process.env.REACT_APP_NO_WORKSPACES === "true" ? null : (
                  <Grid
                    xs={3}
                    style={{
                      textAlign: "right",
                      paddingRight: 20,
                    }}
                  >
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
                  </Grid>
                )}
              </Grid>

              <Grid>
                {!loading ? (
                  <Plots
                    {...{
                      sharedWorkspace: sharedWorkspace,
                      experimentId: props.experimentId,
                    }}
                  ></Plots>
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
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "100px",
              }}
            >
              <CircularProgress style={{ marginTop: 20, marginBottom: 20 }} />
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default Workspace;
