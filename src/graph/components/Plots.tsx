import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import ShareIcon from "@material-ui/icons/Share";
import staticFileReader from "graph/components/modals/staticFCSFiles/staticFileReader";
import MessageModal from "./modals/MessageModal";
import AddFileModal from "./modals/AddFileModal";
import GatetNamePrompt from "./modals/GateNamePrompt";
import GenerateReportModal from "./modals/GenerateReportModal";
import LinkShareModal from "./modals/linkShareModal";
import FCSFile from "graph/dataManagement/fcsFile";
import Workspace from "./workspaces/Workspace";
import dataManager from "graph/dataManagement/dataManager";
import WorkspaceStateHelper from "graph/dataManagement/workspaceStateReload";
import SideMenus from "./static/SideMenus";
import { HuePicker } from "react-color";
import {
  ExperimentApiFetchParamCreator,
  WorkspacesApiFetchParamCreator,
} from "api_calls/nodejsback";
import userManager from "Components/users/userManager";
import axios from "axios";
import { snackbarService } from "uno-material-ui";
import { useHistory } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Gate from "graph/dataManagement/gate/gate";
import { useLocation } from "react-router-dom";
import PlotData from "graph/dataManagement/plotData";

const useStyles = makeStyles((theme) => ({
  header: {
    textAlign: "center",
  },
  title: {},
  fileSelectModal: {
    backgroundColor: "#efefef",
    boxShadow: theme.shadows[6],
    padding: 20,
    width: "800px",
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: "-400px",
    marginTop: "-150px",
    textAlign: "center",
  },
  fileSelectFileContainer: {
    backgroundColor: "#efefef",
    padding: 10,
    borderRadius: 5,
  },
  fileSelectDivider: {
    marginTop: 10,
    marginBottom: 10,
  },
  topButton: {
    marginLeft: 20,
    height: 35,
  },
}));

// ==== Avoid multiple listeners for screen resize ====
let eventListenerSet = false;
let setWorkspaceAlready = false;
const staticFiles = [
  "transduction_1",
  "transduction_2",
  "transduction_3",
  "erica1",
  "erica2",
  "erica3",
].map((e) => {
  return {
    label: e,
    information: "...",
    fromStatic: e,
    fileSize: 0,
    eventCount: 0,
    lastModified: "X/X/X",
  };
});

function Plots(props: { experimentId: string }) {
  console.log("EXPERIMENT ID = ", props.experimentId);
  const remoteWorkspace = dataManager.isRemoteWorkspace();
  const history = useHistory();
  const isLoggedIn = userManager.isLoggedIn();
  const [sharedWorkspace, setSharedWorkspace] = React.useState(false);
  const [workspaceState, setWorkspaceState] = React.useState();
  const [newWorkspaceId, setNewWorkspaceId] = React.useState("");
  const [initPlot, setInitPlot] = React.useState(false);
  const location = useLocation();

  const verifyWorkspace = async (workspaceId: string) => {
    let workspaceData;
    try {
      workspaceData = await axios.post(
        "/api/verifyWorkspace",
        {
          workspaceId: workspaceId,
          experimentId: props.experimentId,
        },
        {}
      );
      dataManager.setWorkspaceIsShared(workspaceData.data["isShared"]);
      setSharedWorkspace(workspaceData.data["isShared"]);
      setWorkspaceState(JSON.parse(workspaceData.data["state"]));
    } catch (e) {
      snackbarService.showSnackbar(
        "Could not verify the workspace, reload the page and try again!",
        "error"
      );
    }

    initPlots(workspaceData.data["isShared"]);
    if (workspaceData)
      loadWorkspaceStatsToDM(
        workspaceData.data["isShared"],
        JSON.parse(workspaceData.data["state"])
      );
  };

  useEffect(() => {

    dataManager.setExperimentId(props.experimentId);

    let workspaceId = new URLSearchParams(location.search).get("id");
    if (workspaceId) {
      verifyWorkspace(workspaceId);
    } else {
      initPlots();
    }

    var downloadedListner = dataManager.addObserver("updateDownloaded", () => {
      setDownloadedFiles(dataManager.downloaded);
    });

    var downloadingListner = dataManager.addObserver("updateDownloadingFiles", () => {
      setDownloadingFiles(dataManager.downloadingFiles);
    });

    return () => {
      setWorkspaceAlready = false;
      dataManager.clearWorkspace();
      dataManager.removeObserver("updateDownloadingFiles", downloadingListner);
      dataManager.removeObserver("updateDownloaded", downloadedListner);
    };
  }, []);

  const initPlots = async (workSpaceShared: boolean = false) => {
    if (observerAdded === false) {
      setObserverAdded(true);
      dataManager.addObserver(
        "addNewGateToWorkspace",
        getNameAndOpenModal,
        true
      );
    }
    if (props.experimentId !== undefined && !setWorkspaceAlready) {
      setWorkspaceAlready = true;
      dataManager.setWorkspaceID(props.experimentId);
      dataManager.addObserver("setWorkspaceLoading", () => {
        const isLoading = dataManager.isWorkspaceLoading();
        setLoading(isLoading);
        if (!isLoading) {
          setLoadModal(false);
        }
      });
    }

    if (
      !workSpaceShared &&
      process.env.REACT_APP_ENFORCE_LOGIN_TO_ANALYSE === "true" &&
      !isLoggedIn
    ) {
      history.push("/login");
    }

    await dataManager.downloadFileMetadata();

    setInitPlot(true);
  };

  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);

  // == Small screen size notice ==
  const [showSmallScreenNotice, setShowSmallScreenNotice] = React.useState(
    window.innerWidth < 1165
  );

  if (!eventListenerSet) {
    eventListenerSet = true;
    window.addEventListener("resize", () => {
      setShowSmallScreenNotice(window.innerWidth < 1165);
    });
  }

  const upsertWorkSpace = (isShared: boolean = false) => {
    let stateJson = dataManager.getWorkspaceJSON();
    const updateWorkSpace = WorkspacesApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).upsertWorkSpace(userManager.getToken(), {
      experimentId: props.experimentId,
      state: stateJson,
      isShared: isShared,
    });
    axios
      .post(
        updateWorkSpace.url,
        updateWorkSpace.options.body,
        updateWorkSpace.options
      )
      .then((e) => {
        setNewWorkspaceId(e.data.workspaceId);
        snackbarService.showSnackbar(
          "Workspace saved successfully.",
          "success"
        );
      })
      .catch((e) => {
        snackbarService.showSnackbar(
          "Could not save the workspace, reload the page and try again!",
          "error"
        );
      });
  };
  // == General modal logic ==
  const handleOpen = (func: Function) => {
    func(true);
  };
  const handleClose = (func: Function) => {
    func(false);
  };

  // == Add file modal logic ==
  const [linkShareModalOpen, setLinkShareModalOpen] = React.useState(false);
  const [addFileModalOpen, setAddFileModalOpen] = React.useState(false);
  const [generateReportModalOpen, setGenerateReportModalOpen] =
    React.useState(false);
  const [loadModal, setLoadModal] = React.useState(false);
  const [helpModal, setHelpModal] = React.useState(false);
  const [clearModal, setClearModal] = React.useState(false);
  const waitTime = Math.random() * 1000 + 500;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (e: any) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const [observerAdded, setObserverAdded] = React.useState(false);
  const [gateToSend, setGateToSend] = React.useState(null);
  const [namePromptOpen, setNamePromptOpen] = React.useState(false);
  const [downloadedFiles, setDownloadedFiles] = React.useState([]);
  const [downloadingFiles, setDownloadingFiles] = React.useState([]);

  const getNameAndOpenModal = (gate: Gate) => {
    setNamePromptOpen(true);
    setGateToSend(gate);
  };

  const renameGate = (newName: String) => {
    dataManager.getGate(gateToSend[0].id).update({ name: newName });
    setNamePromptOpen(false);
  };

  var getSharedRemoteFiles = async (fileIds: Array<string>) => {
    let datas = await axios.post(
      "/api/sharedEvents",
      {
        experimentId: props.experimentId,
        fileIds: fileIds,
      },
      {}
    );

    return datas.data;
  };

  var loadWorkspaceStatsToDM = async (
    sharedWorkspacearg: boolean,
    workspaceStatearg: any
  ) => {
    if (sharedWorkspacearg && workspaceStatearg) {
      setLoading(true);
      let workspaceStateReload = new WorkspaceStateHelper(workspaceStatearg);
      let stateFileIds = workspaceStateReload.getFileIds();

      setDownloadingFiles(stateFileIds);
      let eventFiles = await getSharedRemoteFiles(stateFileIds);
      dataManager.updateDownloaded(eventFiles);
      if(!dataManager.ready())
      {
        dataManager.createWorkspace();
      }
      for (let i = 0; i < eventFiles.length; i++) {
        workspaceStateReload.addFile(eventFiles[i]);
      }

      dataManager.loadWorkspace(JSON.stringify(workspaceStatearg));
    }
    setLoading(false);
  };

  const handleDownLoadFileEvents = async (fileIds: any[]) => {
    dataManager.downloadFileEvents(
      fileIds
    );
  };

  const addFile = (index: number) => {
    if (!dataManager.ready()) {
      snackbarService.showSnackbar("Something went wrong, try again!", "error");
      return;
    }

    const file: any = remoteWorkspace
      ? downloadedFiles[index]
      : staticFiles[index];
    let newFile: FCSFile;
    if (file?.fromStatic) {
      newFile = staticFileReader(file.fromStatic);
    } else {
      newFile = new FCSFile({
        name: file.title,
        id: file.id,
        src: "remote",
        axes: file.channels.map((e: any) => e.value),
        data: file.events,
        plotTypes: file.channels.map((e: any) => e.display),
        remoteData: file,
      });
    }
    const fileID = dataManager.addNewFileToWorkspace(newFile);
    const plot = new PlotData();
    plot.file = dataManager.getFile(fileID);
    dataManager.addNewPlotToWorkspace(plot);
  };

  var onLinkShareClick = async () => {
    if (isLoggedIn) {
      upsertWorkSpace(true);
    } else if (sharedWorkspace) {
      let stateJson = dataManager.getWorkspaceJSON();
      let newWorkspaceDB;
      try {
        newWorkspaceDB = await axios.post(
          "/api/upsertSharedWorkspace",
          {
            workspaceId: newWorkspaceId,
            experimentId: props.experimentId,
            state: stateJson,
          },
          {}
        );
        setNewWorkspaceId(newWorkspaceDB.data);
      } catch (e) {
        snackbarService.showSnackbar(
          "Could not save shared workspace, reload the page and try again!",
          "error"
        );
      }
    }
    handleOpen(setLinkShareModalOpen);
  };

  return (
    <div
      style={{
        height: "100%",
        padding: 0,
      }}
    >
      {/* == MODALS == */}
      {initPlot ? (
        <div>
          <GatetNamePrompt open={namePromptOpen} sendName={renameGate} />

          <AddFileModal
            open={addFileModalOpen}
            closeCall={{ f: handleClose, ref: setAddFileModalOpen }}
            isShared={sharedWorkspace}
            downloaded={downloadedFiles}
            downloading={downloadingFiles}
            filesMetadata={dataManager.files}
            onDownloadFileEvents={(fileIds) => {
              handleDownLoadFileEvents(fileIds);
            }}
            addFileToWorkspace={(index) => {
              addFile(index);
            }}
          />

          <GenerateReportModal
            open={generateReportModalOpen}
            closeCall={{ f: handleClose, ref: setGenerateReportModalOpen }}
          />

          <LinkShareModal
            open={linkShareModalOpen}
            workspaceId={newWorkspaceId}
            closeCall={{ f: handleClose, ref: setLinkShareModalOpen }}
          />
        </div>
      ) : null}

      <MessageModal
        open={helpModal}
        closeCall={{ f: handleClose, ref: setHelpModal }}
        message={
          <div
            style={{
              overflow: "hidden",
              overflowY: "scroll",
              maxHeight: 500,
            }}
          >
            <h2>How to use?</h2>
            <div
              style={{
                width: 550,
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
              }}
            >
              <p>
                <b>General:</b> You may add a file by clicking the "+ Add new
                file" button. By adding a file, you will see a plot with the
                entire contents of the file you selected. You may move this plot
                around by simple clicking dragging it. You may resize by
                clicking and dragging the bottom right of a plot.
              </p>
              <p>
                <b>Main bar:</b> Located at the top of a plot, with several blue
                buttons and a red button for deleting a plot. In the right of
                this bar, you may find a camera button, which when clicked allow
                you to download the current plot as a .png picture.
              </p>
              <p>
                <b>Oval gates:</b> By pressing "Oval" you may enable oval gate
                creation (indicated by the button's color turning slightly
                lighter). To create an oval gate, click the first point where
                you want this oval gate to touch, then move your mouse up to the
                opposite point of this ellipse. After this, move your point away
                from the segment created to change the perpendicular axis'
                radius. After that, just press once again and a oval gate is
                created. To edit, just click any of the four significant points
                of the gate to adjust it.
              </p>
              <p>
                <b>Polygon gates:</b> By pressing "Polygon" you may enable
                polygon gate creation (indicated by the button's color turning
                slightly lighter). To create a polygon gate, first enable it be
                pressing the indicated button, then start clicking on the plot
                where you want the points of the polygon to be. To finish it,
                click the first point back again. The last segment of the
                polygon will be highlighted blue if the click you are about to
                make is the finishing one for closing that polygon. After a gate
                is created, you may click one of it's points to select it and
                move around as you see fit. To finish editing, just press again
                to release the point where you want it to be.
              </p>
              <p>
                <b>Subpopulations and inverse subpopulations:</b> You may create
                a subpopulation based on the current points your gates gate on a
                given plot by pressing the "Subpop" button.You may also create
                an inverse subpopulation by pressing "Inverse subpop" button.
                The inverse subpopulation selects all point outside of your
                current gates.
              </p>
              <p>
                <b>Population bar:</b> In here you may type a gate to apply to
                your current plot, or open a menu with all available gates. You
                may remove or add gates as you wish. Sometimes, if you create a
                plot as a population of another gated plot, you will not be able
                to remove that certain population.
              </p>
              <p>
                <b>Axis bar:</b> In these bars you may change the axis of the X
                or Y dimension. You may turn that dimension into a histogram by
                simple pressing the histogram button. You may change the type of
                plotting you want (linear, logicel, log...).
              </p>
              {process.env.REACT_APP_NO_WORKSPACES === "true" ? null : (
                <p>
                  <b>Sharing:</b> To share the workspace, all you have to do it
                  click the "Share Workspace button" located at the top right.
                  In there, you may find a link other people can access to see
                  your current workspace. The shared workspace is a snapshot:
                  it's immutable. As soon as you create it, it stays like that.
                  You may open a shared workspace and edit, but to see that
                  workspace again, you must create another share link. By
                  pressing the "copy" icon to the left of the link sharing
                  button, you may copy the link in a single click.
                </p>
              )}
            </div>
            <h2 style={{ marginTop: 50 }}>
              What is going to be in the full version of Red Matter?
            </h2>
            <h3>Planned features:</h3>
            <ul
              style={{
                width: 550,
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
              }}
            >
              <li>
                Creating reports (with medians, std. deviation, ...) as .pdf,
                .csv or .xls
              </li>
              <li>Compensation, logicel, ...</li>
            </ul>
            <h3>Long term features:</h3>
            <ul
              style={{
                width: 550,
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
              }}
            >
              <li>Automatic gating using artificial intelligence</li>
              <li>Red Matter's subscription with power user features</li>
            </ul>
          </div>
        }
      />

      <MessageModal
        open={loadModal}
        closeCall={{ f: handleClose, ref: setLoadModal }}
        message={
          <div>
            <h2>Loading workspace</h2>
            <h3 style={{ color: "#777" }}>
              Please wait, we are collecting your files from the servers...
            </h3>
            <CircularProgress style={{ marginTop: 20, marginBottom: 20 }} />
          </div>
        }
        noButtons={true}
      />

      <MessageModal
        open={clearModal}
        closeCall={{
          f: handleClose,
          ref: setClearModal,
        }}
        message={
          <div>
            <h2>Are you sure you want to delete the entire workspace?</h2>
            <p style={{ marginLeft: 100, marginRight: 100 }}>
              The links you've shared with "share workspace" will still work, if
              you want to access this in the future, make sure to store them.
            </p>
          </div>
        }
        options={{
          yes: () => {
            dataManager.clearWorkspace(true);
          },
          no: () => {
            handleClose(setClearModal);
          },
        }}
      />

      {/* == STATIC ELEMENTS == */}
      <SideMenus></SideMenus>

      {/* == NOTICES == */}
      {showSmallScreenNotice ? (
        <div
          style={{
            color: "#555",
            backgroundColor: "#fdd",
            padding: 20,
            paddingBottom: 1,
            paddingTop: 15,
            marginTop: -10,
            textAlign: "center",
          }}
        >
          <p>
            <b>We noticed you are using a small screen</b>
            <br />
            Unfortunately, Red Matter is made with Desktop-sized screens in
            mind. Consider switching devices!
          </p>
        </div>
      ) : null}

      {props.experimentId === undefined ? (
        <div
          style={{
            color: "#555",
            backgroundColor: "#dedede",
            paddingBottom: 1,
            paddingTop: 15,
            fontSize: "1.1em",
            textAlign: "center",
          }}
        >
          <p>
            This is a <b>PROTOTYPE</b> showing functionalities we expect to add
            to Red Matter.
            <br />
            It uses local anonymous files for you to test how the app works
            quick and easy.
            <br />
            You can help us improve or learn more by sending an email to{" "}
            <a href="mailto:redmatterapp@gmail.com">
              <b>redmatterapp@gmail.com</b>
            </a>
            .
          </p>
        </div>
      ) : null}

      {/* == MAIN PANEL == */}
      <Grid
        style={{
          marginTop: 30,
          marginLeft: 0,
          marginRight: 0,
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Grid
          style={{
            backgroundColor: "#fafafa",
            borderRadius: 10,
            marginLeft: 40,
            marginRight: 40,
            boxShadow: "2px 3px 3px #ddd",
          }}
          xs={12}
        >
          {initPlot ? (
            <div>
              <Grid
                style={{
                  backgroundColor: "#66a",
                  paddingTop: 20,
                  paddingBottom: 19,
                  borderRadius: 10,
                  WebkitBorderBottomLeftRadius: 0,
                  WebkitBorderBottomRightRadius: 0,
                }}
                container
              >
                <Grid container xs={9}>
                  {sharedWorkspace ? null : (
                    <Button
                      size="large"
                      variant="contained"
                      style={{
                        backgroundColor: "#fafafa",
                        marginLeft: 20,
                      }}
                      className={classes.topButton}
                      startIcon={<ArrowLeftOutlined style={{ fontSize: 15 }} />}
                      onClick={() => {
                        history.goBack();
                      }}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpen(setAddFileModalOpen)}
                    className={classes.topButton}
                    style={{
                      backgroundColor: "#fafafa",
                    }}
                  >
                    + Add new file
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpen(setGenerateReportModalOpen)}
                    className={classes.topButton}
                    style={{
                      backgroundColor: "#fafafa",
                    }}
                  >
                    Generate report
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpen(setHelpModal)}
                    className={classes.topButton}
                    style={{
                      backgroundColor: "#fafafa",
                    }}
                  >
                    Learn More
                  </Button>
                  {/* Uncomment below to have a "print state" button */}

                  {sharedWorkspace ? null : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => upsertWorkSpace()}
                      className={classes.topButton}
                      style={{
                        backgroundColor: "#fafafa",
                      }}
                    >
                      Save Workspace
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpen(setClearModal)}
                    className={classes.topButton}
                    style={{
                      backgroundColor: "#fafafa",
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
                {process.env.REACT_APP_NO_WORKSPACES === "true" ? null : (
                  <Grid
                    xs={3}
                    style={{
                      textAlign: "right",
                      paddingRight: 20,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => onLinkShareClick()}
                      className={classes.topButton}
                      style={{
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <ShareIcon
                        fontSize="small"
                        style={{
                          marginRight: 10,
                        }}
                      ></ShareIcon>
                      Share Workspace
                    </Button>
                  </Grid>
                )}
              </Grid>

              <Grid>
                {!loading ? (
                  <Workspace
                    {...{
                      sharedWorkspace: sharedWorkspace,
                      experimentId: props.experimentId,
                    }}
                  ></Workspace>
                ) : (
                  <Grid
                    container
                    style={{
                      height: 400,
                      backgroundColor: "#fff",
                      borderBottomLeftRadius: 10,
                      borderBottomRightRadius: 10,
                      textAlign: "center",
                    }}
                    justify="center"
                    alignItems="center"
                    alignContent="center"
                  >
                    <CircularProgress></CircularProgress>
                  </Grid>
                )}
              </Grid>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "100px",
              }}
            >
              <CircularProgress style={{ marginTop: 20, marginBottom: 20 }} />
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default Plots;
