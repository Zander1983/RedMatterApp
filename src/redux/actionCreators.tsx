import { actionTypes } from "./actionTypes";
import { Facility } from "Components/users/userManager";

export const ActionCreators = {
  login: (user: any) => ({ type: actionTypes.LOGIN, payload: { user } }),
  add_facility: (facility: Facility) => ({
    type: actionTypes.ADD_FACILITY,
    payload: { facility },
  }),
  form: (formitem: any) => ({
    type: actionTypes.EXPERIMENT_FORM_DATA,
    payload: { formitem },
  }),
};
