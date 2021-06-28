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
  ExperimentFilesApiFetchParamCreator,
  ExperimentApiFetchParamCreator,
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
import FCSServices from "services/FCSServices/FCSServices";

const styles = {
  input: {
    color: "white",
    borderBottom: "solid 1px white",
    height: 30,
  },
};

const Experiment = (props: any) => {
  const [experimentData, setExperimentData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [onDropZone, setOnDropZone] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [experiment, setExperiment] = useState(Object);
  const [fileUploadInputValue, setFileUploadInputValue] = useState("");

  const [experimentSize, setExperimentSize] = useState(0);
  const [maxExperimentSize, setMaxExperimentSize] = useState(
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

  const allowedInThisExperiment = userManager.canAccessExperiment(props.id);
  if (!allowedInThisExperiment) {
    snackbarService.showSnackbar(
      "You are not allowed in this experiment",
      "warning"
    );
    history.replace("/experiments");
  }

  const fetchExperimentData = (snack = true, callback?: Function) => {
    const fetchExperiments = ExperimentFilesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).experimentFiles(
      userManager.getOrganiztionID(),
      props.id,
      userManager.getToken()
    );

    axios
      .get(fetchExperiments.url, fetchExperiments.options)
      .then((e) => {
        setExperimentData(e.data);
        let sizeSum = 0;
        for (const file of e.data.files) {
          sizeSum += file.fileSize;
        }
        setExperimentSize(sizeSum);
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

  const updateExperimentName = (snack = true) => {
    const updateExperiment = ExperimentApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).editExperimentName(props.id, experiment.name, userManager.getToken());

    axios
      .put(updateExperiment.url, {}, updateExperiment.options)
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

  const getExperiment = () => {
    const experimentApiObj = ExperimentApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).getExperiment(userManager.getToken(), props.id);
    axios
      .post(
        experimentApiObj.url,
        {
          experimentId: props.id,
        },
        {
          headers: {
            token: userManager.getToken(),
          },
        }
      )
      .then((e) => {
        setExperiment(e.data);
      })
      .catch((e) => {});
  };

  function setContaineSet(superSet: Set<any>, set: Set<any>) {
    //@ts-ignore
    if (superSet.size !== set.size) return false;
    //@ts-ignore
    for (var a of set) if (!superSet.has(a)) return false;
    return true;
  }

  const uploadFiles = async (files: FileList) => {
    const fileList: { tempId: string; file: File }[] = [];
    const allowedExtensions = ["fcs", "lmd"];

    let listSize = 0;
    for (const file of Array.from(files)) {
      listSize += file.size;
      if (
        !allowedExtensions.includes(file.name.split(".").pop().toLowerCase())
      ) {
        snackbarService.showSnackbar(
          file.name.substring(0, 20) +
            (file.name.length > 20 ? "..." : "") +
            '"' +
            'Is not a .fcs or .lmd file: "',
          "error"
        );
        continue;
      }
      const id = Math.random().toString(36).substring(7);
      fileList.push({ tempId: id, file });
    }
    if (listSize + experimentSize > maxExperimentSize) {
      snackbarService.showSnackbar(
        "Files passed go above experiment size limit, total size would be " +
          ((listSize + experimentSize) / 1e6).toFixed(2) +
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
    const fcsservice = new FCSServices();
    let channelSet = new Set();
    for (const file of fileList) {
      let fcsFile = await file.file.arrayBuffer().then(async (e) => {
        const buf = Buffer.from(e);
        return await fcsservice.loadFileMetadata(buf).then((e) => {
          return e;
        });
      });
      if (channelSet.size === 0) channelSet = new Set(fcsFile.channels);
      if (
        (getExperimentChannels().length > 0 &&
          !setContaineSet(
            new Set(fcsFile.channels),
            new Set(getExperimentChannels())
          )) ||
        (channelSet.size > 0 &&
          !setContaineSet(new Set(fcsFile.channels), channelSet))
      ) {
        snackbarService.showSnackbar(
          "Channels of uploaded file " +
            file.file.name +
            " don't match experiments channels",
          "error"
        );
        fetchExperimentData(false, () => {
          setUploadingFiles(uploadingFiles.filter((e) => e.id !== file.tempId));
        });
        setFileUploadInputValue("");
        return;
      }
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
          fetchExperimentData(false, () => {
            setUploadingFiles(
              uploadingFiles.filter((e) => e.id !== file.tempId)
            );
          });
          setFileUploadInputValue("");
        });
    }
  };

  const getExperimentChannels = (): string[] => {
    if (experimentData === null || experimentData.files.length === 0) return [];
    return experimentData.files[0].channels;
  };

  const deleteFile = (file: any) => {
    const fetchExperiments = ExperimentFilesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).deleteFile(props.id, file.id, userManager.getToken());

    axios
      .delete(fetchExperiments.url, fetchExperiments.options)
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
        fetchExperimentData();
      });
  };

  const updateSize = (newSize: number) => {
    setExperimentSize(newSize);
  };

  useEffect(() => {
    fetchExperimentData();
    getExperiment();
  }, []);

  const handleClose = (func: Function) => {
    func(false);
  };
  const [uploadFileModalOpen, setUploadFileModalOpen] = React.useState(false);

  useEffect(() => {}, [experimentData]);

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
          fetchExperimentData(false);
        }}
        experiment={{
          ...experimentData,
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
                {experiment === null ? (
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
                        value={experiment.name}
                        onChange={(e: any) => {
                          experiment.name = e.target.value;
                          setExperiment({ ...experiment });
                        }}
                        onKeyDown={(e: any) => {
                          if (e.keyCode === 13) {
                            setEditingName(false);
                            updateExperimentName();
                          }
                        }}
                      ></TextField>
                    ) : (
                      experiment.name
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
                style={{
                  backgroundColor: "#fafafa",
                  maxHeight: 50,
                  visibility:
                    experimentData?.files.length === 0 ? "hidden" : "visible",
                }}
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
                Experiment size limit: <b>{maxExperimentSize / 1e6}MB</b>
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
                      experimentSize === 0
                        ? "rgba(0,0,0,0)"
                        : experimentSize > 0.7 * maxExperimentSize
                        ? experimentSize > 0.85 * maxExperimentSize
                          ? "#AA66AA"
                          : "#8866AA"
                        : "#6666AA",
                    height: 20,
                    width:
                      Math.round((experimentSize * 100) / maxExperimentSize) +
                      "%",
                    borderRadius: 10,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {experimentSize > 0.1 * maxExperimentSize
                    ? (experimentSize / 1e6).toFixed(2) + "MB"
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
                        value={fileUploadInputValue}
                        multiple
                        accept=".fcs, .lmd"
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
                {experimentData === null ? (
                  <CircularProgress />
                ) : experimentData.files.length === 0 &&
                  uploadingFiles.length === 0 ? (
                  <h3 style={{ color: "#777" }}>
                    There are no files in this experiment
                  </h3>
                ) : (
                  experimentData.files.map((e: any, i: number) => {
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
                              .{e.label?.substr(-3).toLowerCase()} file
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
                        {i !== experimentData.files.length - 1 ? (
                          <Divider
                            style={{ marginTop: 15, marginBottom: 15 }}
                          ></Divider>
                        ) : null}
                      </>
                    );
                  })
                )}
                {experimentData !== null &&
                uploadingFiles.length > 0 &&
                experimentData.files.length > 0 ? (
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
                            file
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
                {Object.keys(experiment).length > 0 ? (
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
                        {experiment.details.device != undefined ? (
                          <h4>• Device: {experiment.details.device}</h4>
                        ) : null}
                        {experiment.details.cellType != undefined ? (
                          <h4>• Cell type: {experiment.details.cellType}</h4>
                        ) : null}
                        {experiment.details.particleSize != undefined ? (
                          <h4>
                            • Particle size: {experiment.details.particleSize}
                          </h4>
                        ) : null}
                        {experiment.details.fluorophoresCategory !=
                        undefined ? (
                          <h4>
                            • Fluorophores category:{" "}
                            {experiment.details.fluorophoresCategory}
                          </h4>
                        ) : null}
                        {experiment.details.description != undefined ? (
                          <h4>
                            • Description: {experiment.details.description}
                          </h4>
                        ) : null}
                      </div>
                    </Grid>
                  </>
                ) : null}
                {getExperimentChannels().length > 0 ? (
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
                          Experiment Channels
                        </h1>
                        {getExperimentChannels().map((e) => (
                          <h4>{"• " + e}</h4>
                        ))}
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

export default withStyles(styles)(Experiment);
