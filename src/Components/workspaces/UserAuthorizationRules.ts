export const createButtonDisable = (
  experimentLength: number,
  unLimitedPublicExperiments: boolean,
  numberOfExperiments: string
) => {
  if (unLimitedPublicExperiments) return false;

  try {
    return experimentLength >= parseInt(numberOfExperiments);
  } catch (error) {
    return false;
  }
};
