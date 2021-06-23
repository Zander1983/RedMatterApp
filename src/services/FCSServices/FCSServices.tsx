import fcsModel from "./fcsTransformer/fcsModel";

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
}

export default FCSServices;
