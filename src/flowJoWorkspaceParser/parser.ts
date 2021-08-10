import {
  getContructor,
  RMConstructor,
  RMWorkspace_Interface,
} from "./rmConstructor";
export type WorkspaceParseError = {
  type: string;
  level: "FATAL" | "NON-FATAL";
};

export default class FlowJoWorkspaceParser {
  rmContructor: RMConstructor;
  file: File;
  errors: WorkspaceParseError[] = [];

  constructor(file: File, version: string = "2.1") {
    this.rmContructor = getContructor(version);
    this.file = file;
  }

  parse(): {
    workspace: RMWorkspace_Interface | null;
    errors: WorkspaceParseError[];
  } {
    this.loadFile();
    this.validateFile();
    if (this.verifyFatalError()) return this.getErrors();

    return this.getRedMatterWorkspace();
  }

  private loadFile() {}

  private validateFile() {}

  private verifyFatalError(): boolean {
    return this.errors.map((e) => e.level === "FATAL").every((e) => !e);
  }

  private getErrors(): {
    workspace: RMWorkspace_Interface | null;
    errors: WorkspaceParseError[];
  } {
    return {
      workspace: null,
      errors: this.errors,
    };
  }

  private getRedMatterWorkspace(): {
    workspace: RMWorkspace_Interface | null;
    errors: WorkspaceParseError[];
  } {
    return {
      workspace: null,
      errors: this.errors,
    };
  }
}
