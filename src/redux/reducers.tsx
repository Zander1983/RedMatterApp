import { actionTypes } from "./actionTypes";

const initialState = {
  profile: {},
};

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.LOGIN:
      return {
        ...state,
        profile: action.payload.user.profile,
      };
    case actionTypes.LOGOUT:
      return {
        ...state,
        profile: {},
      };
    default:
      return state;
  }
};

export default reducer;
