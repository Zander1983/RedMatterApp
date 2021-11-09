import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Plans from "./landingPageComponents/Plans";
import LandingHeader from "./landingPageComponents/LandingHeader";
import TargetUsers from "./landingPageComponents/TargetUsers";
import Features from "./landingPageComponents/Features";
import Partners from "./landingPageComponents/Partners";
import Universities from "./landingPageComponents/Universities";
import { Divider } from "antd";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { useState } from "react";

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

  const [openVersionDialog, setOpenVersionDialog] = useState(true);

  return (
    <Grid className={classes.mainContainer}>
      <Dialog
        open={openVersionDialog}
        onClose={() => {
          setOpenVersionDialog(false);
        }}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle
          id="form-dialog-title"
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span>Version updates </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              setOpenVersionDialog(false);
            }}
          >
            X
          </span>{" "}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is new version of red matter which is a major upgradation of
            the previous one.
          </DialogContentText>
          <DialogContentText>
            We encourage you to use the new version currently it does not hold
            the previous version data but on demand we can make that happen.
          </DialogContentText>
          <DialogContentText>
            Your old workspace are shifted to a different domain and you can
            access them with below button click
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              window.open("https://old.redmatterapp.com", "_blank").focus();
              setOpenVersionDialog(false);
            }}
            color="primary"
          >
            Load old redmatter
          </Button>
        </DialogActions>
      </Dialog>
      <LandingHeader />
      <div className={classes.topRightTriangleContainer}>
        <div className={classes.triangleTopRight}></div>
      </div>
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
        <Partners />
        <Divider></Divider>
        <Universities />
        {/* <Divider></Divider>
        <Plans /> */}
      </Grid>
    </Grid>
  );
};

export default AppLandingPage;
