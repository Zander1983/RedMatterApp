import { actionTypes } from "./experimentActionTypes";

const initialState: any = {
  device: null,
  cellType: null,
  particleSize: null,
  fluorophoresCategory: null,
  description: null,
  experimentId: null,
};

const experimentReducers = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.RESET:
      return {
        ...initialState,
      };
    case actionTypes.EXPERIMENT_FORM_DATA:
      let newExperiment = state;
      newExperiment[action.payload.formitem.key] =
        action.payload.formitem.value;
      return newExperiment;
    case actionTypes.EXPERIMENT_FORM_DATA_CLEAR:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default experimentReducers;
