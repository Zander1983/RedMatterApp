import fcsModel from "./fcsTransformer/fcsModel";
import logicleTransformer from "./logicleTransformer.js";
import api from "./logicle-js/exports";

class FCSServices {
  loadFileMetadata(file: Buffer) {
    return fcsModel
      .getFCS({
        file: file,
        eventsToRead: 1,
      })
      .then(function (fcsFile) {
        const channelsHeaders = Object.entries(fcsFile.text)
          .filter((e) => {
            const header = e[0];
            return header.match(/\$P[0-9]*N/gm) !== null;
          })
          .map((e) => e[1]);
        delete fcsFile.dataAsNumbers;
        delete fcsFile.dataAsStrings;
        delete fcsFile.databufReadFn2;
        delete fcsFile.bytesRead;
        delete fcsFile.analysis;
        return {
          ...fcsFile,
          channels: channelsHeaders,
        };
      })
      .catch(function (err) {
        throw err;
      });
  }

  logicleT = 262144;
  logicleM = 4.5;
  logicleW = 0;
  logicleA = 0;

  logicleMetadataSetter(params: {
    T: number;
    M: number;
    W: number;
    A: number;
  }) {
    const { T, M, W, A } = params;
    this.logicleT = T;
    this.logicleM = M;
    this.logicleW = W;
    this.logicleA = A;
  }

  logicleTransformer(data: number[]) {
    return api.LogicleTransform(
      data,
      this.logicleT,
      this.logicleM,
      this.logicleW,
      this.logicleA
    );
  }
}

export default FCSServices;
