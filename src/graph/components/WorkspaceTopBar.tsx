import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import { Button,FormControlLabel } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { snackbarService } from "uno-material-ui";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import { ArrowLeftOutlined } from "@ant-design/icons";
import userManager from "Components/users/userManager";
import {saveWorkspaceStateToServer} from "../utils/workspace";
import { Typography } from "antd";
import WorkspaceDispatch from "../workspaceRedux/workspaceDispatchers";
import IOSSwitch from "../../Components/common/Switch";
import ShareIcon from "@material-ui/core/SvgIcon/SvgIcon";
import MessageModal from "./modals/MessageModal";
import AddFileModal from "./modals/AddFileModal";
import axios from "axios";
import { Debounce } from "../../services/Dbouncer";
import LinkShareModal from "./modals/linkShareModal";
//import GateNamePrompt from "./modals/GateNamePrompt";
// @ts-ignore
//import PipeLineNamePrompt from "./modals/PipelineNamePrompt";
import { getWorkspace,getAllFiles } from "graph/utils/workspace";
import { useSelector } from "react-redux";
import useDidMount from "hooks/useDidMount";
import {createDefaultPlotSnapShot, getPlotChannelAndPosition} from "../mark-app/Helper";
import { File} from "graph/resources/types";

const useStyles = makeStyles((theme) => ({
  header: {
    textAlign: "center",
  },
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

interface Props {
  experimentId: string;
  sharedWorkspace: boolean;
  plotCallNeeded: boolean;
  renderPlotController: boolean;
  setRenderPlotController: React.Dispatch<React.SetStateAction<boolean>>;
  setPlotCallNeeded: React.Dispatch<React.SetStateAction<boolean>>;
  setLoader?: React.Dispatch<React.SetStateAction<boolean>>;
}
const WorkspaceTopBarComponent = ({
  sharedWorkspace,
  experimentId,
  plotCallNeeded,
  renderPlotController,
  setRenderPlotController,
  setPlotCallNeeded,
  setLoader,
}: Props) => {
  const classes = useStyles();
  const history = useHistory();
  const workspace = getWorkspace();
  const isLoggedIn = userManager.isLoggedIn();
  const [lastSavedTime, setLastSavedTime] = React.useState(null);
  const [savingWorkspace, setSavingWorkspace] = React.useState(false);
  const [addFileModalOpen, setAddFileModalOpen] = React.useState(false);
  const [pipeLineModalOpen, setPipeLineModalOpen] = React.useState(false);
  const [clearModal, setClearModal] = React.useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = React.useState(false);
  const [linkShareModalOpen, setLinkShareModalOpen] = React.useState(false);
  const [newWorkspaceId, setNewWorkspaceId] = React.useState("");
  const [activePipelineId, setActivePipelineId] = React.useState("");
  const [pipelines, setPipelines] = React.useState([]);
  const didMount = useDidMount();

  //@ts-ignore
  const activePipeline = useSelector((state) => state.workspace);

  //@ts-ignore
  const workState = useSelector((state) => state.workspace.workspaceState);


  // useEffect(() => {
  //   if (didMount && plotLength === 0) {
  //     setRenderPlotController(true);
  //   }
  // }, [plotLength]);

  useEffect(() => {
    setTimeout(() => {
        //@ts-ignore
        setActivePipelineId(activePipeline?.activePipelineId);
        setPipelines(getWorkspace()?.pipelines);
     }, 1000);

  }, [activePipeline]);

  useEffect(() => {
    setTimeout(() => {
      //@ts-ignore
      setActivePipelineId(workState?.pipelineId || workspace.activePipelineId);
      setPipelines(getWorkspace()?.pipelines);
    }, 1000);
  }, [workState]);

  const handleOpen = (func: Function) => {
    func(true);
  };

  const onQuite = () => {
    setAddFileModalOpen(false);
  };

  const onPipelineChanged = async (event:any) => {
      const selectedPipeline = event.target.value;
      // if(window.confirm("After continue you lost last work if you don't save yet. Are you continue?")){
          setActivePipelineId(selectedPipeline);
          if (selectedPipeline !== "" && activePipelineId !== selectedPipeline) {
              if (selectedPipeline) {
                  setLoader(true);
                  const response = await axios.get(`/api/${experimentId}/pipeline/${selectedPipeline}`, {headers: {token: userManager.getToken()}});
                  if (response?.status === 200) {
                      const workspace = response.data.state;
                      if (workspace && Object.keys(workspace).length > 0) {
                          const workspaceObj = JSON.parse(workspace || "{}");
                          await WorkspaceDispatch.SetPlotStates(workspaceObj);
                          await WorkspaceDispatch.UpdateSelectedFile(workspaceObj.selectedFile);
                          await WorkspaceDispatch.UpdatePipelineId(selectedPipeline);
                          setActivePipelineId(selectedPipeline);
                          await showMessageBox({message: response.data.message, saverity: "success"});
                      } else {
                          const workspaceObj = response.data;
                          //const selectedFile = getWorkspace()?.files?.filter(file => file.id === workspaceObj.pipeline.controlFileId)[0];
                          const filesInNewOrder: File[] = [];
                          let files = getAllFiles();
                          let selectedFile = null;
                          for (let i = 0; i < files.length; i++) {
                              if (files[i].id === workspaceObj.pipeline.controlFileId) {
                                  files[i].view = false;
                                  selectedFile = files[i];
                                  filesInNewOrder.unshift(files[i]);
                              } else {
                                  filesInNewOrder.push(files[i]);
                              }
                          }
                          WorkspaceDispatch.SetFiles(filesInNewOrder);
                          const {xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex} = getPlotChannelAndPosition(selectedFile);
                          const plotState = createDefaultPlotSnapShot(selectedFile.id, experimentId, xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex, selectedPipeline, workspaceObj.pipeline.name);
                          await WorkspaceDispatch.SetPlotStates(plotState);
                          await WorkspaceDispatch.UpdateSelectedFile(selectedFile.id);
                          await WorkspaceDispatch.UpdatePipelineId(selectedPipeline);
                          setActivePipelineId(selectedPipeline);
                          await showMessageBox({message: "Plot init success", saverity: "success"});
                      }

                      if (!renderPlotController) {
                          setRenderPlotController(true);
                      }
                      setPlotCallNeeded(false);
                      if (renderPlotController) {
                          setPlotCallNeeded(true);
                      }
                      setLoader(false);
                  } else {
                      setLoader(false);
                      await handleError({message: "Information missing", saverity: "error"});
                  }
              }
          } else {
              await showMessageBox({message: "Already you here", saverity: "success"});
          }
      //}
  };

  const onSavePipeline = async (name:any, controlFileId:any) => {
    const response = await axios.post("/api/pipeline/create",
        {
          organisationId:userManager.getOrganiztionID(),
          experimentId:experimentId,
          name:name,
          controlFileId:controlFileId
        },
        {
          headers:{
            token:userManager.getToken()
          }
        });
    if (response?.status === 200) {
      let pipelines = getWorkspace()?.pipelines || [];
      // @ts-ignore
      pipelines.push(response.data);
      // if(pipelines?.length === 1 && response?.data?.isDefault){
      if(pipelines?.length >= 1){
          const pipelineId = response.data._id;
          setActivePipelineId(pipelineId);
          const filesInNewOrder: File[] = [];
          let files = getAllFiles();
          let selectedFile = null;
          for (let i = 0; i < files.length; i++) {
              if (files[i].id === controlFileId) {
                  files[i].view = false;
                  selectedFile = files[i];
                  filesInNewOrder.unshift(files[i]);
              } else {
                  filesInNewOrder.push(files[i]);
              }
          }
          WorkspaceDispatch.SetFiles(filesInNewOrder);
          const {xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex} = getPlotChannelAndPosition(selectedFile);
          const plotState = createDefaultPlotSnapShot(selectedFile.id, experimentId, xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex, pipelineId, name);
          await WorkspaceDispatch.SetPlotStates(plotState);
          await WorkspaceDispatch.UpdateSelectedFile(selectedFile.id);
          await WorkspaceDispatch.UpdatePipelineId(pipelineId);

          if(pipelines?.length === 1)
              setTimeout(() => saveWorkspace(false, null, pipelineId ? pipelineId : activePipelineId),5);

          if (!renderPlotController) {
              setRenderPlotController(true);
          }
          setPlotCallNeeded(false);
          if (renderPlotController) {
              setPlotCallNeeded(true);
          }
          setLoader(false);
      }
      setPipelines(pipelines);
      WorkspaceDispatch.SetPipeLines(pipelines);
      await showMessageBox({
        message: "Created Success",
        saverity: "success",
      });

    } else {
      await handleError({
        message: "Information missing",
        saverity: "error",
      });
    }
    onQuite();
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  const handleCloseAndMakePlotControllerTrue = (func: Function) => {
    if (!renderPlotController) {
      setRenderPlotController(true);
    }
    setPlotCallNeeded(false);
    if (renderPlotController) {
      setPlotCallNeeded(true);
    }
    func(false);
  };

  const handleCloseClearWorkspace = (func: Function) => {
    if (!renderPlotController) {
      setRenderPlotController(true);
    }
    setPlotCallNeeded(false);
    if (renderPlotController) {
      setPlotCallNeeded(true);
    }
    func(false);
  };

  const saveWorkspace = async (shared: boolean = false, currentState:any = null, pipelineId = "") => {
    setSavingWorkspace(true);
    // @ts-ignore
      if(getWorkspace().selectedFile && getWorkspace().workspaceState?.files?.[getWorkspace().selectedFile]?.plots?.length > 0) {
        setLastSavedTime(new Date().toLocaleString());
        try {
            await saveWorkspaceStateToServer(shared, experimentId, pipelineId ? pipelineId : activePipelineId, currentState);
        } catch (err) {
            await handleError(err);
        }
    }else {
        await showMessageBox({message:"Plot not available for save", saverity:"success"});
    }
    setSavingWorkspace(false);
  };

  const handleError = async (error: any) => {
    if (
      error?.name === "Error" ||
      error?.message.toString() === "Network Error"
    ) {
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

  var onLinkShareClick = async () => {
    if (isLoggedIn) {
      await saveWorkspace(true);
    } else if (sharedWorkspace) {
      let stateJson = JSON.stringify(workspace);
      let newWorkspaceDB;
      try {
        newWorkspaceDB = await axios.post(
          "/api/upsertSharedWorkspace",
          {
            workspaceId: newWorkspaceId,
            experimentId: experimentId,
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

  const _renderToolbar = () => {
    // console.log("==== render toolbar =====");
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
        container>
        <Grid container>
          {workspace.editWorkspace ? (
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
                  disabled={!plotCallNeeded && !renderPlotController}
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
                  }}>
                  {/*// disabled={!!(workspace?.selectedFile)}>*/}
                  New Analysis
                </Button>
                <Button
                  disabled={true}
                  variant="contained"
                  size="small"
                  onClick={() => handleOpen(setClearModal)}
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                  }}>
                  Clear
                </Button>
                <span style={{margin:5+'px', padding:5 + 'px'}}>
                    PipeLine:
                    <select value={activePipelineId} name="pipeline" style={{width:200+'px',marginLeft:2+'px'}} onChange={onPipelineChanged}>
                      <option value="">Select Pipeline</option>
                        {pipelines && pipelines?.map((pipeline:any, index:any) => <option key={index} value={pipeline?._id}>{pipeline?.name}</option>)}
                    </select>
                  {/*<Button*/}
                  {/*    disabled={!plotCallNeeded && !renderPlotController}*/}
                  {/*    variant="contained"*/}
                  {/*    size="small"*/}
                  {/*    onClick={() => setPipeLineModalOpen(true)}*/}
                  {/*    className={classes.topButton}*/}
                  {/*    style={{*/}
                  {/*      backgroundColor: "#fafafa",*/}
                  {/*      width: 137,*/}
                  {/*    }}>*/}
                  {/*  +New*/}
                  {/*</Button>*/}
                    </span>
                <span>
                  <Button
                    disabled={(!plotCallNeeded && !renderPlotController) || activePipelineId === ""}
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
                      <CircularProgress style={{ width: 20, height: 20 }} />
                    ) : (
                      <Typography
                        style={{
                          color:
                            !plotCallNeeded && !renderPlotController
                              ? "rgba(0, 0, 0, 0.26)"
                              : "black",
                        }}
                      >
                        Save Workspace
                      </Typography>
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
                        disabled={!plotCallNeeded && !renderPlotController}
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

  const clearWorkStateFromServer = async () => {
    // let selectedFileID:any = getWorkspace()?.selectedFile;
    // const defaultFile = selectedFileID ? getWorkspace()?.files?.filter(file => file.id === selectedFileID)?.[0] : getWorkspace()?.files?.[0];
    // console.log(defaultFile);
    // console.log(selectedFileID);
    //  const {xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex} = getPlotChannelAndPosition(defaultFile);
    // const resetState = createDefaultPlotSnapShot(selectedFileID || defaultFile?.id, experimentId, xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex);
    WorkspaceDispatch.ResetWorkspaceExceptFiles();
    await saveWorkspace(false);
  };

  if (autoSaveEnabled) {
      //console.log("== gate save updated 3 =====");
    // if (plotCallNeeded) {
        //console.log("== gate save updated 4 =====");
      Debounce(() => saveWorkspace(), 2000);
    // }
  }

  const renderModal = () => {
    return (
      <>
        {/*<GateNamePrompt />*/}
        {/*<PipeLineNamePrompt*/}
        {/*    open={pipeLineModalOpen}*/}
        {/*    pipelines={pipelines}*/}
        {/*    setOpen={setPipeLineModalOpen}*/}
        {/*    closeCall={{*/}
        {/*      quit: onQuite,*/}
        {/*      save: onSavePipeline,*/}
        {/*    }}/>*/}
        {workspace?.files?.length > 0 && (
          <AddFileModal
            open={addFileModalOpen}
            closeCall={{
              f: handleCloseAndMakePlotControllerTrue,
              ref: setAddFileModalOpen
            }}
            onPipeline={{save: onSavePipeline}}
            isShared={sharedWorkspace}
            experimentId={experimentId}
            pipelineId={getWorkspace().activePipelineId || activePipelineId}
            files={getWorkspace()?.files}
            selectedFile={getWorkspace()?.selectedFile}
          />
        )}
        <MessageModal
          open={clearModal}
          closeCall={{
            f: handleCloseClearWorkspace,
            ref: setClearModal,
          }}
          message={
            <div>
              <h2>Are you sure you want to delete the entire workspace?</h2>
              <p style={{ marginLeft: 100, marginRight: 100 }}>
                The links you've shared with "share workspace" will still work,
                if you want to access this in the future, make sure to store
                them.
              </p>
            </div>
          }
          options={{
            yes: () => {
              clearWorkStateFromServer();
            },
            no: () => {
              handleClose(setClearModal);
            },
          }}
        />

        <LinkShareModal
          open={linkShareModalOpen}
          workspaceId={newWorkspaceId}
          closeCall={{ f: handleClose, ref: setLinkShareModalOpen }}
        />
      </>
    );
  };

  const renderToolBarUI = () => {
    return (
      <>
        {/* == MODALS == */}
        {renderModal()}
        {/* == MAIN PANEL == */}
        {_renderToolbar()}
      </>
    );
  };

  return renderToolBarUI();
};

export default WorkspaceTopBarComponent;
