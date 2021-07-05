import fcsModel from "./fcsTransformer/fcsModel";
import LogicleAPI from "./logicle-js/logicleApi";
import MarkLogicle from "./logicleMark";

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

  logicleJsTransformer(data: number[]) {
    return new LogicleAPI().logicleTransform(
      data,
      this.logicleT,
      this.logicleW,
      this.logicleM,
      this.logicleA
    );
  }

  logicleMarkTransformer(
    data: number[],
    rangeBegin?: number,
    rangeEnd?: number
  ): number[] {
    const logicle = new MarkLogicle(rangeBegin, rangeEnd);
    return data.map((e) => logicle.scale(e));
  }
}

export default FCSServices;
