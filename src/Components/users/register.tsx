import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
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
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import Autocomplete from "@material-ui/lab/Autocomplete";

// Material Ui Icons
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import CloseIcon from "@material-ui/icons/Close";

// Material UI validator
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

// Import Country list
import { counrtyList } from "./common-data";

// Style Classes
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
    width: "75%",
  },
}));

const Register = (props: any) => {
  const classes = useStyles();

  const [isError, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [isLocationSelected, setLocationStatus] = useState();

  const registerForm = useRef();

  const [formData, setFormData] = useState({
    email: "",
    organisation: "",
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
      setLocationStatus((prev: any) => false);
    } else {
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
    if (formData.location === "") {
      setLocationStatus((prev: any) => false);
      return;
    }
    try {
      const res = await axios.post("api/register", formData);
      const loginData = res.data;
      setError((prev: any) => false);
      setSuccess((prev: any) => true);
      // localStorage.setItem('token',loginData.token)
      // localStorage.setItem('user',JSON.stringify(loginData.userDetails))
      // props.onLogin();
      props.onRegister();
      // setTimeout(()=>{
      // props.onRegister();
      // },3000)
    } catch (err) {
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
                  Successfully Registered!!!
                </Alert>
              </Collapse>
            </div>
            <Avatar className={classes.avatarStyle}>
              <LockOutlinedIcon />
            </Avatar>
            <h2>Sign Up</h2>
            <div>
              <ValidatorForm
                ref={registerForm}
                onSubmit={() => {
                  handleSubmit();
                }}
              >
                <TextValidator
                  className={classes.textFieldWidth}
                  label="Organisation"
                  onChange={handleChange}
                  name="organisation"
                  value={formData.organisation}
                  validators={["required"]}
                  errorMessages={["Organisation is required!!!"]}
                />
                <br />
                <Autocomplete
                  id="location"
                  onChange={(event, value) =>
                    handleAutoCompleteField(value, "location")
                  }
                  options={counrtyList}
                  className={classes.textFieldWidth}
                  autoHighlight
                  getOptionLabel={(option) => option.value}
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                        label="Select Country"
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
                <br />
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
                {/* <ReCAPTCHA
                                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                                    onChange={onChangeCaptcha}
                                    onExpired={()=>{
                                        setFormData((prevData:any)=>{
                                            return {...prevData,g_recaptcha_response:""}
                                        })
                                    }}
                                /> */}
                <br />
                <Button
                  color="primary"
                  variant="contained"
                  type="submit"
                  disabled={isSubmit}
                  onFocus={() => {
                    if (formData.location === "") {
                      setLocationStatus((prev: any) => false);
                      return;
                    }
                  }}
                >
                  {(isSubmit && "Your form is submitted!") ||
                    (!isSubmit && "Submit")}
                </Button>
              </ValidatorForm>

              <Typography>
                Already registered ?<Link to="/login">Login In</Link>
              </Typography>
            </div>
          </Grid>
        </Paper>
      </Grid>
    </>
  );
};
export default Register;
