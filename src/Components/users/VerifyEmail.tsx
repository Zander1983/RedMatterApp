import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import Button from "@material-ui/core/Button";
import { CircularProgress, Grid } from "@material-ui/core";
import { snackbarService } from "uno-material-ui";
import logo_orig from "../../assets/images/logo_orig.png";

const VerifyEmail = (props: any) => {
  const history = useHistory();
  const code = props.location.pathname.split("/")[2];

  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.get(`/api/verify?verifyStr=${code}`);
      setLoading(false);
      snackbarService.showSnackbar("Your account is validated, welcome to Red Matter!", "success");
    } catch (err: any) {
      setFailed(true);
      snackbarService.showSnackbar("Validation failed, try again", "error");
    }
  };
  useEffect(() => {
    if (code !== undefined && code !== "") {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {code === undefined || code === "" ? (
          <div>
            <Grid
              justify="center"
              alignItems="center"
              alignContent="center"
              style={{
                textAlign: "center",
                justifyContent: "center",
              }}
            >
              <Grid
                lg={6}
                md={8}
                sm={12}
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <img
                  alt="Red matter logo"
                  src={logo_orig}
                  style={{
                    width: "100%",
                  }}
                ></img>
              </Grid>
            </Grid>
            <h1 style={{ fontSize: 30, marginTop: 30 }}>Welcome!</h1>
            <h3 style={{ marginTop: 20 }}>
              We have sent you an email
              <br /> To activate your account, please click the link on it
              <br /> If you don't find it, check the spam folder
            </h3>
          </div>
        ) : (
          <>
            <Grid>
              {failed ? (
                <>
                  <h1>Unfortunately, we couldn't validate your account</h1>
                  <h4>
                    This is an error on our end.
                    <br /> Please send an email to <b>support@redmatterapp.com</b> so we can help
                    you!
                  </h4>
                </>
              ) : loading ? (
                <>
                  <div>
                    <h1>Verifying your account...</h1>
                  </div>
                  <div>
                    <CircularProgress></CircularProgress>
                  </div>
                </>
              ) : (
                <>
                  <h1>Welcome to Red Matter!</h1>
                  <p>
                    We are currently in our version {process.env.REACT_APP_CURRENT_APP_VERSION} and
                    building several features to make your analysis easier
                  </p>
                  <Button
                    type="submit"
                    style={{
                      height: 50,
                      marginRight: 20,
                      width: 170,
                      backgroundColor: "#66a",
                      color: "white",
                    }}
                    onClick={() => history.push("/login")}
                  >
                    Login
                  </Button>
                </>
              )}
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default VerifyEmail;
