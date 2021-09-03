import { createID } from "graph/utils/id";
import { EventsRequestResponse, File, FileID } from "./types";

export const createFile = (
  cloneFile?: File,
  params?: {
    id?: FileID;
    requestData?: EventsRequestResponse;
  }
): File => {
  let newFile: File = {
    id: "",
    name: "",
    src: "remote",
    axes: [],
    label: "",
    plotTypes: [],
  };
  if (params?.requestData) {
    newFile.axes = params.requestData.channels.map((e) => e.value);
    newFile.plotTypes = params.requestData.channels.map((e) => e.display);
    newFile.id = params.requestData.id;
    newFile.name = newFile.label = params.requestData.title;
  } else if (cloneFile) {
    newFile = cloneFile;
  } else {
    throw Error("Impossible to construct file from parameters");
  }
  if (params?.id) newFile.id = params.id;
  else newFile.id = createID();
  return newFile;
};
