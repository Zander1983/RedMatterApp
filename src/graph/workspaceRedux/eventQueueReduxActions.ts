import { WorkspaceEvent, WorkspaceEventQueue } from "graph/resources/types";

export const eventQueueActions = {
  RESET: "eventQueue.RESET",
  ADD_QUEUE_ITEM: "eventQueue.ADD",
  DELETE_QUEUE_ITEM: "eventQueue.DELETE",
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
      const deleteEvent: WorkspaceEvent = action.payload.event;
      if (!state.queue.find((e) => e.id === deleteEvent.id)) {
        console.error("[eventQueue.DELETE] Event does not exist");
        return state;
      }
      return {
        ...state,
        queue: state.queue.filter((e) => e.id !== deleteEvent.id),
      };

    default:
      return state;
  }
};

export default eventQueueReducer;
