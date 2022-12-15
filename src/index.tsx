import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import "typeface-roboto";
import "typeface-raleway";
import "typeface-quicksand";
import axios from "axios";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ErrorBoundaryMain from "Components/errors/errorBoundaryMain";
//@ts-ignore
import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { store, persistor } from "redux/store";
import { Route, Switch } from "react-router-dom";
import ErrorComponent from "Components/errors/errorComponent";
import Footer from "Components/common/Footer";
import AppLandingPage from "./Components/home/LandingPage";
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
console.log("API URL = ", process.env.REACT_APP_API_URL);

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Switch>
          <Route key={1000} exact path="/error" component={ErrorComponent} />
        </Switch>
        <ErrorBoundaryMain mainScreen={true} appScreen={false}>
          <App />
        </ErrorBoundaryMain>
      </PersistGate>
    </Provider>
  </BrowserRouter>,
  document.getElementById("root")
);

reportWebVitals();
