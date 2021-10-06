import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import Plans from "./landingPageComponents/Plans";
import LandingHeader from "./landingPageComponents/LandingHeader";
import TargetUsers from "./landingPageComponents/TargetUsers";
import Features from "./landingPageComponents/Features";
import Universities from "./landingPageComponents/Universities";
import { Divider } from "antd";

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    flexDirection: "column",
    marginLeft: "auto",
    marginRight: "auto",
  },
  mainContainer: {
    background:
      "linear-gradient(180deg, #6666F90F 0%, #DD33990F 80%, #F0F2F5 100%)",
    overflow: "hidden",
  },
  triangleTopLeft: {
    width: 0,
    height: 0,
    borderTop: "100px solid #333",
    borderRight: "100vw solid transparent",
  },
  footerTextContainer: {
    height: 200,
    paddingTop: 100,
    padding: 10,
    textAlign: "center",
    width: "100%",
  },
  footerText: {
    color: "#333",
    fontWeight: 300,
    fontSize: 25,
  },
  rectTop: {
    backgroundColor: "#333",
    width: "100%",
    height: 30,
  },
}));

const AppLandingPage = () => {
  const classes = useStyles();

  return (
    <Grid className={classes.mainContainer}>
      <LandingHeader />
      <div className={classes.rectTop}></div>
      <div className={classes.triangleTopLeft}></div>
      <Grid
        className={classes.contentContainer}
        container
        xs={12}
        md={9}
        lg={8}
      >
        <TargetUsers />
        <Divider></Divider>
        <Features />
        <Divider></Divider>
        <Universities />
        <Divider></Divider>
        <Plans />
      </Grid>
    </Grid>
  );
};

export default AppLandingPage;
