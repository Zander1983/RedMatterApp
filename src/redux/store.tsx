import configureStore from "./createStore";

let store: any;

if (store === undefined) {
  store = configureStore();
}

export default store;
