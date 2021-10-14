import { store } from "redux/store";
import { createID } from "../utils/id";
import { Notification as NotificationType } from "graph/resources/types";
import { Button, CircularProgress, Grid } from "@material-ui/core";
import { useSelector } from "react-redux";
import Clear from "@material-ui/icons/Clear";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";

const NotificationsOverlay = () => {
  const allNotifications: NotificationType[] | undefined = useSelector(
    (e: any) => (e.workspace?.notifications ? e.workspace.notifications : [])
  );

  const deleteNotification = (e: NotificationType) => {
    WorkspaceDispatch.DeleteNotification(e);
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
            style={{
              backgroundColor: "#EEF",
              border: "solid 1px #ddd",
              boxShadow: "rgba(100, 100, 111, 0.2) 0px 3px 3px 0px",
              padding: 3,
              paddingTop: 5,
              borderRadius: 5,
              marginTop: 5,
              textAlign: "left",
            }}
          >
            <button
              onClick={() => deleteNotification(e)}
              style={{ height: 20, border: 0 }}
            >
              <Clear fontSize="small" style={{ marginTop: -2 }} />
            </button>
            <CircularProgress size={17} />
            <b style={{ marginLeft: 10, marginTop: -3 }}>{e.message}</b>
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
    WorkspaceDispatch.AddNotification({
      id,
      message,
    });
    this.id = id;
    this.message = message;
    if (timeout) {
      setTimeout(() => this.killNotification(), timeout);
    }
  }

  killNotification() {
    WorkspaceDispatch.DeleteNotification({
      id: this.id,
      message: this.message,
    });
  }
}

export default NotificationsOverlay;
