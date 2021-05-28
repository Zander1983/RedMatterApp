import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Button, Divider } from "@material-ui/core";
import BackupIcon from "@material-ui/icons/Backup";

import dataManager from "graph/dataManagement/dataManager";
import FCSFile from "graph/dataManagement/fcsFile";

import axios from "axios";

import PlotData from "graph/dataManagement/plotData";
import staticFileReader from "./staticFCSFiles/staticFileReader";
import { WorkspaceFilesApiFetchParamCreator } from "api_calls/nodejsback";
import userManager from "Components/users/userManager";

const useStyles = makeStyles((theme) => ({
  fileSelectModal: {
    backgroundColor: "#fafafa",
    boxShadow: theme.shadows[6],
    padding: 20,
    width: "800px",
    position: "absolute",
    left: "50%",
    top: "30%",
    marginLeft: "-400px",
    marginTop: "-150px",
    textAlign: "center",
    borderRadius: 10,
    fontFamiliy: "Quicksand",
  },
  fileSelectFileContainer: {
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#efefef",
    borderRadius: 5,
    border: "solid #ddd",
    borderWidth: 0.3,
  },
  fileSelectFileContainerHover: {
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#def",
    borderRadius: 5,
    border: "solid #ddd",
    borderWidth: 0.3,
  },
  fileSelectDivider: {
    marginTop: 10,
    marginBottom: 10,
  },
}));

const generateRandomData = (
  dimesionCount: number,
  maxPoints: number,
  l: number,
  r: number
) => {
  if (l > r) throw Error("R must be greater than L");
  const pointCount = Math.round(
    Math.random() * (maxPoints / 2) + maxPoints / 2
  );
  const points: Array<Array<number>> = [];
  for (let i = 0; i < pointCount; i++) {
    let dimesion = [];
    for (let j = 0; j < dimesionCount; j++) {
      dimesion.push(Math.random() * (r - l) + l);
    }
    points.push(dimesion);
  }
  return points;
};

const generateRandomAxes = (dimesionCount: number) => {
  const list = [];
  for (let i: number = 0; i < dimesionCount; i++) {
    list.push({
      value: Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, Math.round(Math.random() * 5 + 2)),
      key: i,
      display: ["lin", "log"][Math.round(Math.random() * 1.5 - 0.5)],
    });
  }
  return list;
};

const staticFiles = [
  {
    title: "transduction_1",
    information: "No sources where given to anonymize data. Ficticious name.",
    fromStatic: "transduction_1",
    lastModified: "01/03/2021",
  },
  {
    title: "transduction_2",
    information: "No sources where given to anonymize data. Ficticious name.",
    fromStatic: "transduction_2",
    lastModified: "01/03/2021",
  },
  {
    title: "transduction_3",
    information: "No sources where given to anonymize data. Ficticious name.",
    fromStatic: "transduction_3",
    lastModified: "01/03/2021",
  },
  {
    title: "erica1",
    information: "No sources where given to anonymize data. Ficticious name.",
    fromStatic: "erica1",
    lastModified: "23/05/2020",
  },
  {
    title: "erica2",
    information: "No sources where given to anonymize data. Ficticious name.",
    fromStatic: "erica2",
    lastModified: "25/05/2020",
  },
  {
    title: "erica3",
    information: "No sources where given to anonymize data. Ficticious name.",
    fromStatic: "erica3",
    lastModified: "26/05/2020",
  },
  {
    title: "SmallRandomDataset.fcs",
    information:
      "Generates some axes and points randomly! Around ~50 points, 2 dimesions, ranging from 0 to 100",
    data: generateRandomData(2, 100, 0, 100),
    axes: generateRandomAxes(2),
    lastModified: "Right now!",
  },
  {
    title: "MediumRandomDataset.fcs",
    information:
      "Generates axes and points randomly! Around ~500 points, 10 dimesions, ranging from 0 to 1",
    data: generateRandomData(10, 1000, 0, 1),
    axes: generateRandomAxes(10),
    lastModified: "Right now!",
  },
  {
    title: "LargeRandomDataset.fcs",
    information:
      "Generates many axes and points randomly! Around ~5,000 points, 200 dimesions, ranging from -10000 to 1000000",
    data: generateRandomData(200, 3000, -10000, 1000000),
    axes: generateRandomAxes(200),
    lastModified: "Right now!",
  },
  {
    title: "ExtremelyLargeRandomDataset.fcs",
    information:
      "Generates many axes and points randomly! Around ~50,000 points, 200 dimesions, ranging from -10000 to 1000000",
    data: generateRandomData(200, 30000, -10000, 1000000),
    axes: generateRandomAxes(200),
    lastModified: "Right now!",
  },
];

const addToFiles = (data: Array<any>, axes: object[], title: string) => {
  const add = (data: Array<any>) => {
    staticFiles.unshift({
      title: title,
      information: "Real anonymous FCS file",
      data: data,
      //@ts-ignore
      axes: axes,
      lastModified: "??",
    });
  };

  add(data);
};

const getLocal = (filename: any, title: string) => {
  addToFiles(filename.data, filename.axes, title);
};

const getRemotePrototypeFile = (url: string) => {
  axios.get(url).then((response) => {
    let text = response.data.slice(0, -3);
    text += "]]";
    const filedata = JSON.parse(text);
    const remoteFileAxes = [
      "FSC-A",
      "SSC",
      "Comp-FITC-A - CD7",
      "Comp-PE-A - CD3",
      "Comp-APC-A - CD45",
      "Time",
    ].map((e, i) => {
      return { key: i, value: e, display: "lin" };
    });
    addToFiles(filedata, remoteFileAxes, url.split("/")[3].split(".")[0]);
  });
};

const getRemoteFiles = (): any[] => {
  return dataManager.remoteFiles.map((e) => {
    return {
      title: e.title,
      id: e.id,
      data: e.channelsData,
      axes: e.channels,
      description: "...",
      lastModified: "...",
    };
  });
};

function AddFileModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
}): JSX.Element {
  const remoteWorkspace = dataManager.isRemoteWorkspace();
  const classes = useStyles();
  let [files, setFiles] = React.useState(remoteWorkspace ? [] : staticFiles);

  useEffect(() => {
    if (remoteWorkspace && dataManager.isWorkspaceLoading()) {
      dataManager.addObserver("setWorkspaceLoading", () => {
        setFiles(getRemoteFiles());
      });
    }
  }, []);

  const [open, setOpen] = React.useState(false);
  const [onHover, setOnHover] = React.useState(-1);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const addFile = (index: number) => {
    const file = files[index];
    let newFile: FCSFile;
    if (file.fromStatic !== undefined) {
      newFile = staticFileReader(file.fromStatic);
    } else {
      newFile = new FCSFile({
        name: file.title,
        src: "remote",
        axes: file.axes.map((e: any) => e.value),
        data: file.data,
        plotTypes: file.axes.map((e: any) => e.display),
      });
    }
    const fileID = dataManager.addNewFileToWorkspace(newFile);
    const plot = new PlotData();
    plot.file = dataManager.getFile(fileID);
    dataManager.addNewPlotToWorkspace(plot);
  };

  return (
    <Modal
      open={props.open}
      onClose={() => {
        props.closeCall.f(props.closeCall.ref);
      }}
    >
      <div className={classes.fileSelectModal}>
        <h2>Open FCS file</h2>

        <p
          style={{
            color: "#777",
            fontSize: 15,
            textAlign: "left",
          }}
        >
          The prototype still doesn't allow for uploading files or saving them,
          but here we have a selection of 3 real fcs files for you to play
          around!
        </p>

        {process.env.REACT_APP_ENABLE_ANONYMOUS_FILE_UPLOAD === "true" ? (
          <div
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <Button
              style={{
                backgroundColor: "#66d",
                color: "white",
                fontSize: 13,
                marginLeft: 20,
              }}
            >
              Upload file (Anonymous)
            </Button>
          </div>
        ) : null}

        <p>
          <b>Click on the file you want to open:</b>
        </p>

        <div
          style={{
            backgroundColor: "#fff",
            padding: 15,
            textAlign: "left",
            maxHeight: 500,
            overflowY: "scroll",
            border: "solid #ddd",
            borderRadius: 5,
            borderWidth: 0.3,
          }}
        >
          {files.map((e: any, i: number) => {
            const divider =
              i == files.length - 1 ? null : (
                <Divider className={classes.fileSelectDivider} />
              );

            const payload = (
              <div key={i.toString() + e.title}>
                <div
                  onMouseEnter={() => setOnHover(i)}
                  onMouseLeave={() => setOnHover(-1)}
                  className={
                    onHover == i
                      ? classes.fileSelectFileContainerHover
                      : classes.fileSelectFileContainer
                  }
                  onClick={() => {
                    addFile(i);
                    props.closeCall.f(props.closeCall.ref);
                  }}
                >
                  <p>
                    <b>Title:</b>{" "}
                    <a
                      style={{
                        color: "#777",
                        fontSize: 16,
                        fontFamily: "Courier New",
                      }}
                    >
                      {e.title}
                    </a>
                  </p>
                  <p>
                    <b>Last Modified:</b> {e.lastModified}
                  </p>
                  <p>
                    <b>Information:</b> {e.information}
                  </p>
                </div>
                {divider}
              </div>
            );

            return payload;
          })}
        </div>
      </div>
    </Modal>
  );
}

export default AddFileModal;
