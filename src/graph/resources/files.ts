import { createID } from "graph/utils/id";
import { EventsRequestResponse, File, FileID } from "./types";

export const createFile = ({
  cloneFile,
  id,
  requestData,
}: {
  cloneFile?: File;
  id?: FileID;
  requestData?: EventsRequestResponse;
}): File => {
  let newFile: File = {
    id: "",
    name: "",
    src: "remote",
    axes: [],
    label: "",
    plotTypes: [],
    downloaded: false,
    eventCount: 0,
    fileSize: 0,
    experimentId: "",
    createdOn: new Date(),
  };
  if (requestData) {
    newFile.axes = requestData.channels.map((e) => e.value);
    newFile.plotTypes = requestData.channels.map((e) => e.display);
    newFile.id = requestData.id;
    newFile.name = newFile.label = requestData.title;
  } else if (cloneFile) {
    newFile = cloneFile;
  } else {
    throw Error("Impossible to construct file from parameters");
  }
  if (id) newFile.id = id;
  else newFile.id = createID();
  return newFile;
};
