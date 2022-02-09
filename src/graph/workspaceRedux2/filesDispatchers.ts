import { store } from "redux/store";
import { filesActions } from "./filesAction";
import { File } from "graph/resources/types";

const FilesDispatch = {
  SetFiles: (files: File[]) => {
    return store.dispatch({
      type: filesActions.SET,
      payload: { files },
    });
  },
};

export default FilesDispatch;
