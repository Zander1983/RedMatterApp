import React, { useState, FC, useEffect } from "react";
import { Route, Switch, useLocation, useHistory } from "react-router-dom";
// import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Layout, Image } from "antd";

import { makeStyles } from "@material-ui/core/styles";
import "./App.css";
import "antd/dist/antd.css";

import AppHeader from "./Components/common/header";
import AppHome from "./Components/home/home";
import Workspaces from "./Components/workspaces/workspaces";
import AppLandingPage from "./Components/home/landingPage";
import WorkspaceAppFiles from "./Components/workspaces/workspaceFiles";
import requestsUrl from "./Components/common/RequestUrls";
import PrototypeForm from "./Components/home/PrototypeForm";

import Plots from "./Components/graph/components/Plots";
import Login from "./Components/users/login";
import Register from "./Components/users/register";
import VerifyEmail from "./Components/users/verifyEmail";
import SignInOutContainer from "./Components/users/signInOutContainer";
import GraphPrototype from "./Components/prototype/GraphPrototype";

const { Header, Content } = Layout;

const useStyles = makeStyles((theme) => ({
  content: {
    marginTop: 64,
  },
}));

const App: FC = () => {
  const history = useHistory();
  const classes = useStyles();

  const [isLoggedIn, setIsLogged] = useState(false);

  const handleAfterLogin = () => {
    history.push("/workspaces");
    setIsLogged((prevData: any) => true);
  };
  const handleAfterRegister = () => {
    history.push("/login");
  };
  const handleAfterLogout = () => {
    localStorage.clear();
    setIsLogged((prevData: any) => false);
  };
  useEffect(() => {}, [isLoggedIn]);

  return (
    <Layout className="mainLayout">
      <Header className="default-header">
        <AppHeader onLogout={handleAfterLogout} />
      </Header>
      <Content className={classes.content} style={{ fontFamily: "Quicksand" }}>
        <Switch>
          {/* <Route exact path="/" component={AppHome}/> */}
          <Route exact path="/" component={AppLandingPage} />
          <Route exact path="/questions" component={PrototypeForm} />

          <Route
            exact
            path="/authentication/:tabId"
            component={(props: any) => <SignInOutContainer {...props} />}
          />
          <Route
            exact
            path="/login"
            component={(props: any) => (
              <Login {...props} onLogin={handleAfterLogin} />
            )}
          />
          <Route
            exact
            path="/register"
            component={(props: any) => (
              <Register {...props} onRegister={handleAfterRegister} />
            )}
          />
          <Route
            exact
            path="/verify/:verifyStr"
            component={({ match }: any) => (
              <VerifyEmail verifyStr={match.params.verifyStr} />
            )}
          />
          <Route exact path="/graph" component={Plots} />
          <Route exact path="/workspaces" component={() => <Workspaces />} />
          <Route
            exact
            path="/files/:workspacesId"
            component={({ match }: any) => (
              <WorkspaceAppFiles id={match.params.workspacesId} />
            )}
          />

          {/* <Route exact path="/graph" component={Plots} />

          <Route
            exact
            path="/authentication/:tabId"
            component={(props: any) => <SignInOutContainer {...props} />}
          />
          <Route
            exact
            path="/login"
            component={(props: any) => (
              <Login {...props} onLogin={handleAfterLogin} />
            )}
          />
          <Route
            exact
            path="/register"
            component={(props: any) => (
              <Register {...props} onRegister={handleAfterRegister} />
            )}
          />
          <Route exact path="/graph" component={Plots} />
          <Route exact path="/workspaces" component={() => <Workspaces />} />
          <Route
            exact
            path="/files/:workspacesId"
            component={({ match }: any) => (
              <WorkspaceAppFiles id={match.params.workspacesId} />
            )}
          />

          {/* <Route exact path="/graph" component={Plots} />
          <Route exact path="/login" component={(props:any)=><Login {...props} onLogin={handleAfterLogin} />} />
          <Route exact path="/workspaces" component={()=><Workspaces url={requestsUrl.workspaceUrl}/>}/> */}

          {/* <Route exact path="/workspaces" component={()=><Workspaces  url={requestsUrl.workspaceUrl}/>}/> */}
          {/* <Route exact path="/workspaces" component={() => <CanvasChart />} /> */}
          {/* <Route exact path="/files/:workspacesId" component={({ match }: any) => <WorkspaceAppFiles id={match.params.workspacesId} url={requestsUrl.fcsfilesUrl} />} /> */}
          {/* <Route exact path="/analyse/:workspacesId/:fcsfileId" component={({ match }: any) => <Graph fcsfileId={match.params.fcsfileId} workspacesId={match.params.workspacesId} graphsUrl={requestsUrl.graphsUrl} gatesUrl={requestsUrl.gatesUrl} paramsUrl={requestsUrl.paramsUrl} eventsurl={requestsUrl.eventsUrl} />} /> */}
        </Switch>
        {/* <AppHome/> */}
      </Content>
      {/* <Footer>
                <AppFooter/>  
            </Footer>       */}
    </Layout>
  );
};

export default App;
