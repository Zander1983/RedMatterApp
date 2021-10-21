import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";

import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { SnackbarContainer } from "uno-material-ui";
import { Layout } from "antd";

import AppHeader from "./Components/common/Header";
import Experiments from "./Components/workspaces/Experiments";
import AppLandingPage from "./Components/home/LandingPage";
import Experiment from "./Components/workspaces/Experiment";
import About from "./Components/home/About";

import Plots from "./graph/WorkspaceComponent";
import Login from "./Components/users/Login";
import Register from "./Components/users/Register";
import ForgetPassword from "Components/users/ForgetPassword";
import VerifyEmail from "./Components/users/VerifyEmail";
import SignInOutContainer from "./Components/users/signInOutContainer";
import Terms from "Components/home/Terms";
import PremiumCheckout from "./Components/plans/PremiumCheckout";
import Cancel from "./Components/plans/Cancel";
import Success from "./Components/plans/Success";
import UserProfile from "./Components/plans/UserProfile";
import Credits from "Components/home/Credits";
import BrowseExperiments from "Components/home/BrowseExperiments";
import Footer from "Components/common/Footer";
import Jobs from "Components/home/Jobs";
import ChatBox from "./Components/common/ChatBox/ChatBox";

import PlansPage from "Components/home/PlansPage";
import axios from "axios";
import userManager from "Components/users/userManager";
import CircularProgress from "@material-ui/core/CircularProgress";
import ErrorBoundaryMain from "Components/errors/errorBoundaryMain";

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
    path: "/authentication/:tabId",
    component: SignInOutContainer,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/browse-experiments",
    component: BrowseExperiments,
  },
  {
    path: "/register",
    component: Register,
  },
  {
    path: "/forget-password",
    component: ForgetPassword,
  },

  {
    path: "/plans",
    component: PlansPage,
  },
  {
    path: "/verify",
    component: VerifyEmail,
  },
  {
    path: "/premium-checkout",
    component: PremiumCheckout,
  },
  {
    path: "/user-profile",
    component: UserProfile,
  },
  {
    path: "/cancel",
    component: Cancel,
  },
  {
    path: "/success/:session_id",
    component: ({ match }: any) => {
      //@ts-ignore
      return <Success session_id={match.params.session_id} />;
    },
  },
  {
    path: "/verify/:verifyStr",
    component: VerifyEmail,
  },
  {
    path:
      "/" +
      (process.env.REACT_APP_NO_WORKSPACES === "true"
        ? "analyse"
        : "test-red-matter"),
    component: Plots,
  },
  {
    path: "/experiment/:experimentId/plots",
    component: ({ match }: any) => (
      <Plots experimentId={match.params.experimentId} shared={false} />
    ),
  },
  {
    path: "/experiment/:experimentId/plots/public",
    component: ({ match }: any) => (
      <Plots experimentId={match.params.experimentId} shared={true} />
    ),
  },
  { path: "/experiments", component: Experiments },
  { path: "/terms", component: Terms },
  {
    path: "/experiment/:experimentId",
    component: ({ match }: any) => (
      <Experiment id={match.params.experimentId} poke={false} />
    ),
  },
  {
    path: "/experiment/:experimentId/poke",
    component: ({ match }: any) => (
      <Experiment id={match.params.experimentId} poke={true} />
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
  {
    path: "/jobs",
    component: Jobs,
  },
].filter((e) => {
  if (process.env.REACT_APP_NO_WORKSPACES === "true") {
    return e.path.indexOf("experiment") === -1;
  }
  return true;
});

const theme = createMuiTheme();

const App = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  useMemo(() => {
    setLoading(true);

    if (userManager.isLoggedIn() && userManager.getToken()) {
      axios
        .get("/api/getuserdetails", {
          headers: {
            token: userManager.getToken(),
          },
        })
        .then((response) => {
          let userDetails = response.data;
          dispatch({
            type: "UPDATE_SUBSCRIPTION_DETAILS",
            payload: {
              rules: userDetails?.rules,
              subscriptionDetails:
                userDetails?.userDetails?.subscriptionDetails,
              subscriptionType: userDetails?.userDetails?.subscriptionType,
            },
          });
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    dispatch({
      type: "RESET",
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout className="mainLayout" style={{ minHeight: "100%" }}>
      <ThemeProvider theme={theme}>
        <SnackbarContainer />
        <AppHeader />

        {loading ? (
          <div className={classes.loaderClass}>
            <CircularProgress></CircularProgress>
          </div>
        ) : (
          <Content
            className={classes.content}
            style={{ fontFamily: "Quicksand" }}
          >
            <Switch>
              <Route key={1001} exact path="/" component={AppLandingPage} />
            </Switch>
            <ErrorBoundaryMain mainScreen={false} appScreen={true}>
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
            </ErrorBoundaryMain>
          </Content>
        )}
        <ChatBox />
      </ThemeProvider>
    </Layout>
  );
};

export default App;
