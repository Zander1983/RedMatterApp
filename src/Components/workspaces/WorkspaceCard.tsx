import React from "react";
import { NavLink } from "react-router-dom";
import { snackbarService } from "uno-material-ui";
import axios from "axios";
import userManager from "Components/users/userManager";
import Alert from "@material-ui/lab/Alert";
import {
  Grid,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Tooltip,
} from "@material-ui/core";

import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

import { getHumanReadableTimeDifference } from "utils/time";
import { WorkspacesApiFetchParamCreator } from "api_calls/nodejsback/api";
import MessageModal from "graph/components/modals/MessageModal";

const styles = {
  title: {
    fontSize: 14,
    color: "#222",
  },
};

export default function WorkspaceCard(props: { data: any; update: Function }) {
  const getTimeCal = (date: string) => {
    return getHumanReadableTimeDifference(new Date(date), new Date());
  };

  const deleteWorkspace = () => {
    const fetchArgs = WorkspacesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).deleteWorkspace(props.data.id, userManager.getToken());
    axios
      .delete(fetchArgs.url, fetchArgs.options)
      .then((e) => {
        snackbarService.showSnackbar("Workspace deleted", "success");
        props.update();
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Failure deleting workspace, refresh the page and try again!",
          "error"
        );
      });
  };

  const editWorkspace = () => {
    const fetchArgs = WorkspacesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).appWorkspace(userManager.getOrganiztionID(), userManager.getToken());
    axios.get(fetchArgs.url, fetchArgs.options).then((e) => {});
  };

  const [open, setOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <MessageModal
        open={deleteConfirmModal}
        closeCall={{
          f: handleClose,
          ref: setDeleteConfirmModal,
        }}
        message={<h2>Are you sure you want to delete this workspace?</h2>}
        options={{
          yes: deleteWorkspace,
          no: () => {
            setDeleteConfirmModal(false);
          },
        }}
      />
      <Grid item lg={3} md={6} sm={12}>
        <Card>
          <CardContent style={{ textAlign: "center" }}>
            <NavLink
              to={{
                pathname: `/files/${props.data.id}`,
                state: { workspaceName: props.data.name },
              }}
            >
              <Typography
                style={{
                  fontWeight: "bold",
                  color: "#66a",
                  marginBottom: "5px",
                }}
                color="textPrimary"
                align="center"
                gutterBottom
                noWrap
              >
                {props.data.name}
              </Typography>
            </NavLink>
            <Typography style={styles.title} color="textSecondary" gutterBottom>
              {getTimeCal(props.data.createdOn)}
            </Typography>
            <Typography style={styles.title} color="textSecondary" gutterBottom>
              {props.data.isPrivate ? "Private" : "Public"}
            </Typography>
          </CardContent>
          <CardActions style={{ display: "flex", justifyContent: "center" }}>
            <Tooltip title="Edit workspace">
              <Button
                size="small"
                color="primary"
                startIcon={<EditIcon />}
                variant="contained"
              >
                Edit
              </Button>
            </Tooltip>
            <Tooltip title="Delete workspace">
              <Button
                size="small"
                color="secondary"
                startIcon={<DeleteIcon />}
                variant="contained"
                onClick={() => setDeleteConfirmModal(true)}
              >
                Delete
              </Button>
            </Tooltip>
          </CardActions>
        </Card>
      </Grid>
    </>
  );
}
