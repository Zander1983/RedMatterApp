import FCSFile from "graph/old/dataManagement/fcsFile";

export default class ReconstructorFactory {
  makeFile(source: string, metadata: any) {
    if (source.startsWith("http")) {
      /* handle if s3 or old db */
    }
    if (source === "local") {
      return this.makeFileFromLocalFile(metadata);
    }
  }

  private makeFileFromS3URL() {}

  private makeFileFromOldDatabaseURL() {}

  private makeFileFromLocalFile(metadata: any) {}
}
