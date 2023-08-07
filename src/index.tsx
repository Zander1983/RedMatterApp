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

import Footer from "Components/common/Footer";
import AppLandingPage from "./Components/home/LandingPage";
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
console.log("API URL = ", process.env.REACT_APP_API_URL);

ReactDOM.render(
  <BrowserRouter>
    <App />

    <Footer />
  </BrowserRouter>,
  document.getElementById("root")
);

reportWebVitals();
