import { actionTypes } from "./userActionTypes";

const initialState: any = {};

const userReducers = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.LOGIN:
      return {
        ...action.payload,
      };
    case actionTypes.LOGOUT:
      return {
        ...initialState,
      };
    case actionTypes.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default userReducers;
