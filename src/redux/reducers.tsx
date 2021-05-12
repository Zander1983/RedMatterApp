import { actionTypes } from "./actionTypes";

const initialState = {
  profile: {
    firstName: "",
  },
};

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.LOGIN:
      console.log("login", action.payload.user);
      return {
        ...state,
        profile: action.payload.user,
      };
    default:
      return state;
  }
};

export default reducer;
