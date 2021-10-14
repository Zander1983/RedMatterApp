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
  AddQueueItem: (newEvent: WorkspaceEvent) => {
    const id = createID();
    newEvent.id = id;
    return store.dispatch({
      type: eventQueueActions.ADD_QUEUE_ITEM,
      payload: { event: newEvent },
    });
  },
  DeleteQueueItem: (id: any) => {
    return store.dispatch({
      type: eventQueueActions.DELETE_QUEUE_ITEM,
      payload: { id: id },
    });
  },
  UpdateUsed: (id: any) => {
    return store.dispatch({
      type: eventQueueActions.UPDATE_USED,
      payload: { id: id },
    });
  },
};

export default EventQueueDispatch;
