import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, FormControlLabel, Switch } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import userManager from "Components/users/userManager";
import {
  ExperimentApiFetchParamCreator,
  WorkspacesApiFetchParamCreator,
} from "api_calls/nodejsback";
import axios from "axios";
import { snackbarService } from "uno-material-ui";
import { useDispatch, useStore} from "react-redux";
import PrototypeForm from "Components/home/PrototypeForm";
import PrototypeForm2 from "Components/home/PrototypeForm2";
import CreateExperimentDialog from "./CreateExperimentDialog";

const useStyles = makeStyles((theme) => ({
  modal: {
    backgroundColor: "#fafafa",
    boxShadow: theme.shadows[6],
    padding: "0px 0 20px",
    width: "800px",
    position: "absolute",
    left: "50%",
    top: "30%",
    marginLeft: "-400px",
    marginTop: "-150px",
    textAlign: "center",
    borderRadius: 10,
  },
}));



function CreateWorkspaceModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  created: Function;
  workspaces: string[];
}): JSX.Element {
  const store = useStore();
  const dispatch = useDispatch();
  const classes = useStyles();

  const organizationId = userManager.getOrganiztionID();
  const [name, setName] = React.useState("");
  const [privateWorkspace, setPrivateWorkspace] = React.useState(false);
  const [formData, setFormData] = React.useState(null);
  const [createExperimentDialog, setCreateExperimentDialog] = React.useState(false);

  const createWorkspace = () => {
    const data = {
      name,
      organisationId: organizationId,
      isPrivate: privateWorkspace,
    };
  

    const fetchArgs = WorkspacesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).createWorkspace(userManager.getToken(), data);
    axios
      .post(fetchArgs.url, data, {
        headers: fetchArgs.options.headers,
      })
      .then((e) => {
        props.closeCall.f(props.closeCall.ref);
        props.created(e.data.id);
        setName("");
        setPrivateWorkspace(false);
        const workspaceID = e.data.id;
        // This should create an experiment assigning this data to that experiment
        const req = ExperimentApiFetchParamCreator({
          accessToken: userManager.getToken(),
        }).createExperiment(
          { details: formData },
          userManager.getToken(),
          workspaceID
        );
        axios
          .post(req.url, req.options.body, req.options)
          .then((e) => {})
          .catch((e) => {});
        dispatch({
          type: "EXPERIMENT_FORM_DATA_CLEAR",
        });
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Could not create workspace, reload the page and try again!",
          "error"
        );
      });
  };


  

  const handleSubmit = () => {
    console.log("working handleSubmit")
    console.log(Object.values(store.getState().user.experiment).every(item => item != null))
  {/* WHAT THIS  Object.values(store.getState().user.experiment).every(item => item != null) MEANS
      IS THAT WE IF EVERY VALUE OF THE STATE IS DIFFERENT OF NULL, THEN IT CAN GO ON, ELSE, FILL THE REQUIRED FIELDS
   */}
    if(Object.values(store.getState().user.experiment).every(item => item != null)){
      // alert("All fields filled")
      setCreateExperimentDialog(true)
      console.log(createExperimentDialog)
    } else { 
      
      alert("There are still some required fields empty")
    }
  };

  const handleClose = (func: Function) => {
    func(false);
  };

  return (
    <div>
      <CreateExperimentDialog
        open = {createExperimentDialog}
        closeCall={{
          f: handleClose,
          ref: setCreateExperimentDialog,
        }}
      />

      <Modal
        open={props.open}
        onClose={() => {
          props.closeCall.f(props.closeCall.ref);
        }}
        disableScrollLock = {true}
        style={{
          overflow: 'scroll',
          padding: '0'
        }}
      >
        
        <div className={classes.modal}>
          <div
            style = {{
              backgroundColor: "#6666A9",
              color: "#FFF",
              padding: "20px 0 10px "
            }}
          >
          <h2 style = {{
              color: "#FFF",
            }}>Create Experiment</h2>
          </div>
          

          <PrototypeForm2
            //@ts-ignore
            onSend={(e) => {
              setFormData(e);
            }}
          ></PrototypeForm2>

          <div
            style={{
              marginTop: 30,
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Workspace name"
              onChange={(textField: any) => {
                setName(textField.target.value);
              }}
              value={name}
              style={{
                width: "50%",
              }}
            ></TextField>
          </div>

          <FormControlLabel
            style={{
              marginTop: 10,
            }}
            control={
              <Switch
                checked={privateWorkspace}
                onChange={() => setPrivateWorkspace(!privateWorkspace)}
                name="Private workspace"
                color="primary"
              />
            }
            label="Private workspace"
          />

          {privateWorkspace ? (
            <p>No one in your workspace will be able to see this workspace</p>
          ) : null}

          <Divider
            style={{
              marginTop: 10,
              marginBottom: 10,
            }}
          ></Divider>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "50%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <Button
              variant="contained"
              style={{ backgroundColor: "#F44336", color: "white" }}
              onClick={() => {
                props.closeCall.f(props.closeCall.ref);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              style={{
                backgroundColor: formData === null ? "#ddd" : "#43A047",
                color: "white",
              }}
              onClick={() => {
                if (name === "" || name === undefined || name === null) {
                  snackbarService.showSnackbar(
                    "Experiment name cannot not be empty",
                    "warning"
                  );
                  return;
                }
                if (props.workspaces.includes(name)) {
                  snackbarService.showSnackbar(
                    "An experiment with this name already exists",
                    "warning"
                  );
                  return;
                }
                createWorkspace();
              }}
              disabled={formData === null}
            >
              Confirm
            </Button>
            <Button
            variant="contained"
            style={{ backgroundColor: "#6666A9", color: "white" }}
            onClick={() => {handleSubmit();}}>
            Finish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CreateWorkspaceModal;
