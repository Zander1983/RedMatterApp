import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import reducers from "./reducers";
import graphReducers from "graph/workspaceRedux/graphReduxActions";
import eventQueueReducers from "graph/workspaceRedux/eventQueueReduxActions";
import workspaceReducers from "graph/workspaceRedux2/workspaceActions";
import eventQueue2Reducers from "graph/workspaceRedux2/eventQueue2Actions";

const rootReducer = combineReducers({
  user: reducers,
  workspace: graphReducers,
  workspaceEventQueue: eventQueueReducers,
  workspace2: workspaceReducers,
  workspace2EventQueue: eventQueue2Reducers,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // only applies persistence to this guy
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
