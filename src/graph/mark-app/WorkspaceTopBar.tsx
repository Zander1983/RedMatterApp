import React, { useEffect } from "react";
import { CSVLink } from "react-csv";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useHistory } from "react-router";
import { Button } from "@material-ui/core";
import { getGateName, getGateNameFriendly } from "./Helper";
import { Tooltip } from "@material-ui/core";
import ReactGA from "react-ga";

import {
  createDefaultPlotSnapShot,
  getPlotChannelAndPosition,
  formatEnrichedFiles,
  superAlgorithm,
  getMedian,
} from "graph/mark-app/Helper";

interface Props {
  experimentId: string;
  sharedWorkspace: boolean;
  plotCallNeeded: boolean;
  renderPlotController: boolean;
}

const TIME_INTERVAL = 35000;

const WorkspaceTopBar = (props: any) => {
  const [data, setData] = React.useState<any[]>([]);
  const [heeaderForCSV, setHeaderForCSV] = React.useState<any[]>([]);
  const inputWorkspace = React.createRef();

  ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_ID);

  useEffect(() => {
    updateHeaders();
  }, []);

  const updateHeaders = () => {
    const headers = [
      { label: "File Name", key: "fileName" },
      { label: "Gate Name", key: "gateName" },
      { label: "X Channel", key: "xChannel" },
      { label: "Y Channel", key: "yChannel" },
      { label: "Percentage", key: "percentage" },
    ];
    let copyOfFiles: any[] = props.fcsFiles;
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

  // const downloadPlotAsImage = async () => {
  //   console.log("in downloadPlotAsImage");
  //   // downloading functionality
  //   const plotElement = document.getElementById("entire-table");
  //   const dataUrl = await htmlToImage.toSvg(plotElement);
  //   var link = document.createElement("a");
  //   //link.download = `${plot.population}`;
  //   link.href = dataUrl;
  //   link.click();
  // };

  const downloadCSV = () => {
    if (process.env.REACT_APP_ENV == "production") {
      ReactGA.event({
        category: "Buttons",
        action: "Download CSV button clicked",
      });
    }
    let workspaceState = props.workspaceState;
    // @ts-ignore
    const plots =
      workspaceState &&
      // @ts-ignore
      workspaceState?.files?.[workspaceState.controlFileId]?.plots;
    let isSnapShotCreated = false;
    let copyOfFiles: any[] = props.fcsFiles;
    // if (plots === null || plots === undefined) {
    //   const defaultFile = copyOfFiles?.[0];
    //   const {
    //     xAxisLabel,
    //     yAxisLabel,
    //     xAxisIndex,
    //     yAxisIndex,
    //     xAxisScaleType,
    //     yAxisScaleType,
    //   } = getPlotChannelAndPosition(defaultFile);
    //   workspaceState = createDefaultPlotSnapShot(
    //     defaultFile?.id,
    //     xAxisLabel,
    //     yAxisLabel,
    //     xAxisIndex,
    //     yAxisIndex
    //   );
    //   isSnapShotCreated = true;
    // }

    let fcsFiles: any[] = superAlgorithm(copyOfFiles, workspaceState, true);

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

    fcsFiles = formatEnrichedFiles(fcsFiles, workspaceState);

    const csvData = [];
    const eventsSeparatedByChannels: any = {};
    for (let i = 0; i < fcsFiles.length; i++) {
      eventsSeparatedByChannels[fcsFiles[i].fileId] = [];
    }

    for (let fileIndex = 0; fileIndex < fcsFiles.length; fileIndex++) {
      for (
        let statsIndex = 0;
        statsIndex < fcsFiles[fileIndex].gateStats.length;
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
        if (fcsFiles[fileIndex]?.gateStats[statsIndex]?.percentage) {
          const events =
            fcsFiles[fileIndex]?.gateStats[statsIndex]?.eventsInsideGate;
          channelsObj.percentage =
            fcsFiles[fileIndex]?.gateStats[statsIndex]?.percentage;
          channelsObj.gateName =
            fcsFiles[fileIndex]?.gateStats[statsIndex]?.gateName;
          channelsObj.xChannel =
            fcsFiles[fileIndex].plots[statsIndex].xAxisLabel;
          channelsObj.yChannel =
            fcsFiles[fileIndex].plots[statsIndex].yAxisLabel;

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
                fcsFiles[fileIndex]?.gateStats[statsIndex]?.percentage;
            }
          }

          eventsSeparatedByChannels[fcsFiles[fileIndex].fileId].push(
            JSON.parse(JSON.stringify(channelsObj))
          );
        }
        channelsObj = {};
      }
    }

    for (let fileIndex = 0; fileIndex < fcsFiles.length; fileIndex++) {
      for (
        let channelIndex = 0;
        channelIndex < channels.length;
        channelIndex++
      ) {
        for (
          let statsIndex = 0;
          statsIndex <
          eventsSeparatedByChannels[fcsFiles[fileIndex].fileId].length;
          statsIndex++
        ) {
          if (
            eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex][
              channels[channelIndex]
            ]?.array.length > 0
          ) {
            eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex][
              channels[channelIndex]
            ].mean = (
              eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex][
                channels[channelIndex]
              ]?.sum /
              eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex][
                channels[channelIndex]
              ]?.array.length
            ).toFixed(2);

            eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex][
              channels[channelIndex]
            ].median = getMedian(
              eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex][
                channels[channelIndex]
              ].array
            );
          }
        }
      }
    }

    for (let fileIndex = 0; fileIndex < fcsFiles.length; fileIndex++) {
      for (
        let statsIndex = 0;
        statsIndex <
        eventsSeparatedByChannels[fcsFiles[fileIndex].fileId].length;
        statsIndex++
      ) {
        const stats: any = {
          fileName: fcsFiles[fileIndex]?.label,
          gateName: getGateNameFriendly(
            eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex]
              ?.gateName
          ),
          percentage:
            eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex]
              ?.percentage,
          xChannel:
            eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex]
              ?.xChannel,
          yChannel:
            eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex]
              ?.yChannel,
        };
        for (
          let channelIndex = 0;
          channelIndex < channels.length;
          channelIndex++
        ) {
          const median = `channel${channelIndex}Median`;
          const mean = `channel${channelIndex}Mean`;
          stats[median] =
            eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex][
              channels[channelIndex]
            ]?.median;

          stats[mean] =
            eventsSeparatedByChannels[fcsFiles[fileIndex].fileId][statsIndex][
              channels[channelIndex]
            ]?.mean;
        }
        csvData.push(stats);
      }
    }

    setData(csvData);
  };

  const _renderToolbar = () => {
    return (
      <div
        style={{
          height: "40px",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div
          style={{
            marginRight: "auto",
            marginLeft: "5px",
          }}
        >
          <Button
            variant="outlined"
            style={{
              backgroundColor: "#fafafa",
              color: "#1890ff",
              marginLeft: "auto",
            }}
            onClick={(e) => {
              // const resettedState = resetState();
              // this.setState(resettedState);
              // this.onInitState(workspaceState);
              props.onNewAnlysis();
            }}
          >
            New Analysis
          </Button>
        </div>
        <div
          style={{
            marginRight: "5px",
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => downloadCSV()}
            // className={classes.topButton}
            style={{
              backgroundColor: "#fafafa",
              color: "#1890ff",
              // marginLeft: "auto",
              // marginRight: 10,
              height: "30px",
            }}
            //disabled={!hasGate}
          >
            <CSVLink
              headers={heeaderForCSV}
              data={data}
              filename="WorkspaceReport.csv"
              // className={classes.downloadBtnLayout}
            >
              <GetAppIcon
                fontSize="small"
                style={{ marginRight: 10 }}
              ></GetAppIcon>
              <Tooltip title="download statistics such as the median and mean">
                <>Download All Stats</>
              </Tooltip>
            </CSVLink>
          </Button>
        </div>
        <div
          style={{
            marginRight: "5px",
          }}
        >
          <Tooltip title={"Save the Red Matter Workspace"}>
            <Button
              variant="contained"
              id="save"
              size="small"
              onClick={() => {
                props.saveWorkspace();
              }}
              // className={classes.topButton}
              style={{
                backgroundColor: "#fafafa",
                color: "#1890ff",
                // marginLeft: "auto",
                // marginRight: 10,
                height: "30px",
              }}
              //disabled={!hasGate}
            >
              <GetAppIcon
                fontSize="small"
                style={{ marginRight: 10 }}
              ></GetAppIcon>
              Save Workspace
            </Button>
          </Tooltip>
        </div>
        <div
          style={{
            marginRight: "5px",
          }}
        >
          <Tooltip
            title={
              "Add an existing Red Matter workspace (.red). All added files must have the same file names as when the Workspace was created"
            }
          >
            <Button
              variant="contained"
              style={{
                backgroundColor: "#fafafa",
                color: "#1890ff",
                // marginLeft: "auto",
                // marginRight: 10,
                height: "30px",
              }}
              onClick={() => {
                // eslint-disable-next-line
                //@ts-ignore
                inputWorkspace.current.click();
              }}
            >
              <input
                type="file"
                id="file"
                //@ts-ignore
                ref={inputWorkspace}
                disabled={!props.fcsFiles || props.fcsFiles.length == 0}
                multiple
                accept=".red"
                style={{ display: "none" }}
                onChange={(e) => {
                  props.uploadWorkspace(e.target.files);
                }}
              />
              Add Workspace
            </Button>
          </Tooltip>

          {props.uploadedWorkspace && <span>{props.uploadedWorkspace}</span>}
        </div>
      </div>
    );
  };

  const renderToolBarUI = () => {
    return (
      <>
        {/* == MAIN PANEL == */}
        {_renderToolbar()}
      </>
    );
  };

  return renderToolBarUI();
};

export default WorkspaceTopBar;
