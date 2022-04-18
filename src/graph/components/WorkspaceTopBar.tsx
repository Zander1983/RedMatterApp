import React, { useEffect } from "react";
import { CSVLink } from "react-csv";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import { Button, FormControlLabel, MenuItem, Select } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { snackbarService } from "uno-material-ui";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import { ArrowLeftOutlined } from "@ant-design/icons";
import userManager from "Components/users/userManager";
import { saveWorkspaceStateToServer } from "../utils/workspace";
import { Typography } from "antd";
import WorkspaceDispatch from "../workspaceRedux/workspaceDispatchers";
import IOSSwitch from "../../Components/common/Switch";
import ShareIcon from "assets/images/share.png";
import MessageModal from "./modals/MessageModal";
import AddFileModal from "./modals/AddFileModal";
import axios from "axios";
import { Debounce } from "../../services/Dbouncer";
import LinkShareModal from "./modals/linkShareModal";
//import GateNamePrompt from "./modals/GateNamePrompt";
// @ts-ignore
//import PipeLineNamePrompt from "./modals/PipelineNamePrompt";
import { getWorkspace, getAllFiles } from "graph/utils/workspace";
import { useSelector } from "react-redux";
import useDidMount from "hooks/useDidMount";
import {
  createDefaultPlotSnapShot,
  getPlotChannelAndPosition,
  formatEnrichedFiles,
  superAlgorithm,
  getMedian,
  DEFAULT_PLOT_TYPE,
} from "graph/mark-app/Helper";
import { File } from "graph/resources/types";

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
  downloadBtn: {
    marginLeft: 10,
    backgroundColor: "#fff",
    color: "#000",
  },
  downloadBtnLayout: {
    display: "flex",
    alignItems: "center",
    color: "#000",
    "&:hover": {
      color: "#000",
    },
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

  sharedHeader: {
    width: "100%",
    textAlign: "center",
    paddingTop: "5px",
    fontSize: "19px",
    fontWeight: 500,
    color: "#6fcc88",
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

const TIME_INTERVAL = 35000;

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
  const [autoSaveEnabled, setAutoSaveEnabled] = React.useState(
    !sharedWorkspace
  );
  const [linkShareModalOpen, setLinkShareModalOpen] = React.useState(false);
  const [isSaveNeeded, setSaveNeeded] = React.useState(false);
  const [newWorkspaceId, setNewWorkspaceId] = React.useState("");
  const [activePipelineId, setActivePipelineId] = React.useState("");
  const [pipelines, setPipelines] = React.useState([]);
  const didMount = useDidMount();

  const [data, setData] = React.useState<any[]>([]);
  const [heeaderForCSV, setHeaderForCSV] = React.useState<any[]>([]);

  useEffect(() => {
    updateHeaders();
  }, []);

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
    setSaveNeeded(false);
    setTimeout(() => {
      //@ts-ignore
      setActivePipelineId(
        getWorkspace().activePipelineId || workState?.pipelineId
      );
      //setSaveNeeded(false);
      //setPipelines(getWorkspace()?.pipelines);
    }, 1000);
  }, [workState]);

  useEffect(() => {
    setTimeout(() => {
      if (!isSaveNeeded) setSaveNeeded(true);
      //@ts-ignore
      setPipelines(getWorkspace()?.pipelines);
      setActivePipelineId(getWorkspace()?.activePipelineId);
      setSaveNeeded(false);
    }, 1000);
  }, [activePipeline]);

  const handleOpen = (func: Function) => {
    func(true);
  };

  const onQuite = () => {
    setAddFileModalOpen(false);
  };

  const onPipelineChanged = async (event: any) => {
    setSaveNeeded(false);
    const selectedPipeline = event.target.value;
    // if(window.confirm("After continue you lost last work if you don't save yet. Are you continue?")){
    if (selectedPipeline !== "" && activePipelineId !== selectedPipeline) {
      if (selectedPipeline) {
        setActivePipelineId(selectedPipeline);
        setSaveNeeded(false);
        setLoader(true);
        let response = null;

        setTimeout(async () => {
          if (!sharedWorkspace) {
            response = await axios.get(
              `/api/${experimentId}/pipeline/${selectedPipeline}`,
              { headers: { token: userManager.getToken() } }
            );
          } else {
            response = await axios.get(
              `/api/${experimentId}/pipeline/${selectedPipeline}/shared`
            );
          }

          if (response?.status === 200) {
            setSaveNeeded(false);
            const workspace = response.data.state;
            if (workspace && Object.keys(workspace).length > 0) {
              const workspaceObj = JSON.parse(workspace || "{}");

              await WorkspaceDispatch.SetPlotStates(workspaceObj);
              await WorkspaceDispatch.UpdatePipelineId(selectedPipeline);
              await WorkspaceDispatch.UpdateSelectedFile(
                workspaceObj.selectedFile
              );

              //setActivePipelineId(selectedPipeline);
              await showMessageBox({
                message: response.data.message,
                saverity: "success",
              });
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
              const {
                xAxisLabel,
                yAxisLabel,
                xAxisIndex,
                yAxisIndex,
                xAxisScaleType,
                yAxisScaleType,
              } = getPlotChannelAndPosition(selectedFile);
              const plotState = createDefaultPlotSnapShot(
                selectedFile.id,
                experimentId,
                xAxisLabel,
                yAxisLabel,
                xAxisIndex,
                yAxisIndex,
                selectedPipeline,
                workspaceObj.pipeline.name
              );

              await WorkspaceDispatch.SetPlotStates(plotState);
              await WorkspaceDispatch.UpdatePipelineId(selectedPipeline);
              await WorkspaceDispatch.UpdateSelectedFile(selectedFile.id);
              setActivePipelineId(selectedPipeline);

              await showMessageBox({
                message: "Plot init success",
                saverity: "success",
              });
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
            await handleError({
              message: "Information missing",
              saverity: "error",
            });
          }
        }, 5);
      }
    } else {
      setSaveNeeded(false);
      await showMessageBox({
        message: "Already you here",
        saverity: "success",
      });
    }
    //}
  };

  const onSavePipeline = async (name: any, controlFileId: any) => {
    onQuite();
    setLoader(true);
    setTimeout(async () => {
      const response = await axios.post(
        "/api/pipeline/create",
        {
          organisationId: userManager.getOrganiztionID(),
          experimentId: experimentId,
          name: name,
          controlFileId: controlFileId,
        },
        {
          headers: {
            token: userManager.getToken(),
          },
        }
      );
      if (response?.status === 200) {
        let pipelines = getWorkspace()?.pipelines || [];
        // @ts-ignore
        pipelines.push(response.data);
        // if(pipelines?.length === 1 && response?.data?.isDefault){
        if (pipelines?.length >= 1) {
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
          const {
            xAxisLabel,
            yAxisLabel,
            xAxisIndex,
            yAxisIndex,
            xAxisScaleType,
            yAxisScaleType,
          } = getPlotChannelAndPosition(selectedFile);
          const plotState = createDefaultPlotSnapShot(
            selectedFile.id,
            experimentId,
            xAxisLabel,
            yAxisLabel,
            xAxisIndex,
            yAxisIndex,
            pipelineId,
            name,
            DEFAULT_PLOT_TYPE,
            xAxisScaleType,
            yAxisScaleType
          );
          await WorkspaceDispatch.SetPlotStates(plotState);
          await WorkspaceDispatch.UpdateSelectedFile(selectedFile.id);
          await WorkspaceDispatch.UpdatePipelineId(pipelineId);

          if (pipelines?.length === 1)
            setTimeout(
              () =>
                saveWorkspace(
                  false,
                  null,
                  pipelineId ? pipelineId : activePipelineId
                ),
              5
            );

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
        setLoader(false);
        await handleError({
          message: "Information missing",
          saverity: "error",
        });
      }
    }, 5);
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

  const saveWorkspace = async (
    shared: boolean = false,
    currentState: any = null,
    pipelineId = ""
  ) => {
    setSavingWorkspace(true);
    setSaveNeeded(false);
    // @ts-ignore
    if (
      getWorkspace().selectedFile &&
      // @ts-ignore
      getWorkspace().workspaceState?.files?.[getWorkspace().selectedFile]?.plots
        ?.length > 0
    ) {
      setLastSavedTime(new Date().toLocaleString());
      try {
        await saveWorkspaceStateToServer(
          shared,
          experimentId,
          pipelineId ? pipelineId : activePipelineId,
          currentState
        );
      } catch (err) {
        await handleError(err);
      }
    } else {
      // console.log("TEMP-MESSAGE: Work state empty");
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
      // let stateJson = JSON.stringify(workState);
      // let newWorkspaceDB;
      // try {
      //   newWorkspaceDB = await axios.post(
      //     "/api/upsertSharedWorkspace",
      //     {
      //       //workspaceId: newWorkspaceId,
      //       experimentId: experimentId,
      //       state: stateJson,
      //     },
      //     {}
      //   );
      //   setNewWorkspaceId(newWorkspaceDB.data);
      // } catch (e) {
      //   snackbarService.showSnackbar(
      //     "Could not save shared workspace, reload the page and try again!",
      //     "error"
      //   );
      // }
    }
    handleOpen(setLinkShareModalOpen);
  };

  const updateHeaders = () => {
    const headers = [
      { label: "File Name", key: "fileName" },
      { label: "Gate Name", key: "gateName" },
      { label: "X Channel", key: "xChannel" },
      { label: "Y Channel", key: "yChannel" },
      { label: "Percentage", key: "percentage" },
    ];
    let copyOfFiles: any[] = getWorkspace().files;
    const channels =
      copyOfFiles.length > 0
        ? copyOfFiles[0]?.channels.map(
            (element: any) => element?.label || element?.value
          )
        : [];

    for (let i = 0; i < channels.length; i++) {
      headers.push({ label: `${channels[i]} Mean`, key: `channel${i}Mean` });
      headers.push({
        label: `${channels[i]} Median`,
        key: `channel${i}Median`,
      });
    }
    setHeaderForCSV(headers);
  };

  const downloadCSV = () => {
    let workspaceState = getWorkspace().workspaceState;
    // @ts-ignore
    const plots =
      workspaceState &&
      // @ts-ignore
      workspaceState?.files?.[getWorkspace()?.selectedFile]?.plots;
    let isSnapShotCreated = false;
    let copyOfFiles: any[] = getWorkspace().files;
    if (plots === null || plots === undefined) {
      const defaultFile = copyOfFiles?.[0];
      const {
        xAxisLabel,
        yAxisLabel,
        xAxisIndex,
        yAxisIndex,
        xAxisScaleType,
        yAxisScaleType,
      } = getPlotChannelAndPosition(defaultFile);
      workspaceState = createDefaultPlotSnapShot(
        defaultFile?.id,
        experimentId,
        xAxisLabel,
        yAxisLabel,
        xAxisIndex,
        yAxisIndex
      );
      isSnapShotCreated = true;
    }

    let enrichedFiles: any[] = superAlgorithm(
      copyOfFiles,
      workspaceState,
      true
    );

    const channels =
      copyOfFiles.length > 0
        ? copyOfFiles[0]?.channels.map(
            (element: any) => element?.label || element?.value
          )
        : [];
    const obj: any = {};
    for (let i = 0; i < channels.length; i++) {
      obj[channels[i]] = [];
    }

    enrichedFiles = formatEnrichedFiles(enrichedFiles, workspaceState);
    const csvData = [];
    const eventsSeparatedByChannels: any = {};
    for (let i = 0; i < enrichedFiles.length; i++) {
      eventsSeparatedByChannels[enrichedFiles[i].fileId] = [];
    }

    for (let fileIndex = 0; fileIndex < enrichedFiles.length; fileIndex++) {
      for (
        let statsIndex = 0;
        statsIndex < enrichedFiles[fileIndex].gateStats.length;
        statsIndex++
      ) {
        let channelsObj: any = {};
        for (let i = 0; i < channels.length; i++) {
          channelsObj[channels[i]] = {
            array: [],
            sum: 0,
            mean: 0,
            median: 0,
          };
        }
        channelsObj.percentage = 0;
        channelsObj.gateName = "";
        channelsObj.xChannel = "";
        channelsObj.gateName = "";
        if (enrichedFiles[fileIndex]?.gateStats[statsIndex]?.percentage) {
          const events =
            enrichedFiles[fileIndex]?.gateStats[statsIndex]?.eventsInsideGate;
          channelsObj.percentage =
            enrichedFiles[fileIndex]?.gateStats[statsIndex]?.percentage;
          channelsObj.gateName =
            enrichedFiles[fileIndex]?.gateStats[statsIndex]?.gateName;
          channelsObj.xChannel =
            enrichedFiles[fileIndex].plots[statsIndex].xAxisLabel;
          channelsObj.yChannel =
            enrichedFiles[fileIndex].plots[statsIndex].yAxisLabel;

          for (
            let eventsIndex = 0;
            eventsIndex < events.length;
            eventsIndex++
          ) {
            for (
              let channelIndex = 0;
              channelIndex < events[eventsIndex].length;
              channelIndex++
            ) {
              channelsObj[channels[channelIndex]].array.push(
                events[eventsIndex][channelIndex]
              );
              channelsObj[channels[channelIndex]].sum +=
                events[eventsIndex][channelIndex];
              channelsObj[channels[channelIndex]].percentage =
                enrichedFiles[fileIndex]?.gateStats[statsIndex]?.percentage;
            }
          }

          eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId].push(
            JSON.parse(JSON.stringify(channelsObj))
          );
        }
        channelsObj = {};
      }
    }

    for (let fileIndex = 0; fileIndex < enrichedFiles.length; fileIndex++) {
      for (
        let channelIndex = 0;
        channelIndex < channels.length;
        channelIndex++
      ) {
        for (
          let statsIndex = 0;
          statsIndex <
          eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId].length;
          statsIndex++
        ) {
          if (
            eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
              statsIndex
            ][channels[channelIndex]]?.array.length > 0
          ) {
            eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
              statsIndex
            ][channels[channelIndex]].mean = (
              eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
                statsIndex
              ][channels[channelIndex]]?.sum /
              eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
                statsIndex
              ][channels[channelIndex]]?.array.length
            ).toFixed(2);

            eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
              statsIndex
            ][channels[channelIndex]].median = getMedian(
              eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
                statsIndex
              ][channels[channelIndex]].array
            );
          }
        }
      }
    }

    for (let fileIndex = 0; fileIndex < enrichedFiles.length; fileIndex++) {
      for (
        let statsIndex = 0;
        statsIndex <
        eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId].length;
        statsIndex++
      ) {
        const stats: any = {
          fileName: enrichedFiles[fileIndex]?.label,
          gateName:
            eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
              statsIndex
            ]?.gateName,
          percentage:
            eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
              statsIndex
            ]?.percentage,
          xChannel:
            eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
              statsIndex
            ]?.xChannel,
          yChannel:
            eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
              statsIndex
            ]?.yChannel,
        };
        for (
          let channelIndex = 0;
          channelIndex < channels.length;
          channelIndex++
        ) {
          const median = `channel${channelIndex}Median`;
          const mean = `channel${channelIndex}Mean`;
          stats[median] =
            eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
              statsIndex
            ][channels[channelIndex]]?.median;

          stats[mean] =
            eventsSeparatedByChannels[enrichedFiles[fileIndex].fileId][
              statsIndex
            ][channels[channelIndex]]?.mean;
        }
        csvData.push(stats);
      }
    }

    setData(csvData);
  };

  const clearWorkStateFromServer = async () => {
    // let selectedFileID:any = getWorkspace()?.selectedFile;
    // const defaultFile = selectedFileID ? getWorkspace()?.files?.filter(file => file.id === selectedFileID)?.[0] : getWorkspace()?.files?.[0];
    // console.log(defaultFile);
    // console.log(selectedFileID);
    //  const { xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex, xAxisScaleType, yAxisScaleType } = getPlotChannelAndPosition(defaultFile);
    // const resetState = createDefaultPlotSnapShot(selectedFileID || defaultFile?.id, experimentId, xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex);
    WorkspaceDispatch.ResetWorkspaceExceptFiles();
    await saveWorkspace(false);
  };

  if (autoSaveEnabled && isSaveNeeded) {
    Debounce(() => saveWorkspace(), 4000);
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
              ref: setAddFileModalOpen,
            }}
            onPipeline={{ save: onSavePipeline }}
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
                    fontWeight: "bold",
                  }}
                >
                  {/*// disabled={!!(workspace?.selectedFile)}>*/}
                  New Gate Pipeline
                </Button>
                {/*<Button*/}
                {/*  disabled={true}*/}
                {/*  variant="contained"*/}
                {/*  size="small"*/}
                {/*  onClick={() => handleOpen(setClearModal)}*/}
                {/*  className={classes.topButton}*/}
                {/*  style={{*/}
                {/*    backgroundColor: "#fafafa",*/}
                {/*  }}*/}
                {/*>*/}
                {/*  Clear*/}
                {/*</Button>*/}
                {/* <Button
                  variant="contained"
                  size="small"
                  onClick={() => downloadCSV()}
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                  }}
                >
                  <CSVLink
                    headers={heeaderForCSV}
                    data={data}
                    filename="WorkspaceReport.csv"
                    className={classes.downloadBtnLayout}
                  >
                    <GetAppIcon
                      fontSize="small"
                      style={{ marginRight: 10 }}
                    ></GetAppIcon>
                    Download Stats
                  </CSVLink>
                </Button> */}
                <Button
                  variant="contained"
                  size="small"
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                  }}
                >
                  <span style={{ margin: 5 + "px", padding: 5 + "px" }}>
                    Gate Pipelines:
                    <Select
                      disableUnderline
                      value={activePipelineId}
                      name="pipeline"
                      style={{ width: 200 + "px", marginLeft: 2 + "px" }}
                      onChange={onPipelineChanged}
                    >
                      <MenuItem value="">Select Pipeline</MenuItem>
                      {pipelines &&
                        pipelines?.map((pipeline: any, index: any) => (
                          <MenuItem key={index} value={pipeline?._id}>
                            {pipeline?.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </span>
                </Button>
                <span>
                  <Button
                    disabled={
                      (!plotCallNeeded && !renderPlotController) ||
                      activePipelineId === ""
                    }
                    variant="contained"
                    size="small"
                    onClick={() => saveWorkspace()}
                    className={classes.topButton}
                    style={{
                      backgroundColor: "#fafafa",
                      width: 160,
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
                        Save Gate Pipeline
                      </Typography>
                    )}
                  </Button>
                  {/* <FormControlLabel
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
                        onChange={() => {
                          setAutoSaveEnabled(!autoSaveEnabled);
                          setSaveNeeded(false);
                        }}
                      />
                    }
                  /> */}
                </span>
                {/* {lastSavedTime ? (
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
                        fontSize: 9,
                      }}
                    >
                      saved at {lastSavedTime}
                    </span>
                  </span>
                ) : null} */}
              </div>
              <div>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => downloadCSV()}
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                  }}
                >
                  <CSVLink
                    headers={heeaderForCSV}
                    data={data}
                    filename="WorkspaceReport.csv"
                    className={classes.downloadBtnLayout}
                  >
                    <GetAppIcon
                      fontSize="small"
                      style={{ marginRight: 10 }}
                    ></GetAppIcon>
                    Download Stats
                  </CSVLink>
                </Button>
                <Button
                  disabled={
                    (!plotCallNeeded && !renderPlotController) ||
                    activePipelineId === ""
                  }
                  variant="contained"
                  // size="small"
                  onClick={() => onLinkShareClick()}
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                    marginRight: 10,
                    width: 200,
                  }}
                >
                  <img
                    src={ShareIcon}
                    alt="shareicon"
                    style={{ width: 15, height: 15, marginRight: 10 }}
                  />
                  Share Workspace
                </Button>
              </div>
            </span>
          ) : (
            <div>
              <span style={{ margin: 5 + "px", padding: 5 + "px" }}>
                PipeLine:
                <select
                  value={activePipelineId}
                  name="pipeline"
                  style={{ width: 200 + "px", marginLeft: 2 + "px" }}
                  onChange={onPipelineChanged}
                >
                  <option value="">Select Pipeline</option>
                  {pipelines &&
                    pipelines?.map((pipeline: any, index: any) => (
                      <option key={index} value={pipeline?._id}>
                        {pipeline?.name}
                      </option>
                    ))}
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
              <span className={classes.sharedHeader}>Shared Workspace</span>
            </div>
          )}
        </Grid>
      </Grid>
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
