import WorkspaceData from "../workspaceData";

export default abstract class Reconstructor {
  abstract store(metadata: any): any;
  abstract retrieve(metadata: any): WorkspaceData;
}
