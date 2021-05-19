import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";

import CircularProgress from "@material-ui/core/CircularProgress";
import ShareIcon from "@material-ui/icons/Share";

import MessageModal from "./modals/MessageModal";
import AddFileModal from "./modals/AddFileModal";
import GenerateReportModal from "./modals/GenerateReportModal";
import LinkShareModal from "./modals/linkShareModal";

import Workspace from "./workspaces/Workspace";
import dataManager from "graph/dataManagement/dataManager";
import SideMenus from "./static/SideMenus";
import { HuePicker } from "react-color";
import { ExperimentApiFetchParamCreator } from "api_calls/nodejsback";
import userManager from "Components/users/userManager";
import axios from "axios";
import { snackbarService } from "uno-material-ui";

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

function Plots(props: { workspaceID: string }) {
  console.log("WORKSPACE ID = ", props.workspaceID);
  if (props.workspaceID !== undefined && !setWorkspaceAlready) {
    setWorkspaceAlready = true;
    dataManager.setWorkspaceID(props.workspaceID);
    dataManager.addObserver("setWorkspaceLoading", () => {
      console.log("hey i loaded!");
      const isLoading = dataManager.isWorkspaceLoading();
      setLoading(isLoading);
      if (!isLoading) {
        setLoadModal(false);
      }
    });
  }
  useEffect(() => {
    return () => {
      setWorkspaceAlready = false;
    };
  }, []);
  const classes = useStyles();
  const [loading, setLoading] = React.useState(props.workspaceID !== undefined);

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
  const [loadModal, setLoadModal] = React.useState(true);
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

  return (
    <div
      style={{
        height: "100%",
        padding: 0,
      }}
    >
      {/* == MODALS == */}
      <AddFileModal
        open={addFileModalOpen}
        closeCall={{ f: handleClose, ref: setAddFileModalOpen }}
      />

      <GenerateReportModal
        open={generateReportModalOpen}
        closeCall={{ f: handleClose, ref: setGenerateReportModalOpen }}
      />

      <LinkShareModal
        open={linkShareModalOpen}
        closeCall={{ f: handleClose, ref: setLinkShareModalOpen }}
      />

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
              <p>
                <b>Sharing:</b> To share the workspace, all you have to do it
                click the "Share Workspace button" located at the top right. In
                there, you may find a link other people can access to see your
                current workspace. The shared workspace is a snapshot: it's
                immutable. As soon as you create it, it stays like that. You may
                open a shared workspace and edit, but to see that workspace
                again, you must create another share link. By pressing the
                "copy" icon to the left of the link sharing button, you may copy
                the link in a single click.
              </p>
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
              <li>FCS file uploads</li>
              <li>Overlays of histograms and scatter plots</li>
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
            dataManager.clearWorkspace();
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

      {props.workspaceID === undefined ? (
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
        <div
          style={{
            marginBottom: 30,
            marginLeft: 40,
            marginRight: 40,
            fontWeight: 700,
          }}
        >
          BIG RED BUTTON =&gt;{" "}
          <Button
            style={{
              backgroundColor: "red",
              color: "white",
              borderRadius: 10,
              fontSize: 20,
              boxShadow: "2px 3px 3px #ddd",
            }}
            onClick={() => {
              const workspaceJSON = dataManager.getWorkspaceJSON();
              console.log(userManager.getToken());
              const params = ExperimentApiFetchParamCreator({
                accessToken: userManager.getToken(),
              }).createExperiment(
                { data: workspaceJSON },
                userManager.getToken(),
                props.workspaceID
              );
              axios
                .post(params.url, params.options.body, params.options)
                .then(() => {
                  snackbarService.showSnackbar(
                    "!!!!!!!!!11IT WORKED!!!!1!!!!!! 😃😄😁😆😅😂🤣☺️😇🙂🙃😉😍😘😗😙😋😛😝😜🤪🤨🧐🤓😎🤩😏😒😞😔😟😕🙁☹️😣😖😫😩😢😭😤😠😡🤬🤯😳😱😨😰😥😓🤗🤔🤭🤫🤥😶😐😑😬🙄😯😦😧😮😲😴🤤😪😵🤐🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾🤲🤲🏻🤲🏼🤲🏽👐🏾🤲🏿👐👐🏻👐🏼👐🏽👐🏾👐🏿🙌🙌🏻🙌🏼🙌🏽🙌🏾🙌🏿👏👏🏻👏🏼👏🏽👏🏾👏🏿🤝👍👍🏻👍🏼👍🏽👍🏾👍🏿👎👎🏻👎🏼👎🏽👎🏾👎🏿👊👊🏻👊🏼👊🏽👊🏾👊🏿✊✊🏻✊🏼✊🏽✊🏾✊🏿🤛🤛🏻🤛🏼🤛🏽🤛🏾🤛🏿🤜🤜🏻🤜🏼🤜🏽🤜🏾🤜🏿🤞🤞🏻🤞🏼🤞🏽🤞🏾🤞🏿✌️✌🏻✌🏼✌🏽✌🏾✌🏿🤟🤟🏻🤟🏼🤟🏽🤟🏾🤟🏿🤘🤘🏻🤘🏼🤘🏽🤘🏾🤘🏿👌👌🏻👌🏼👌🏽👌🏾👌🏿👈👈🏻👈🏼👈🏽👈🏾👈🏿👉👉🏻👉🏼👉🏽👉🏾👉🏿👆👆🏻👆🏼👆🏽👆🏾👆🏿👇👇🏻👇🏼👇🏽👇🏾👇🏿☝️☝🏻☝🏼☝🏽☝🏾☝🏿✋✋🏻✋🏼✋🏽✋👷🏻‍♀️",
                    "success"
                  );
                })
                .catch((e) => {
                  snackbarService.showSnackbar(
                    "Something went wrong tomaz, you might wanna logout and login again...",
                    "error"
                  );
                });
            }}
          >
            Tomaz's big red button that saves everthing to the backend!
          </Button>{" "}
          &lt;= BIG RED BUTTON
        </div>
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
              <Popover
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
              >
                <Typography>I use Popover.</Typography>
              </Popover>
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
              {/* <Button
                variant="contained"
                size="large"
                onClick={() => console.log(dataManager.getWorkspaceJSON())}
                className={classes.topButton}
                style={{
                  backgroundColor: "#fafafa",
                }}
              >
                Print Experiment
              </Button> */}
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
                onClick={() => handleOpen(setLinkShareModalOpen)}
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
          </Grid>

          <Grid>
            {!loading ? (
              <Workspace></Workspace>
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
        </Grid>
      </Grid>
    </div>
  );
}

export default Plots;
