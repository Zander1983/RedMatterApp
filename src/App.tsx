import {useEffect, useMemo, useState} from "react";
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
import Experiments from "./Components/workspaces/Experiments";
import AppLandingPage from "./Components/home/LandingPage";
import Experiment from "./Components/workspaces/Experiment";
import About from "./Components/home/About";

import Plots from "./graph/WorkspaceComponent";
import Login from "./Components/users/Login";
import Register from "./Components/users/Register";
import ForgetPassword from "Components/users/ForgetPassword";
import ResetPassword from "Components/users/ResetPassword";
import VerifyEmail from "./Components/users/VerifyEmail";
import Invite from "Components/users/Invite";
import InviteExisting from "Components/users/InviteExisting";
import SignInOutContainer from "./Components/users/signInOutContainer";
import Terms from "Components/home/Terms";
import PremiumCheckout from "./Components/plans/PremiumCheckout";
import Cancel from "./Components/plans/Cancel";
import Success from "./Components/plans/Success";
import UserProfileCompo from "./Components/plans/UserProfile";
import Credits from "Components/home/Credits";
import BrowseExperiments from "Components/home/BrowseExperiments";

import Jobs from "Components/home/Jobs";
import ChatBox from "./Components/common/ChatBox/ChatBox";
import { useSelector} from "react-redux";
import PlansPage from "Components/home/PlansPage";
import axios from "axios";
import userManager, { UserProfile } from "Components/users/userManager";
import CircularProgress from "@material-ui/core/CircularProgress";
import ErrorBoundaryMain from "Components/errors/errorBoundaryMain";
import { updateUserStripeDetails } from "services/StripeService";

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
    path: "/resetpassword/:verifyString",
    component: ResetPassword,
  },
  {
    path: "/invite/:id",
    component: Invite,
  },
  {
    path: "/inviteExisting/:id",
    component: InviteExisting,
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
    component: UserProfileCompo,
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
let sessionCheckStarted = false;

const App = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const profile: UserProfile = useSelector((state: any) => state.user.profile);

  useEffect(() => {
     const updateProfileSub = (dispatch: any) => {
       if (
           profile &&
           Object.keys(profile).length > 0 &&
           userManager.isLoggedIn()
       ) {
         let subscriptionDetails = userManager.getSubscriptionDetails();
         if (
             userManager.isLoggedIn() &&
             subscriptionDetails &&
             subscriptionDetails.currentCycleEnd &&
             userManager.getSubscriptionType()
         ) {
           let date = new Date(subscriptionDetails.currentCycleEnd * 1000);
           let subEndTime = date.getTime();
           let currentTime = new Date().getTime();
           if (currentTime >= subEndTime) {
             axios
                 .post(
                     "/api/updateProfileSubcription",
                     {
                       subscriptionType: "",
                     },
                     {
                       headers: {
                         token: userManager.getToken(),
                       },
                     }
                 )
                 .then(async (response) => {
                   await updateUserStripeDetails(dispatch);
                   sessionCheckStarted = false;
                 })
                 .catch((e) => {});
           }
         }
       }
     };
     updateProfileSub(dispatch);
  }, [profile, dispatch]);

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
  }, [dispatch]);


  useEffect(() => {
    dispatch({type: "RESET"});
    axios.interceptors.response.use(
        function (response) {
          return response;
        },
        function (error) {
          if (419 === error.response.status) {
            if (!sessionCheckStarted) {
              sessionCheckStarted = true;
              axios
                  .get("/api/authVerify", {
                    headers: {
                      refreshToken: userManager.getRefreshToken(),
                    },
                  })
                  .then(async (response) => {
                    let data = response.data;
                    dispatch({
                      type: "UPDATE_TOKENS",
                      payload: {
                        token: data.token,
                        refreshToken: data.refreshToken,
                      },
                    });
                    await updateUserStripeDetails(dispatch);
                    sessionCheckStarted = false;
                    window.location.reload();
                  })
                  .catch((e) => {});
            }
          } else if (401 === error.response.status) {
            userManager.logout();
            sessionCheckStarted = false;
            history.replace("/login");
          } else {
            return Promise.reject(error);
          }
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
            <CircularProgress/>
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
