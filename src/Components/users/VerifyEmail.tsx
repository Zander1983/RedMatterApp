import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { CircularProgress, Grid } from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { snackbarService } from "uno-material-ui";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
}));

//@ts-ignore
function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const VerifyEmail = (props: any) => {
  const classes = useStyles();
  const history = useHistory();
  const loginForm = React.useRef();

  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = useState({
    code: "",
  });
  const handleChange = (event: any) => {
    setFormData((prevData: any) => {
      return { ...prevData, [event.target.name]: event.target.value };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/verify?verifyStr=${formData.code}`);
      setLoading(false);
      history.push("/login");
    } catch (err: any) {
      setLoading(false);
      snackbarService.showSnackbar("Validation failed, try again", "error");
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
        lg={6}
        md={9}
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
        <h1>Welcome to Red Matter</h1>
        <h3 style={{ marginTop: 20 }}>Verify your email</h3>
        <p>We have sent a code to your inbox, type it here:</p>
        <ValidatorForm ref={loginForm} onSubmit={handleSubmit}>
          <TextValidator
            style={{ marginTop: 30, backgroundColor: "white", width: "100%" }}
            label="Code"
            onChange={handleChange}
            name="code"
            value={formData.code}
            variant="outlined"
            validators={["required"]}
            errorMessages={["Code is required"]}
          />
        </ValidatorForm>
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
            onClick={handleSubmit}
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
              "Validate email"
            )}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default VerifyEmail;
