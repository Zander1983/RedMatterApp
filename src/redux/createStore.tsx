import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import userReducers from "./reducers/userReducers";
import experimentReducers from "./reducers/experimentReducers";
import graphReducers from "graph/redux/reducers";

const rootReducer = combineReducers({
  user: userReducers,
  workspace: graphReducers,
  experiment: experimentReducers,
});

const persistConfig = {
  key: "root",
  storage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

//@ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = () => {
  return createStore(
    persistedReducer,
    composeEnhancers(applyMiddleware(thunk))
  );
};

export default configureStore;
