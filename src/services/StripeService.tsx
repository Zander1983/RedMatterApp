import axios from "axios";
import userManager from "Components/users/userManager";

const updateUserStripeDetails = async (dispatch: any) => {
  const token = userManager.getToken();
  const data = await axios.get("/api/profile-info", {
    headers: {
      token: token,
    },
  });
  let userDetails = data.data.userDetails;
  dispatch({
    type: "UPDATE_SUBSCRIPTION_DETAILS",
    payload: {
      rules: userDetails?.rules,
      subscriptionDetails: userDetails?.subscriptionDetails,
      subscriptionType: userDetails?.subscriptionType,
    },
  });
};

const getPlans = async () => {
  let response = await axios.get("/api/getPlans", {
    headers: {
      Token: userManager.getToken(),
    },
  });
  return response.data.data;
};

export { updateUserStripeDetails, getPlans };
