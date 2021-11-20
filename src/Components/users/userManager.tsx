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
export type UserProfile = {
  subscriptionType: string;
  token: string;
  refreshToken: string;
  organisationId: string;
  rules: Rules;
  subscriptionDetails: SubscriptionDetail;
  isAdmin: Boolean;
  email: string;
};

type SubscriptionDetail = {
  everSubscribed: boolean;
  canceled: boolean;
  product: string;
  currentCycleEnd: number;
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

  getRefreshToken() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get token of unlogged user");
    }
    return this.state.user.profile.refreshToken;
  }

  getOrganiztionID() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get token of unlogged user");
    }
    return this.state.user.profile.organisationId;
  }

  getRules() {
    if (!this.isLoggedIn()) {
      return {};
    }
    return this.state.user.profile.rules;
  }

  getSubscriptionDetails() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get token of unlogged user");
    }
    return this.state.user.profile.subscriptionDetails;
  }

  getSubscriptionType() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get token of unlogged user");
    }
    return this.state.user.profile.subscriptionType;
  }

  getUserAdminStatus() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get admin status of unlogged user");
    }
    return this.state.user.profile.isAdmin;
  }

  getUserEmail() {
    if (!this.isLoggedIn()) {
      throw Error("Can't get Email of unlogged user");
    }
    return this.state.user.profile.email;
  }

  canAccessExperiment(id: string) {
    return true;
  }
}

export default new UserManager();
