import { useState, useLayoutEffect } from "react";
import { Grid, Button, CircularProgress, TextField } from "@material-ui/core";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { snackbarService } from "uno-material-ui";

import userManager from "./../users/userManager";

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
    marginTop: 30,
    backgroundColor: "white",
  },
  outerGridContainer: {
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
    width: "50%",
  },
  forgetPass: {
    float: "right",
    color: "rgb(0, 0, 136)",
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  btnContainer: {
    marginTop: 30,
  },
  btn: {
    height: 50,
    marginRight: 20,
    width: 170,
    backgroundColor: "#66a",
    color: "white",
  },
  progress: {
    color: "white",
    width: 23,
    height: 23,
  },
  resendProgress: {
    color: "rgb(0, 0, 136)",
    width: 12,
    height: 12,
    marginLeft: 10,
  },
  registration: {
    marginLeft: -21,
    marginTop: 10,
    color: "#008",
  },
  emailErr: {
    height: 12,
    fontSize: 12,
    color: "red",
    textAlign: "left",
  },
  success: {
    height: 16,
    color: "green",
  },
  resend: {
    color: "rgb(0, 0, 136)",
    textDecoration: "underline",
    fontWeight: 500,
    minHeight: 30,
    cursor: "pointer",
  },
}));

const ForgetPassword = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [enableSubmitBtn, setEnableSubmitBtn] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useLayoutEffect(() => {
    const isLoggedIn = userManager.isLoggedIn() ;
    if(isLoggedIn){
      window.location.replace("/")
    }
  }, []);

  const emailHandler = (value: string) => {
    setEmail(value);
    if (value === "") {
      setEmailError("Email is required");
      setEnableSubmitBtn(false);
    }

    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(String(value).toLowerCase())) {
      setEmailError("Email is not valid");
      setEnableSubmitBtn(false);
    } else {
      setEmailError("");
      setEnableSubmitBtn(true);
    }
  };

  const submitHandler = async (resend = false) => {
    resend ? setResendLoading(true) : setLoading(true);
    try {
      const response = await axios.post("/api/forgotpassword", { email });
      setSuccessMessage(response.data?.message);
      resend ? setResendLoading(false) : setLoading(false);
    } catch (err) {
      console.log(err);
      resend ? setResendLoading(false) : setLoading(false);
      snackbarService.showSnackbar("Couldn't find the Email", "error");
    }
  };

  return (
    <Grid
      container
      alignContent="center"
      justify="center"
      className={classes.outerGridContainer}
    >
      <Grid
        container
        justify="center"
        direction="column"
        className={classes.innerGridContainer}
      >
        {/* Title */}
        <h2>Forget Password</h2>

        <p>
          {"Enter your Email & we'll send you a link to reset your password."}
        </p>

        {/* Email Input */}
        <TextField
          className={classes.textFieldWidth}
          label="Email"
          onChange={(e) => emailHandler(e.target.value)}
          name="email"
          value={email}
          variant="outlined"
        />
        <p className={classes.emailErr}> {emailError} </p>

        {/* Submit Button */}
        <Grid justify="center" container className={classes.btnContainer}>
          <Button
            onClick={() => submitHandler()}
            className={classes.btn}
            disabled={!enableSubmitBtn}
            style={{
              backgroundColor: !enableSubmitBtn ? "#F0F0F0" : "#6666AA",
            }}
          >
            {loading ? (
              <CircularProgress className={classes.progress} />
            ) : (
              "Submit"
            )}
          </Button>
        </Grid>

        {/* Go to registration page */}
        <div>
          <Link to="/login">
            <h3 className={classes.registration}>Go Back to Login Page</h3>
          </Link>
        </div>

        {/* Confirmation Mail */}
        {successMessage && (
          <>
            <h3 className={classes.success}>{successMessage}</h3>
            <p>
              Didn't get the rest link in your mail?{" "}
              <span
                className={classes.resend}
                onClick={() => submitHandler(true)}
              >
                {"Resend"}
              </span>
              {resendLoading && (
                <CircularProgress
                  className={classes.resendProgress}
                  style={{ width: 12, height: 12 }}
                />
              )}
            </p>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default ForgetPassword;
