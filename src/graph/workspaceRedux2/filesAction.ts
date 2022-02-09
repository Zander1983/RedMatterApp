import { File } from "graph/resources/types";

export const filesActions = {
  SET: "file.SET",
};
interface FileInterface {
  files: File[];
}

const initialState: FileInterface = {
  files: [],
};

const filesReducers = (state = initialState, action: any) => {
  switch (action.type) {
    case filesActions.SET:
      return {
        ...state,
        files: [...action.payload.files],
      };
    default:
      return state;
  }
};

export default filesReducers;
