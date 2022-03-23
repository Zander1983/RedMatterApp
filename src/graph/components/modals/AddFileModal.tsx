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

import { SearchOutlined } from "@ant-design/icons";
import { getHumanReadableTimeDifference } from "utils/time";
import { File, FileID } from "graph/resources/types";
import { downloadFileEvent } from "services/FileService";
import * as PlotResource from "graph/resources/plots";
import { getFile, getAllFiles, getWorkspace } from "graph/utils/workspace";

import { filterArrayAsPerInput } from "utils/searchFunction";
import useGAEventTrackers from "hooks/useGAEvents";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import {createDefaultPlotSnapShot, getPlotChannelAndPosition} from "../../mark-app/Helper";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";

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
    closeCall: { f: Function; ref: Function};
    onPipeline?: { save: Function}
    isShared: boolean;
    experimentId: string;
    pipelineId?: string,
    files: File[];
    selectedFile: string;
  }): JSX.Element => {
    const classes = useStyles();

    const filesMetadata = props.files;
    const files = getAllFiles();
    const [onHover, setOnHover] = React.useState(-1);

    const [downloading, setDowloading] = useState<FileID[]>([]);
    const [fileSearchTerm, setFileSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("This Field Is Required");
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

    const onSetControl = (FileId:any, isDownloading = false) => {
     // eventStacker(`A plot added on experimentID: ${props.experimentId} from file ${FileId}.`);
      if(name?.length === 0){
        setErrorMessage("Name is Required");
        setNameError(true)
      }else if(name?.length <= 5 || name?.length >= 20){
        setErrorMessage("Name must be 5 to 20 char");
        setNameError(true)
      }else {
        setNameError(false);
        setErrorMessage("This Field Is Required");
        props.onPipeline.save(name, FileId);
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
          <h2>Pick Control File</h2>

          <p
            style={{
              color: "#777",
              fontSize: 15,
              textAlign: "center",
            }}>
            Load and use your Flow Analysis files.
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
                    style={{ width: "100%" }}
                    error={nameError}
                    value={name}
                    helperText={errorMessage}
                    autoFocus
                    margin="dense"
                    id="gate-name-textinput"
                    label="Enter new pipe line name"
                    type="text"
                    onChange={(e: any) => {
                      setName(e.target.value);
                    }}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <TextField
                style={{ width: "100%" }}
                InputProps={{
                  startAdornment: (
                    <SearchOutlined style={{ marginRight: 10 }} />
                  ),
                }}
                variant="standard"
                onChange={(v) => {
                  if (v.type === "change") {
                    setFileSearchTerm(v.currentTarget.value);
                  }
                }}
              />
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
                            />
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
                            disabled={isDownloading}
                            onClick={() => onSetControl(fileMetadata.id, isDownloading)}>
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
                              backgroundColor: isDownloaded ? "#66d" : "#99d",
                              color: "white",
                              fontSize: 13,
                              marginLeft: 20,
                            }}
                            onClick={() => onSetControl(fileMetadata.id, isDownloaded)}
                            disabled={isDownloading}>
                            {props.selectedFile === fileMetadata.id
                              ? "Selected As Control"
                              : "Set As Control"}
                          </Button>
                        ) : null}
                      </div>
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
