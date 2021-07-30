import dataManager from "../dataManager";
import WorkspaceData from "../workspaceData";

export default class LinkReconstructor {
  store(workspace: WorkspaceData, newWorkSpaceId: string): string {
    if (workspace === null || workspace === undefined) return "";
    let currentHost = window.location.href;
    if (currentHost.includes("?")) {
      currentHost = currentHost.split("?")[0];
    }
    currentHost += "?id=";
    return currentHost + newWorkSpaceId;
  }

  retrieve(callback: (workspaceJSON: string) => void) {
    if (!this.canBuildWorkspace()) return;
    const workspaceID = this.getWorkspaceID();
    this.retrieveFromCloud(workspaceID, callback);
  }

  canBuildWorkspace() {
    const queryParams = this.getQueryParams();
    if (
      queryParams === null ||
      queryParams === undefined ||
      queryParams["id"] === null ||
      queryParams["id"] === undefined
    ) {
      return false;
    }
    return true;
  }

  private getWorkspaceID() {
    const queryParams = this.getQueryParams();
    return queryParams["id"];
  }

  private getQueryParams() {
    let queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const keys = Array.from(urlParams.keys());
    const values = Array.from(urlParams.values());
    let dict: any = {};
    keys.forEach((e, i) => {
      dict[e] = values[i];
    });
    return dict;
  }

  private saveToCloud(workspaceJSON: string): string {
    const newURLID = dataManager.createID().substr(0, 10);
    // firebase.saveToCloud("linkshortening", {
    //   workspaceJSON: workspaceJSON,
    //   workspaceID: newURLID,
    // });
    return newURLID;
  }

  private retrieveFromCloud(
    token: string,
    callback: (workspaceJSON: string) => void
  ) {
    // firebase.retrieveFromCloud(
    //   "linkshortening",
    //   "workspaceID",
    //   token,
    //   (collection: any) => {
    //     callback(collection.workspaceJSON);
    //   }
    // );
  }
}
