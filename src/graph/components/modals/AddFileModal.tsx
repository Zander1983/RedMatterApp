import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import {
  Button,
  CircularProgress,
  Divider,
  Grid,
  Tooltip,
} from "@material-ui/core";

import dataManager from "graph/dataManagement/dataManager";
import FCSFile from "graph/dataManagement/fcsFile";

import axios from "axios";

import PlotData from "graph/dataManagement/plotData";
import staticFileReader from "./staticFCSFiles/staticFileReader";
import { snackbarService } from "uno-material-ui";
import { DownloadOutlined } from "@ant-design/icons";
import userManager from "Components/users/userManager";
import { ExperimentFilesApiFetchParamCreator } from "api_calls/nodejsback";
import { getHumanReadableTimeDifference } from "utils/time";
import { FileService } from "services/FileService";

const useStyles = makeStyles((theme) => ({
  fileSelectModal: {
    backgroundColor: "#fafafa",
    boxShadow: theme.shadows[6],
    padding: 20,
    width: "800px",
    position: "absolute",
    left: "50%",
    top: "30%",
    marginLeft: "-400px",
    marginTop: "-150px",
    textAlign: "center",
    borderRadius: 10,
    fontFamiliy: "Quicksand",
  },
  fileSelectFileContainer: {
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#efefef",
    borderRadius: 5,
    border: "solid #ddd",
    borderWidth: 0.3,
  },
  fileSelectFileContainerHover: {
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#def",
    borderRadius: 5,
    border: "solid #ddd",
    borderWidth: 0.3,
  },
  fileSelectDivider: {
    marginTop: 10,
    marginBottom: 10,
  },
}));

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

function useForceUpdate() {
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

let downloading: any[] = [];
let downloaded: any[] = [];

function AddFileModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  isShared: boolean;
  downloaded: any[];
  filesMetadata: any[];
  downloading: any[];
  onDownloadFileEvents: (fileIds: any[]) => void;
}): JSX.Element {
  const forceUpdate = useForceUpdate();
  const remoteWorkspace = dataManager.isRemoteWorkspace();
  const classes = useStyles();
  const [filesMetadata, setFilesMetadata] = React.useState([]);
  useEffect(() => {
    if (remoteWorkspace) {
      setFilesMetadata(props.filesMetadata);
      dataManager.addObserver("clearWorkspace", () => {
        downloaded = remoteWorkspace ? [] : staticFiles;
        dataManager.setWorkspaceLoading(false);
      });
    }
    return () => {
      downloading = [];
      downloaded = [];
    };
  }, []);

  const [onHover, setOnHover] = React.useState(-1);
  const [downloadCopied, setDownloadCopied] = React.useState(false); // integer state
  const addFile = (index: number) => {
    if (!dataManager.ready()) {
      snackbarService.showSnackbar("Something went wrong, try again!", "error");
      return;
    }

    const file: any = remoteWorkspace ? props.downloaded[index] : staticFiles[index];
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

  const downloadFile = (fileId: string) => {
    props.onDownloadFileEvents([fileId]);
  };

  const downloadAll = () => {
    let downloadingFileIds = filesMetadata.map((e) => e.id);
    props.onDownloadFileEvents(downloadingFileIds);
  };

  return (
    <Modal
      open={props.open}
      onClose={() => {
        props.closeCall.f(props.closeCall.ref);
      }}
      onRendered={() => {
        if (!downloadCopied) {
          downloaded = downloaded.concat(props.downloaded);
          setDownloadCopied(true);
        }
      }}
    >
      <div className={classes.fileSelectModal}>
        <h2>Open file</h2>

        <p
          style={{
            color: "#777",
            fontSize: 15,
            textAlign: "center",
          }}
        >
          Download and use your Flow Analysis files.
        </p>

        <div>
          <Button
            size="large"
            variant="contained"
            style={{
              backgroundColor: "#66d",
              color: "white",
              marginBottom: 15,
            }}
            startIcon={
              <DownloadOutlined style={{ fontSize: 15, color: "white" }} />
            }
            onClick={() => {
              downloadAll();
            }}
          >
            Download all files
          </Button>
        </div>

        {process.env.REACT_APP_ENABLE_ANONYMOUS_FILE_UPLOAD === "true" ? (
          <div
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <Button
              style={{
                backgroundColor: "#66d",
                color: "white",
                fontSize: 13,
                marginLeft: 20,
              }}
            >
              Upload file (Anonymous)
            </Button>
          </div>
        ) : null}

        <div
          style={{
            backgroundColor: "#fff",
            padding: 15,
            textAlign: "left",
            maxHeight: 500,
            overflowY: "scroll",
            border: "solid #ddd",
            borderRadius: 5,
            borderWidth: 0.3,
          }}
        >
          {downloadCopied ? (
            filesMetadata.map((fileMetadata: any, i: number) => {
              const divider =
                i == filesMetadata.length - 1 ? null : (
                  <Divider className={classes.fileSelectDivider} />
                );
              let isDownloaded =
                //@ts-ignore
                props.downloaded.length > 0
                  ? props.downloaded.filter((e) => e.id === fileMetadata.id)
                      .length > 0
                  : false;

              const isDownloading =
                props.downloading.length > 0
                  ? props.downloading.filter((e) => e === fileMetadata.id)
                      .length > 0
                  : false;

              return (
                <div key={i.toString() + fileMetadata.title}>
                  <div
                    onMouseEnter={() => setOnHover(i)}
                    onMouseLeave={() => setOnHover(-1)}
                    className={
                      onHover === i
                        ? classes.fileSelectFileContainerHover
                        : classes.fileSelectFileContainer
                    }
                  >
                    <Grid container xs={12} direction="row">
                      <Grid direction="row">
                        <p>
                          <b>Title:</b>{" "}
                          <a
                            style={{
                              color: "#777",
                              fontSize: 14,
                            }}
                          >
                            {fileMetadata.label}
                          </a>
                        </p>
                        <div style={{ display: "inline-block" }}>
                          <p
                            style={{
                              marginTop: -6,
                              display: "inline-block",
                            }}
                          >
                            <b>Date:</b>{" "}
                            <a
                              style={{
                                color: "#777",
                                fontSize: 14,
                              }}
                            >
                              {getHumanReadableTimeDifference(
                                new Date(fileMetadata.createdOn),
                                new Date()
                              )}
                            </a>
                          </p>
                          <p
                            style={{
                              marginTop: -6,
                              display: "inline-block",
                              marginLeft: 10,
                            }}
                          >
                            <b>Size:</b>{" "}
                            <a
                              style={{
                                color: "#777",
                                fontSize: 14,
                              }}
                            >
                              {(fileMetadata.fileSize / 1e6).toFixed(2)} MB
                            </a>
                          </p>
                          <p
                            style={{
                              marginTop: -6,
                              display: "inline-block",
                              marginLeft: 10,
                            }}
                          >
                            <b>Events:</b>{" "}
                            <a
                              style={{
                                color: "#777",
                                fontSize: 14,
                              }}
                            >
                              {fileMetadata.eventCount}
                            </a>
                          </p>
                        </div>
                      </Grid>
                      {/* <Grid
                      direction="row"
                      style={{
                        flexGrow: 1,
                      }}
                    ></Grid> */}
                      <Grid
                        style={{
                          float: "right",
                          textAlign: "right",
                          flex: 1,
                          flexDirection: "row",
                          display: "inline-block",
                        }}
                      >
                        <Grid style={{ display: "inline-block" }}>
                          {remoteWorkspace
                            ? isDownloaded
                              ? "Downloaded"
                              : isDownloading
                              ? "Dowloading..."
                              : "Remote"
                            : "Local"}
                        </Grid>
                        <Grid
                          style={{
                            display: "inline-block",
                          }}
                        >
                          <Grid
                            style={{
                              borderRadius: "100%",
                              width: 13,
                              height: 13,
                              marginLeft: 10,
                              backgroundColor:
                                isDownloaded || !remoteWorkspace
                                  ? "green"
                                  : isDownloading
                                  ? "#66d"
                                  : "#d66",
                            }}
                          ></Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <div
                      style={{
                        marginBottom: 10,
                        marginLeft: -20,
                        textAlign: "right",
                      }}
                    >
                      {remoteWorkspace ? (
                        !isDownloaded ? (
                          <Button
                            style={{
                              backgroundColor: "#66d",
                              color: "white",
                              fontSize: 13,
                              marginLeft: 20,
                            }}
                            onClick={() => downloadFile(fileMetadata.id)}
                          >
                            {isDownloading ? (
                              <CircularProgress
                                style={{
                                  color: "white",
                                  width: 23,
                                  height: 23,
                                }}
                              />
                            ) : (
                              "Download"
                            )}
                          </Button>
                        ) : // <Button
                        //   style={{
                        //     backgroundColor: "#d66",
                        //     color: "white",
                        //     fontSize: 13,
                        //     marginLeft: 20,
                        //   }}
                        //   onClick={() => {
                        //     downloaded =
                        //       //@ts-ignore
                        //       downloaded.filter(
                        //         (e) => e.id !== fileMetadata.id
                        //       );
                        //     dataManager.removeFileFromWorkspace(
                        //       fileMetadata.id
                        //     );
                        //     forceUpdate();
                        //   }}
                        // >
                        //   Remove
                        // </Button>
                        null
                      ) : null}
                      {isDownloaded || !remoteWorkspace ? (
                        <Button
                          style={{
                            backgroundColor:
                              isDownloaded || !remoteWorkspace
                                ? "#66d"
                                : "#99d",
                            color: "white",
                            fontSize: 13,
                            marginLeft: 20,
                          }}
                          onClick={() => {
                            let index: number;
                            for (
                              let i = 0;
                              i <
                              (remoteWorkspace
                                ? downloaded.length
                                : staticFiles.length);
                              i++
                            ) {
                              if (
                                remoteWorkspace &&
                                downloaded[i].id === fileMetadata.id
                              ) {
                                index = i;
                                break;
                              }
                              if (
                                !remoteWorkspace &&
                                fileMetadata.label === staticFiles[i].label
                              ) {
                                index = i;
                                break;
                              }
                            }
                            if (index === undefined && remoteWorkspace) {
                              snackbarService.showSnackbar(
                                "File is not dowloaded",
                                "error"
                              );
                              return;
                            }
                            addFile(index);
                            props.closeCall.f(props.closeCall.ref);
                          }}
                          disabled={!isDownloaded && remoteWorkspace}
                        >
                          Add to Workspace
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {divider}
                </div>
              );
            })
          ) : (
            <CircularProgress style={{ marginTop: 20, marginBottom: 20 }} />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default AddFileModal;
