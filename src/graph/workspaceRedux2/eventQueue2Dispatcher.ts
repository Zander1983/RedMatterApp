import { store } from "redux/store";
import { eventQueueActions2 } from "./eventQueue2Actions";
import { WorkspaceEvent } from "graph/resources/types";
import { createID } from "graph/utils/id";

const EventQueue2Dispatch = {
  Reset: () => {
    return store.dispatch({
      type: eventQueueActions2.RESET,
    });
  },
  AddQueueItem: (newEvent: WorkspaceEvent) => {
    const id = createID();
    newEvent.id = id;
    return store.dispatch({
      type: eventQueueActions2.ADD_QUEUE_ITEM,
      payload: { event: newEvent },
    });
  },
  DeleteQueueItem: (id: any) => {
    return store.dispatch({
      type: eventQueueActions2.DELETE_QUEUE_ITEM,
      payload: { id: id },
    });
  },
  UpdateUsed: (id: any) => {
    return store.dispatch({
      type: eventQueueActions2.UPDATE_USED,
      payload: { id: id },
    });
  },
};

export default EventQueue2Dispatch;
