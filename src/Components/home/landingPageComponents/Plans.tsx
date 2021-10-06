import { useEffect, useState } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import userManager from "Components/users/userManager";
import { Grid, Button } from "@material-ui/core";
import { NavLink, useHistory } from "react-router-dom";

import { loadStripe } from "@stripe/stripe-js/pure";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    padding: 10,
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
  const classes = useStyles();
  const [stripe, setStripe] = useState(null);
  const history = useHistory();

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
      });
  };

  useEffect(() => {
    loadStripe(process.env.REACT_APP_STRIPE_KEY).then((stripe) =>
      setStripe(stripe)
    );
  }, []);

  const handleClick = async (subType: string) => {
    if (subType === "free") {
      history.push(isLoggedIn ? "/experiments" : "/register");
      return;
    }
    const price =
      process.env[
        subType === "Premium"
          ? "REACT_APP_STRIPE_PREMIUM_PRICE"
          : "REACT_APP_STRIPE_ENTERPRISE_PRICE"
      ];
    const data = await createCheckoutSession(price, subType);
    stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  return (
    <Grid className={classes.mainContainer}>
      <Grid item xs={12} className={classes.plansHeader}>
        Choose Your Plan
      </Grid>

      <Grid container spacing={5}>
        {plans.map((plan) => (
          <Grid item md={4} xs={12} className={classes.planContainer}>
            <Grid className={classes.plan}>
              <Grid style={{ flex: 1 }}>
                <Grid className={classes.nameHighlight}>
                  <h2 className={classes.white}>{plan.name}</h2>
                </Grid>
                <h1>
                  {plan.price}$<span>/month</span>
                </h1>

                {plan.features.map((feature) => (
                  <p className={classes.planFeature}>{feature}</p>
                ))}
              </Grid>
              <Grid style={{ flexGrow: 1, flex: 1 }}></Grid>
              <Grid>
                <Button
                  color="primary"
                  variant="contained"
                  className={classes.planButton}
                  style={{
                    backgroundColor: plan.available ? "#6666A9" : "#8888BA",
                    flex: 1,
                  }}
                  disabled={plan.available}
                  onClick={() => {
                    handleClick(plan.name);
                  }}
                >
                  <b className={classes.white}>
                    {plan.available
                      ? plan.price === 0
                        ? "Start Free!"
                        : "Get started"
                      : "Coming soon..."}
                  </b>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}

const plans = [
  {
    name: "Free",
    price: 0,
    features: ["1 experiment", "Public experiment"],
    available: true,
  },
  {
    name: "Premium",
    price: 30,
    features: ["Unlimited experiments", "Private experiments"],
    available: true,
  },
  {
    name: "Enterprise",
    price: 500,
    features: [
      "Unlimited experiments",
      "Private experiments",
      "Create organizations",
      "Custom support",
    ],
    available: false,
  },
];
