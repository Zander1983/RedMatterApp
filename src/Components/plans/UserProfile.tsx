import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Grid, Button, CircularProgress} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import userManager from "Components/users/userManager";
import NativeSelect from '@material-ui/core/NativeSelect';

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

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
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

    const [userObj, setuserObj] = useState(null);
    const [sub, setSub] = useState(null);
    const [product, setProduct] = useState(null);
    useEffect(() => {
      if(typeof userObj != 'object' || userObj == null){
        axios.get(`/profile-info`, {
        headers: {
          Token: userManager.getToken(),
        },
      })
    .then((response) => response.data)
    .then((user) => {
      setuserObj(user);
      alert(JSON.stringify(userObj, null, 2))
    })
    .then(() => {
      
    })
    }

    if(typeof userObj === 'object' && userObj != null){
      alert("executing this line of code");
      //alert(JSON.stringify(userObj, null, 2));
      axios.get(`/get-subscription?id=${userObj.userDetails.subscriptionId}`)
      .then((response) => response.data)
      .then((subscription) => {setSub(subscription)}).then(() => {alert(JSON.stringify(sub, null, 2))})
    }

    if(typeof sub === 'object' && sub != null){
      alert("executing subs line");
      //alert(JSON.stringify(sub.items.data[0].plan.product, null, 2));
      axios.get(`/get-product?id=${sub.items.data[0].plan.product}`)
      .then((response) => response.data)
      .then((product) => {setSub(product)}).then(() => {alert(JSON.stringify(product, null, 2))})
    }

    }, [userObj, sub, product])
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
        justify="flex-start"
        direction="column"
        style={{
          backgroundColor: "#fafafa",
          padding: "3em 5em",
          borderRadius: 10,
          boxShadow: "1px 1px 1px 1px #ddd",
          border: "solid 1px #ddd",
          textAlign: "left",
        }}>
            <h1 style={{
                marginBottom:'1.5em',
                fontSize: '36px'
            }}>My profile</h1>
            <h2>{userObj == null ? 'user email' : userObj.userDetails.email}</h2>

            <Grid
        container
        lg={12}
        md={12}
        sm={12}
        justify="flex-start"
        direction="row"
        style={{
          textAlign: "left",
        }}>
            <Grid item lg={6}
        md={6}
        sm={6}>
            <h3>Next Billing Date: <span>{userObj == null ? 'user email' : userObj.userDetails.email}</span></h3>

        </Grid>

           
        
      </Grid>

      <Grid
        container
        lg={12}
        md={12}
        sm={12}
        alignItems='flex-end'
        justify="flex-start"
        direction="row"
        style={{
          textAlign: "left",
        }}>
            <Grid item lg={6}
        md={6}
        sm={6}>
            <h3 style={{
                marginBottom:'1.5em'
            }}>Current Subscription: <span>{product == null ? 'Product Name' : product.name}</span></h3>

            <h3>Change Subscription</h3>
            <div>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="subscriptionSelect">Select Subscription</InputLabel>
        <Select
          native
          value={"Premium"}
          onChange={()=> console.log("change")}
          inputProps={{
            name: 'age',
            id: 'subscriptionSelect',
          }}
        >
          <option aria-label="None" value="" />
          <option value={1}>Free Subscription</option>
          <option value={2}>Premium Subscription</option>
          <option value={3}>Enterprise Subscription</option>
        </Select>
      </FormControl>
      <Button 
        style={
            {
            marginTop: 25,
            }
        } color="secondary">Change Subscription</Button>
</div>
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

        <Grid item lg={1}
        md={1}
        sm={1}></Grid>
           
        
      </Grid>

      
      </Grid>


      </Grid>

  )};
