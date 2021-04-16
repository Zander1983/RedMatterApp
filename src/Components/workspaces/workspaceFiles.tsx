import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";

import {
  Paper,
  Grid,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Tooltip,
  Modal,
  Fade,
  Backdrop,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  CircularProgress,
  Snackbar,
  IconButton 
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import CloseIcon from "@material-ui/icons/Close";
import { green } from "@material-ui/core/colors";
import CheckIcon from "@material-ui/icons/Check";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import LoopIcon from '@material-ui/icons/Loop';
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: 275,
      flexGrow: 1,
    },
    paper: {
      position: "absolute",
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
    bullet: {
      display: "inline-block",
      margin: "0 2px",
      transform: "scale(0.8)",
    },
    title: {
      fontSize: 14,
      color: "#222"
    },
    pos: {
      marginBottom: 12,
    },
    addButton: {
      marginLeft: 30,
    },
    zeroMargin: {
      margin: 0,
    },
    zeroPadding: {
      padding: 0,
    },
    buttonSuccess: {
      backgroundColor: green[500],
      "&:hover": {
        backgroundColor: green[700],
      },
    },
    buttonProgress: {
      color: green[500],
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
    wrapper: {
      margin: theme.spacing(1),
      position: "relative",
    },
  })
);

const WorkspaceAppFiles = ({ id }: any) => {
  const workspacesId = id;
  const location: any = useLocation<any>();
  const classes = useStyles();
  function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
  let organisationId = "";
  let user = JSON.parse(localStorage?.getItem("user"));
  if (user) {
    organisationId = user["organisationId"];
  }
  const workspaceName = location.state.workspaceName;
  
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [isSuccessAlert, setSuccessAlert] = useState(false); //use for success message
  const [notifyMsg,setMsg] = useState("");

  const [workspaceFileData, setWorkspaceFileData] = useState<any[]>([]);

  const handleSuccessClose = (
    event?: React.SyntheticEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessAlert(false);
  };

  const options = {
    headers: {
      Token: localStorage.getItem("token"),
    },
    onDownloadProgress: (progressEvent:any) => {
      setProgress(
        Math.round((progressEvent.loaded / progressEvent.total) * 100)
      );
    }
  };

  
  const getWorkspaceFileData = async () => {
    try {
      const response = await axios
        .get(
          `api/files?organisationId=${organisationId}&workspaceId=${id}`,
          options
        )
        .catch((err) => console.log(err));
      if (response) {
        const datatemp = response.data;
        setWorkspaceFileData(datatemp.files);
      }
    } catch (err) {
      console.log('11111111111111111111',err)
    }
  };

  useEffect(()=>{
    getWorkspaceFileData()
  },[])

  const getTimeCal = (date: string) => {
    const date1 = new Date(date);
    const date2 = new Date();
    let days = "";
    let totalDays = Math.floor(
      (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)
    );
    if(Math.floor(totalDays/31) > 0){
      days = `${Math.floor(totalDays/31)} Months Ago`
    }else{
      days = `${totalDays} Days Ago`
    }
    console.log(totalDays,Math.floor(totalDays/31))
    return days;
  };

  
  const FileCard = (props:any) => {
    return (
      <>
        <Grid item lg={3} md={6} sm={12}>
          <Card className={classes.root}>
            <CardContent style={{ textAlign: "center" }}>
            {/* <NavLink to={`/analyse/${workspacesId}/${props.data.id}`}> */}
            <NavLink to={`/workspaces`}>
              <Typography
                style={{
                  fontWeight: "bold",
                  color: "#66a",
                  marginBottom: "5px"
                }}
                color="textPrimary"
                align="center"
                gutterBottom
                noWrap
              >
                {props.data.label}
              </Typography>
              </NavLink>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
              >
                {getTimeCal(props.data.createdOn)}
              </Typography>
            </CardContent>
            <CardActions style={{ display: "flex", justifyContent: "center" }}>
              <Tooltip title="Edit file">
                <Button
                  size="small"
                  color="primary"
                  startIcon={<EditIcon />}
                  variant="contained"
                >
                  Edit
                </Button>
              </Tooltip>
              <Tooltip title="Delete file">
                <Button
                  size="small"
                  color="secondary"
                  startIcon={<DeleteIcon />}
                  variant="contained"
                >
                  Delete
                </Button>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      </>
    );
  };

  const WorkspaceHeader = () => {
    return (
      <>
        <Grid
          style={{
            backgroundColor: "#66a",
            WebkitBorderBottomLeftRadius: 0,
            WebkitBorderBottomRightRadius: 0,
          }}
          container
        >
          <Grid
            item
            lg={12}
            sm={12}
            style={{
              display: "flex",
              padding: 10,
              justifyContent: "space-between",
            }}
          >
            <h1 className={classes.zeroMargin} style={{ color: "#ddd" }}>
              {workspaceName} - Files
            </h1>
            <div>
              <Tooltip title="Upload file">
                <Button
                  variant="contained"
                  className={classes.addButton}
                  startIcon={<CloudUploadIcon />}
                  style={{
                    backgroundColor: "#fafafa",
                  }}
                >
                  Upload File
                </Button>
              </Tooltip>
            
            </div>
          </Grid>

          <Grid item lg={12} sm={12} md={12}>
            <div className={classes.root}>
              <LinearProgress variant="determinate" color="secondary" value={progress} />
            </div>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={isSuccessAlert}
        autoHideDuration={6000}
        onClose={handleSuccessClose}
      >
        <Alert onClose={handleSuccessClose} severity="success">
          {notifyMsg}
        </Alert>
      </Snackbar>
      <Grid
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          justifyContent: "center",
          display: "flex",
          marginBottom: 50,
        }}
        lg={12}
        xl={10}
      >
        <Grid
          style={{
            backgroundColor: "#fafafa",
            marginLeft: 10,
            marginRight: 10,
            marginTop: 5,
            boxShadow: "2px 3px 3px #ddd",
          }}
          xs={12}
        >
          <WorkspaceHeader />
          <Grid
            container
            spacing={2}
            style={{
              padding: "10px",
              backgroundColor: "#ddd",
              margin: "auto",
              width: "100%",
            }}
          >
            {
              workspaceFileData.length > 0 ? workspaceFileData.map((data:any)=>{
                return <FileCard data={data}/>
              }) : 
              <h1>No Data</h1>
            }
          </Grid>
        </Grid>
      </Grid>
    </>
  );
  
};

export default WorkspaceAppFiles;
