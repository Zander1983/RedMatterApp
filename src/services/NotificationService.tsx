import { store } from "redux/store";
import { createID } from "../graph/utils/id";
import { Notification as NotificationType } from "graph/resources/types";
import { Button, CircularProgress, Grid } from "@material-ui/core";
import { useSelector } from "react-redux";
import Clear from "@material-ui/icons/Clear";

const NotificationsOverlay = () => {
  const allNotifications: NotificationType[] | undefined = useSelector(
    (e: any) => (e.workspace?.notifications ? e.workspace.notifications : [])
  );

  const deleteNotification = (e: NotificationType) => {
    store.dispatch({
      type: "workspace.DELETE_NOTIFICATION",
      payload: {
        notification: e,
      },
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 10,
        top: 150,
        zIndex: 1001,
      }}
    >
      {allNotifications.map((e) => {
        return (
          <Grid
            key={e.id}
            container
            justify="center"
            style={{
              backgroundColor: "#EEF",
              border: "solid 1px #ddd",
              boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
              padding: 3,
              paddingTop: 5,
              borderRadius: 5,
              marginTop: 3,
            }}
          >
            <CircularProgress size={17} />
            <b style={{ marginLeft: 10, marginTop: -3 }}>{e.message}</b>
            <Button
              onClick={() => deleteNotification(e)}
              style={{ height: 20 }}
            >
              <Clear fontSize="small" style={{ marginTop: -2 }} />
            </Button>
          </Grid>
        );
      })}
    </div>
  );
};

export class Notification {
  id: string;
  message: string;

  constructor(message: string, timeout?: number) {
    const id = createID();
    store.dispatch({
      type: "workspace.ADD_NOTIFICATION",
      payload: {
        notification: {
          id,
          message,
        },
      },
    });
    this.id = id;
    this.message = message;
    if (timeout) {
      setTimeout(() => this.killNotification(), timeout);
    }
  }

  killNotification() {
    store.dispatch({
      type: "workspace.DELETE_NOTIFICATION",
      payload: {
        notification: {
          id: this.id,
          message: this.message,
        },
      },
    });
  }
}

export default NotificationsOverlay;
