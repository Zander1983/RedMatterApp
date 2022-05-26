const initialState: any = {
  files: [],
};

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case "ADD_FCS_FILE":
      console.log("in add fcs file and action.payload is ", action.payload);
      // return {
      //   ...state,
      //   files: action.payload,
      // };

      console.log("state is ", state);
      let files = state.files || [];
      files.push(action.payload);

      console.timeLog("files is now ", files);

      return {
        ...state,
        files: files,
      };

    default:
      return state;
  }
};

export default reducer;
