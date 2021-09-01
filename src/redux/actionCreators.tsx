import { actionTypes } from "./actionTypes";

export const ActionCreators = {
  login: (user: any) => ({ type: actionTypes.LOGIN, payload: { user } }),
  form: (formitem: any) => ({
    type: actionTypes.EXPERIMENT_FORM_DATA,
    payload: formitem
  }),
};
