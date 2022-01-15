import { useEffect } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { Grid } from "@material-ui/core";
import check from "./img/check.png";
import { useDispatch } from "react-redux";
import { updateUserStripeDetails } from "../../services/StripeService";

export default function Plans(props: { session_id: any }) {
  const dispatch = useDispatch();
  useEffect(() => {
      if (props.session_id) {
          axios
              .get(`/checkout-session?id=${props.session_id}`)
              .then((response) => response.data)
              .then((data) => {
                  if (data) {
                      axios
                          .post(`/save-checkout`, {
                              body: {
                                  id: data.id,
                                  user: data.metadata.userId,
                                  subscription: data.subscription,
                                  customer: data.customer,
                              },
                          })
                          .then(() => {
                              axios
                                  .post(`/add-subscription`, {
                                      body: {
                                          user: data.metadata.userId,
                                          subscriptionType: data.metadata.subscriptionType,
                                          subscription: data.subscription,
                                          customer: data.customer,
                                      },
                                  })
                                  .then(async () => {
                                      updateUserStripeDetails(dispatch);
                                  });
                          });
                  }
              });
      }
  }, [dispatch, props.session_id]);
  return (
    <Grid
      container
      alignContent="center"
      justify="center"
      style={{
        paddingTop: 30,
        paddingBottom: 50,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <Grid
        container
        lg={8}
        md={10}
        sm={12}
        justify="center"
        direction="column"
        style={{
          backgroundColor: "#fafafa",
          padding: 20,
          borderRadius: 10,
          boxShadow: "1px 1px 1px 1px #ddd",
          border: "solid 1px #ddd",
          textAlign: "center",
        }}
      >
        <img
          src={check}
          alt="success icon"
          style={{
            height: "4em",
            width: "4em",
            margin: "15px auto 20px",
          }}
        />
        <h1>Your payment has been Received!</h1>
        <h2>
          Go to your
          <NavLink to="/experiments">Experiments</NavLink>
        </h2>
      </Grid>
    </Grid>
  );
}
