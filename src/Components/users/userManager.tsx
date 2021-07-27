import { store } from "redux/store";

class UserManager {
  state: any = {};

  isLoggedIn(): boolean {
    this.state = store.getState();
    const ret = Object.keys(this.state.user).length !== 0;
    return ret;
  }

  logout() {
    store.dispatch({
      type: "LOGOUT",
    });
  }

  getToken() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get token of unlogged user");
    }
    return this.state.user.token;
  }

  getOrganiztionID() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get token of unlogged user");
    }
    return this.state.user.organisationId;
  }

  canAccessExperiment(id: string) {
    return true;
  }
}

export default new UserManager();
