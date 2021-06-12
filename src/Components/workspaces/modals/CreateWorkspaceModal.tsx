import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, FormControlLabel, Switch } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

import userManager from "Components/users/userManager";
import {
  ExperimentApiFetchParamCreator,
  WorkspacesApiFetchParamCreator,
} from "api_calls/nodejsback";
import axios from "axios";
import { snackbarService } from "uno-material-ui";
import PrototypeForm from "Components/home/PrototypeForm";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  modal: {
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
  },
}));

function CreateWorkspaceModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  created: Function;
  experiments: string[];
}): JSX.Element {
  const dispatch = useDispatch();
  const classes = useStyles();

  const organizationId = userManager.getOrganiztionID();
  const [name, setName] = React.useState("");
  const [privateWorkspace, setPrivateWorkspace] = React.useState(false);
  const [formData, setFormData] = React.useState(null);

  const createExperiment = () => {
    const req = ExperimentApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).createExperiment(
      { details: formData, name: name },
      userManager.getToken()
    );
    axios
      .post(req.url, req.options.body, req.options)
      .then((e) => {
        props.closeCall.f(props.closeCall.ref);
        props.created(e.data.id);
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Could not create experiment, reload the page and try again!",
          "error"
        );
      });
    dispatch({
      type: "EXPERIMENT_FORM_DATA_CLEAR",
    });
    
  };

  return (
    <div>
      <Modal
        open={props.open}
        onClose={() => {
          props.closeCall.f(props.closeCall.ref);
        }}
      >
        <div className={classes.modal}>
          <h2>Create workspace</h2>

          <PrototypeForm
            //@ts-ignore
            onSend={(e) => {
              setFormData(e);
            }}
          ></PrototypeForm>

          <div
            style={{
              marginTop: 30,
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Experiment name"
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
                if (props.experiments.includes(name)) {
                  snackbarService.showSnackbar(
                    "A experiment with this name already exists",
                    "warning"
                  );
                  return;
                }
                createExperiment();
              }}
              disabled={formData === null}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CreateWorkspaceModal;
