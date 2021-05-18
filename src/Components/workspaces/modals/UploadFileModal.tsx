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
  const classes = useStyles();

  const organizationId = userManager.getOrganiztionID();
  const [name, setName] = React.useState("");
  const [privateWorkspace, setPrivateWorkspace] = React.useState(false);
  const [files, setFiles] = React.useState([]);

  const uploadFileToWorkpace = async () => {
    for (const file of files) {
      const fileReader = new FileReader();
      console.log(file);
      //@ts-ignore
      await fileReader.readAsDataURL(file);
      console.log(fileReader);
      // WorkspaceFilesApiFetchParamCreator({
      //   accessToken: userManager.getToken(),
      // }).uploadFile(
      //   userManager.getToken(),
      //   props.workspace.id,
      //   userManager.getOrganiztionID(),
      //   blob
      // );
    }
    // const fetchArgs = WorkspacesApiFetchParamCreator({
    //   accessToken: userManager.getToken(),
    // }).createWorkspace(userManager.getToken(), data);
    // axios
    //   .post(fetchArgs.url, data, {
    //     headers: fetchArgs.options.headers,
    //   })
    //   .then((e) => {
    //     props.closeCall.f(props.closeCall.ref);
    //     props.added();
    //     setName("");
    //     setPrivateWorkspace(false);
    //   })
    //   .catch((e) => {
    //     snackbarService.showSnackbar(
    //       "Could not create workspace, reload the page and try again!",
    //       "error"
    //     );
    //   });
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
