import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import Plans from "./landingPageComponents/Plans";
import LandingHeader from "./landingPageComponents/LandingHeader";
import TargetUsers from "./landingPageComponents/TargetUsers";
import Features from "./landingPageComponents/Features";
import Universities from "./landingPageComponents/Universities";
import { Divider } from "antd";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    flexDirection: "column",
    marginLeft: "auto",
    marginRight: "auto",
  },
}));

const AppLandingPage = () => {
  const classes = useStyles();

  return (
    <Grid>
      <LandingHeader />
      <Grid className={classes.mainContainer} container xs={12} md={9} lg={8}>
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
