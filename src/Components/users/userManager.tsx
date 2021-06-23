import { store } from "redux/store";

class UserManager {
  state: any = {};
  constructor() {}

  isLoggedIn(): boolean {
    this.state = store.getState();
    const ret = Object.keys(this.state.user.profile).length !== 0;
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
    return this.state.user.profile.token;
  }

  getUid() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get uid of unlogged user");
    }
    return this.state.user.profile.userDetails.userUid;
  }

  getOrganiztionID() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get token of unlogged user");
    }
    return this.state.user.profile.userDetails.organisationId;
  }

  canAccessExperiment(id: string) {
    return true;
  }
}

export default new UserManager();
