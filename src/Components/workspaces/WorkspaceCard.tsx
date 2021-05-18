import React, { useEffect } from "react";
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
  const [files, setFiles] = React.useState([]);
  const [initLoading, setInitLoading] = React.useState(true);
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
        userManager.logout();
      });
  };

  const fetchWorkspaceFiles = () => {
    setInitLoading(false);
  };

  const [open, setOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = React.useState(false);
  const [editodal, setEditodal] = React.useState(false);

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

  useEffect(() => {
    fetchWorkspaceFiles();
  }, []);

  return (
    <Grid
      style={{
        padding: 5,
      }}
      xs={6}
      md={4}
      lg={3}
    >
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
      <Grid item>
        <Card>
          <NavLink
            to={{
              pathname: `/workspace/${props.data.id}`,
              state: { workspaceName: props.data.name },
            }}
          >
            <CardContent style={{ margin: 0, padding: 0, textAlign: "center" }}>
              <div
                style={{
                  backgroundColor: "#6666AA",
                  borderRadius: 10,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                <Typography
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    marginBottom: "5px",
                    fontSize: 18,
                    padding: 5,
                  }}
                  color="textPrimary"
                  align="center"
                  gutterBottom
                  noWrap
                >
                  {props.data.name}
                </Typography>
              </div>
              <div>
                <Typography
                  style={styles.title}
                  color="textSecondary"
                  gutterBottom
                >
                  {getTimeCal(props.data.createdOn)}
                </Typography>
                <Typography
                  style={styles.title}
                  color="textSecondary"
                  gutterBottom
                >
                  {props.data.isPrivate ? "Private" : "Public"}
                </Typography>
                <Typography
                  style={styles.title}
                  color="textSecondary"
                  gutterBottom
                >
                  {initLoading
                    ? "Loading files..."
                    : files.length.toString() +
                      " file" +
                      (files.length !== 1 ? "s" : "")}
                </Typography>
              </div>
            </CardContent>
          </NavLink>
          <CardActions style={{ display: "flex", justifyContent: "center" }}>
            {/* <Tooltip title="Edit workspace">
              <Button
                size="small"
                color="primary"
                startIcon={<EditIcon />}
                variant="contained"
              >
                Edit
              </Button>
            </Tooltip> */}
            <Tooltip title="Delete workspace">
              <Button
                size="small"
                color="secondary"
                startIcon={<DeleteIcon />}
                variant="outlined"
                onClick={() => setDeleteConfirmModal(true)}
              >
                Delete
              </Button>
            </Tooltip>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
}
