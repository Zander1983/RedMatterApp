import { actionTypes } from "./actionTypes";

const initialState: any = {
  profile: {},
  experiment: {
    device: null,
    cellType: null,
    particleSize: null,
    fluorophoresCategory: null,
    description: null,
  },
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
    case actionTypes.EXPERIMENT_FORM_DATA:
      console.log(state);
      console.log(action);
      let newExperiment: any = state.experiment;
      newExperiment[action.payload.formitem.key] =
        action.payload.formitem.value;
      return {
        ...state,
        experiment: newExperiment,
      };
    default:
      return state;
  }
};

export default reducer;
