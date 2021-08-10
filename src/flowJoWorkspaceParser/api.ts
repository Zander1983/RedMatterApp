// import uuidv4 from "uuid/v4";
import FlowJoWorkspaceParser, { WorkspaceParseError } from "./parser";
import { RMWorkspace_Interface } from "./rmConstructor";

export const parseWorkspace = (
  workpsaceFile: File
): { workspace: RMWorkspace_Interface; errors: WorkspaceParseError[] } => {
  return new FlowJoWorkspaceParser(workpsaceFile, "2.1").parse();
};

// /**
//  * Adds a new workspace to be parsed to the job queue. Returns the ID of this
//  * new workspace.
//  * @param  {File} workspace - FlowJo Workspace .xml file
//  * @return {{ id: string }} Workspace parse job id
//  * @return  {Exception} if not valid file, not valid file exception
//  */
// export const addWorkspaceParseJobToQueue = (workspace) => {
//   const newId = uuidv4();
//   // add to queue
//   // add to mongo
//   return { id: newId };
// };

// /**
//  * Returns the status of a workspace
//  * @param  {string} id - Workspace parse job id
//  * @return  {{ status: string }} Job status
//  * @return  {Exception} if id not found, not found exception
//  */
// export const getWorkspaceParseJobStatus = (id) => {
//   // find_job(id)
//   // get job status
//   // return { status: job status }
// };

// /**
//  * Returns the JSON of a parsed workspace
//  * @param  {string} id - Workspace parse job id
//  * @return  {Workspace} if job status == "FINISHED", rm workspace json
//  * @return  {Exception} if job status != "FINISHED", job running exception
//  * @return  {Exception} if id not found, not found exception
//  */
// export const getNewWorkspace = (id) => {
//   // find_workspace(id)
//   // return JSON.stringify(workspace)
// };
