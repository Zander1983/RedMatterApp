import React, { useEffect, useState } from "react";
import userManager from "Components/users/userManager";
import axios from "axios";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function AddUsersModal(props: {
  open: boolean;
  user: any;
  close: Function;
  copiedToClipboard: Function;
}) {
  const [orgId, setOrgId] = useState("Loading your key...");

  useEffect(() => {
    if (props.user != null) {
      axios
        .post(
          "/organisation/key",
          {
            subscriptionId: props.user.userDetails.subscriptionId,
          },
          {
            headers: {
              token: userManager.getToken(),
            },
          }
        )
        .then((response) => {
          setOrgId(response.data);
        })
        .catch((err) => {});
    }
  });
  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
          Add Users To Your Organisation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Send this Key to your new team member, they will be added to your
            institution if they sign up with it.
            <br></br>
            <br></br>
            <i
              style={{
                color: "#3f4145",
                wordWrap: "break-word",
                fontWeight: 500,
              }}
            >
              {orgId}
            </i>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              props.close();
            }}
            color="primary"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(orgId);
              props.copiedToClipboard();
            }}
            color="primary"
          >
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
