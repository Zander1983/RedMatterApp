import { store } from "redux/store";

type Experiment = {
  number: "unlimited";
  delete: true;
  unlimitedPrivate: true;
  unLimitedPublic: true;
};
type Rules = {
  experiment: Experiment;
  createOrganizations: true;
  customerSupport: true;
};
type UserProfile = {
  subscriptionType: string;
  token: string;
  organisationId: string;
  rules: Rules;
};
type UserState = {
  profile: UserProfile;
};

type User = {
  user: UserState;
};

class UserManager {
  state: User;
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

  getOrganiztionID() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get token of unlogged user");
    }
    return this.state.user.profile.organisationId;
  }

  getRules() {
    return this.state.user.profile.rules;
  }

  getSubscriptionType() {
    return this.state.user.profile.subscriptionType;
  }

  canAccessExperiment(id: string) {
    return true;
  }
}

export default new UserManager();
