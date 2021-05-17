import configureStore from "./createStore";
import { persistStore, persistReducer } from "redux-persist";

export let store: any;

if (store === undefined) {
  store = configureStore();
}

export const persistor = persistStore(store);
