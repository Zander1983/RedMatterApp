import { createID } from "graph/utils/id";
import { createDataset } from "./dataset";
import { EventsRequestResponse, File, FileID } from "./types";
import { store } from "redux/store";

export const commitFileChange = async (file: File) => {
  store.dispatch({
    type: "workspace.UPDATE_FILE",
    payload: { file: file },
  });
};

export const createFile = async ({
  cloneFile,
  id,
  requestData,
}: {
  cloneFile?: File;
  id?: FileID;
  requestData?: EventsRequestResponse;
}): Promise<File> => {
  let newFile: File = {
    id: "",
    name: "",
    src: "remote",
    axes: [],
    label: "",
    defaultAxisPlotTypes: {},
    defaultRanges: {},
    downloaded: false,
    eventCount: 0,
    fileSize: 0,
    experimentId: "",
    createdOn: new Date(),
    downloading: false,
    labels: [],
    view: false,
  };
  const createdID = createID();
  if (requestData) {
    requestData.channels.forEach((e) => {
      newFile.axes.push(e.value);
      newFile.labels.push(e.label);
      newFile.defaultRanges[e.value + "-lin"] = [
        e.linearMinimum,
        e.linearMaximum,
      ];
      newFile.defaultRanges[e.value + "-bi"] = [
        e.biexponentialMinimum,
        e.biexponentialMaximum,
      ];
      newFile.defaultAxisPlotTypes[e.value] = e.display;
    });
    newFile.id = requestData.id;
    newFile.name = newFile.label = requestData.title;
    await createDataset(requestData.events, newFile);
  } else if (cloneFile) {
    newFile = { ...cloneFile };
  } else {
    throw Error("Impossible to construct file from parameters");
  }

  if (id) newFile.id = id;
  else newFile.id = createdID;
  return newFile;
};
