import React, { useEffect } from "react";
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
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import UploadFileModal from "./modals/UploadFileModal";

const styles = {
  input: {
    color: "white",
    borderBottom: "solid 1px white",
    height: 30,
  },
};

const Workspace = (props: any) => {
  const { classes } = props;
  const history = useHistory();

  // const isLoggedIn = userManager.isLoggedIn();
  // if (!isLoggedIn) {

  //   return <></>
  // }

  const allowedInThisWorkspace = userManager.canAccessWorkspace(props.id);
  if (!allowedInThisWorkspace) {
    snackbarService.showSnackbar(
      "You are not allowed in this workspace",
      "warning"
    );
    history.replace("/workspaces");
  }

  const [workspaceData, setWorkpsaceData] = React.useState(null);
  const [editingName, setEditingName] = React.useState(false);

  const fetchWorkspaceData = () => {
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
        setTimeout(() => {
          setWorkpsaceData(e.data);
        }, 100);
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Failed to find this workspace, reload the page to try again!",
          "error"
        );
        userManager.logout();
      });
  };

  const updateWorkspace = () => {
    const updateWorkspace = WorkspacesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).editWorkspace(
      props.id,
      workspaceData.workspaceName,
      userManager.getToken()
    );

    console.log(updateWorkspace);

    axios
      .put(updateWorkspace.url, {}, updateWorkspace.options)
      .then((e) => {
        snackbarService.showSnackbar("Workspace updated", "success");
      })
      .catch((e) => {
        console.log(e);
        snackbarService.showSnackbar(
          "Failed to update this workspace, reload the page to try again!",
          "error"
        );
      });
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const handleClose = (func: Function) => {
    func(false);
  };
  const [uploadFileModalOpen, setUploadFileModalOpen] = React.useState(false);

  return (
    <>
      <UploadFileModal
        open={uploadFileModalOpen}
        closeCall={{
          f: handleClose,
          ref: setUploadFileModalOpen,
        }}
        added={() => {
          updateWorkspace();
          snackbarService.showSnackbar("File added to workspace", "success");
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
                  history.goBack();
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
                        onEnded={() => console.log("ned")}
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
                onClick={() => setUploadFileModalOpen(true)}
              >
                Upload File
              </Button>
            </Grid>
            <Grid
              style={{
                backgroundColor: "#fafafa",
                borderBottomRightRadius: 10,
                borderBottomLeftRadius: 10,
                padding: 10,
              }}
            >
              <Grid xs={12} style={{ textAlign: "center" }}>
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  alignContent="center"
                  justify="center"
                >
                  <h1>Files</h1>
                </Grid>
                <Divider style={{ marginBottom: 10 }}></Divider>
                {workspaceData === null ? (
                  <CircularProgress />
                ) : workspaceData.files.length === 0 ? (
                  <h3 style={{ color: "#777" }}>
                    There are no files in this workspace
                  </h3>
                ) : (
                  workspaceData.files.map((e: any) => {
                    return JSON.stringify(e);
                  })
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );

  // const location: any = useLocation<any>();
  // const classes = useStyles();
  // function Alert(props: AlertProps) {
  //   return <MuiAlert elevation={6} variant="filled" {...props} />;
  // }
  // let organisationId = "";
  // let user = JSON.parse(localStorage?.getItem("user"));
  // if (user) {
  //   organisationId = user["organisationId"];
  // }
  // const workspaceName = location.state.workspaceName;

  // const [progress, setProgress] = useState(0);
  // const [success, setSuccess] = useState(false);
  // const [isSuccessAlert, setSuccessAlert] = useState(false); //use for success message
  // const [notifyMsg, setMsg] = useState("");

  // const [workspaceFileData, setWorkspaceFileData] = useState<any[]>([]);

  // const handleSuccessClose = (
  //   event?: React.SyntheticEvent,
  //   reason?: string
  // ) => {
  //   if (reason === "clickaway") {
  //     return;
  //   }
  //   setSuccessAlert(false);
  // };

  // const options = {
  //   headers: {
  //     Token: localStorage.getItem("token"),
  //   },
  //   onDownloadProgress: (progressEvent: any) => {
  //     setProgress(
  //       Math.round((progressEvent.loaded / progressEvent.total) * 100)
  //     );
  //   },
  // };

  // const getWorkspaceFileData = async () => {
  //   try {
  //     const response = await axios
  //       .get(
  //         `api/files?organisationId=${organisationId}&workspaceId=${id}`,
  //         options
  //       )
  //       .catch((err) => console.log(err));
  //     if (response) {
  //       const datatemp = response.data;
  //       setWorkspaceFileData(datatemp.files);
  //     }
  //   } catch (err) {}
  // };

  // useEffect(() => {
  //   getWorkspaceFileData();
  // }, []);

  // const getTimeCal = (date: string) => {
  //   const date1 = new Date(date);
  //   const date2 = new Date();
  //   let days = "";
  //   let totalDays = Math.floor(
  //     (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)
  //   );
  //   if (Math.floor(totalDays / 31) > 0) {
  //     days = `${Math.floor(totalDays / 31)} Months Ago`;
  //   } else {
  //     days = `${totalDays} Days Ago`;
  //   }
  //   console.log(totalDays, Math.floor(totalDays / 31));
  //   return days;
  // };

  // const FileCard = (props: any) => {
  //   return (
  //     <>
  //       <Grid item lg={3} md={6} sm={12}>
  //         <Card className={classes.root}>
  //           <CardContent style={{ textAlign: "center" }}>
  //             {/* <NavLink to={`/analyse/${workspacesId}/${props.data.id}`}> */}
  //             <NavLink to={`/workspaces`}>
  //               <Typography
  //                 style={{
  //                   fontWeight: "bold",
  //                   color: "#66a",
  //                   marginBottom: "5px",
  //                 }}
  //                 color="textPrimary"
  //                 align="center"
  //                 gutterBottom
  //                 noWrap
  //               >
  //                 {props.data.label}
  //               </Typography>
  //             </NavLink>
  //             <Typography
  //               className={classes.title}
  //               color="textSecondary"
  //               gutterBottom
  //             >
  //               {getTimeCal(props.data.createdOn)}
  //             </Typography>
  //           </CardContent>
  //           <CardActions style={{ display: "flex", justifyContent: "center" }}>
  //             <Tooltip title="Edit file">
  //               <Button
  //                 size="small"
  //                 color="primary"
  //                 startIcon={<EditIcon />}
  //                 variant="contained"
  //               >
  //                 Edit
  //               </Button>
  //             </Tooltip>
  //             <Tooltip title="Delete file">
  //               <Button
  //                 size="small"
  //                 color="secondary"
  //                 startIcon={<DeleteIcon />}
  //                 variant="contained"
  //               >
  //                 Delete
  //               </Button>
  //             </Tooltip>
  //           </CardActions>
  //         </Card>
  //       </Grid>
  //     </>
  //   );
  // };

  // const WorkspaceHeader = () => {
  //   return (
  //     <>
  //       <Grid
  //         style={{
  //           backgroundColor: "#66a",
  //           WebkitBorderBottomLeftRadius: 0,
  //           WebkitBorderBottomRightRadius: 0,
  //         }}
  //         container
  //       >
  //         <Grid
  //           item
  //           lg={12}
  //           sm={12}
  //           style={{
  //             display: "flex",
  //             padding: 10,
  //             justifyContent: "space-between",
  //           }}
  //         >
  //           <h1 className={classes.zeroMargin} style={{ color: "#ddd" }}>
  //             {workspaceName} - Files
  //           </h1>
  //           <div>
  //             <Tooltip title="Upload file">
  //               <Button
  //                 variant="contained"
  //                 className={classes.addButton}
  //                 startIcon={<CloudUploadIcon />}
  //                 style={{
  //                   backgroundColor: "#fafafa",
  //                 }}
  //               >
  //                 Upload File
  //               </Button>
  //             </Tooltip>
  //           </div>
  //         </Grid>

  //         <Grid item lg={12} sm={12} md={12}>
  //           <div className={classes.root}>
  //             <LinearProgress
  //               variant="determinate"
  //               color="secondary"
  //               value={progress}
  //             />
  //           </div>
  //         </Grid>
  //       </Grid>
  //     </>
  //   );
  // };

  return (
    <>
      {/* <Snackbar
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
          marginTop: 30,
        }}
        xs={12}
        md={9}
        lg={6}
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
            {workspaceFileData.length > 0 ? (
              workspaceFileData.map((data: any) => {
                return <FileCard data={data} />;
              })
            ) : (
              <h1>No Data</h1>
            )}
          </Grid>
        </Grid>
      </Grid> */}
    </>
  );
};

export default withStyles(styles)(Workspace);
