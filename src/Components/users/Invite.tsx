import { useEffect, useState, useRef } from "react";
import { useParams, useHistory } from "react-router";
import { snackbarService } from "uno-material-ui";
import axios from "axios";
import { Grid, Button } from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  input: {
    width: "100%",
    marginTop: 30,
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
  btn: {
    backgroundColor: "#66a",
    color: "white",
    marginTop: 15,
    paddingInline: 20,
    "&:hover": {
      backgroundColor: "#333",
    },
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
  success: {
    height: 16,
    color: "green",
  },
}));

// interfaces
interface ParamsType {
  id: string;
}
interface Invite {
  accepted: boolean;
  facilityId: string;
  email: string;
  organisationId: string;
  __v: number;
  _id: string;
}

interface User {
  email: string;
  password: string;
  confirmPassword: string;
  organisationId: string;
  verified: true;
  inviteId: string;
  facilityId: string;
}

// the component
const Invite = () => {
  const params: ParamsType = useParams();
  const history = useHistory();
  const classes = useStyles();

  // refs
  const formRef = useRef();

  // states
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [invitation, setInvitation] = useState<Invite>();

  // this one triggers when user changes the state
  const handleChange = (event: any) => {
    setFormData((prevData: any) => {
      return { ...prevData, [event.target.name]: event.target.value };
    });
  };

  // this one triggers when user clicks the submit button
  const handleSubmit = async () => {
    try {
      const data: User = {
        confirmPassword: formData.confirmPassword,
        password: formData.password,
        email: invitation.email,
        inviteId: invitation._id,
        facilityId: invitation.facilityId,
        organisationId: invitation.organisationId,
        verified: true,
      };
      const response = await axios.post("/api/addInvitedUserToDatabase", data);
      snackbarService.showSnackbar(response?.data?.message, "success");
      history.push("/login");
    } catch (err: any) {
      const errMsg = err?.response?.data?.message;
      snackbarService.showSnackbar(errMsg, "error");
    }
  };

  // getting the invitation object on initial load
  useEffect(() => {
    fetchInvitation(params.id);
  }, []);

  // Adding custom validation
  useEffect(() => {
    ValidatorForm.addValidationRule("minLength", (value: string) => {
      return value.length >= 8;
    });

    ValidatorForm.addValidationRule("isPasswordMatched", (value: string) => {
      return value === formData.password;
    });

    return () => {
      ValidatorForm.removeValidationRule("minLength");
      ValidatorForm.removeValidationRule("isPasswordMatched");
    };
  }, [formData]);

  // fetching the invitation object from DB
  const fetchInvitation = async (id: string) => {
    try {
      const { response }: { response: Invite } = await (
        await axios.get(`/api/invite/${id}`)
      ).data;
      setInvitation(response);
    } catch (error: any) {
      const errorMsg = error.response.data.message;
      snackbarService.showSnackbar(`${errorMsg}`, "error");
      history.push("/");
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
        <h2>Create Password</h2>

        <p>{"In order to create the profile, please provide a password."}</p>

        <ValidatorForm
          ref={formRef}
          onSubmit={() => {
            handleSubmit();
          }}
        >
          {/* Password Input */}
          <TextValidator
            className={classes.input}
            type="password"
            variant="outlined"
            label="Password"
            onChange={handleChange}
            name="password"
            value={formData.password}
            validators={["required", "minLength"]}
            errorMessages={["Password is required", "Password Length >= 8"]}
          />

          {/* Comfirm password */}
          <TextValidator
            className={classes.input}
            type="password"
            variant="outlined"
            label="Conform Password"
            onChange={handleChange}
            name="confirmPassword"
            value={formData.confirmPassword}
            validators={["required", "isPasswordMatched"]}
            errorMessages={["Password is required", "Password mismatched."]}
          />

          {/* Submit Button */}
          <Button type="submit" className={classes.btn}>
            {"Create Account"}
          </Button>
        </ValidatorForm>
      </Grid>
    </Grid>
  );
};
export default Invite;
