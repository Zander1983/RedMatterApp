import { Workspace } from "graph/resources/types";
import { createID } from "./id";

export default class LinkReconstructor {
  static store(newWorkSpaceId: string): string {
    let currentHost = window.location.href;
    if (currentHost.includes("?")) {
      currentHost = currentHost.split("?")[0];
    }
    return `${currentHost}/public`;
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

  private static saveToCloud(workspaceJSON: string): string {
    return "";
    // const newURLID = createID().substr(0, 10);
    // firebase.saveToCloud("linkshortening", {
    //   workspaceJSON: workspaceJSON,
    //   workspaceID: newURLID,
    // });
    // return newURLID;
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
