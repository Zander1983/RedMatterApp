import { useEffect, useState } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import userManager from "Components/users/userManager";
import { Grid, Button } from "@material-ui/core";
import { NavLink } from "react-router-dom";

import { loadStripe } from "@stripe/stripe-js/pure";

const useStyles = makeStyles((theme) => ({
  paperStyle: {
    padding: "10px",
    height: "70vh",
    width: "450px",
    margin: "20px auto",
  },
  avatarStyle: {
    background: "#00dffffc",
  },
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
  textFieldWidth: {
    width: "100%",
  },
  nameHighlight: {
    backgroundColor: "#6666A9",
    color: "#ffffff",
    padding: "10px 5px 5px 5px",
    borderRadius: "20px 20px 0 0",
  },
  white: {
    color: "white",
  },
  price: {
    marginTop: 18,
    marginBottom: 18,
  },
  get: {
    backgroundColor: "#6666A9",
    border: "0px solid",
    fontSize: 16,
    padding: "8px 28px",
    color: "white",
    borderRadius: 5,
    fontWeight: 500,
  },

  plan: {
    border: "solid 1px #ddd",
    borderRadius: 20,
    paddingBottom: "30px",
  },
  mainContainer: {},
}));

export default function Plans(props: any) {
  const isLoggedIn = userManager.isLoggedIn();
  const classes = useStyles();
  const [stripe, setStripe] = useState(null);

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

  const handleClick = async (price: string, subType: string) => {
    const data = await createCheckoutSession(price, subType);
    stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  useEffect(() => {
    loadStripe(process.env.REACT_APP_STRIPE_KEY).then((stripe) =>
      setStripe(stripe)
    );
  }, []);

  return (
    <Grid
      container
      alignContent="center"
      justify="center"
      className={classes.mainContainer}
    >
      <Grid
        container
        justify="center"
        direction="row"
        style={{
          backgroundColor: "#fafafa",
          padding: "20px 4em",
          borderRadius: 10,
          boxShadow: "1px 1px 1px 1px #ddd",
          border: "solid 1px #ddd",
          textAlign: "center",
          width: "75%",
        }}
      >
        <h1 style={{ marginBottom: 15 }}>Choose Your Plan</h1>

        <Grid
          spacing={5}
          container
          justify="center"
          direction="row"
          style={{
            backgroundColor: "#fafafa",
            padding: 20,
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          <Grid item lg={4} md={4} sm={12} style={{ borderRadius: 1000 }}>
            <div className={classes.plan}>
              <div className={classes.nameHighlight}>
                <h2 className={classes.white}>Free</h2>
              </div>

              <div className={classes.price}>
                <h1>
                  0$
                  <span>/mo</span>
                </h1>
                <p>
                  10 experiments/month
                  <br></br>Public experiments
                </p>
              </div>
              {isLoggedIn ? (
                <Button
                  style={{ marginTop: 25 }}
                  color="primary"
                  variant="contained"
                  className={classes.get}
                  onClick={() =>
                    handleClick(process.env.REACT_APP_FREE_PRICE, "Free")
                  }
                >
                  Start Free!
                </Button>
              ) : (
                <NavLink to="/register">
                  <Button
                    style={{ marginTop: 25 }}
                    color="primary"
                    variant="contained"
                    className={classes.get}
                  >
                    Start Free!
                  </Button>
                </NavLink>
              )}
            </div>
          </Grid>

          <Grid item lg={4} md={4} sm={12} style={{ borderRadius: 1000 }}>
            <div className={classes.plan}>
              <div className={classes.nameHighlight}>
                <h2 className={classes.white}>Premium</h2>
                <span>Our Most Popular!</span>
              </div>

              <div className={classes.price}>
                <h1>
                  30$
                  <span>/mo</span>
                </h1>
                <p>
                  Unlimited experiments/month
                  <br></br>Private experiments
                </p>
              </div>
              {isLoggedIn ? (
                <Button
                  style={{ marginTop: 25 }}
                  color="primary"
                  variant="contained"
                  className={classes.get}
                  onClick={() =>
                    handleClick(
                      process.env.REACT_APP_STRIPE_PREMIUM_PRICE,
                      "Premium"
                    )
                  }
                >
                  Get Started!
                </Button>
              ) : (
                <NavLink to="/register">
                  <Button
                    style={{ marginTop: 25 }}
                    color="primary"
                    variant="contained"
                    className={classes.get}
                  >
                    Start Free!
                  </Button>
                </NavLink>
              )}
            </div>
          </Grid>

          <Grid item lg={4} md={4} sm={12} style={{ borderRadius: 1000 }}>
            <div className={classes.plan}>
              <div className={classes.nameHighlight}>
                <h2 className={classes.white}>Enterprise</h2>
              </div>

              <div className={classes.price}>
                <h1>
                  500$
                  <span>/mo</span>
                </h1>
                <p>
                  Unlimited experiments/month
                  <br></br>Private experiments
                  <br></br>
                  Custom Support!
                </p>
              </div>
              {isLoggedIn ? (
                <Button
                  style={{ marginTop: 25 }}
                  color="primary"
                  variant="contained"
                  className={classes.get}
                  onClick={() =>
                    handleClick(
                      process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE,
                      "Enterprise"
                    )
                  }
                >
                  Get Enterprise!
                </Button>
              ) : (
                <NavLink to="/register">
                  <Button
                    style={{ marginTop: 25 }}
                    color="primary"
                    variant="contained"
                    className={classes.get}
                  >
                    Start Free!
                  </Button>
                </NavLink>
              )}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
