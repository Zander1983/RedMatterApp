import configureStore from "./createStore";
import { persistStore } from "redux-persist";

export let store: any;

if (store === undefined) {
  store = configureStore();
}

export const persistor = persistStore(store);
