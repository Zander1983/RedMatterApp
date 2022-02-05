import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import SecurityUtil from '../../utils/Security.js';

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
  EditOutlined,
} from "@ant-design/icons";
import UploadFileModal from "./modals/UploadFileModal";
import useGAEventTrackers from "hooks/useGAEvents";
import { getHumanReadableTimeDifference } from "utils/time";
import oldBackFileUploader from "utils/oldBackFileUploader";
import FCSServices from "services/FCSServices/FCSServices";
import {useDispatch, useSelector} from "react-redux";
import {Workspace as WorkspaceType} from "../../graph/resources/types";

const styles = {
  input: {
    color: "white",
    borderBottom: "solid 1px white",
    height: 30,
  },
  fileEditInput: {
    borderBottom: "solid 1px white",
    height: 30,
  },
};

const fileTempIdMap: any = {};

const Experiment = (props: any) => {
  const dispatch = useDispatch();
  const [experimentData, setExperimentData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [editingFileName, setEditingFileName] = useState<null | string>(null);
  const [newFileName, setNewFileName] = useState<string>("");
  const [reportName, setReportName] = useState("");
  const [onDropZone, setOnDropZone] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [experiment, setExperiment] = useState(Object);
  const [fileUploadInputValue, setFileUploadInputValue] = useState("");

  const [reports, setReport] = useState([]);
  const [reportStatus, setReportStatus] = useState(false);

  const [experimentSize, setExperimentSize] = useState(0);
  const maxExperimentSize = parseInt(
    process.env.REACT_APP_MAX_WORKSPACE_SIZE_IN_BYTES
  );
  const maxFileSize = parseInt(process.env.REACT_APP_MAX_FILE_SIZE_IN_BYTES);

  const { classes } = props;
  const history = useHistory();
  const inputFile = React.useRef(null);
  const eventStacker = useGAEventTrackers("File Upload");
  const isLoggedIn = userManager.isLoggedIn();
  if (
    !isLoggedIn ||
    (null !== process && process.env.REACT_APP_NO_WORKSPACES === "true")
  ) {
    history.replace("/login");
  }

  const allowedInThisExperiment = userManager.canAccessExperiment(props.id);
  if (!allowedInThisExperiment) {
    snackbarService.showSnackbar(
      "You are not allowed in this experiment",
      "warning"
    );
    history.replace("/experiments");
  }

  useEffect(() => {
    dispatch({
      type: "EXPERIMENT_FORM_DATA",
      payload: {
        //@ts-ignore
        formitem: { key: "experimentId", value: props.id },
      },
    });
  }, [dispatch, props.id]);

  useEffect(() => {
    if (
      fileTempIdMap && Object.keys(fileTempIdMap).length > 0 && uploadingFiles.length > 0
    ) {
      let keys = Object.keys(fileTempIdMap).map((x) => {
          if (fileTempIdMap[x]) {
            delete fileTempIdMap[x];
            return x;
          }
          return null;
        })
        .filter((x) => x);
      let files = uploadingFiles.filter((x) => !keys.includes(x.id));
      setUploadingFiles(files);
    }
    //eslint-disable-next-line
  }, [experimentData]);

  // const fetchExperimentData = (snack = true, key: string = "") => {
  //   const fetchExperiments = ExperimentFilesApiFetchParamCreator({
  //     accessToken: userManager.getToken(),
  //   }).experimentFiles(
  //     userManager.getOrganiztionID(),
  //     props.id,
  //     userManager.getToken()
  //   );
  //
  //   axios
  //     .get(fetchExperiments.url, fetchExperiments.options)
  //     .then((e) => {
  //       if (key && fileTempIdMap && Object.keys(fileTempIdMap).length > 0) {
  //         if (e.data.files) {
  //           fileTempIdMap[key] = e.data.files[0].id;
  //         } else {
  //           delete fileTempIdMap[key];
  //         }
  //       }
  //       setExperimentData(e.data);
  //       setExperiment(e.data?.experimentDetails);
  //       let sizeSum = 0;
  //       for (const file of e.data.files) {
  //         sizeSum += file.fileSize;
  //       }
  //       setExperimentSize(sizeSum);
  //     })
  //     .catch((e) => {
  //       if (snack)
  //         snackbarService.showSnackbar(
  //           "Failed to find this experiment, reload the page to try again!",
  //           "error"
  //         );
  //       userManager.logout();
  //     });
  // };

  const reload = async () => {
    try {
      const fetchExperiments = ExperimentFilesApiFetchParamCreator({
        accessToken: userManager.getToken(),
      }).experimentFiles(userManager.getOrganiztionID(), props.id, userManager.getToken());

      const response = await  axios.get(fetchExperiments.url, fetchExperiments.options);

      if (response?.status) {
          //WorkspaceDispatch.SetFiles(response.data);
        setExperimentData(response?.data);
        setExperiment(response?.data?.experimentDetails);
        setTimeout(() => {
          sessionStorage.setItem("experimentFiles", SecurityUtil.encryptData({files: response.data}, process.env.REACT_APP_DATA_SECRET_SOLD));
          sessionStorage.setItem("activeOrg", props.id);
        },0);
      } else {
        await handleError({"message": "Information missing", saverity: "error"});
      }
    } catch (err) {
      await handleError(err);
    }
  };

  const updateFileCache = async (fileId:any, fileLabel:any) => {
        //link view code here
      const activeOrg:string = sessionStorage.getItem("activeOrg");
      if (activeOrg && activeOrg === props.id) {
          const expFileInfo = SecurityUtil.decryptData(sessionStorage.getItem("experimentFiles"), process.env.REACT_APP_DATA_SECRET_SOLD);
          if (expFileInfo) {
              let index = expFileInfo?.files?.files?.findIndex((file: any) => file.id === fileId);
              if (index > -1) {
                  let currentFiles: any[] = expFileInfo?.files?.files?.slice();
                  const updatedFile = {...currentFiles[index], ...{label: fileLabel}};
                  const updatedFiles = [
                          ...currentFiles.slice(0, index),
                          updatedFile,
                          ...currentFiles.slice(index + 1),
                      ];
                  //setExperimentData({files: {...expFileInfo.files, ...{files:[...updatedFiles]}}});
                  sessionStorage.setItem("experimentFiles",
                      SecurityUtil.encryptData({files: {...expFileInfo.files, ...{files:[...updatedFiles]}}}, process.env.REACT_APP_DATA_SECRET_SOLD));
              }
          }else {
            await reload();
          }
      }else {
        await reload();
      }
    };

  const updateExperimentCache = async (data: any, expId:any) => {
    let requiredUpdateExperiments:any[] = [];
    let targetExperiment = "";
    if (data?.experiments?.organisationExperiments.length > 0
        && data?.experiments?.organisationExperiments.findIndex((e:any) => e.id === expId) > -1) {
      requiredUpdateExperiments = data?.experiments?.organisationExperiments?.slice();
      targetExperiment = "org";
    }else if (data?.experiments?.userExperiments.length > 0
        && data?.experiments?.userExperiments.findIndex((e:any) => e.id === expId) > -1) {
      requiredUpdateExperiments = data?.experiments?.userExperiments?.slice();
      targetExperiment = "user";
    }else {
      requiredUpdateExperiments = data?.experiments?.oldExperiments?.slice();
      targetExperiment = "old";
    }
    let targetIndex = -1;
    if (requiredUpdateExperiments && requiredUpdateExperiments.length > 0) {
      targetIndex = requiredUpdateExperiments.findIndex((e:any) => e.id === expId);
      if(targetIndex > -1) {
       const updatedExperiments = [
          ...requiredUpdateExperiments.slice(0, targetIndex),
          {...requiredUpdateExperiments[targetIndex], ...experiment},
          ...requiredUpdateExperiments.slice(targetIndex + 1),
        ];
        switch (targetExperiment) {
          case "user":
            let userData: any = {
              oldExperiments: [...data?.experiments?.oldExperiments],
              organisationExperiments: [...data?.experiments?.organisationExperiments],
              userExperiments: [...updatedExperiments]
            };
            sessionStorage.setItem("experimentData", SecurityUtil.encryptData({experiments: userData}, process.env.REACT_APP_DATA_SECRET_SOLD));
            break;
          case "org":
            let orgData: any = {
              oldExperiments: [...data?.experiments?.oldExperiments],
              organisationExperiments: [...updatedExperiments],
              userExperiments: [...data?.experiments?.userExperiments]
            };
            sessionStorage.setItem("experimentData", SecurityUtil.encryptData({experiments: orgData}, process.env.REACT_APP_DATA_SECRET_SOLD));
            break;
          case "old":
            let oldData: any = {
              oldExperiments: [...updatedExperiments],
              organisationExperiments: [...data?.experiments?.organisationExperiments],
              userExperiments: [...data?.experiments?.userExperiments]
            };
            sessionStorage.setItem("experimentData", SecurityUtil.encryptData({experiments: oldData}, process.env.REACT_APP_DATA_SECRET_SOLD));
            break;
        }
      }else {
        sessionStorage.removeItem("experimentData");
      }
    }
  };

  const updateExperimentName = (snack = true) => {
    const updateExperiment = ExperimentApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).editExperimentName(props.id, experiment.name, userManager.getToken());

    axios
      .put(updateExperiment.url, {}, updateExperiment.options)
      .then(async (e) => {
        const cacheData = SecurityUtil.decryptData(sessionStorage.getItem("experimentData"),process.env.REACT_APP_DATA_SECRET_SOLD);
        if(cacheData){
          await updateExperimentCache(cacheData, props.id);
        }else {
          sessionStorage.removeItem("experimentData");
        }
        if (snack)
          showMessageBox({message:"Experiment updated", saverity:"success"});

      })
      .catch((e) => {
        if (snack)
          showMessageBox({
              message: "Failed to update this experiment, reload the page to try again!",
              saverity:"error"});
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const getExperiment = () => {
  //   const experimentApiObj = ExperimentApiFetchParamCreator({
  //     accessToken: userManager.getToken(),
  //   }).getExperiment(userManager.getToken(), props.id);
  //   axios
  //     .post(
  //       experimentApiObj.url,
  //       {
  //         experimentId: props.id,
  //       },
  //       {
  //         headers: {
  //           token: userManager.getToken(),
  //         },
  //       }
  //     )
  //     .then((e) => {
  //       console.log(e);
  //       setExperiment(e.data);
  //     })
  //     .catch((e) => {});
  // };

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

    let filesUpload = uploadingFiles.concat(
      fileList.map((e) => {
        return { name: e.file.name, id: e.tempId };
      })
    );
    setUploadingFiles(filesUpload);
    const fcsservice = new FCSServices();
    let channelSet = new Set();
    let finalFileList = [];
    for (const file of fileList) {
      fileTempIdMap[file.tempId] = "";
      let fcsFile = await file.file.arrayBuffer().then(async (e) => {
        const buf = Buffer.from(e);
        return await fcsservice.loadFileMetadata(buf).then((e) => {
          return e;
        });
      });
      if (channelSet.size === 0) {
        if (getExperimentChannels().length === 0) {
          channelSet = new Set(fcsFile.channels);
        } else {
          channelSet = new Set(getExperimentChannels());
        }
      }

      if (
        channelSet.size > 0 &&
        !setContaineSet(new Set(fcsFile.channels), new Set(channelSet))
      ) {
        snackbarService.showSnackbar(
          "Channels of uploaded file " +
            file.file.name +
            " don't match experiments channels",
          "error"
        );
        filesUpload = filesUpload.filter((x) => x.id !== file.tempId);
      } else {
        finalFileList.push(file);
      }
    }
    setUploadingFiles(filesUpload);
    let completedIds:any[] = [];
    for (const file of finalFileList) {
      oldBackFileUploader(
        userManager.getToken(),
        props.id,
        userManager.getOrganiztionID(),
        file.file
      ).then(async (e) => {
          eventStacker(
            `A file has been uploaded on experiment ${experimentData?.experimenteName}`,
            `Uploaded file name is ${file.file.name}`
          );
          showMessageBox({message:"Uploaded " + file.file.name, saverity:"success"});
        })
        .catch((e) => {
            showMessageBox({message:"Error uploading file " +file.file.name.substring(0, 20) +(file.file.name.length > 20 ? ",,," : "") +", please try again", saverity:"error"});
        })
        .finally(() => {
            completedIds.push(file.tempId);
            //fetchExperimentData(false, file.tempId);
        });
    }

    if(completedIds.length > 0){
        await reload();
    }
    setFileUploadInputValue("");
  };

  const getExperimentChannels = (): string[] => {
    if (experimentData === null || experimentData.files.length === 0) return [];
    return experimentData.files[0].channels;
  };

  // const deleteFile = (file: any) => {
  //   alert(
  //     "Due to technical issues, this version of the app doesn't allow for file deletion within an experiment"
  //   );
  //   return;
  //   const fetchExperiments = ExperimentFilesApiFetchParamCreator({
  //     accessToken: userManager.getToken(),
  //   }).deleteFile(props.id, file.id, userManager.getToken());

  //   axios
  //     .delete(fetchExperiments.url, fetchExperiments.options)
  //     .then((e) => {
  //       snackbarService.showSnackbar("File deleted!", "success");
  //     })
  //     .catch((e) => {
  //       snackbarService.showSnackbar(
  //         "Failed to delete file, try again.",
  //         "error"
  //       );
  //     })
  //     .finally(() => {
  //       fetchExperimentData();
  //     });
  // };

  useEffect(() => {
    const activeOrg:string = sessionStorage.getItem("activeOrg");
    if (activeOrg && activeOrg === props.id) {
      const expFileInfo = SecurityUtil.decryptData(sessionStorage.getItem("experimentFiles"), process.env.REACT_APP_DATA_SECRET_SOLD);
      if (expFileInfo) {
        setExperimentData(expFileInfo?.files);
        setExperiment(expFileInfo?.files?.experimentDetails);
      } else {
        sessionStorage.removeItem("activeOrg");
        (async () =>{
          await reload()
        })();
      }
    } else {
      sessionStorage.removeItem("activeOrg");
      sessionStorage.removeItem("experimentFiles");
      (async () =>{
        await reload();
      })();
    }

    // const onUnload = (e:any) => {
    //     e.preventDefault();
    //     console.log("====experimentData====");
    //     console.log(experimentData);
    //     console.log(data);
    //     console.log(experimentData);
    //     localStorage.setItem("reloadData", JSON.stringify(experimentData));
    //   };
    //   window.addEventListener("beforeunload", onUnload);
    //   return () => window.removeEventListener("beforeunload", onUnload);
   // fetchExperimentData();
    // getExperiment();
    //eslint-disable-next-line
  }, []);

  const handleClose = (func: Function) => {
    func(false);
  };
  const [uploadFileModalOpen, setUploadFileModalOpen] = React.useState(false);

  const GenOrView = async (event: any, fileId: any, name: string) => {
    setReportName(name);
    event.preventDefault();
    setReportStatus(true);
    try {
      //370 KB file
      //const URL = `http://localhost:8080/api/report/${"61d1df3b4775ec12f26a8bcb"}/${"9fc51860-6bf0-11ec-8baf-b9ee2147d2ed"}`;
      // 14 MB file
      //const URL = `http://localhost:8080/api/report/${"615207baa0f5847ee122fb07"}/${"e45c58a0-1fbd-11ec-a311-714960590ddc"}`;
      //5.3 MB
      //const URL = `http://localhost:8080/api/report/${"6123a8ca7d7dff74498e07ab"}/${"a7b7b350-1bd9-11ec-8260-571cd83d40c9"}`;
      //const URL = `http://localhost:8080/api/report/${props.id}/${fileId}`;
      const URL = `${process.env.REACT_APP_API_URL}api/report/${props.id}/${fileId}`;
      const response = await axios.get(URL, {
        headers: {
          "Content-Type": "application/json",
          token: userManager.getToken(),
        },
      });
      if (response.status === 200) await handleResponse(response.data, true);
      else
        await handleError({
          message:
            response?.data?.message ||
            "Request not completed. Due to Time out Or Unable To Allocation",
          saverity: "error",
        });
    } catch (error) {
      await handleError(error);
    }
    setReportStatus(false);
  };

  const doStaff = async (data: any) => {
    //link view code here
    let availableReports = reports.slice();
    if (availableReports && availableReports.length <= 0) {
      availableReports.push({ fileId: data.fileId, link: data.link });
      setTimeout(() => {
        setReport(availableReports);
      }, 50);
    } else {
      let index = availableReports.findIndex(
        (report) => report.fileId === data.fileId
      );
      if (index > -1) {
        const updatedReport = {
          ...availableReports[index],
          ...{ fileId: data.fileId, link: data.link },
        };
        const updatedReports = [
          ...availableReports.slice(0, index),
          updatedReport,
          ...availableReports.slice(index + 1),
        ];
        setTimeout(() => {
          setReport(updatedReports);
        }, 50);
      } else {
        availableReports.push({ fileId: data.fileId, link: data.link });
        setTimeout(() => {
          setReport(availableReports);
        }, 50);
      }
    }
  };

  const handleResponse = async (response: any, isMsgShow = false) => {
    if (response?.level === "success") {
      if (isMsgShow) {
        showMessageBox({
          title: "Success !",
          message: response?.message || "Report Generating Success",
          saverity: "success",
        });
      }
      await doStaff(response);
    } else if (response?.level === "danger") {
      showMessageBox({
        message: response?.message || "Request Not Completed",
        saverity: "error",
      });
    } else {
      await handleError({});
    }
  };

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

  const updateExperimentFileName = (id: string, label: string) => {
    const updateFileName = ExperimentFilesApiFetchParamCreator({
      apiKey: userManager.getToken(),
    }).editFiles(props.id, id, label, userManager.getToken());
    axios
      .put(updateFileName.url, { label }, updateFileName.options)
      .then(async (e) => {
        await updateFileCache(id, label);
      })
      .catch((e) =>
        snackbarService.showSnackbar(
          "Could not edit file name, try again",
          "error"
        )
      );
  };

  return (
    <>
      {}
      <UploadFileModal
        open={uploadFileModalOpen}
        closeCall={{
          f: handleClose,
          ref: setUploadFileModalOpen,
        }}
        added={async () => {
          await reload();
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
          padding: "0 4em",
        }}
        container
      >
        <Grid
          style={{
            backgroundColor: "#fafafa",
            borderRadius: 10,
            marginLeft: 40,
            marginRight: 40,
            boxShadow: "2px 3px 3px #ddd",
            width: "75%",
          }}
        >
          <Grid style={{ borderRadius: 5 }}>
            <Grid
              container
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
                  if (props.poke === false) {
                    history.push("/experiments");
                  } else {
                    history.push("/browse-experiments");
                  }
                }}
              >
                Back
              </Button>
              <div>
                {experiment === null ? (
                  <CircularProgress style={{ width: 20, height: 20, color: "white" }}/>
                ) : (
                  <Grid
                    container
                    direction="row"
                    style={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 20,
                    }}>
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
                    {props.poke === true ? null : (
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
                    )}
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
                onClick={() => {
                  if (props.poke === false) {
                    history.push("/experiment/" + props.id + "/plots");
                  } else {
                    history.push("/experiment/" + props.id + "/plots/poke");
                  }
                }}
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
                File size limit: <b>{maxFileSize / 1e6}MB</b>
                <br />
                Experiment size limit: <b>{maxExperimentSize / 1e6}MB</b>
              </Grid>
              <Grid
                style={{
                  backgroundColor: "#ddd",
                  border: "solid 1px #bbb",
                  height: 22,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <Grid
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
              <Grid style={{ textAlign: "center" }}>
                {/*@ts-ignore*/}
                {/* {experiments.length > 0
                  ? JSON.stringify(experiments[0].details)
                  : null} */}

                {props.poke === true ? null : (
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
                )}
                <Divider style={{ marginBottom: 10 }}></Divider>
                {/* {reports &&
                  reports.map((report: any, index: number) => {
                    return (
                      <div key={Math.random() + index}>
                        <Grid
                          item
                          key={Math.random() + index}
                          xs={12}
                          style={{
                            textAlign: "left",
                            marginTop: 15,
                            marginLeft: 10,
                          }}
                        >
                          <h3>
                            <a
                              href={report.link}
                              style={{
                                background: "#66a",
                                margin: 0,
                                padding: 0,
                                float: "right",
                              }}
                            >
                              {report.fileId}
                            </a>
                          </h3>
                        </Grid>
                      </div>
                    );
                  })} */}
                <Divider style={{ marginBottom: 10 }}></Divider>
                {experimentData === null ? (
                  <CircularProgress />
                ) : experimentData?.files?.length === 0 &&
                  uploadingFiles.length === 0 ? (
                  <h3 style={{ color: "#777" }}>
                    There are no files in this experiment
                  </h3>
                ) : (
                  experimentData.files.map((e: any, i: number) => {
                    return (
                      <div key={`experiment-data-${i}`}>
                        <Grid
                          item
                          key={`experiment-file-id-${i}`}
                          xs={12}
                          style={{
                            textAlign: "left",
                            marginTop: 25,
                            marginLeft: 10,
                          }}
                        >
                          <h3>
                            {/* <b
                              style={{
                                backgroundColor: "#ddf",
                                border: "solid 1px #ddd",
                                borderRadius: 5,
                                padding: 5,
                              }}
                            >
                              .{e.label?.substr(-3).toLowerCase()} file
                            </b> */}
                            {/* <div style={{ display: "inline", width: 10 }}>
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
                            </div> */}
                            {editingFileName === e.id ? (
                              <>
                                <TextField
                                  style={{
                                    width: "20%",
                                  }}
                                  InputProps={{
                                    className: classes.fileEditInput,
                                  }}
                                  value={
                                    editingFileName === e.id
                                      ? newFileName
                                      : e.label
                                  }
                                  onChange={(newName: any) => {
                                    let newExperimentData = experimentData;
                                    newExperimentData.files.forEach(
                                      (f: any) => {
                                        if (f.id === e.id)
                                          f.label = newName.target.value;
                                      }
                                    );
                                    setNewFileName(newName.target.value);
                                    setExperimentData(newExperimentData);
                                  }}
                                  onKeyDown={(event: any) => {
                                    if (event.keyCode === 13) {
                                      updateExperimentFileName(
                                        e.id,
                                        newFileName
                                      );
                                      setEditingFileName(null);
                                    }
                                  }}
                                ></TextField>

                                <button
                                  onClick={() => {
                                    updateExperimentFileName(e.id, newFileName);
                                    setEditingFileName(null);
                                  }}
                                  style={{
                                    border: "none",
                                    cursor: "pointer",
                                    color: "white",
                                    fontWeight: 500,
                                    padding: "2px 5px",
                                    background: "#66a",
                                    width: 50,
                                    margin: "0px 8px",
                                    borderRadius: 5,
                                  }}
                                >
                                  {"Save"}
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingFileName(null);
                                  }}
                                  style={{
                                    border: "none",
                                    cursor: "pointer",
                                    color: "white",
                                    fontWeight: 500,
                                    padding: "2px 5px",
                                    background: "#66a",
                                    width: 70,
                                    borderRadius: 5,
                                  }}
                                >
                                  {"Cancel"}
                                </button>
                              </>
                            ) : (
                              <>{e.label}</>
                            )}
                            {!editingFileName && (
                              <Button
                                style={{
                                  fontSize: 16,
                                  maxWidth: 30,
                                  minWidth: 30,
                                }}
                                onClick={() => {
                                  setNewFileName(e.label);
                                  setEditingFileName(
                                    editingFileName ? null : e.id
                                  );
                                }}
                              >
                                <EditOutlined
                                  style={{
                                    color: "#66d",
                                    marginTop: -4,
                                  }}
                                />
                              </Button>
                            )}
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
                              ) === "just now"
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
                            {"   "}•{"   "}
                            <b
                              style={{
                                fontSize: 15,
                                fontWeight: 500,
                                color: "#777",
                              }}
                            >
                              {e.eventCount + " events"}
                            </b>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                float: "right",
                                alignItems: "flex-end",
                                marginTop: -15,
                              }}
                            >
                              <Button
                                disabled={reportStatus}
                                variant="contained"
                                style={{
                                  background: "#66a",
                                  margin: 0,
                                  padding: 0,
                                  width: 150,
                                  float: "right",
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type={"button"}
                                  data-id={e.id}
                                  data-link={e.link || "http://www.google.com"}
                                  value={
                                    reportStatus && reportName === e.label
                                      ? "Generating Report..."
                                      : "Generate Report"
                                  }
                                  style={{
                                    backgroundColor: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "white",
                                    fontWeight: 500,
                                    padding: "2px 5px",
                                  }}
                                  onClick={(event) =>
                                    GenOrView(event, e.id, e.label)
                                  }
                                />
                              </Button>
                              <p
                                style={{
                                  fontSize: 14,
                                  color: "#66a",
                                  textDecoration: "underline",
                                }}
                              >
                                {" "}
                                {reports && reports[i] && (
                                  <a
                                    target="_blank"
                                    rel="noopener"
                                    href={reports[i].link}
                                  >
                                    {"View Report"}
                                  </a>
                                )}
                              </p>
                            </div>
                          </h3>
                        </Grid>
                        {i !== experimentData.files.length - 1 ? (
                          <Divider
                            style={{ marginTop: 15, marginBottom: 15 }}
                          ></Divider>
                        ) : null}
                      </div>
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
                        key={`uploadingFiles-${i}`}
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
                        {experiment.details.device !== undefined ? (
                          <h4>• Device: {experiment.details.device}</h4>
                        ) : null}
                        {experiment.details.cellType !== undefined ? (
                          <h4>• Cell type: {experiment.details.cellType}</h4>
                        ) : null}
                        {experiment.details.particleSize !== undefined ? (
                          <h4>
                            • Particle size: {experiment.details.particleSize}
                          </h4>
                        ) : null}
                        {experiment.details.fluorophoresCategory !==
                        undefined ? (
                          <h4>
                            • Fluorophores category:{" "}
                            {experiment.details.fluorophoresCategory}
                          </h4>
                        ) : null}
                        {experiment.details.description !== undefined ? (
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
                        {getExperimentChannels().map((e, i) => (
                          <h4 key={`get-experiment-channels-${i}`}>
                            {"• " + e}
                          </h4>
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
