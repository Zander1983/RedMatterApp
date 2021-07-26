import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { snackbarService } from "uno-material-ui";
import { Scrollbars } from "react-custom-scrollbars";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Divider from "@material-ui/core/Divider";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import LinkReconstructor from "graph/dataManagement/reconstructors/linkReconstructor";
import dataManager from "graph/dataManagement/dataManager";

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
  linkArea: {
    backgroundColor: "#dadada",
    borderRadius: 5,
    width: 600,
    height: 50,
    padding: 10,
    marginTop: 30,
  },
}));

function LinkShareModal(props: {
  open: boolean;
  workspaceId: string;
  closeCall: { f: Function; ref: Function };
}): JSX.Element {
  const classes = useStyles();
  const linkReconstructor = new LinkReconstructor();
  let link = "";
  if (props.open) {
    link = linkReconstructor.store(
      dataManager.currentWorkspace,
      props.workspaceId
    );
  }

  function copyToClipBoard() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(
        function () {
          snackbarService.showSnackbar("Copied to clipboard.", "success");
        },
        function (err) {
          snackbarService.showSnackbar(
            "Failed to copy to clipboard. Please try again.",
            "error"
          );
        }
      );
    } else {
      snackbarService.showSnackbar(
        "This functionality doesn't works in this browser",
        "warning"
      );
    }
  }

  return (
    <Modal
      open={props.open}
      onClose={() => {
        props.closeCall.f(props.closeCall.ref);
      }}
    >
      <div className={classes.modal}>
        <Grid container alignItems="center" direction="column">
          <h2>Share your workspace</h2>
          <p style={{ marginTop: 20 }}>
            Copy this link and send it to people you want to show your
            workspace. <br />
            Be sure you save it so you can use it later, too.
          </p>
          <Grid className={classes.linkArea} container direction="row">
            <Grid
              style={{
                marginTop: 2,
                textAlign: "left",
                height: 30,
                flex: 1,
              }}
            >
              <p
                style={{
                  width: 500,
                  overflowX: "hidden",
                  overflowY: "hidden",
                  textAlign: "center",
                  fontFamily:
                    "SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace",
                  fontSize: 14,
                  marginTop: 2,
                }}
              >
                {link.substring(0, 55)}...
              </p>
            </Grid>
            <Grid
              style={{
                marginTop: -3,
                marginRight: -5,
                textAlign: "right",
              }}
            >
              <Divider orientation="vertical"></Divider>
              <Button
                style={{
                  marginLeft: 5,
                  marginTop: -60,
                }}
                onClick={() => {
                  copyToClipBoard();
                }}
              >
                <FileCopyOutlinedIcon />
              </Button>
            </Grid>
          </Grid>
          <p style={{ marginTop: 20, fontWeight: 500 }}>
            NOTICE: Workspaces sharing is exclusively private, for now
          </p>
          <RadioGroup style={{ marginLeft: 20, marginTop: -15 }}>
            <FormControlLabel
              value="private"
              control={<Radio />}
              disabled
              label="Private (only you can access)"
              checked={true}
            />
            <FormControlLabel
              value="organization"
              control={<Radio />}
              disabled
              label="Organization (only people in your
            organization can access)"
            />
            <FormControlLabel
              value="public"
              control={<Radio />}
              disabled
              label="Public (everyone with the link can
            access)"
            />
          </RadioGroup>
        </Grid>
      </div>
    </Modal>
  );
}

export default LinkShareModal;
