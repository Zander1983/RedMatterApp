import { Workspace2 } from "graph/resources/types";
import { store } from "redux/store";

export const getWorkspace2 = (): Workspace2 => {
  return store.getState().workspace2;
};
