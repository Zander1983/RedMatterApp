/*
  Should instance every plot with it's correspodent data, should also be able
  to load and save workspaces to json, somehow.
*/

export default class WorkspaceData {
  setupWorkspace() {}

  export(): string {
    return JSON.stringify({
      fuck: "this",
    });
  }
  import(workspaceJSON: string) {
    const workspace = JSON.parse(workspaceJSON);
    /* ... */
  }
}
