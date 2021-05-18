import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, FormControlLabel, Switch } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import { DropzoneArea } from "material-ui-dropzone";

import userManager from "Components/users/userManager";
import {
  WorkspaceFilesApiFetchParamCreator,
  WorkspacesApiFetchParamCreator,
} from "api_calls/nodejsback";
import axios from "axios";
import { snackbarService } from "uno-material-ui";
import { cssNumber } from "jquery";
import oldBackFileUploader from "utils/oldBackFileUploader";

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

function UploadFileModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  added: Function;
  workspace: any;
}): JSX.Element {
  const forceUpdate = 
  const classes = useStyles();

  const organizationId = userManager.getOrganiztionID();
  const [name, setName] = React.useState("");
  const [privateWorkspace, setPrivateWorkspace] = React.useState(false);
  const [files, setFiles] = React.useState([]);
  const [filesUploaded, setFilesUploaded] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);

  const endFileUpload = () => {
    console.log("files uploaded!");
  };

  const uploadFileToWorkpace = () => {
    setUploading(true);
    let uploaded = [];
    for (const file of files) {
      uploaded.push(false);
    }
    setFilesUploaded(uploaded);
    for (let i = 0; i < files.length; i++) {
      oldBackFileUploader(
        userManager.getToken(),
        props.workspace.id,
        userManager.getOrganiztionID(),
        files[i]
      )
        .then((e) => {
          console.log("success");
          let nf = filesUploaded;
          nf[i] = true;
          setFiles(nf);
          if (nf.filter((e) => !e).length === 0) {
            endFileUpload();
          }
        })
        .catch((e) => {
          snackbarService.showSnackbar(
            "There was an error uploading your file, please try again",
            "error"
          );
        });
    }
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
          <h2>Upload a file</h2>
          {uploading ? (
            <div>
              Uploading files... (
              {(files.filter((e) => !e).length / files.length).toFixed(2)}
              %)
            </div>
          ) : null}
          <DropzoneArea
            acceptedFiles={[".fcs"]}
            filesLimit={1000}
            maxFileSize={1073741824} // gigabyte
            onChange={(e: any) => {
              console.log(e);
              setFiles(e);
            }}
          ></DropzoneArea>
          {/* 
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
          /> */}

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
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "#43A047", color: "white" }}
              onClick={() => {
                uploadFileToWorkpace();
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default UploadFileModal;
