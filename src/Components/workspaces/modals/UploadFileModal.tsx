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

function useForceUpdate() {
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

let sum = 0;
function UploadFileModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  added: Function;
  workspace: any;
}): JSX.Element {
  const forceUpdate = useForceUpdate();
  const classes = useStyles();

  const organizationId = userManager.getOrganiztionID();
  const [name, setName] = React.useState("");
  const [privateWorkspace, setPrivateWorkspace] = React.useState(false);
  const [files, setFiles] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);

  const endFileUpload = () => {
    setTimeout(() => {
      snackbarService.showSnackbar("Files have been uploaded!", "success");
      props.added();
      props.closeCall.f(props.closeCall.ref);
      sum = 0;
      setUploading(false);
    }, Math.random() * 1000); // Feels much better to use with this little detail
  };

  const uploadFileToWorkpace = () => {
    setUploading(true);
    const addP = 100 / files.length;
    for (let i = 0; i < files.length; i++) {
      oldBackFileUploader(
        userManager.getToken(),
        props.workspace.id,
        userManager.getOrganiztionID(),
        files[i]
      )
        .then((e) => {
          if (sum + addP >= 100) {
            endFileUpload();
          }
          sum += addP;
          forceUpdate();
        })
        .catch((e) => {
          snackbarService.showSnackbar(
            "There was an error uploading your file, please try again",
            "error"
          );
          setUploading(false);
          forceUpdate();
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
              Uploading files... ({sum.toFixed(0)}%)
              <div
                style={{
                  height: 20,
                  width: "100%",
                  backgroundColor: "#aaa",
                  marginBottom: 20,
                  borderRadius: 10,
                  padding: 2,
                }}
              >
                <div
                  style={{
                    height: 16,
                    width: sum + "%",
                    backgroundColor: "#6666AA",
                    borderRadius: 10,
                  }}
                ></div>
              </div>
            </div>
          ) : null}
          <DropzoneArea
            acceptedFiles={[".fcs"]}
            filesLimit={1000}
            maxFileSize={1073741824} // gigabyte
            onChange={(e: any) => {
              setFiles(e);
            }}
          ></DropzoneArea>

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
                forceUpdate();
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
