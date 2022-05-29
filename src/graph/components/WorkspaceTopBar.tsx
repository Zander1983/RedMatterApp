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
import { getWorkspace, getAllFiles, getFiles } from "graph/utils/workspace";
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
  // setRenderPlotController: React.Dispatch<React.SetStateAction<boolean>>;
  // setPlotCallNeeded: React.Dispatch<React.SetStateAction<boolean>>;
  // setLoader?: React.Dispatch<React.SetStateAction<boolean>>;
}

const TIME_INTERVAL = 35000;

const WorkspaceTopBar = ({
  sharedWorkspace,
  experimentId,
  plotCallNeeded,
  renderPlotController,
}: // setRenderPlotController,
// setPlotCallNeeded,
// setLoader,
Props) => {
  const classes = useStyles();
  const history = useHistory();
  const workspace = getWorkspace();

  const [data, setData] = React.useState<any[]>([]);
  const [heeaderForCSV, setHeaderForCSV] = React.useState<any[]>([]);

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
    let copyOfFiles: any[] = getFiles();
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

  const _renderToolbar = () => {
    let hasGate =
      // @ts-ignore
      getWorkspace().workspaceState?.files?.[getWorkspace()?.selectedFile]
        ?.plots?.length > 1;

    return (
      <Grid
        style={{
          //position: "fixed",
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
                  variant="contained"
                  size="small"
                  onClick={() => handleOpen(setAddFileModalOpen)}
                  className={classes.topButton}
                  style={{
                    backgroundColor: "#fafafa",
                    fontWeight: "bold",
                  }}
                >
                  New Gate Pipeline
                </Button>
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
                  disabled={!hasGate}
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
              </div>
            </span>
          ) : (
            <></>
          )}
        </Grid>
      </Grid>
    );
  };
};

export default WorkspaceTopBar;
