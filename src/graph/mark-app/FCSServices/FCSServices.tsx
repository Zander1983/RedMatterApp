import fcsModel from "./fcsTransformer/fcsModel";
import LogicleAPI from "./logicle-js/logicleApi";
import MarkLogicle from "../logicleMark";
import { parseAndUpload } from "./fcsTransformer/node-handler";

class FCSServices {
  loadFileMetadata(file: Buffer) {
    console.log(">>> starting parse of buffer, buffer is ", file);
    return fcsModel
      .getFCS({
        file: file,
        eventsToRead: -1,
        skip: 100,
      })
      .then(function (parsedFcsFile) {
        console.log("parsedFcsFile is.....", parsedFcsFile);

        //let fileEvents = parseAndUpload({}, fcsFile, 123456, 987654, false);

        // channels: channels,
        // jsonEventCount: fileData.length,
        // events: fileData,
        // scale: scale,
        // paramNamesHasSpillover: paramNamesHasSpillover,
        let fileData = {
          channels: parsedFcsFile.channels,
          events: parsedFcsFile.events,
          scale: parsedFcsFile.scale,
          paramNamesHasSpillover: parsedFcsFile.paramNamesHasSpillover,
          origEvents: parsedFcsFile.origEvents,
          channelMaximums: parsedFcsFile.channelMaximums,
        };

        return fileData;
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
    data: number[] | Float32Array,
    rangeBegin?: number,
    rangeEnd?: number
  ): Float32Array {
    const logicle = new MarkLogicle(rangeBegin, rangeEnd);
    return new Float32Array(data.map((e: any) => logicle.scale(e)));
  }

  logicleInverseMarkTransformer(
    data: number[],
    rangeBegin?: number,
    rangeEnd?: number
  ): number[] {
    const logicle = new MarkLogicle(rangeBegin, rangeEnd);
    return data.map((e) => logicle.inverse(e));
  }
}

export default FCSServices;
