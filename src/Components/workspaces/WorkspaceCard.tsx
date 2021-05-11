import React from "react";
import { NavLink } from "react-router-dom";

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

const styles = {
  title: {
    fontSize: 14,
    color: "#222",
  },
};

export default function WorkspaceCard(props: { data: any }) {
  const getTimeCal = (date: string) => {
    const date1 = new Date(date);
    const date2 = new Date();
    let days = "";
    let totalDays = Math.floor(
      (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)
    );
    if (Math.floor(totalDays / 31) > 0) {
      days = `${Math.floor(totalDays / 31)} Months Ago`;
    } else {
      days = `${totalDays} Days Ago`;
    }
    return days;
  };

  return (
    <>
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
