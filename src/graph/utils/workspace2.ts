import { File, Workspace2 } from "graph/resources/types";
import { store } from "redux/store";

export const getWorkspace2 = (): Workspace2 => {
  return store.getState().workspace2;
};

export const getFileById2 = (id: string): File => {
  return store.getState().files.files.find((f: any) => f.id === id) || null;
};
