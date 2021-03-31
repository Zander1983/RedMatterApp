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

// Redux config
import { createStore } from "redux";
import { Provider } from "react-redux";
import reducers from "./Components/graph/store/reducers";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
console.log("process.env.REACT_APP_API_URL>>", process.env.REACT_APP_API_URL);

// Redux config
const store = createStore(
  reducers,
  //@ts-ignore
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
