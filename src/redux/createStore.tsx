import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import reducers from "./reducers";
import graphReducers from "graph/redux/actions";

const rootReducer = combineReducers({
  user: reducers,
  workspace: graphReducers,
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
