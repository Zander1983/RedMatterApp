import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

import {
  Grid,
  Button,
  CircularProgress,
  Divider,
  TextField,
  withStyles,
} from "@material-ui/core";

import userManager from "Components/users/userManager";
import { snackbarService } from "uno-material-ui";
import {
  WorkspaceFilesApiFetchParamCreator,
  WorkspacesApiFetchParamCreator,
} from "api_calls/nodejsback";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteFilled,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import UploadFileModal from "./modals/UploadFileModal";
import { getHumanReadableTimeDifference } from "utils/time";
import oldBackFileUploader from "utils/oldBackFileUploader";

const styles = {
  input: {
    color: "white",
    borderBottom: "solid 1px white",
    height: 30,
  },
};

const Workspace = (props: any) => {
  const [workspaceData, setWorkpsaceData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [onDropZone, setOnDropZone] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [experiments, setExperiments] = useState([]);

  const [workspaceSize, setWorkspaceSize] = useState(0);
  const [maxWorkspaceSize, setMaxWorkspaceSize] = useState(
    parseInt(process.env.REACT_APP_MAX_WORKSPACE_SIZE_IN_BYTES)
  );

  const { classes } = props;
  const history = useHistory();
  const inputFile = React.useRef(null);

  const isLoggedIn = userManager.isLoggedIn();
  if (!isLoggedIn) {
    history.replace("/login");
  }

  if (process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/");
  }

  const allowedInThisWorkspace = userManager.canAccessWorkspace(props.id);
  if (!allowedInThisWorkspace) {
    snackbarService.showSnackbar(
      "You are not allowed in this experiment",
      "warning"
    );
    history.replace("/experiments");
  }

  const fetchWorkspaceData = (snack = true, callback?: Function) => {
    const fetchWorkspaces = WorkspaceFilesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).workspaceFiles(
      userManager.getOrganiztionID(),
      props.id,
      userManager.getToken()
    );

    axios
      .get(fetchWorkspaces.url, fetchWorkspaces.options)
      .then((e) => {
        setWorkpsaceData(e.data);
        let sizeSum = 0;
        for (const file of e.data.files) {
          sizeSum += file.fileSize;
        }
        setWorkspaceSize(sizeSum);
      })
      .catch((e) => {
        if (snack)
          snackbarService.showSnackbar(
            "Failed to find this experiment, reload the page to try again!",
            "error"
          );
        userManager.logout();
      })
      .finally(() => {
        if (callback !== undefined) callback();
      });
  };

  const updateWorkspace = (snack = true) => {
    const updateWorkspace = WorkspacesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).editWorkspace(
      props.id,
      workspaceData.workspaceName,
      userManager.getToken()
    );

    axios
      .put(updateWorkspace.url, {}, updateWorkspace.options)
      .then((e) => {
        if (snack)
          snackbarService.showSnackbar("Experiment updated", "success");
      })
      .catch((e) => {
        if (snack)
          snackbarService.showSnackbar(
            "Failed to update this experiment, reload the page to try again!",
            "error"
          );
      });
  };

  const getExperiments = () => {
    axios
      .get("/api/workspace/" + props.id + "/experiments/", {
        headers: {
          token: userManager.getToken(),
        },
      })
      .then((e) => {
        setExperiments(e.data);
      })
      .catch((e) => {});
  };

  const uploadFiles = (files: FileList) => {
    const fileList: { tempId: string; file: File }[] = [];
    let listSize = 0;
    for (const file of Array.from(files)) {
      listSize += file.size;
      if (file.name.split(".")[1] !== "fcs") {
        snackbarService.showSnackbar(
          file.name.substring(0, 20) +
            (file.name.length > 20 ? "..." : "") +
            '"' +
            'Is not a .fcs file: "',
          "error"
        );
        continue;
      }
      const id = Math.random().toString(36).substring(7);
      fileList.push({ tempId: id, file });
    }
    if (listSize + workspaceSize > maxWorkspaceSize) {
      snackbarService.showSnackbar(
        "Files passed go above experiment size limit, total size would be " +
          ((listSize + workspaceSize) / 1e6).toFixed(2) +
          "MB",
        "error"
      );
      return;
    }
    setUploadingFiles([
      ...uploadingFiles,
      ...fileList.map((e) => {
        return { name: e.file.name, id: e.tempId };
      }),
    ]);
    for (const file of fileList) {
      oldBackFileUploader(
        userManager.getToken(),
        props.id,
        userManager.getOrganiztionID(),
        file.file
      )
        .then((e) => {
          snackbarService.showSnackbar("Uploaded " + file.file.name, "success");
        })
        .catch((e) => {
          snackbarService.showSnackbar(
            "Error uploading file " +
              file.file.name.substring(0, 20) +
              (file.file.name.length > 20 ? ",,," : "") +
              ", please try again",
            "error"
          );
        })
        .finally(() => {
          fetchWorkspaceData(false, () => {
            setUploadingFiles(
              uploadingFiles.filter((e) => e.id !== file.tempId)
            );
          });
        });
    }
  };

  const deleteFile = (file: any) => {
    const fetchWorkspaces = WorkspaceFilesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).deleteFile(props.id, file.id, userManager.getToken());

    axios
      .delete(fetchWorkspaces.url, fetchWorkspaces.options)
      .then((e) => {
        snackbarService.showSnackbar("File deleted!", "success");
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Failed to delete file, try again.",
          "error"
        );
      })
      .finally(() => {
        fetchWorkspaceData();
      });
  };

  const updateSize = (newSize: number) => {
    setWorkspaceSize(newSize);
  };

  useEffect(() => {
    fetchWorkspaceData();
    getExperiments();
  }, []);

  const handleClose = (func: Function) => {
    func(false);
  };
  const [uploadFileModalOpen, setUploadFileModalOpen] = React.useState(false);

  return (
    <>
      {}
      <UploadFileModal
        open={uploadFileModalOpen}
        closeCall={{
          f: handleClose,
          ref: setUploadFileModalOpen,
        }}
        added={() => {
          fetchWorkspaceData(false);
        }}
        workspace={{
          ...workspaceData,
          id: props.id,
        }}
      />
      <Grid
        style={{
          justifyContent: "center",
          display: "flex",
          marginTop: 30,
          marginLeft: "auto",
          marginRight: "auto",
        }}
        container
        xs={12}
        md={10}
        lg={8}
      >
        <Grid
          style={{
            backgroundColor: "#fafafa",
            borderRadius: 10,
            marginLeft: 40,
            marginRight: 40,
            boxShadow: "2px 3px 3px #ddd",
          }}
          xs={12}
        >
          <Grid style={{ borderRadius: 5 }}>
            <Grid
              container
              lg={12}
              sm={12}
              style={{
                backgroundColor: "#66a",
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                padding: 20,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="contained"
                style={{
                  backgroundColor: "#fafafa",
                  maxHeight: 50,
                  marginRight: 20,
                }}
                startIcon={<ArrowLeftOutlined style={{ fontSize: 15 }} />}
                onClick={() => {
                  history.push("/experiments");
                }}
              >
                Back
              </Button>
              <div>
                {workspaceData === null ? (
                  <CircularProgress
                    style={{ width: 20, height: 20, color: "white" }}
                  />
                ) : (
                  <Grid
                    xs={12}
                    direction="row"
                    style={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 20,
                    }}
                  >
                    {editingName ? (
                      <TextField
                        InputProps={{
                          className: classes.input,
                        }}
                        value={workspaceData.workspaceName}
                        onChange={(e: any) => {
                          setWorkpsaceData({
                            ...workspaceData,
                            workspaceName: e.target.value,
                          });
                        }}
                        onKeyDown={(e: any) => {
                          if (e.keyCode === 13) {
                            setEditingName(false);
                            updateWorkspace();
                          }
                        }}
                      ></TextField>
                    ) : (
                      workspaceData.workspaceName
                    )}
                    <Button
                      style={{ fontSize: 20, marginLeft: 20 }}
                      onClick={() => setEditingName(!editingName)}
                    >
                      <EditOutlined
                        style={{
                          color: "white",
                          borderRadius: 5,
                          marginTop: -4,
                          border: "solid 1px #fff",
                          padding: 3,
                        }}
                      />
                    </Button>
                  </Grid>
                )}
              </div>
              <Button
                variant="contained"
                style={{ backgroundColor: "#fafafa", maxHeight: 50 }}
                onClick={() =>
                  history.push("/experiment/" + props.id + "/plots")
                }
                endIcon={<ArrowRightOutlined style={{ fontSize: 15 }} />}
              >
                Workspace
              </Button>
            </Grid>
            <Grid
              style={{
                backgroundColor: onDropZone ? "#eef" : "#fafafa",
                borderBottomRightRadius: 10,
                borderBottomLeftRadius: 10,
                padding: 10,
                paddingTop: 5,
              }}
              onDrop={(e) => {
                e.preventDefault();
                uploadFiles(e.dataTransfer.files);
                setOnDropZone(false);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOnDropZone(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setOnDropZone(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setOnDropZone(false);
              }}
            >
              <Grid style={{ textAlign: "center" }}>
                Experiment size limit: <b>{maxWorkspaceSize / 1e6}MB</b>
              </Grid>
              <Grid
                xs={12}
                style={{
                  backgroundColor: "#ddd",
                  border: "solid 1px #bbb",
                  height: 22,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <Grid
                  xs={12}
                  style={{
                    backgroundColor:
                      workspaceSize === 0
                        ? "rgba(0,0,0,0)"
                        : workspaceSize > 0.7 * maxWorkspaceSize
                        ? workspaceSize > 0.85 * maxWorkspaceSize
                          ? "#AA66AA"
                          : "#8866AA"
                        : "#6666AA",
                    height: 20,
                    width:
                      Math.round((workspaceSize * 100) / maxWorkspaceSize) +
                      "%",
                    borderRadius: 10,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {workspaceSize > 0.1 * maxWorkspaceSize
                    ? (workspaceSize / 1e6).toFixed(2) + "MB"
                    : ""}
                </Grid>
              </Grid>
              <Grid xs={12} style={{ textAlign: "center" }}>
                {/*@ts-ignore*/}
                {/* {experiments.length > 0
                  ? JSON.stringify(experiments[0].details)
                  : null} */}
                <Grid
                  container
                  direction="row"
                  style={{
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <h1 style={{ fontWeight: 600, marginBottom: -8 }}>
                      Experiment Files
                    </h1>
                    <p
                      style={{
                        fontSize: 14,
                      }}
                    >
                      To upload files, drag and drop them here or click the
                      upload button
                    </p>
                  </div>
                  <div>
                    <Button
                      variant="contained"
                      style={{
                        backgroundColor: "#6666AA",
                        maxHeight: 50,
                        marginTop: 5,
                        color: "white",
                      }}
                      onClick={() => {
                        inputFile.current.click();
                      }}
                    >
                      <input
                        type="file"
                        id="file"
                        ref={inputFile}
                        multiple
                        accept=".fcs"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          uploadFiles(e.target.files);
                        }}
                      />
                      Upload File
                    </Button>
                  </div>
                </Grid>
                <Divider style={{ marginBottom: 10 }}></Divider>
                {workspaceData === null ? (
                  <CircularProgress />
                ) : workspaceData.files.length === 0 &&
                  uploadingFiles.length === 0 ? (
                  <h3 style={{ color: "#777" }}>
                    There are no files in this experiment
                  </h3>
                ) : (
                  workspaceData.files.map((e: any, i: number) => {
                    return (
                      <>
                        <Grid
                          item
                          xs={12}
                          style={{
                            textAlign: "left",
                            marginTop: 15,
                            marginLeft: 10,
                          }}
                        >
                          <h3>
                            <b
                              style={{
                                backgroundColor: "#ddf",
                                border: "solid 1px #ddd",
                                borderRadius: 5,
                                padding: 5,
                              }}
                            >
                              .fcs file
                            </b>
                            <div style={{ display: "inline", width: 10 }}>
                              <Button
                                onClick={() => {
                                  deleteFile(e);
                                }}
                                style={{ marginTop: -3 }}
                              >
                                <DeleteFilled
                                  style={{ color: "#6666aa" }}
                                ></DeleteFilled>
                              </Button>
                            </div>
                            {e.label}
                            {"   "}•{"   "}
                            <b
                              style={{
                                fontSize: 15,
                                fontWeight: 500,
                                color: "#777",
                              }}
                            >
                              {getHumanReadableTimeDifference(
                                new Date(e.createdOn),
                                new Date()
                              )}{" "}
                              {getHumanReadableTimeDifference(
                                new Date(e.createdOn),
                                new Date()
                              ) == "just now"
                                ? ""
                                : "ago"}
                            </b>
                            {"   "}•{"   "}
                            <b
                              style={{
                                fontSize: 15,
                                fontWeight: 500,
                                color: "#777",
                              }}
                            >
                              {(e.fileSize / 1e6).toFixed(2) + "MB"}
                            </b>
                          </h3>
                        </Grid>
                        {i !== workspaceData.files.length - 1 ? (
                          <Divider
                            style={{ marginTop: 15, marginBottom: 15 }}
                          ></Divider>
                        ) : null}
                      </>
                    );
                  })
                )}
                {workspaceData !== null &&
                uploadingFiles.length > 0 &&
                workspaceData.files.length > 0 ? (
                  <Divider
                    style={{ marginTop: 15, marginBottom: 15 }}
                  ></Divider>
                ) : null}
                {uploadingFiles.map((e: any, i: number) => {
                  return (
                    <>
                      <Grid
                        item
                        xs={12}
                        style={{
                          textAlign: "left",
                          marginTop: 15,
                          marginLeft: 10,
                        }}
                      >
                        <h3>
                          <b
                            style={{
                              backgroundColor: "#dfd",
                              border: "solid 1px #ddd",
                              borderRadius: 5,
                              padding: 5,
                              marginRight: 10,
                            }}
                          >
                            .fcs file
                          </b>
                          {e.name}
                          <CircularProgress
                            style={{
                              height: 16,
                              width: 16,
                              marginLeft: 20,
                              marginBottom: -3,
                            }}
                          ></CircularProgress>
                        </h3>
                      </Grid>
                      {i !== uploadingFiles.length - 1 ? (
                        <Divider
                          style={{ marginTop: 15, marginBottom: 15 }}
                        ></Divider>
                      ) : null}
                    </>
                  );
                })}
                {experiments.length > 0 ? (
                  <>
                    <Divider style={{ marginBottom: 10 }}></Divider>
                    <Grid
                      container
                      direction="row"
                      style={{
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ textAlign: "left" }}>
                        <h1 style={{ fontWeight: 600, marginBottom: 0 }}>
                          Experiment Details
                        </h1>
                        {experiments[0].details.device != undefined ? (
                          <h4>• Device: {experiments[0].details.device}</h4>
                        ) : null}
                        {experiments[0].details.cellType != undefined ? (
                          <h4>
                            • Cell type: {experiments[0].details.cellType}
                          </h4>
                        ) : null}
                        {experiments[0].details.particleSize != undefined ? (
                          <h4>
                            • Particle size:{" "}
                            {experiments[0].details.particleSize}
                          </h4>
                        ) : null}
                        {experiments[0].details.fluorophoresCategory !=
                        undefined ? (
                          <h4>
                            • Fluorophores category:{" "}
                            {experiments[0].details.fluorophoresCategory}
                          </h4>
                        ) : null}
                        {experiments[0].details.description != undefined ? (
                          <h4>
                            • Description: {experiments[0].details.description}
                          </h4>
                        ) : null}
                      </div>
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default withStyles(styles)(Workspace);
