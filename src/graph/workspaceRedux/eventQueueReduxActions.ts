import { WorkspaceEvent, WorkspaceEventQueue } from "graph/resources/types";

export const eventQueueActions = {
  RESET: "eventQueue.RESET",
  ADD_QUEUE_ITEM: "eventQueue.ADD",
  DELETE_QUEUE_ITEM: "eventQueue.DELETE",
  UPDATE_USED: "eventQueue.UPDATE_USED",
};

export const initialState: WorkspaceEventQueue = {
  queue: [],
};

const eventQueueReducer = (
  state: WorkspaceEventQueue = initialState,
  action: any
) => {
  switch (action.type) {
    case eventQueueActions.RESET:
      return initialState;

    case eventQueueActions.ADD_QUEUE_ITEM:
      const newEvent: WorkspaceEvent = action.payload.event;
      if (state.queue.find((e) => e.id === newEvent.id)) {
        console.error("[eventQueue.ADD] Event already in workspace");
        return state;
      }
      return {
        ...state,
        queue: [...state.queue, newEvent],
      };

    case eventQueueActions.DELETE_QUEUE_ITEM:
      const deleteEventId = action.payload.id;
      if (!state.queue.find((e) => e.id === deleteEventId)) {
        console.error("[eventQueue.DELETE] Event does not exist");
        return state;
      }
      return {
        ...state,
        queue: state.queue.filter((e) => e.id !== deleteEventId),
      };
    case eventQueueActions.UPDATE_USED:
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

export default eventQueueReducer;
