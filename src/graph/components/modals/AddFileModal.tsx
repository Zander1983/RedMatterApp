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
    title: e,
    information: "...",
    fromStatic: e,
    lastModified: "X/X/X",
  };
});

function useForceUpdate() {
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

const getRemoteFiles = (workspaceId: string): Promise<any[]> => {
  return axios.get("/api/events/" + workspaceId, {
    params: {
      experimentId: workspaceId,
      token: userManager.getToken(),
      organisationId: userManager.getOrganiztionID(),
    },
  });
};

const getRemoteFile = (
  experimentId: string,
  fileId: string,
  isShared: boolean
): any => {
  if (isShared) {
    return axios.post(
      "/api/sharedEvents",
      { experimentId: experimentId, fileIds: [fileId] },
      {}
    );
  } else {
    return axios.get("/api/events/" + experimentId + "/" + fileId, {
      params: {
        experimentId: experimentId,
        organisationId: userManager.getOrganiztionID(),
        fileId: fileId,
      },
      headers: {
        token: userManager.getToken(),
      },
    });
  }
};

const getRemoteFileMetadata = (
  experimentId: string,
  isShared: boolean
): Promise<any> => {
  var params;
  if (isShared) {
    params = ExperimentFilesApiFetchParamCreator(
      {}
    ).experimentFilesWithoutToken(experimentId);
  } else {
    params = ExperimentFilesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).experimentFiles(
      userManager.getOrganiztionID(),
      experimentId,
      userManager.getToken()
    );
  }
  return axios.get(params.url, params.options);
};

let downloading: any[] = [];
let downloaded: any[] = [];

function AddFileModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  isShared: boolean;
  downloaded: any[];
}): JSX.Element {
  const forceUpdate = useForceUpdate();
  const remoteWorkspace = dataManager.isRemoteWorkspace();
  const classes = useStyles();
  const [filesMetadata, setFilesMetadata] = React.useState(
    remoteWorkspace ? [] : staticFiles
  );
  const isLoggedIn = userManager.isLoggedIn();
  useEffect(() => {
    downloaded = props.downloaded ? props.downloaded : [];
    downloading = [];
    if (remoteWorkspace) {
      getRemoteFileMetadata(dataManager.getRemoteWorkspaceID(), props.isShared)
        .then((e) => {
          setFilesMetadata(e.data.files);
        })
        .catch((e) => console.log("[ERROR] ", e, e.response));
      dataManager.addObserver("clearWorkspace", () => {
        downloaded = remoteWorkspace ? [] : staticFiles;
        dataManager.setWorkspaceLoading(false);
      });
    }
  }, []);

  const [onHover, setOnHover] = React.useState(-1);
  const [downloadCopied, setDownloadCopied] = React.useState(false); // integer state
  const addFile = (index: number) => {
    if (!dataManager.ready()) {
      snackbarService.showSnackbar("Something went wrong, try again!", "error");
      return;
    }
    const file: any = downloaded[index];
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
    //@ts-ignore
    if (downloaded.filter((e) => e.id === fileId).length > 0) {
      snackbarService.showSnackbar("File already downloaded", "warning");
      return;
    }
    downloading = downloading.concat(fileId);
    getRemoteFile(dataManager.getRemoteWorkspaceID(), fileId, props.isShared)
      .then((e: any) => (downloaded = downloaded.concat(e.data)))
      .catch((e: any) => {
        snackbarService.showSnackbar(
          "File download failed, try again",
          "error"
        );
      })
      .finally(() => {
        downloading = downloading.filter((e) => e !== fileId);
        forceUpdate();
      });
  };

  const downloadAll = () => {
    //@ts-ignore
    downloading = filesMetadata.map((e) => e.id);
    getRemoteFiles(dataManager.getRemoteWorkspaceID())
      .then((e: any[]) => {
        //@ts-ignore
        downloaded = e.data;
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Failed to dowload files, try again!",
          "error"
        );
      })
      .finally(() => {
        downloading = [];
        forceUpdate();
      });
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
                downloaded.filter((e) => e.id === fileMetadata.id).length > 0;
              const isDownloading =
                downloading.filter((e) => e === fileMetadata.id).length > 0;

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
                        <p style={{ marginTop: -6 }}>
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
                        <p style={{ marginTop: -6 }}>
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
                      {isDownloaded ? (
                        <Button
                          style={{
                            backgroundColor: isDownloaded ? "#66d" : "#99d",
                            color: "white",
                            fontSize: 13,
                            marginLeft: 20,
                          }}
                          onClick={() => {
                            let index: number;
                            for (let i = 0; i < downloaded.length; i++) {
                              //@ts-ignore
                              if (downloaded[i].id === fileMetadata.id) {
                                index = i;
                                break;
                              }
                            }
                            if (index === undefined) {
                              snackbarService.showSnackbar(
                                "File is not dowloaded",
                                "error"
                              );
                              return;
                            }
                            addFile(index);
                            props.closeCall.f(props.closeCall.ref);
                          }}
                          disabled={!isDownloaded}
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
