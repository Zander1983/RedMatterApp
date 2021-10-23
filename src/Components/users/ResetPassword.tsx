import { useEffect, useState } from "react";
import { Grid, Button, CircularProgress, TextField } from "@material-ui/core";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { useHistory } from "react-router";
import { snackbarService } from "uno-material-ui";

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
    color: "#008",
    textDecoration: "underline",
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
}));
const ResetPassword = () => {
  const classes = useStyles();

  //  Verify Token Extraction
  const history = useHistory();
  const resetPasswordToken = history.location.pathname.split("/")?.[2];

  // Loaders
  const [loading, setLoading] = useState(false);

  // Password
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Confirm Password
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Submit btn and Success Messages
  const [enableSubmitBtn, setEnableSubmitBtn] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Setting up values of password and passwordError
  const passwordHandler = (value: string) => {
    setPassword(value);
    setPasswordError(
      value.length < 8 ? "Password must be 8 characters long." : ""
    );
  };

  // Checking if both passwords matched or not and showing error according to in.
  useEffect(() => {
    setConfirmPasswordError(
      password === confirmPassword ? "" : "Password didn't match."
    );
    setEnableSubmitBtn(
      password && confirmPassword && password === confirmPassword
    );
  }, [confirmPassword]);

  // handling the reset password logic
  const submitHandler = async () => {
    setLoading(true);
    try {
      const url = `/api/resetpassword`;
      const response = await axios.post(url, {
        resetPasswordToken,
        password,
        confirmPassword,
      });
      if (response.status === 200) {
        setSuccessMessage(response.data?.message);
      } else {
        snackbarService.showSnackbar(response.data?.message, "error");
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      snackbarService.showSnackbar("Couldn't reset the Password", "error");
    }
    setPassword("");
    setConfirmPassword("");
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
        <h2>Create new Password</h2>

        <p>
          {
            "Your new password must be different from the previous used passwords."
          }
        </p>

        {/* Password Input */}
        <TextField
          className={classes.textFieldWidth}
          label="Password"
          onChange={(e) => passwordHandler(e.target.value)}
          name="password"
          value={password}
          variant="outlined"
          type="password"
        />
        <p className={classes.emailErr}> {passwordError} </p>

        {/* Confirm Password Input */}
        <TextField
          className={classes.textFieldWidth}
          label="Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          name="password"
          value={confirmPassword}
          variant="outlined"
          type="password"
        />
        <p className={classes.emailErr}> {confirmPasswordError} </p>

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

        {/* Confirmation Mail */}
        {successMessage && (
          <>
            <h3 className={classes.success}>{successMessage}</h3>
            {/* Go to login page */}
            <div>
              <h3>
                {"Click Here to "}
                <Link to="/login">
                  <span className={classes.registration}> Login </span>
                </Link>
                {"with updated password."}
              </h3>
            </div>
          </>
        )}
      </Grid>
    </Grid>
  );
};
export default ResetPassword;
