import { store } from "redux/store";
import { snackbarService } from "uno-material-ui";

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
  facility: Facility;
};

export type Facility = {
  _id: string;
  location: string;
  name: string;
  ownerId: string[];
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
      this.fail();
    }
    return this.state.user.profile.token;
  }

  getRefreshToken() {
    if (!this.isLoggedIn()) {
      this.fail();
    }
    return this.state.user.profile.refreshToken;
  }

  getOrganiztionID() {
    if (!this.isLoggedIn()) {
      this.fail();
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
      this.fail();
    }
    return this.state.user.profile.subscriptionDetails;
  }

  getSubscriptionType() {
    if (!this.isLoggedIn()) {
      this.fail();
    }
    return this.state.user.profile.subscriptionType;
  }

  getUserAdminStatus() {
    if (!this.isLoggedIn()) {
      this.fail();
    }
    return this.state.user.profile.isAdmin;
  }

  getUserFacility() {
    if (!this.isLoggedIn()) {
      this.fail();
    }
    return this.state.user.profile.facility;
  }

  getUserEmail() {
    if (!this.isLoggedIn()) {
      this.fail();
    }
    return this.state.user.profile.email;
  }
  canAccessExperiment(id: string) {
    return true;
  }

  fail() {
    snackbarService.showSnackbar(
      "Session token expired, please login again",
      "warning"
    );
    this.logout();
    setTimeout(() => {
      window.location.href = "/login";
    }, 0);
  }
}

export default new UserManager();
