import React, { useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Material UI Components
import { makeStyles } from "@material-ui/core/styles";
import {
  Avatar,
  Grid,
  Paper,
  Button,
  IconButton,
  Collapse,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Typography from "@material-ui/core/Typography";

// Material Ui Icons
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import CloseIcon from "@material-ui/icons/Close";

// Material UI validator
//@ts-ignore
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

// Style Classes
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
    width: "75%",
  },
}));

const Login = (props: any) => {
  const classes = useStyles();

  const [isError, setError] = React.useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [isSuccess, setSuccess] = React.useState(false);

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
    try {
      const res = await axios.post("api/login", formData);
      const loginData = res.data;
      setError((prev: any) => false);
      setSuccess((prev: any) => true);
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.userDetails));
      // props.onLogin();
      // props.history.push('/workspaces');
    } catch (err) {
      console.log(err);
      const errMsg = err.response.data.message;
      setErrorMsg((prevMsg: string) => {
        return errMsg;
      });
      setError((prev: any) => true);
      setSuccess((prev: any) => false);
    }
  };
  return (
    <>
      <Grid>
        <Paper elevation={10} className={classes.paperStyle}>
          {/* @ts-ignore */}
          <Grid align="center">
            <div className={classes.root}>
              <Collapse in={isError}>
                <Alert
                  severity="error"
                  action={
                    <IconButton
                      aria-label="close"
                      color="inherit"
                      size="small"
                      onClick={() => {
                        setError(false);
                      }}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  }
                >
                  {errorMsg}
                </Alert>
              </Collapse>

              <Collapse in={isSuccess}>
                <Alert
                  severity="success"
                  action={
                    <IconButton
                      aria-label="close"
                      color="inherit"
                      size="small"
                      onClick={() => {
                        setSuccess(false);
                      }}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  }
                >
                  Successfully Logged In
                </Alert>
              </Collapse>
            </div>
            <Avatar className={classes.avatarStyle}>
              <LockOutlinedIcon />
            </Avatar>
            <h2>Sign In</h2>
            <div>
              <ValidatorForm ref={loginForm} onSubmit={handleSubmit}>
                <TextValidator
                  className={classes.textFieldWidth}
                  label="Email"
                  onChange={handleChange}
                  name="email"
                  value={formData.email}
                  validators={["required", "isEmail"]}
                  errorMessages={["Email is required!!!", "Email is not valid"]}
                />
                <br />
                <TextValidator
                  className={classes.textFieldWidth}
                  label="Password"
                  type="password"
                  onChange={handleChange}
                  name="password"
                  value={formData.password}
                  validators={["required"]}
                  errorMessages={["Password is required"]}
                />
                <br />
                <Button
                  color="primary"
                  variant="contained"
                  type="submit"
                  disabled={isSubmit}
                >
                  {(isSubmit && "Your form is submitted!") ||
                    (!isSubmit && "Submit")}
                </Button>
              </ValidatorForm>
              <br />
              <Typography>
                <Link to="/register">Not registred yet?</Link>
              </Typography>
            </div>
          </Grid>
        </Paper>
      </Grid>
    </>
  );
};

export default Login;
