//@ts-ignore
import ReCAPTCHA from "react-google-recaptcha";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, CircularProgress } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { snackbarService } from "uno-material-ui";

import { counrtyList } from "./common-data";

const useStyles = makeStyles((theme) => ({
  paperStyle: {
    padding: "10px",
    minHeight: "70vh",
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

const Register = (props: any) => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = React.useState(false);
  const [isLocationSelected, setLocationStatus] = useState();

  const registerForm = useRef();

  const [formData, setFormData] = useState({
    email: "",
    organisation: "",
    organisationKey: "",
    location: "",
    password: "",
    g_recaptcha_response: "",
  });

  const handleChange = (event: any) => {
    setFormData((prevData: any) => {
      return { ...prevData, [event.target.name]: event.target.value };
    });
  };

  const handleAutoCompleteField = (value: any, name: string) => {
    if (value === null) {
      //@ts-ignore
      setLocationStatus((prev: any) => false);
    } else {
      //@ts-ignore
      setLocationStatus((prev: any) => true);
      setFormData((prevData: any) => {
        return { ...prevData, [name]: value.key };
      });
    }
  };

  useEffect(() => {}, [isLocationSelected]);

  function onChangeCaptcha(value: any) {
    setFormData((prevData: any) => {
      return { ...prevData, g_recaptcha_response: value };
    });
  }

  const handleSubmit = async () => {
    setLoading(true);
    if (formData.location === "") {
      //@ts-ignore
      setLocationStatus((prev: any) => false);
      return;
    }
    try {
      await axios.post("api/register", formData);
      setLoading(false);
      snackbarService.showSnackbar("Email verification sent!", "success");
      history.push("/verify");
    } catch (err) {
      try {
        setLoading(false);
        //@ts-ignore
        const errMsg = err.response.data.message;
        snackbarService.showSnackbar(errMsg, "error");
      } catch (e) {}
    }
  };

  const [joiningOrg, setJoiningOrg] = useState(false);
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
        <h2>Create your Red Matter account</h2>
        <ValidatorForm
          ref={registerForm}
          onSubmit={() => {
            handleSubmit();
          }}
        >
          {joiningOrg == false ? (
            <TextValidator
              style={{ marginTop: 30, backgroundColor: "white" }}
              className={classes.textFieldWidth}
              variant="outlined"
              label="Organisation"
              onChange={handleChange}
              name="organisation"
              value={formData.organisation}
              validators={["required"]}
              errorMessages={["Organisation is required"]}
            />
          ) : null}

          <Autocomplete
            id="location"
            onChange={(event, value) =>
              handleAutoCompleteField(value, "location")
            }
            style={{
              backgroundColor: "white",
              marginTop: 30,
            }}
            options={counrtyList}
            autoHighlight
            getOptionLabel={(option) => option.value}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select Country"
                  variant="outlined"
                  error={
                    isLocationSelected === undefined
                      ? false
                      : !isLocationSelected
                  }
                  helperText={
                    isLocationSelected === undefined
                      ? null
                      : !isLocationSelected
                      ? "Location is required"
                      : null
                  }
                  fullWidth
                />
              );
            }}
          />

          <TextValidator
            style={{ marginTop: 30, backgroundColor: "white" }}
            className={classes.textFieldWidth}
            label="Email"
            onChange={handleChange}
            variant="outlined"
            name="email"
            value={formData.email}
            validators={["required", "isEmail"]}
            errorMessages={["Email is required", "Email is not valid"]}
          />

          <TextValidator
            style={{
              marginTop: 30,
              marginBottom: 10,
              backgroundColor: "white",
            }}
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
              "Password must have at least 8 characters",
            ]}
          />

          {joiningOrg === false ? (
            <a
              onClick={() => {
                setJoiningOrg(true);
                setFormData({
                  email: formData.email,
                  organisation: " ",
                  organisationKey: "",
                  location: formData.location,
                  password: formData.password,
                  g_recaptcha_response: formData.g_recaptcha_response,
                });
              }}
              style={{ textAlign: "left", color: "#008" }}
            >
              I'm here to join my organisation
            </a>
          ) : null}

          {joiningOrg === false ? null : (
            <div>
              <TextValidator
                style={{
                  marginTop: 30,
                  marginBottom: 10,
                  backgroundColor: "white",
                }}
                className={classes.textFieldWidth}
                variant="outlined"
                label="Organisation Key"
                onChange={handleChange}
                name="organisationKey"
                value={formData.organisationKey}
                validators={["required"]}
                errorMessages={["Organisation is required"]}
              />

              <a
                onClick={() => {
                  setJoiningOrg(false);
                  setFormData({
                    email: formData.email,
                    organisation: formData.organisation,
                    organisationKey: "",
                    location: formData.location,
                    password: formData.password,
                    g_recaptcha_response: formData.g_recaptcha_response,
                  });
                }}
                style={{ textAlign: "left", color: "#008" }}
              >
                I do not have an organisation to join.
              </a>
            </div>
          )}

          <Grid
            container
            justify="center"
            alignItems="center"
            alignContent="center"
            style={{
              marginTop: 30,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={onChangeCaptcha}
              onExpired={() => {
                setFormData((prevData: any) => {
                  return { ...prevData, g_recaptcha_response: "" };
                });
              }}
            />
          </Grid>

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
          <Link to="/login">
            <h3 style={{ marginLeft: -21, marginTop: 10, color: "#008" }}>
              Already registred? Sign In
            </h3>
          </Link>
        </div>
      </Grid>
    </Grid>
  );
};
export default Register;
