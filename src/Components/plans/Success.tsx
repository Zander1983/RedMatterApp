import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, CircularProgress } from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import check from './img/check.png';

import { useDispatch } from "react-redux";
import { snackbarService } from "uno-material-ui";
import { LockFilled } from "@ant-design/icons";
import {
  AuthenticationApiFetchParamCreator,
  UserApiFetchParamCreator,
} from "api_calls/nodejsback";
import session from "redux-persist/lib/storage/session";

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



export default function Plans(props:{
  session_id:any
}) {
  const [sessionId, setSessionId] = useState('');
  useEffect(()=>{
    axios.get(`/checkout-session?id=${props.session_id}`)
    .then((response) => response.data)
    .then((session) => setSessionId(JSON.stringify(session, null, 2)))
  });
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
            <img src={check} alt="success icon" style={{height:'4em', width:'4em', margin:'15px auto 20px'}}></img>
            <h1>Your payment has been Received! {sessionId}</h1>
            <p> Redirecting you to your profile Page</p>

           

        
      </Grid>


      </Grid>
  );
};
