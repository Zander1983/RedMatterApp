import { store } from "redux/store";
import { eventQueueActions } from "./eventQueueReduxActions";
import { WorkspaceEvent } from "graph/resources/types";
import { createID } from "graph/utils/id";

const EventQueueDispatch = {
  Reset: () => {
    return store.dispatch({
      type: eventQueueActions.RESET,
    });
  },
  ResetWorkspaceExceptFiles: (newEvent: WorkspaceEvent) => {
    const id = createID();
    newEvent.id = id;
    return store.dispatch({
      type: eventQueueActions.ADD_QUEUE_ITEM,
      payload: { event: newEvent },
    });
  },
  LoadWorkspace: (deleteEvent: WorkspaceEvent) => {
    return store.dispatch({
      type: eventQueueActions.ADD_QUEUE_ITEM,
      payload: { event: deleteEvent },
    });
  },
};

export default EventQueueDispatch;
