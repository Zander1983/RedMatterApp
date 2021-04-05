import FCSFile from "graph/dataManagement/fcsFile";

export default abstract class Reconstructor {
  metadata: any;

  abstract setMetadata(): void;

  // getFile(): FCSFile {}

  private checkValidity(file: FCSFile): boolean {
    return true;
  }
}
