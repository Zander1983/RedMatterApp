import { actionTypes } from "./actionTypes";

export const ActionCreators = {
  login: (user: any) => ({ type: actionTypes.LOGIN, payload: { user } }),
};
