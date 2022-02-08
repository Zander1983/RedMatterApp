import { WorkspaceEvent, WorkspaceEventQueue } from "graph/resources/types";

export const eventQueueActions2 = {
  RESET: "eventQueue2.RESET",
  ADD_QUEUE_ITEM: "eventQueue2.ADD",
  DELETE_QUEUE_ITEM: "eventQueue2.DELETE",
  UPDATE_USED: "eventQueue2.UPDATE_USED",
};

export const initialState: WorkspaceEventQueue = {
  queue: [],
};

const eventQueue2Reducers = (
  state: WorkspaceEventQueue = initialState,
  action: any
) => {
  switch (action.type) {
    case eventQueueActions2.RESET:
      return initialState;

    case eventQueueActions2.ADD_QUEUE_ITEM:
      const newEvent: WorkspaceEvent = action.payload.event;
      if (state.queue.find((e) => e.id === newEvent.id)) {
        console.error("[eventQueue.ADD] Event already in workspace");
        return state;
      }
      return {
        ...state,
        queue: [...state.queue, newEvent],
      };

    case eventQueueActions2.DELETE_QUEUE_ITEM:
      const deleteEventId = action.payload.id;
      if (!state.queue.find((e) => e.id === deleteEventId)) {
        console.error("[eventQueue.DELETE] Event does not exist");
        return state;
      }
      return {
        ...state,
        queue: state.queue.filter((e) => e.id !== deleteEventId),
      };
    case eventQueueActions2.UPDATE_USED:
      const updateEventId = action.payload.id;
      let queue = state.queue;
      let eventIndex = queue.findIndex((e) => e.id === updateEventId);
      if (eventIndex == -1) {
        console.error("[eventQueue.DELETE] Event does not exist");
        return state;
      }
      queue[eventIndex].used = true;
      return {
        ...state,
        queue: queue,
      };

    default:
      return state;
  }
};

export default eventQueue2Reducers;
