/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import {
  Button,
  CircularProgress,
  Divider,
  Grid,
  TextField,
} from "@material-ui/core";

import { getHumanReadableTimeDifference } from "utils/time";
import { File, FileID } from "graph/resources/types";
import { downloadFileEvent } from "services/FileService";
import * as PlotResource from "graph/resources/plots";
import { getFile, getAllFiles, getWorkspace } from "graph/utils/workspace";

import { filterArrayAsPerInput } from "utils/searchFunction";
import useGAEventTrackers from "hooks/useGAEvents";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import {
  createDefaultPlotSnapShot,
  getPlotChannelAndPosition,
} from "../../mark-app/Helper";

const useStyles = makeStyles((theme) => ({
  fileSelectModal: {
    backgroundColor: "#fafafa",
    boxShadow: theme.shadows[6],
    padding: 20,
    width: "800px",
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    height: "90vh",
    top: "5vh",
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
    onPipeline?: { save: Function };
    isShared: boolean;
    experimentId: string;
    pipelineId?: string;
    files: File[];
    selectedFile: string;
  }): JSX.Element => {
    const classes = useStyles();

    const filesMetadata = props.files;
    const files = getAllFiles();
    const [onHover, setOnHover] = React.useState(-1);

    const [downloading, setDowloading] = useState<FileID[]>([]);
    const [fileSearchTerm, setFileSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const eventStacker = useGAEventTrackers("Plot Added.");

    const [nameError, setNameError] = React.useState(false);
    const [name, setName] = React.useState("");

    const downloadFile = async (fileId: string) => {
      let file: File = getFile(fileId);
      if (!file.downloaded) {
        const newId = await downloadFileEvent(
          props.isShared,
          fileId,
          props.experimentId
        );
        if (typeof newId !== "string") {
          throw Error("wtf?");
        }
        file = getFile(newId);
      }
      await PlotResource.createNewPlotFromFile(file);
      props.closeCall.f(props.closeCall.ref);
    };

    useEffect(() => {
      let downloadingFiles: File[] = files.filter((x) => x.downloading);
      let downloadingFileIds: string[] = [];
      if (downloadingFiles && downloadingFiles.length > 0) {
        downloadingFileIds = downloadingFiles.map((x) => x.id);
      }
      setDowloading(downloadingFileIds);
    }, [props.files]);

    const everythingDownloaded = filesMetadata
      .map((e) => e.downloaded)
      .every((e) => e);

    const shownFilesMetadata = filterArrayAsPerInput(
      filesMetadata,
      fileSearchTerm,
      "name"
    );

    const onSetControl = (FileId: any, isDownloading = false) => {
      // eventStacker(`A plot added on experimentID: ${props.experimentId} from file ${FileId}.`);
      if (name?.length === 0) {
        setErrorMessage("Name is Required");
        setNameError(true);
      } else if (name?.length <= 8 || name?.length >= 20) {
        setErrorMessage("Name must be equal 8 to 20 char");
        setNameError(true);
      } else {
        let isSavePermitted = true;
        if (getWorkspace()?.pipelines?.length > 1) {
          const isHasIndex = getWorkspace()?.pipelines?.findIndex(
            (pipeline) => pipeline?.name?.toLowerCase() === name.toLowerCase()
          );
          if (isHasIndex > -1) {
            setErrorMessage("Duplicate name not allowed.");
            setNameError(true);
            isSavePermitted = false;
          }
        }
        if (isSavePermitted) {
          setNameError(false);
          setErrorMessage("This Field Is Required");
          setName("");
          props.onPipeline.save(name, FileId);
        }
      }
      // PlotResource.createNewPlotFromFile(
      //   getFile(fileMetadata.id)
      // );
      //   let selectedFile = null;
      //   if (isDownloading) {
      //     selectedFile = getWorkspace()?.files?.filter(file => file.id === FileId)[0];
      //   } else {
      //     // making the selected file the first element of filesArray
      //     const filesInNewOrder: File[] = [];
      //
      //     for (let i = 0; i < files.length; i++) {
      //       if (files[i].id === FileId) {
      //         files[i].view = false;
      //         selectedFile = files[i];
      //         filesInNewOrder.unshift(files[i]);
      //       } else {
      //         filesInNewOrder.push(files[i]);
      //       }
      //     }
      //     WorkspaceDispatch.SetFiles(filesInNewOrder);
      //   }
      //
      //   // const defaultFile = filesInNewOrder?.filter(file => file.id === fileMetadata.id)[0];
      //   const {xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex} = getPlotChannelAndPosition(selectedFile);
      //   console.log("xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex");
      //   console.log(xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex);
      //   const plotState = createDefaultPlotSnapShot(FileId, props.experimentId, xAxisLabel, yAxisLabel, xAxisIndex, yAxisIndex, props.pipelineId, name);
      //
      //   WorkspaceDispatch.UpdatePlotStates(plotState);
      //   WorkspaceDispatch.UpdateSelectedFile(FileId);
      //   WorkspaceDispatch.UpdatePipelineId(props.pipelineId);
      //
      //   setTimeout(() => {
      //     props.closeCall.f(props.closeCall.ref);
      //   }, 10);
      // }
    };

    return (
      <Modal
        open={props.open}
        onClose={() => {
          props.closeCall.f(props.closeCall.ref);
        }}
      >
        <div className={classes.fileSelectModal}>
          <h2 style={{ margin: 0 }}>{"Name Your Analysis"}</h2>
          <p
            style={{
              color: "#777",
              fontSize: 15,
              textAlign: "center",
              margin: 0,
            }}
          >
            {"Each analysis consists of a pipeline of gates."}
          </p>

          <Grid container direction="row">
            {/* <Grid item xs={4} style={{ paddingRight: 20 }}>
              <Button
                size="large"
                variant="contained"
                style={{
                  backgroundColor: "#66d",
                  color: "white",
                  width: "100%",
                  height: 30,
                  marginBottom: 15,
                }}
                startIcon={
                  everythingDownloaded ? null : (
                    <DownloadOutlined
                      style={{ fontSize: 15, color: "white" }}
                    />
                  )
                }
                onClick={downloadAll}
                // disabled={everythingDownloaded}
              >
                Plot all samples
              </Button>
            </Grid> */}
            <Grid item xs={12}>
              <div>
                <TextField
                  style={{ width: "100%", padding: 0, margin: 0 }}
                  error={nameError}
                  value={name}
                  helperText={errorMessage}
                  autoFocus
                  margin="dense"
                  id="gate-name-textinput"
                  label="Analysis name*"
                  type="text"
                  onChange={(e: any) => {
                    setName(e.target.value);
                  }}
                />
              </div>
            </Grid>
          </Grid>

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
            {shownFilesMetadata.length === 0 ? (
              <Grid style={{ textAlign: "center" }}>
                No files found with search term '{fileSearchTerm}'
              </Grid>
            ) : (
              shownFilesMetadata.map((fileMetadata: File, i: number) => {
                const divider =
                  i === filesMetadata.length - 1 ? null : (
                    <Divider className={classes.fileSelectDivider} />
                  );

                const isDownloading =
                  downloading.filter((e) => e === fileMetadata.id).length > 0;

                let isDownloaded = fileMetadata.downloaded;

                return (
                  <div
                    key={
                      i.toString() + (fileMetadata.name || fileMetadata.label)
                    }
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
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <div style={{ display: "flex" }}>
                            <p>
                              <b>{"Title: "}</b>
                              <span>{fileMetadata.label}</span>
                            </p>
                            <p
                              style={{
                                marginLeft: 10,
                              }}
                            >
                              <b>{"Events: "}</b>
                              <span>{fileMetadata.eventCount}</span>
                            </p>
                          </div>
                          <div
                            style={{
                              marginBottom: 10,
                              marginLeft: -20,
                              textAlign: "right",
                            }}
                          >
                            {isDownloaded === false ? (
                              <Button
                                style={{
                                  backgroundColor: "#66d",
                                  color: "white",
                                  fontSize: 13,
                                  marginLeft: 20,
                                }}
                                disabled={isDownloading}
                                onClick={() =>
                                  onSetControl(fileMetadata.id, isDownloading)
                                }
                              >
                                {isDownloading ? (
                                  <CircularProgress
                                    style={{
                                      color: "white",
                                      width: 23,
                                      height: 23,
                                    }}
                                  />
                                ) : props.selectedFile === fileMetadata.id ? (
                                  "Selected As Control"
                                ) : (
                                  "Set As Control"
                                )}
                              </Button>
                            ) : null}
                            {isDownloaded ? (
                              <Button
                                style={{
                                  backgroundColor: isDownloaded
                                    ? "#66d"
                                    : "#99d",
                                  color: "white",
                                  fontSize: 13,
                                  marginLeft: 20,
                                }}
                                onClick={() =>
                                  onSetControl(fileMetadata.id, isDownloaded)
                                }
                                disabled={isDownloading}
                              >
                                {props.selectedFile === fileMetadata.id
                                  ? "Selected As Control"
                                  : "Set As Control"}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </Grid>
                    </div>
                    {divider}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    );
  }
);

export default AddFileModal;
