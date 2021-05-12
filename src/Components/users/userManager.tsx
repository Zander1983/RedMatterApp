//@ts-ignore
import store from "redux/store";

class UserManager {
  state: any = {};
  constructor() {
    console.log(store);
  }

  isLoggedIn(): boolean {
    this.state = store.getState();
    const ret = Object.keys(this.state.user.profile).length !== 0;
    console.log("keys = ", Object.keys(this.state.user.profile));
    console.log("state = ", this.state.user.profile);
    console.log("ret = ", ret);
    if (ret) console.log("User is logged in!");
    else console.log("User is not logged in");
    return ret;
  }

  logout() {
    store.dispatch({
      type: "LOGOUT",
    });
  }
}

export default new UserManager();
