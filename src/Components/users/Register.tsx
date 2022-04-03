import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Link, useHistory } from "react-router-dom";

import { Grid, Button, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { snackbarService } from "uno-material-ui";

import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import useGAEventTrackers from "hooks/useGAEvents";

import { counrtyList } from "./common-data";
import userManager from "./../users/userManager";

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
    marginTop: 30,
    backgroundColor: "white",
  },
  gridContainer: {
    paddingTop: 30,
    paddingBottom: 50,
    paddingLeft: 20,
    paddingRight: 20,
  },
  innerGridContainer: {
    backgroundColor: "#fafafa",
    padding: 20,
    borderRadius: 10,
    boxShadow: "1px 1px 1px 1px #ddd",
    border: "solid 1px #ddd",
    textAlign: "center",
  },
  selectCountry: {
    backgroundColor: "white",
    marginTop: 30,
  },
  orgBtn: {
    textAlign: "left",
    color: "#008",
  },
  captcha: {
    marginTop: 30,
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  submitBtn: {
    height: 50,
    width: 170,
    backgroundColor: "#66a",
    color: "white",
  },
  loading: {
    color: "white",
    width: 23,
    height: 23,
  },
  captchaError: {
    color: "red",
    height: 14,
  },
}));

const Register = (props: any) => {
  const classes = useStyles();
  const history = useHistory();
  const isUserLoggedin = userManager.isLoggedIn();

  const [loading, setLoading] = React.useState(false);
  const [isLocationSelected, setLocationStatus] = useState();
  const [captcha, setCaptcha] = useState<boolean>(false);
  const [captchaError, setCaptchaError] = useState<boolean>(false);

  const registerForm = useRef();

  const [formData, setFormData] = useState({
    email: "",
    organisation: "",
    organisationKey: "",
    location: "",
    password: "",
    g_recaptcha_response: "",
    subscribed: false,
  });

  const eventStacker = useGAEventTrackers("Registration");

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

  useLayoutEffect(() => {
    isUserLoggedin && window.location.replace("/");
  }, [isUserLoggedin]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async () => {
    if (formData.location === "") {
      //@ts-ignore
      setLocationStatus((prev: any) => false);
      return;
    }
    if (!captcha) {
      setCaptchaError(true);
      return;
    }
    try {
      setLoading(true);
      await axios.post("api/register", formData);
      setLoading(false);
      snackbarService.showSnackbar("Email verification sent!", "success");
      eventStacker(
        "A new user has registered.",
        `User has registered but yet to be varified.`
      );
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
      className={classes.gridContainer}
    >
      <Grid item lg={6} md={9} sm={12} className={classes.innerGridContainer}>
        <h2>Create your Red Matter account</h2>
        <ValidatorForm
          ref={registerForm}
          onSubmit={() => {
            handleSubmit();
          }}
        >
          {/* Organisation */}
          {joiningOrg === false && (
            <TextValidator
              className={classes.textFieldWidth}
              variant="outlined"
              label="Organisation"
              onChange={handleChange}
              name="organisation"
              value={formData.organisation}
              validators={["required"]}
              errorMessages={["Organisation is required"]}
            />
          )}
          {/* Select Country */}
          <Autocomplete
            id="location"
            onChange={(event, value) =>
              handleAutoCompleteField(value, "location")
            }
            className={classes.selectCountry}
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
          {/* Email */}
          <TextValidator
            className={classes.textFieldWidth}
            label="Email"
            onChange={handleChange}
            variant="outlined"
            name="email"
            value={formData.email}
            validators={["required", "isEmail"]}
            errorMessages={["Email is required", "Email is not valid"]}
          />
          {/* Password */}
          <TextValidator
            style={{ marginBottom: 10 }}
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

          {/* Switch from Register to create organisation page*/}
          {/* {joiningOrg === false && (
            <button
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
              className={classes.orgBtn}
            >
              I'm here to join my organisation
            </button>
          )} */}
          {/* {joiningOrg && (
            <div>
              <TextValidator
                style={{ marginBottom: 10 }}
                className={classes.textFieldWidth}
                variant="outlined"
                label="Organisation Key"
                onChange={handleChange}
                name="organisationKey"
                value={formData.organisationKey}
                validators={["required"]}
                errorMessages={["Organisation is required"]}
              />

              <button
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
                style={{ color: "#008" }}
              >
                I do not have an organisation to join.
              </button>
            </div>
          )} */}

          {/* Subscribed */}
          <p style={{ margin: 0, fontWeight: 500 }}>
            Yes, please send me special offers and new product emails
          </p>
          <input
            type="radio"
            name="subscribed"
            value="Yes"
            onClick={() =>
              setFormData((prev: any) => {
                return { ...prev, subscribed: true };
              })
            }
          />
          <label
            htmlFor="Yes"
            style={{ marginRight: 5, marginLeft: 2, fontWeight: 500 }}
          >
            Yes
          </label>
          <input
            type="radio"
            name="subscribed"
            value="No"
            onClick={() =>
              setFormData((prev: any) => {
                return { ...prev, subscribed: false };
              })
            }
          />
          <label htmlFor="No" style={{ marginLeft: 2, fontWeight: 500 }}>
            No
          </label>
          {/* Captcha */}
          <Grid
            container
            justify="center"
            alignItems="center"
            alignContent="center"
            className={classes.captcha}
          >
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={(value) => {
                setCaptcha(true);
                setCaptchaError(false);
              }}
              onExpired={() => {
                setFormData((prevData: any) => {
                  return { ...prevData, g_recaptcha_response: "" };
                });
              }}
            />
            {captchaError && (
              <p className={classes.captchaError}>
                {"Make sure you are not a robot"}
              </p>
            )}
          </Grid>
          <Grid container justify="center" style={{ marginTop: 30 }}>
            <Button type="submit" className={classes.submitBtn}>
              {loading ? (
                <CircularProgress className={classes.loading} />
              ) : (
                "Submit"
              )}
            </Button>
          </Grid>
        </ValidatorForm>
        <div>
          <Link to="/login">
            <h3 style={{ marginTop: 10, color: "#008" }}>
              Already registred? Sign In
            </h3>
          </Link>
        </div>
      </Grid>
    </Grid>
  );
};
export default Register;
