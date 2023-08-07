import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch, useHistory } from "react-router-dom";
import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { SnackbarContainer } from "uno-material-ui";
import { Layout } from "antd";

import AppHeader from "./Components/common/Header";
import AppLandingPage from "./Components/home/LandingPage";

import About from "./Components/home/About";

import GraphWorkspaceComponent from "./graph/GraphWorkspaceComponent";

import Terms from "Components/home/Terms";
import HowToUse from "Components/home/HowToUse";
import Integrate from "Components/home/Integrate";

import Credits from "Components/home/Credits";
import BrowseExperiments from "Components/home/BrowseExperiments";
import WhyRedMatter from "Components/home/whyRedMatter";

import { useSelector } from "react-redux";

import axios from "axios";

import CircularProgress from "@material-ui/core/CircularProgress";

const { Content } = Layout;

const useStyles = makeStyles((theme) => ({
  content: {
    paddingBottom: 240,
    flex: "1 0 auto",
  },
  footer: {
    flexShrink: 0,
  },
  mainLayout: {
    overflow: "hidden",
    width: "100%",
    padding: 0,
    height: "auto",
    lineHeight: 1.6,
  },
  loaderClass: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: "1 0 auto",
    paddingBottom: 225,
  },
}));

const router = [
  // {
  //   path: "/questions/:workspaceID",
  //   component: ({ match }: any) => {
  //     //@ts-ignore
  //     return <PrototypeForm workspaceID={match.params.workspaceID} />;
  //   },
  // },

  {
    path: "/browse-experiments",
    component: BrowseExperiments,
  },

  {
    path: "/why-red-matter",
    component: WhyRedMatter,
  },

  {
    path: "/graph-workspace",
    component: ({ match }: any) => (
      <GraphWorkspaceComponent
        experimentId={match.params.experimentId}
        shared={false}
      />
    ),
  },

  {
    path: "/graph-workspace/:experimentId/plots/public",
    component: ({ match }: any) => (
      <GraphWorkspaceComponent
        experimentId={match.params.experimentId}
        shared={true}
      />
    ),
  },
  { path: "/terms", component: Terms },
  { path: "/howtouse", component: HowToUse },
  { path: "/integrate", component: Integrate },
  {
    path: "/mailing-list",
    component: About,
  },
  {
    path: "/credits",
    component: Credits,
  },
].filter((e) => {
  if (process.env.REACT_APP_NO_WORKSPACES === "true") {
    return e.path.indexOf("experiment") === -1;
  }
  return true;
});

const theme = createMuiTheme();
let sessionCheckStarted = false;

const App = () => {
  const history = useHistory();

  const classes = useStyles();
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    setLoading(false);
    // if (userManager.isLoggedIn() && userManager.getToken()) {
    //   userManager.logout();
    //   sessionCheckStarted = false;
    //   history.replace("/login");
    //   setLoading(false);
    //   // axios.get("/api/getuserdetails", {
    //   //     headers: {
    //   //       token: userManager.getAccessToken(),
    //   //     },
    //   //   })
    //   //   .then((response) => {
    //   //     let userDetails = response.data;
    //   //
    //   //     dispatch({
    //   //       type: "UPDATE_SUBSCRIPTION_DETAILS",
    //   //       payload: {
    //   //         rules: userDetails?.rules,
    //   //         subscriptionDetails: userDetails?.userDetails?.subscriptionDetails,
    //   //         subscriptionType: userDetails?.userDetails?.subscriptionType,
    //   //       },
    //   //     });
    //   //     setLoading(false);
    //   //   })
    //   //   .catch((e) => {
    //   //     setLoading(false);
    //   //   });
    // } else {
    //   setLoading(false);
    // }
  }, []);

  return (
    <Layout className="mainLayout" style={{ minHeight: "100%" }}>
      <ThemeProvider theme={theme}>
        <SnackbarContainer />

        <AppHeader />

        {loading ? (
          <div className={classes.loaderClass}>
            <CircularProgress />
          </div>
        ) : (
          <Content
            className={classes.content}
            style={{ fontFamily: "Quicksand" }}
          >
            <Switch>
              <Route key={1001} exact path="/" component={AppLandingPage} />
            </Switch>
            {/* 
            // @ts-ignore */}

            <Switch>
              {router.map((e, number) => (
                // @ts-ignore
                <Route
                  key={number}
                  exact
                  path={e.path}
                  component={e.component}
                />
              ))}
            </Switch>
          </Content>
        )}
      </ThemeProvider>
    </Layout>
  );
};

export default App;
