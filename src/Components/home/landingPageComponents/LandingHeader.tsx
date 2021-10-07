import { NavLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";

import loop_analytics from "assets/videos/loop_analytics.mp4";
import icon from "assets/images/white_icon.png";

import userManager from "Components/users/userManager";
import { Grid } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  topDialogBar: {
    height: 500,
  },
  topDialogVisualContentBar: {
    height: 500,

    overflow: "hidden",
  },
  topDialogContent: {
    textAlign: "center",
    flexDirection: "column",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -400,
    fontFamily: "Quicksand",
  },
  card: {
    borderRadius: 10,
    zIndex: 0,
    width: "100%",
    backgroundColor: "rgba(90, 110, 120, 0.8)",
  },
  marginButton: {
    margin: theme.spacing(1),
    width: 300,
    height: 50,
    boxShadow: "1px 1px 5px 1px #555",
    backgroundColor: "#66a",
    "&:hover": {
      backgroundColor: "#66b",
    },
  },
}));

const LandingHeader = () => {
  const classes = useStyles();
  const isLoggedIn = userManager.isLoggedIn();

  return (
    <div className={classes.topDialogBar}>
      <div className={classes.topDialogVisualContentBar}>
        <video
          autoPlay
          muted
          loop
          style={{
            minHeight: 500,
            minWidth: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <source src={loop_analytics} type="video/mp4" />
        </video>
      </div>

      <div className={classes.topDialogContent}>
        <Grid container xs={10} sm={9} md={6} lg={4} xl={3}>
          <Card className={classes.card} variant="outlined">
            <CardContent>
              <Typography variant="h6">
                <img
                  src={icon}
                  alt="Red matter logo"
                  height="25"
                  style={{
                    marginRight: 10,
                    marginTop: -8,
                  }}
                />
                <b
                  style={{
                    fontFamily: "quicksand",
                    fontWeight: 400,
                    fontSize: 29,
                    color: "#fff",
                  }}
                >
                  RED MATTER
                </b>
              </Typography>
              <p style={{ marginTop: 10 }}>
                <b style={{ color: "#eee" }}>Your flow analysis tool</b>
              </p>
              <p style={{ color: "#eee", marginTop: -15 }}>
                Analysing FCS files has never been easier
              </p>
              {!isLoggedIn ? (
                <div>
                  <div>
                    <NavLink to="/login">
                      <Button
                        variant="contained"
                        size="large"
                        color="primary"
                        className={classes.marginButton}
                      >
                        Login
                      </Button>
                    </NavLink>{" "}
                    <NavLink to="/register">
                      <Button
                        variant="contained"
                        size="large"
                        color="primary"
                        className={classes.marginButton}
                      >
                        Register
                      </Button>
                    </NavLink>
                  </div>
                </div>
              ) : process.env.REACT_APP_NO_WORKSPACES === "true" ? null : (
                <div>
                  <NavLink to="/experiments">
                    <Button
                      variant="contained"
                      size="large"
                      color="primary"
                      className={classes.marginButton}
                    >
                      Experiments
                    </Button>
                  </NavLink>
                </div>
              )}
              {/* <br />
              <NavLink to="/mailing-list">
                <p
                  style={{
                    color: "#ddf",
                  }}
                >
                  Or join our mailing list
                </p>
              </NavLink> */}
            </CardContent>
          </Card>
        </Grid>
      </div>
    </div>
  );
};

export default LandingHeader;
