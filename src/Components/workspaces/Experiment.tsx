import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import SecurityUtil from "../../utils/Security.js";

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
import { useDispatch } from "react-redux";
import deleteIcon from "assets/images/delete.png";
import MessageModal from "./../../graph/components/modals/MessageModal";
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
  delete: {
    height: 20,
    width: 20,
    marginRight: 10,
    cursor: "pointer",
  },
};

const fileTempIdMap: any = {};

interface ReportType {
  fileId: string;
  link: string;
}

const FREE_PLAN_FILE_UPLOAD_LIMIT = 50;

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
  const [uploadFileModalOpen, setUploadFileModalOpen] = React.useState(false);
  const [reports, setReport] = useState<ReportType[]>([]);
  const [reportStatus, setReportStatus] = useState(false);
  const [deleteFileModal, setDeleteFileModal] = useState<boolean>(false);
  const [deleteFileId, setDeleteFileId] = useState<string>("");
  const [experimentSize, setExperimentSize] = useState(0);
  const [totalFilesUploaded, setTotalFilesUploaded] = useState(0);

  return <></>;
};

export default Experiment;
