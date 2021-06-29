import React, { useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, CircularProgress } from "@material-ui/core";

import { loadStripe } from '@stripe/stripe-js';

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


    const classes = useStyles();
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
        <script src="https://js.stripe.com/v3/"></script>
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
            <h1>Premium Plan Checkout</h1>

            <Grid
        container
        lg={12}
        md={12}
        sm={12}
        justify="center"
        direction="row"
        style={{
          textAlign: "center",
        }}>
            <Grid item lg={6}
        md={6}
        sm={6}>
            <h3>Item</h3>

        </Grid>

        <Grid item lg={6}
        md={6}
        sm={6}>
            <h3>Price</h3>

        </Grid>

           
        
      </Grid>

      <Grid
        container
        lg={12}
        md={12}
        sm={12}
        justify="center"
        direction="row"
        style={{
          textAlign: "center",
        }}>
            <Grid item lg={6}
        md={6}
        sm={6}>
            <h3>Premium Plan</h3>

        </Grid>

        <Grid item lg={6}
        md={6}
        sm={6}>
            <h3>$30</h3>

        </Grid>

           
        
      </Grid>

      <Grid
        container
        lg={12}
        md={12}
        sm={12}
        justify="center"
        direction="row"
        style={{
          textAlign: "center",
        }}>
            <Grid item lg={7}
        md={6}
        sm={1}>
            
        </Grid>
            <Grid item lg={3}
        md={6}
        sm={12}>
            <form id="payment-form">
      <div id="card-element"></div>
      <button id="submit">
        <div className="spinner hidden" id="spinner"></div>
        <span id="button-text">Pay now</span>
      </button>
      <p id="card-error" role="alert"></p>
      <p className="result-message hidden">
        Payment succeeded, see the result in your
        <a href="" target="_blank">Stripe dashboard.</a> Refresh the page to pay again.
      </p>
    </form>

        </Grid>

        <Grid item lg={1}
        md={1}
        sm={1}></Grid>
           
        
      </Grid>

      
      </Grid>


      </Grid>

  )};
