import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import LandingHeader from "./landingPageComponents/LandingHeader";
import TargetUsers from "./landingPageComponents/TargetUsers";
import Features from "./landingPageComponents/Features";
import Partners from "./landingPageComponents/Partners";
import Universities from "./landingPageComponents/Universities";
import { Divider } from "antd";
import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    flexDirection: "column",
    marginLeft: "auto",
    marginRight: "auto",
  },
  mainContainer: {
    background:
      "linear-gradient(180deg, #6666F919 0%, #6666F913 50%, #F0F2F5 100%)",
    overflow: "hidden",
  },
  triangleTopLeft: {
    width: 0,
    height: 0,
    borderTop: "50px solid #333",
    borderRight: "100vw solid transparent",
  },
  triangleTopRight: {
    width: 0,
    height: 0,
    borderBottom: "50px solid #333",
    borderLeft: "100vw solid transparent",
  },
  topRightTriangleContainer: {
    marginTop: -50,
    position: "absolute",
    overflow: "hidden",
    width: "100%",
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
    <Grid className={classes.mainContainer} component={"div"}>
      <LandingHeader />
      <div className={classes.topRightTriangleContainer}>
        <div className={classes.triangleTopRight} />
      </div>
      <div className={classes.triangleTopLeft} />
      <Grid
        item
        className={classes.contentContainer}
        container
        xs={12}
        md={9}
        lg={8}
        component={"div"}
      >
        <TargetUsers />
        {/* <Partners /> */}
        <Divider />
        <Universities />
        {/* <Divider></Divider>
        <Plans /> */}
      </Grid>
    </Grid>
  );
};

export default AppLandingPage;
