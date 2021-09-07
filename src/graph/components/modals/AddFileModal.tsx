/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Button, CircularProgress, Divider, Grid } from "@material-ui/core";
import { snackbarService } from "uno-material-ui";
import { DownloadOutlined } from "@ant-design/icons";
import { getHumanReadableTimeDifference } from "utils/time";
import { File, FileID } from "graph/resources/types";
import { downloadFileEvent } from "services/FileService";
import * as PlotResource from "graph/resources/plots";
import { getFile, getWorkspace } from "graph/utils/workspace";
import { store } from "redux/store";

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

const AddFileModal = React.memo(
  (props: {
    open: boolean;
    closeCall: { f: Function; ref: Function };
    isShared: boolean;
    experimentId: string;
    filesMetadata: File[];
  }): JSX.Element => {
    const classes = useStyles();

    const filesMetadata = props.filesMetadata;

    const [onHover, setOnHover] = React.useState(-1);

    const [downloading, setDowloading] = useState<FileID[]>([]);

    const downloadFile = async (fileId: string) => {
      setDowloading(downloading.concat(fileId));
      const file = await downloadFileEvent(
        props.isShared,
        fileId,
        props.experimentId
      );
      setDowloading(downloading.filter((e) => e !== fileId));
      await PlotResource.createNewPlotFromFile(getFile(file));
    };

    const downloadAll = () => {
      let files = filesMetadata.map((e) => e.id);
      const workspace = getWorkspace();
      files = files.filter((e) => !(e in workspace.files.map((e) => e.id)));
      files.forEach((e) => downloadFile(e));
      // props.onDownloadFileEvents(downloadingFileIds);
    };

    return (
      <Modal
        open={props.open}
        onClose={() => {
          props.closeCall.f(props.closeCall.ref);
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
            Load and use your Flow Analysis files.
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
              Load all files
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
            {filesMetadata.map((fileMetadata: File, i: number) => {
              const divider =
                i === filesMetadata.length - 1 ? null : (
                  <Divider className={classes.fileSelectDivider} />
                );

              const isDownloading =
                downloading.filter((e) => e === fileMetadata.id).length > 0;

              let isDownloaded = fileMetadata.downloaded;

              return (
                <div
                  key={i.toString() + (fileMetadata.name || fileMetadata.label)}
                >
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
                            ? "Loaded"
                            : isDownloading
                            ? "Loading..."
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
                      {isDownloaded === false ? (
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
                            PlotResource.createNewPlotFromFile(
                              getFile(fileMetadata.id)
                            );
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
            })}
          </div>
        </div>
      </Modal>
    );
  }
);

export default AddFileModal;
