import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import reducers from "./reducers";
import graphReducers from "graph/workspaceRedux/graphReduxActions";
import eventQueueReducers from "graph/workspaceRedux/eventQueueReduxActions";

const rootReducer = combineReducers({
  user: reducers,
  workspace: graphReducers,
  workspaceEventQueue: eventQueueReducers,
});

const persistConfig = {
  key: "root",
  storage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

const composeEnhancers =
  //@ts-ignore
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true }) || compose;

const configureStore = () => {
  return createStore(
    persistedReducer,
    composeEnhancers(applyMiddleware(thunk))
  );
};

export default configureStore;
