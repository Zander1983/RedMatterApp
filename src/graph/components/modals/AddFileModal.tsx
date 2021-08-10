/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Button, CircularProgress, Divider, Grid } from "@material-ui/core";
import FCSFile from "graph/dataManagement/fcsFile";
import dataManager from "graph/dataManagement/dataManager";
import PlotData from "graph/dataManagement/plotData";
import { snackbarService } from "uno-material-ui";
import { ConsoleSqlOutlined, DownloadOutlined } from "@ant-design/icons";
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

let downloaded: any[] = [];

function AddFileModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  isShared: boolean;
  downloaded: any[];
  filesMetadata: any[];
  downloading: any[];
  onDownloadFileEvents: (fileIds: any[]) => void;
  addFileToWorkspace: (index: number) => void;
}): JSX.Element {
  const classes = useStyles();

  const [filesMetadata, setFilesMetadata] = React.useState([]);
  const [buttonText, setButtonText] = React.useState("ADD TO WORKSPACE");
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  useEffect(() => {
    setFilesMetadata(props.filesMetadata);
    dataManager.addObserver("clearWorkspace", () => {
      downloaded = [];
      dataManager.setWorkspaceLoading(false);
    });
    return () => {
      downloaded = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [onHover, setOnHover] = React.useState(-1);
  const [downloadCopied, setDownloadCopied] = React.useState(false); // integer state
  const addFile = (index: number) => {
    props.addFileToWorkspace(index);
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
                i === filesMetadata.length - 1 ? null : (
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
                    <Grid container direction="row">
                      <Grid container direction="row">
                        <p style={{ width: "100%" }}>
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
                    </Grid>
                    <div
                      style={{
                        marginBottom: 10,
                        marginLeft: -20,
                        textAlign: "right",
                      }}
                    >
                      <Grid
                        style={{
                          textAlign: "right",
                          flex: 1,
                          flexDirection: "row",
                          display: "inline-block",
                        }}
                      >
                        <Grid style={{ display: "inline-block" }}>
                          {isDownloaded
                            ? "Downloaded"
                            : isDownloading
                            ? "Downloading..."
                            : "Remote"}
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
                              position: "relative",
                              top: 2,
                              marginLeft: 10,
                              backgroundColor: isDownloaded
                                ? "green"
                                : isDownloading
                                ? "#66d"
                                : "#d66",
                            }}
                          ></Grid>
                        </Grid>
                      </Grid>
                      <Button
                        disabled={buttonDisabled}
                        style={{
                          backgroundColor: buttonDisabled ? "#bdbdbd" : "#66d",
                          color: "white",
                          fontSize: 13,
                          marginLeft: 20,
                        }}
                        onClick={async () => {
                          //downloadFile(fileMetadata.id)
                          setButtonText("Downloading...");
                          let file = await dataManager.downloadFileEvent(
                            fileMetadata.id
                          );
                          let newFile = new FCSFile({
                            name: file[0].title,
                            id: file[0].id,
                            src: "remote",
                            axes: file[0].channels.map((e: any) => e.value),
                            data: file[0].events,
                            plotTypes: file[0].channels.map(
                              (e: any) => e.display
                            ),
                            remoteData: file,
                          });
                          const fileID =
                            dataManager.addNewFileToWorkspace(newFile);
                          const plot = new PlotData();
                          plot.file = dataManager.getFile(fileID);
                          dataManager.addNewPlotToWorkspace(plot);
                          setButtonDisabled(true);
                          setButtonText("Added to Workspace");
                        }}
                      >
                        {buttonText}
                      </Button>
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
