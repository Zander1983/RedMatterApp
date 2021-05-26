import { Route, Switch } from "react-router-dom";
import { Layout } from "antd";

import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { SnackbarContainer } from "uno-material-ui";

import AppHeader from "./Components/common/header";
import Workspaces from "./Components/workspaces/workspaces";
import AppLandingPage from "./Components/home/LandingPage";
import Workspace from "./Components/workspaces/Workspace";
import PrototypeForm from "./Components/home/PrototypeForm";
import About from "./Components/home/About";

import Plots from "./graph/components/Plots";
import Login from "./Components/users/Login";
import Register from "./Components/users/Register";
import VerifyEmail from "./Components/users/VerifyEmail";
import SignInOutContainer from "./Components/users/signInOutContainer";
import Terms from "Components/home/Terms";
import Credits from "Components/home/Credits";
import Footer from "Components/common/Footer";
import Jobs from "Components/home/Jobs";

const { Content } = Layout;

const useStyles = makeStyles((theme) => ({
  content: {
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
    path: "/questions/:workspaceID",
    component: ({ match }: any) => {
      return <PrototypeForm workspaceID={match.params.workspaceID} />;
    },
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
    path: "/verify",
    component: VerifyEmail,
  },
  {
    path: "/verify/:verifyStr",
    component: VerifyEmail,
  },
  { path: "/test-red-matter", component: Plots },
  {
    path: "/workspace/:workspaceID/plots",
    component: ({ match }: any) => (
      <Plots workspaceID={match.params.workspaceID} />
    ),
  },
  { path: "/workspaces", component: Workspaces },
  { path: "/terms", component: Terms },
  {
    path: "/workspace/:workspaceID",
    component: ({ match }: any) => <Workspace id={match.params.workspaceID} />,
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
];

const theme = createMuiTheme();

const App = () => {
  const classes = useStyles();

  return (
    <Layout className="mainLayout" style={{ minHeight: "100%" }}>
      <ThemeProvider theme={theme}>
        <SnackbarContainer />
        <AppHeader />
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
