import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
// import {
//   List,
//   Card,
//   Button,
//   Modal,
//   Form,
//   Input,
//   Tooltip,
//   Row,
//   Col,
// } from "antd";
// import axios from './../common/axios';
import "./css/style.css";
// import {
//   EditTwoTone,
//   EditFilled,
//   CheckOutlined,
//   CloseOutlined,
//   DeleteFilled,
// } from "@ant-design/icons";

// material ui

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
  CircularProgress 
} from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { green } from '@material-ui/core/colors';
import CheckIcon from '@material-ui/icons/Check';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: 275,
      flexGrow: 1
    },
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    topButton: {
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
      '&:hover': {
        backgroundColor: green[700],
      },
    },
    buttonProgress: {
      color: green[500],
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative',
    },
  }),
);

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  };
}

const Workspaces = () => {
  // const [organisationId,setOrgId] = useState()
  let organisationId = "";
  let user = JSON.parse(localStorage?.getItem("user"));
  if (user) {
    organisationId = user["organisationId"];
  }
  const [workspaceData, setWorkspaceData] = useState<any[]>([]);
  // const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const timer = React.useRef<number>();

  // const buttonClassname = clsx({
  //   [classes.buttonSuccess]: success,
  // });
  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);
  const handleButtonClick = () => {
    
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  // const [form] = Form.useForm();
  const classes = useStyles();

  const getTimeCal = (date: string) => {
    const date1 = new Date(date);
    const date2 = new Date();
    let totalDays = Math.floor(
      (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)
    );
    return totalDays;
  };

  const options = {
    headers: {
      Token: localStorage.getItem("token"),
    },
  };
  useEffect(() => {
    const getWorkspaceByOrgid = () => {
      setLoading(true);
      axios
        .get(`api/workspaces?organisationId=${organisationId}`, options)
        .then((res: any) => {
          const datatemp = res.data.workspaces;
          setWorkspaceData(datatemp);
          setLoading(false);
        })
        .catch((err: any) => {
          setLoading(false);
        });
    };
    // getWorkspaceByOrgid();
    // const getWorkspaceData = async()=>{
    //     try{
    //         setLoading(true);
    //         const response = await axios.get(url).catch((err)=>console.log(err))
    //         if(response){
    //             const datatemp = response.data;
    //             setWorkspaceData(datatemp);
    //             setLoading(false);
    //         }
    //     }catch(err){
    //         setLoading(false);
    //     }
    // }
    // getWorkspaceData();
  }, []);

  // Workspace child components
  const WorkspaceCard = ({ item }: any) => {
    const [isInEditMode, setIsInEditMode] = useState(false);
    const editName = useRef<HTMLInputElement>(null);
    const [isValid, setIsValid] = useState(true);

    const updateWorkspace = (id: string, data: any) => {
      const newWorkspaceName = editName.current?.value || "";
      data["name"] = newWorkspaceName;
      setIsInEditMode((prevData: Boolean) => !prevData);
    };

    const changeEditMode = () => {
      setIsInEditMode((prevData: Boolean) => !prevData);
    };

    const deleteWorkspace = (workid: string) => {
      setWorkspaceData((prevData: any) => {
        return prevData.filter((data: any) => {
          return data.id != workid;
        });
      });
    };

    const cancel = () => {
      setIsInEditMode(false);
      setIsValid(true);
    };

    const handleChange = (event: any) => {
      setIsValid(true);
      if (event.target.value.length == 0) {
        setIsValid(false);
      }
    };

    // return (
    //   <Card>
    //     <div className="workspaceDetail">
    //       {isInEditMode ? (
    //         <div className="editable">
    //           <input
    //             type="text"
    //             onChange={handleChange}
    //             defaultValue={item.name}
    //             ref={editName}
    //           />
    //           {/* <Button type="primary" disabled={!isValid?disabled:null} className="edit" onClick={()=>updateWorkspace(item.id,item)}>Save</Button> */}
    //           {/* <Button type="primary" onClick={()=>cancel()}>Cancel</Button> */}
    //           <div className="action">
    //             <Tooltip
    //               placement="bottom"
    //               arrowPointAtCenter={true}
    //               title="Save Changes"
    //             >
    //               <a
    //                 type="button"
    //                 className={!isValid ? "saveBtn disabled" : "saveBtn"}
    //                 onClick={() => updateWorkspace(item.id, item)}
    //               >
    //                 <CheckOutlined />
    //               </a>
    //             </Tooltip>
    //             <Tooltip
    //               placement="bottom"
    //               arrowPointAtCenter={true}
    //               title="Cancel"
    //             >
    //               <a
    //                 type="button"
    //                 className="cancelBtn"
    //                 onClick={() => cancel()}
    //               >
    //                 <CloseOutlined />
    //               </a>
    //             </Tooltip>
    //           </div>
    //         </div>
    //       ) : (
    //         <div className="workspace-name">
    //           <NavLink
    //             to={{
    //               pathname: `/files/${item.id}`,
    //               state: { workspaceName: item.name },
    //             }}
    //           >
    //             <p>{item.name}</p>
    //           </NavLink>
    //           {/* <Button type="primary" className="edit" onClick={()=>changeEditMode()}><EditFilled /></Button> */}
    //         </div>
    //       )}
    //       <p>{`${getTimeCal(item.createdOn)} days ago`}</p>
    //       <p>{item.isPrivate ? "Private" : "Public"}</p>
    //       <div className="main-action">
    //         {isInEditMode ? null : (
    //           <Tooltip
    //             placement="bottom"
    //             arrowPointAtCenter={true}
    //             title="Edit"
    //           >
    //             <a
    //               type="button"
    //               className="editBtn"
    //               onClick={() => changeEditMode()}
    //             >
    //               <EditFilled />
    //             </a>
    //           </Tooltip>
    //         )}
    //         <Tooltip
    //           placement="bottom"
    //           arrowPointAtCenter={true}
    //           title="Delete"
    //         >
    //           <a
    //             type="button"
    //             className="deleteBtn"
    //             onClick={() => {
    //               deleteWorkspace(item.id);
    //             }}
    //           >
    //             <DeleteFilled />
    //           </a>
    //         </Tooltip>
    //         {/* <Button type="primary"onClick={()=>{deleteWorkspace(item.id)}} danger>Delete</Button> */}
    //       </div>
    //     </div>
    //   </Card>
    // );
  };

  const WorkspaceList = () => {
    // return (
    //   <List
    //     grid={{
    //       gutter: 16,
    //       xs: 1,
    //       sm: 1,
    //       md: 4,
    //       lg: 4,
    //       xl: 4,
    //       xxl: 4,
    //     }}
    //     dataSource={workspaceData}
    //     renderItem={(item: any) => (
    //       <List.Item>
    //         <WorkspaceCard item={item} />
    //       </List.Item>
    //     )}
    //   />
    // );
  };

  const WorkspaceAddForm = () => {
    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    const tailLayout = {
      wrapperCol: { offset: 8, span: 16 },
    };

    // const addWorkspace = (values: any) => {
    //   setLoading(true);
    //   let newWorkspace: any = {};
    //   newWorkspace["id"] = "6036460d0e12bc27db6df426";
    //   newWorkspace["name"] = values.workspacename;
    //   newWorkspace["createdOn"] = new Date().toISOString();
    //   newWorkspace["owner"] = "abhitube434@gmail.com";
    //   newWorkspace["isOwner"] = true;
    //   newWorkspace["isPrivate"] = false;
    //   newWorkspace["noAccepted"] = true;
    //   setWorkspaceData((prevData: any) => {
    //     return [...prevData, newWorkspace];
    //   });
    //   // form.resetFields();
    //   setVisible(false);
    //   setLoading(false);
    // };

    // return (
      // <Form
      //   {...layout}
      //   form={form}
      //   name="control-hooks"
      //   onFinish={addWorkspace}
      // >
      //   <Form.Item
      //     name="workspacename"
      //     label="Workspace Name"
      //     rules={[{ required: true }]}
      //   >
      //     <Input />
      //   </Form.Item>
      //   <Form.Item {...tailLayout}>
      //     <Button type="primary" htmlType="submit">
      //       Add
      //     </Button>
      //   </Form.Item>
      // </Form>
    // );
  };

  const WorkspaceHeader2 = () => {
    const showModal = () => {
      setVisible(true);
    };

    const handleCancel = (e: any) => {
      setVisible(false);
      // form.resetFields();
    };

    // return (
      // <div className="workspaceHeader">
      //   <Row gutter={[8, 8]}>
      //     <Col xs={24} sm={24} md={12} lg={12} xl={12} className="title">
      //       <h3>My Workspaces</h3>
      //     </Col>
      //     <Col
      //       xs={24}
      //       sm={24}
      //       md={12}
      //       lg={12}
      //       xl={12}
      //       className="workspaceFileBtn"
      //     >
      //       <Button type="primary" onClick={showModal} className="text-dark">
      //         Create New Workspace
      //       </Button>
      //       <Modal
      //         visible={visible}
      //         title="Add Workspace"
      //         onCancel={handleCancel}
      //         footer={null}
      //         destroyOnClose={true}
      //       >
      //         <WorkspaceAddForm />
      //       </Modal>
      //     </Col>
      //   </Row>
      // </div>
    // );
  };

  const WorkspaceHeader = ()=>{
    return(
      <>
        <Grid
            style={{
              backgroundColor: "#66a",
              WebkitBorderBottomLeftRadius: 0,
              WebkitBorderBottomRightRadius: 0,
            }}
            container
        >
            <Grid item lg={12} sm={12}
              style={{
                display: "flex",
                padding: 10,
                justifyContent: "space-between"
              }}
            >
              <h1 className={classes.zeroMargin} style={{color: "#ddd"}}>My Workspaces</h1>
              <Tooltip title="Add new workspace">
                <Button
                  variant="contained"
                  className={classes.topButton}
                  startIcon={<AddIcon/>}
                  style={{
                    backgroundColor: "#fafafa",
                  }}
                  onClick={handleOpen}
                >
                  Add Workspace
                </Button>
              </Tooltip>
            </Grid>
        
            <Grid item lg={12} sm={12} md={12}>
              <div className={classes.root}>
                  <LinearProgress variant="determinate" value={10} />
              </div>
            </Grid>
        </Grid>
      </>
    )
  }

  const addWorkspace = (event:any)=>{
    event.preventDefault();
    if (!loading) {
      setSuccess(false);
      setLoading(true);
      timer.current = window.setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 2000);
    }
    console.log(event)
  }
  const body = (
    <div style={modalStyle} className={classes.paper}>
      <h2>Add New Workspace</h2>
      <form onSubmit={addWorkspace} noValidate autoComplete="off">
        <div style={{display: "flex",flexDirection:"column",justifyContent: "center"}}>
          <TextField label="Enter Workspace Name" style={{width: "100%"}}/>
          <div style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-evenly",
            padding: "5px",
          }}>
            <Tooltip title="Save">
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SaveIcon />}
                type="submit"
              >
                Save
              </Button>
            </Tooltip>
            <Tooltip title="Cancel">
              <Button
                variant="contained"
                size="small"
                startIcon={<CloseIcon />}
                onClick={handleClose}
              >
                Cancel
              </Button>
            </Tooltip>
            
          </div>
        </div>
      </form>
        
    </div>
  );
  
  const WkCard = ()=>{
    return(
      <>
        <Grid item lg={3} md={6} sm={12}>
          <Card className={classes.root}>
            <CardContent style={{textAlign: "center"}}>
              <Typography className={classes.title} variant="h1" color="textPrimary" gutterBottom>
                WorkSpace Name
              </Typography><br/>
              <TextField />
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                20 Days Ago
              </Typography>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                Private
              </Typography>
            </CardContent>
            <CardActions style={{display: "flex", justifyContent: "center"}}>
              <Tooltip title="Edit workspace">
                <Button size="small" color="primary" startIcon={<EditIcon/>} variant="contained">Edit</Button>
              </Tooltip>
              <Tooltip title="Delete workspace">
                <Button size="small" color="secondary" startIcon={<DeleteIcon />} variant="contained">Delete</Button>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      </>
    )
  }

  
const handleText = (event:any)=>{
  console.log('setInput',event.target.value)
}
  const AddWorkspaceDialog = ()=>{
    return(
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Workspace</DialogTitle>
        <form onSubmit={addWorkspace} noValidate autoComplete="off">
          <DialogContent>
            <DialogContentText>
              Please enter workspace name and click on submit button to create new workspace
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              onChange={handleText}
              label="Enter Workspace Name"
              type="text"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
        <Tooltip title="Cancel">
          <span>
          <Button 
          disabled={loading}
          onClick={handleClose} startIcon={<CloseIcon/>} variant="contained">
            Cancel
          </Button>
          </span>
        </Tooltip>
        <div className={classes.wrapper}>
        <Tooltip title="Create Workspace">
          <span>
          <Button
          disabled={loading}
          type="submit"
          startIcon={<AddIcon/>} variant="contained" color="primary">
            Create
          </Button>
          </span>
        </Tooltip>
          {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        </DialogActions>
        </form>
      </Dialog>
    )
  }

  
  return (
  <>
  <AddWorkspaceDialog/>
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
      <WorkspaceHeader/>
          <Grid container spacing={2}
            style={{
              padding: "10px",
              backgroundColor: "#ddd",
              margin: "auto",
              width: "100%"
            }}
          >
            <WkCard/>
            <WkCard/>
          </Grid>
    </Grid>
  </Grid>
    {/* <div className="block workspaceBlock" style={{background: "red"}}>
      {/* <div className="container-fluid">

        {/* <WorkspaceHeader /> *}
        {loading ? <h1>Loading...</h1> : <WorkspaceList />}
      </div> */}
      {/* <div className="container-fluid">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h1" component="h2">
                My WorkSpaces
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </div> *}
    </div> */}
    </>
  );
};
export default Workspaces;
