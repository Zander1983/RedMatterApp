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
import { snackbarService } from "uno-material-ui";
import { ExperimentFilesApiFetchParamCreator } from "api_calls/nodejsback";
import userManager from "Components/users/userManager";
import { useHistory } from "react-router";

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

const staticFiles = [
  "transduction_1",
  "transduction_2",
  "transduction_3",
  "erica1",
  "erica2",
  "erica3",
].map((e) => {
  return {
    title: e,
    information: "...",
    fromStatic: e,
    lastModified: "X/X/X",
  };
});

const getRemoteFiles = (): any[] => {
  return dataManager.remoteFiles.map((e) => {
    return {
      title: e.title,
      id: e.id,
      data: e.events,
      axes: e.channels,
      description: "...",
      lastModified: "...",
      remoteData: {
        ...e,
        events: null,
      },
    };
  });
};

function AddFileModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
}): JSX.Element {
  const history = useHistory();
  const remoteWorkspace = dataManager.isRemoteWorkspace();
  const classes = useStyles();
  let [files, setFiles] = React.useState(remoteWorkspace ? [] : staticFiles);

  useEffect(() => {
    if (remoteWorkspace && dataManager.isWorkspaceLoading()) {
      dataManager.addObserver("setWorkspaceLoading", () => {
        if (dataManager.remoteFiles !== undefined) {
          const remoteFiles = getRemoteFiles();
          setFiles(remoteFiles);
        }
      });
      dataManager.addObserver("clearWorkspace", () => {
        setFiles(remoteWorkspace ? [] : staticFiles);
        dataManager.setWorkspaceLoading(false);
      });
    }
  }, []);

  const [onHover, setOnHover] = React.useState(-1);

  const addFile = (index: number) => {
    if (!dataManager.ready()) {
      snackbarService.showSnackbar("Something went wrong, try again!", "error");
      return;
    }
    const file: any = files[index];
    console.log(file);
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
        remoteData: file.remoteData,
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
