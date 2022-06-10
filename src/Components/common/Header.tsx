import { useEffect } from "react";
import ReactGA from "react-ga";

import { NavLink } from "react-router-dom";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation } from "react-router";

import icon from "../../assets/images/white_icon.png";
import userManager from "Components/users/userManager";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  headertitle: {
    flexGrow: 1,
    fontFamily: "Quicksand",
    fontWeight: 700,
    color: "white",
  },
  topBarLink: {
    color: "white",
    fontSize: 17,
    fontFamily: "Quicksand",
    fontWeight: 600,
    marginLeft: "10px",
    padding: 6,
    borderRadius: 3,
  },
  toolbar: {
    backgroundColor: "#333",
    textColor: "#fafafa",
  },
}));

const AppHeader = (props: any) => {
  const location = useLocation();
  const isLoggedIn =
    Object.keys(
      useSelector((state: any) => {
        if (Object.keys(state).includes("user")) {
          if (Object.keys(state.user).includes("profile")) {
            return state.user.profile;
          }
        }
        return {};
      })
    ).length !== 0;

  const classes = useStyles();

  const onLogout = () => {
    userManager.logout();
  };

  useEffect(() => {
    ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_ID);
    ReactGA.pageview(location.pathname);
  }, [location.pathname]);

  const renderHeader = () => {
    return (
      <div>
        <AppBar className={classes.toolbar} position="fixed">
          <Toolbar>
            <Typography className={classes.headertitle}>
              <NavLink style={{ color: "#fafafa" }} to="/">
                <img
                  src={icon}
                  alt="Logo"
                  height="23"
                  style={{
                    marginRight: 7,
                    marginTop: -6,
                  }}
                />
                <b
                  style={{
                    fontFamily: "quicksand",
                    fontWeight: 400,
                    fontSize: 25,
                  }}
                >
                  {window.outerWidth > 500 ? "RED MATTER" : "RM"}
                </b>
                <b
                  style={{
                    fontFamily: "quicksand",
                    marginLeft: 5,
                    color: "#bbb",
                    fontWeight: 300,
                    fontSize: 15,
                  }}
                >
                  {"v3.0.14"}
                </b>
              </NavLink>
            </Typography>
            {process.env.REACT_APP_NO_WORKSPACES === "true" && isLoggedIn ? (
              <NavLink className={classes.topBarLink} to="/analyse">
                Start Analysing
              </NavLink>
            ) : null}
            {isLoggedIn ? (
              <>
                {/* {process.env.REACT_APP_NO_WORKSPACES === "true" ? null : (
                  <NavLink className={classes.topBarLink} to="/experiments">
                    Experiments
                  </NavLink>
                )} */}
                {/* <NavLink className={classes.topBarLink} to="/plans">
                  Plans
                </NavLink> */}
                {/* <NavLink className={classes.topBarLink} to="/user-profile">
                  Profile
                </NavLink> */}
                {/* <NavLink className={classes.topBarLink} to="/browse-experiments">
                Browse
              </NavLink> */}
                {/* <NavLink className={classes.topBarLink} to="/why-red-matter">
                  Why Red Matter
                </NavLink> */}
                <a className={classes.topBarLink} onClick={onLogout} href="/">
                  Logout
                </a>
              </>
            ) : (
              <>
                {/* <NavLink className={classes.topBarLink} to="/why-red-matter">
                  Why Red Matter
                </NavLink> */}
                <NavLink className={classes.topBarLink} to="/login">
                  Login
                </NavLink>
                <NavLink className={classes.topBarLink} to="/register">
                  Register
                </NavLink>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Toolbar />
      </div>
    );
  };

  // !location.pathname.includes("/workspace") &&
  return renderHeader();
};

export default AppHeader;
