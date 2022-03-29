import { useEffect, useState } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import userManager from "Components/users/userManager";
import { Grid, Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { getPlans, updateUserStripeDetails } from "services/StripeService";
import CircularProgress from "@material-ui/core/CircularProgress";
import { snackbarService } from "uno-material-ui";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    padding: 5,
  },
  nameHighlight: {
    backgroundColor: "#6666A9",
    padding: "10px 5px 5px 5px",
    borderRadius: "5px 5px 0 0",
    marginBottom: 10,
    marginLeft: -10,
    marginRight: -10,
    marginTop: -10,
  },
  white: {
    color: "white",
  },
  planButton: {
    border: "0px solid",
    fontSize: 16,
    borderRadius: 5,
    fontWeight: 500,
  },
  plan: {
    flexDirection: "column",
    display: "flex",
    width: "100%",
    minHeight: 270,
    border: "solid 1px #ddd",
    borderRadius: 5,
    paddingBottom: "30px",
    backgroundColor: "#fff",
    padding: 10,
  },
  planContainer: {
    textAlign: "center",
    minHeight: 270,
  },
  plansHeader: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: 500,
    marginBottom: 20,
  },
  planFeature: {
    marginBottom: -5,
  },
}));

export default function Plans(props: any) {
  const isLoggedIn = userManager.isLoggedIn();
  const dispatch = useDispatch();
  const classes = useStyles();
  const history = useHistory();
  const [plans, setPlans] = useState([]);
  const [pageLoader, setPageLoader] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const createCheckoutSession = async (priceId: string, subType: string) => {
    return axios
      .post(
        "/create-checkout-session",
        {
          priceId: priceId,
          subscriptionType: subType,
          location: window.location.origin,
        },
        {
          headers: {
            Token: userManager.getToken(),
          },
        }
      )
      .then(function (result) {
        return result.data;
      })
      .catch((e) => {
        return null;
      });
  };

  useEffect(() => {
    const initPlanPage = async () => {
      setPageLoader(true);
      setValues();
      let plans = await getPlans();

      plans.data.forEach((plan: any) => {
        let metadata = plansMetaData.find((x) => x.name === plan.name);
        plan["features"] = metadata.features;
      });

      plans.data.sort((a: any, b: any) => {
        return a.price.amount - b.price.amount;
      });

      setPlans(plans.data);
      setPageLoader(false);
    };

    initPlanPage();
  }, []);

  const setValues = () => {
    let subscriptionDetails = userManager.getSubscriptionDetails();
    setSubscriptionDetails(subscriptionDetails);
  };

  const handleGetStarted = async (plan: any) => {
    if (!isLoggedIn) {
      history.push("/register");
      return;
    }
    const data = await createCheckoutSession(plan.price.id, plan.name);
    if (data) window.location.href = data.sessionUrl;
    else {
      snackbarService.showSnackbar("Something went wrong!!", "error");
    }
    //stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  const handleUpdateSubscription = (plan: any) => {
    setPageLoader(true);
    axios
      .post(
        "/update-subscription",
        {
          price: plan.price.id,
          subscriptionType: plan.name,
        },
        {
          headers: {
            Token: userManager.getToken(),
          },
        }
      )
      .then(async (result) => {
        await updateUserStripeDetails(dispatch);
        await setValues();
        snackbarService.showSnackbar(
          "Subscription Updated Successfully!",
          "success"
        );
      })
      .catch(() => {
        snackbarService.showSnackbar("Subscription Updated failed!", "error");
      })
      .finally(() => {
        setPageLoader(false);
      });
  };

  return (
    <Grid item className={classes.mainContainer}>
      <Grid item xs={12} className={classes.plansHeader}>
        Unlimited Experiments
      </Grid>
      {pageLoader ? (
        <div
          style={{ display: "flex", justifyContent: "center", paddingTop: 100 }}
        >
          <CircularProgress />
        </div>
      ) : (
        // <p style={{ fontSize: "20px", justifyContent: "center" }}>
        //   For unlimited experiments, contact us at mark.kelly@redmatterapp.com
        // </p>
        <Grid
          container
          spacing={5}
          style={{ display: "flex", justifyContent: "center" }}
        >
          {plans.map((plan, index) => (
            <Grid
              key={Math.random() + index}
              item
              md={4}
              xs={12}
              className={classes.planContainer}
              component={"div"}
            >
              <Grid item className={classes.plan}>
                <Grid item style={{ flex: 1 }}>
                  <Grid item className={classes.nameHighlight}>
                    <h2 className={classes.white}>{plan.name}</h2>
                  </Grid>
                  <h1>
                    {plan.price.amount}
                    {plan.price.currency}
                    <span>{"/month"}</span>
                  </h1>

                  {plan.features.map((feature: any, index: number) => (
                    <p key={index} className={classes.planFeature}>
                      {feature}
                    </p>
                  ))}
                </Grid>
                <Grid item style={{ flexGrow: 1, flex: 1 }} />
                <Grid item>
                  {subscriptionDetails.everSubscribed ? (
                    subscriptionDetails.product === plan.id &&
                    !subscriptionDetails.canceled ? (
                      <Button
                        color="primary"
                        variant="contained"
                        disabled={true}
                        className={classes.planButton}
                        style={{
                          backgroundColor: "#8888BA",
                          flex: 1,
                        }}
                      >
                        <b className={classes.white}>Subscribed</b>
                      </Button>
                    ) : (
                      <Button
                        color="primary"
                        variant="contained"
                        className={classes.planButton}
                        style={{
                          backgroundColor:
                            plan.name === "Enterprise" ? "#8888BA" : "#6666A9",
                          flex: 1,
                        }}
                        disabled={plan.name === "Enterprise"}
                        onClick={() => {
                          handleUpdateSubscription(plan);
                        }}
                      >
                        <b className={classes.white}>
                          {plan.name === "Enterprise"
                            ? "Coming soon..."
                            : "Update"}
                        </b>
                      </Button>
                    )
                  ) : (
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.planButton}
                      style={{
                        backgroundColor:
                          plan.name === "Enterprise" ? "#8888BA" : "#6666A9",
                        flex: 1,
                      }}
                      disabled={plan.name === "Enterprise"}
                      onClick={() => {
                        handleGetStarted(plan);
                      }}
                    >
                      <b className={classes.white}>
                        {plan.name === "Enterprise"
                          ? "Coming soon..."
                          : "Get Started"}
                      </b>
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  );
}

const plansMetaData = [
  {
    name: "Premium",
    features: ["Unlimited experiments", "Private experiments"],
  },
  {
    name: "Enterprise",
    features: [
      "Unlimited experiments",
      "Private experiments",
      "Create organizations",
      "Custom support",
    ],
  },
];
