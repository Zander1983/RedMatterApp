import React from "react";

import { NavLink } from "react-router-dom";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import icon from "../../assets/images/white_icon.png";
import userManager from "Components/users/userManager";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
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
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.2)",
    },
  },
  toolbar: {
    backgroundColor: "#333",
    textColor: "#fafafa",
  },
}));

const AppHeader = (props: any) => {
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

  return (
    <div>
      <AppBar className={classes.toolbar} position="fixed">
        <Toolbar>
          {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton> */}
          <Typography variant="h6" className={classes.title}>
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
                RED MATTER
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
                v2.1.0
              </b>
            </NavLink>
          </Typography>
          <NavLink className={classes.topBarLink} to="/questions">
            Test Red Matter
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink className={classes.topBarLink} to="/workspaces">
                Workspace
              </NavLink>
              <a className={classes.topBarLink} onClick={onLogout} href="/">
                Logout
              </a>
            </>
          ) : (
            <>
              <NavLink className={classes.topBarLink} to="/login">
                Sign In
              </NavLink>
              <NavLink className={classes.topBarLink} to="/register">
                Register
              </NavLink>
            </>
          )}
          {/* <NavLink className={classes.topBarLink} to="/mailing-list">
          Mailing list
        </NavLink> */}
          {/* <NavLink className={classes.topBarLink} to="/">Home &nbsp;</NavLink>*/}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
};

export default AppHeader;
