import React, { useState, FC, useEffect } from "react";
import { Route, Switch, useLocation, useHistory } from "react-router-dom";
// import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Layout, Image } from "antd";

import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { SnackbarContainer } from "uno-material-ui";
import "./App.css";
import "antd/dist/antd.css";

import AppHeader from "./Components/common/header";
import Workspaces from "./Components/workspaces/workspaces";
import AppLandingPage from "./Components/home/LandingPage";
import WorkspaceAppFiles from "./Components/workspaces/workspaceFiles";
import PrototypeForm from "./Components/home/PrototypeForm";
import About from "./Components/home/About";

import Plots from "./graph/components/Plots";
import Login from "./Components/users/Login";
import Register from "./Components/users/Register";
import VerifyEmail from "./Components/users/verifyEmail";
import SignInOutContainer from "./Components/users/signInOutContainer";
import Terms from "Components/home/Terms";
import Credits from "Components/home/Credits";
import Footer from "Components/common/Footer";

const { Header, Content } = Layout;

const useStyles = makeStyles((theme) => ({
  content: {
    marginTop: 64,
    flex: "1 0 auto",
  },
  footer: {
    flexShrink: 0,
  },
  mainLayout: {
    padding: 0,
    height: "auto",
    lineHeight: 1.6,
  },
}));

const router = [
  {
    path: "/",
    component: AppLandingPage,
  },
  {
    path: "/questions",
    component: PrototypeForm,
  },
  {
    path: "/authentication/:tabId",
    component: SignInOutContainer,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/register",
    component: Register,
  },
  {
    path: "/verify/:verifyStr",
    component: VerifyEmail,
  },
  { path: "/graph", component: Plots },
  { path: "/workspaces", component: Workspaces },
  { path: "/terms", component: Terms },
  {
    path: "/files/:workspacesId",
    component: ({ match }: any) => (
      <WorkspaceAppFiles id={match.params.workspacesId} />
    ),
  },
  {
    path: "/mailing-list",
    component: About,
  },
  {
    path: "/credits",
    component: Credits,
  },
];

const theme = createMuiTheme();

const App = () => {
  const classes = useStyles();

  return (
    <Layout className="mainLayout" style={{ minHeight: "100%" }}>
      <ThemeProvider theme={theme}>
        <SnackbarContainer />
        <Header className="default-header">
          <AppHeader />
        </Header>
        <Content
          className={classes.content}
          style={{ fontFamily: "Quicksand" }}
        >
          <Switch>
            {router.map((e) => (
              // @ts-ignore
              <Route exact path={e.path} component={e.component} />
            ))}
          </Switch>
        </Content>
        <Footer className={classes.footer} />
      </ThemeProvider>
    </Layout>
  );
};

export default App;
