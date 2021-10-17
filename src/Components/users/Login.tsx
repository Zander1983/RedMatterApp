import React, { useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, CircularProgress } from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

import { useDispatch } from "react-redux";
import { snackbarService } from "uno-material-ui";
import { LockFilled } from "@ant-design/icons";
import { AuthenticationApiFetchParamCreator } from "api_calls/nodejsback";

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
}));

const Login = (props: any) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [loading, setLoading] = React.useState(false);

  const loginForm = useRef();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event: any) => {
    setFormData((prevData: any) => {
      return { ...prevData, [event.target.name]: event.target.value };
    });
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const req = AuthenticationApiFetchParamCreator().userLogin(formData);
      const res = await axios.post(req.url, req.options.body, req.options);
      const userDetails = await axios.get("/api/getuserdetails", {
        headers: {
          token: res.data.token,
        },
      });

      setLoading(false);
      let blankArray: any[] = [];
      const loginData = {
        subscriptionType: userDetails.data?.userDetails?.subscriptionType,
        token: res.data.token,
        organisationId: res.data.organisationId,
        rules: userDetails.data?.rules,
        subscriptionDetails: userDetails.data?.subscriptionDetails,
      };

      dispatch({
        type: "LOGIN",
        payload: { user: { profile: loginData } },
      });
      snackbarService.showSnackbar("Logged in!", "success");
      if (process.env.REACT_APP_NO_WORKSPACES === "true") {
        props.history.push("/analyse");
      } else {
        props.history.push("/experiments");
      }
    } catch (err) {
      setLoading(false);
      //@ts-ignore
      if (err.response === undefined) {
        snackbarService.showSnackbar(
          "Couldn't connect to Red Matter servers",
          "error"
        );
        return;
      }
      //@ts-ignore
      const errMsg = err.response.data.message;
      snackbarService.showSnackbar(errMsg, "error");
    }
  };

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
        justify="center"
        direction="column"
        style={{
          backgroundColor: "#fafafa",
          padding: 20,
          borderRadius: 10,
          boxShadow: "1px 1px 1px 1px #ddd",
          border: "solid 1px #ddd",
          textAlign: "center",
          width: "50%",
        }}
      >
        <LockFilled />
        <h2>Login</h2>
        <ValidatorForm ref={loginForm} onSubmit={handleSubmit}>
          <TextValidator
            style={{ marginTop: 30, backgroundColor: "white" }}
            className={classes.textFieldWidth}
            label="Email"
            onChange={handleChange}
            name="email"
            value={formData.email}
            variant="outlined"
            validators={["required", "isEmail"]}
            errorMessages={["Email is required", "Email is not valid"]}
          />
          <TextValidator
            style={{ marginTop: 30, backgroundColor: "white" }}
            className={classes.textFieldWidth}
            label="Password"
            variant="outlined"
            type="password"
            onChange={handleChange}
            name="password"
            value={formData.password}
            validators={["required", "minStringLength:8"]}
            errorMessages={[
              "Password is required",
              "Password is not 8 characters long",
            ]}
          />

          <Grid
            justify="center"
            container
            style={{
              marginTop: 30,
            }}
          >
            <Button
              type="submit"
              style={{
                height: 50,
                marginRight: 20,
                width: 170,
                backgroundColor: "#66a",
                color: "white",
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress
                  style={{
                    color: "white",
                    width: 23,
                    height: 23,
                  }}
                />
              ) : (
                "Submit"
              )}
            </Button>
          </Grid>
        </ValidatorForm>
        <div>
          <Link to="/register">
            <h3 style={{ marginLeft: -21, marginTop: 10, color: "#008" }}>
              Not registred yet?
            </h3>
          </Link>
        </div>
      </Grid>
    </Grid>
  );
};

export default Login;
