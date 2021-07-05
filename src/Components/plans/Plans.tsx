import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import userManager from "Components/users/userManager";
import { Grid, Button, CircularProgress } from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { useDispatch, useStore } from "react-redux";
import { snackbarService } from "uno-material-ui";
import { LockFilled } from "@ant-design/icons";
import {
  AuthenticationApiFetchParamCreator,
  UserApiFetchParamCreator,
} from "api_calls/nodejsback";

import { loadStripe } from '@stripe/stripe-js';
// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51J7UfrFYFs5GcbAXBxHANlj0XASMfZV5TfxzkaKSDTTOeJTmlaIa60Uk5WlizFQ2JTSqZuhn9nJauzNGKmC1dR3700t0UTXOdy');

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
      backgroundColor:"#6666A9",
      color:"#ffffff",
      padding: "10px 5px 5px 5px",
      borderRadius: "20px 20px 0 0"
  },
  white:{
      color: "white"
  },

  price: {
      marginTop: 18,
      marginBottom: 18,
      
  },

  get: {
    backgroundColor: "#6666A9",
    border: "0px solid",
    fontSize: 18,
    padding: "8px 40px",
    color: "white",
    borderRadius: 5,
    fontWeight: 500
  },

  plan: {
    border: "solid 1px #ddd",
    borderRadius: 20,
    paddingBottom: "30px"
  }
}));



export default function Plans(props:any) {
    const [userId, setUserId] = useState(null);
    const store = useStore();

    const classes = useStyles();

    const gettingUserToken = () => {
        try {
          let token = userManager.getToken();
          return token;
        } catch (error) {
          let token = null;
          return token;
        }
        
      }

      let userToken = gettingUserToken();

      const createCheckoutSession = async (priceId: string) => {
        return axios
          .post(
            "/create-checkout-session",
            {
              priceId: priceId,
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

    const handleClick = async (event:any) => {
        // Get Stripe.js instance
        const stripe = await stripePromise;
    
        // Call your backend to create the Checkout Session
        //const response = await fetch('/create-checkout-session', { method: 'POST' });
        createCheckoutSession('price_1J7UmZFYFs5GcbAXvPronXSX').then(function(data) {
            // Call Stripe.js method to redirect to the new Checkout page
            stripe
              .redirectToCheckout({
                sessionId: data.sessionId
              })
              .then(()=>{console.log('handleResult')});
          })
          };
        
      useEffect(()=>{
          try{
              axios.post(`/api/getuserId`, {Token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc09yZ2FuaXNhdGlvbkFkbWluIjp0cnVlLCJpc0FkbWluIjpmYWxzZSwiaXNEZW1vVXNlciI6ZmFsc2UsImVtYWlsIjoibHVpc0ByZWRtYXR0ZXJhcHAuY29tIiwiaWQiOiI2MGMxMmVjMjcxMWQ2YTA3ZTdiOTI1Y2MiLCJpYXQiOjE2MjUxNzQ3OTksImV4cCI6MTYyNTE3NDgwNX0.djVEY3xh0-WCLu8ebq46uWyj_tMrRJyMxXgMVo9EXU4"
            })
              .then((response) => {console.log(response.data)}).finally(()=>{console.log('did i just do something?')}) 
            }catch(err){
                console.log(err)
            }
      });
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
        }}>
            <span>{JSON.stringify(userToken, null, 2)}</span>
            <h1>Choose Your Plan</h1>

            <Grid
            spacing={5}
        container
        lg={12}
        md={12}
        sm={12}
        justify="center"
        direction="row"
        style={{
          backgroundColor: "#fafafa",
          padding: 20,
          borderRadius: 10,
          textAlign: "center",
        }}>
            <Grid item lg={4} md={4} sm={12} style={{
                borderRadius: 1000,
            }}>
                <div className={classes.plan}>
                    <div className={classes.nameHighlight}>
                        <h2 className={classes.white}>Free</h2>
                    </div>

                    <div className={classes.price}>
                        <h1>0$ <span>/mo</span></h1> 
                        <p>10 experiments/month <br></br>Public experiments</p>
                    </div>

                    <button className={classes.get}>
                        Start Now!
                    </button>
                    </div>      
            </Grid>


            <Grid item lg={4} md={4} sm={12} style={{
                borderRadius: 1000,
            }}>
                <div className={classes.plan}>
                    <div className={classes.nameHighlight}>
                        <h2 className={classes.white}>Premium</h2><span>Our Most Popular!</span>
                    </div>

                    <div className={classes.price}>
                        <h1>30$ <span>/mo</span></h1> 
                        <p>Unlimited experiments/month <br></br>Private experiments</p>
                    </div>

                    <button className={classes.get} role="link" onClick={handleClick}>
                        Get Started!
                    </button>
                    </div>      
            </Grid>


            <Grid item lg={4} md={4} sm={12} style={{
                borderRadius: 1000,
            }}>
                <div className={classes.plan}>
                    <div className={classes.nameHighlight}>
                        <h2 className={classes.white}>Enterprise</h2>
                    </div>

                    <div className={classes.price}>
                        <h1>500$ <span>/mo</span></h1> 
                        <p>Unlimited experiments/month <br></br>Private experiments <br></br> Custom Support!</p>
                    </div>

                    <button className={classes.get}>
                        Start Now!
                    </button>
                    </div>      
            </Grid>

        
      </Grid>


      </Grid>

      
    </Grid>
  );
}