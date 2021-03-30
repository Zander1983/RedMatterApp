import React from "react";
import { NavLink } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import "./css/landing.css";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";

import loop_analytics from "../../assets/videos/loop_analytics.mp4";

import icon from "../../assets/images/white_icon.png";
import ImgCarousel from "./carousel";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    paddingTop: 40,
    paddingLeft: 100,
    paddingRight: 100,
    textAlign: "center",
    flexDirection: "column",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  },
  mainDiv: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(150, 200, 200, 0.5)",
    fontFamily: "Quicksand",
  },
  card: {
    width: 600,
    flex: 1,
    backgroundColor: "rgba(90, 110, 120, 0.96)",
  },
  centralizer: {
    display: "grid",
    placeItems: "center",
  },
  marginButton: {
    margin: theme.spacing(1),
    width: 300,
    height: 50,
    boxShadow: "1px 1px 5px 1px #555",
    backgroundColor: "#66a",
    "&:hover": {
      backgroundColor: "#77b",
    },
  },
  video: {
    position: "fixed",
    right: 0,
    bottom: 0,
    minWidth: "100%",
    minHeight: "100%",
  },
}));

const AppLandingPage = () => {
  const classes = useStyles();

  return (
    <div className="loading-page">
      <video autoPlay muted loop className={classes.video}>
        <source src={loop_analytics} type="video/mp4" />
      </video>
      <div className={classes.mainDiv}>
        <div className={classes.mainContainer}>
          <div className={classes.centralizer}>
            <Card className={classes.card} variant="outlined">
              <CardContent>
                <Typography variant="h6" className={classes.title}>
                  <img
                    src={icon}
                    alt="Logo"
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
                  Anaylising FCS files has never been easier
                </p>
                {/* <ImgCarousel /> */}
                <NavLink to="/questions">
                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    className={classes.marginButton}
                  >
                    Start now
                  </Button>
                </NavLink>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLandingPage;
