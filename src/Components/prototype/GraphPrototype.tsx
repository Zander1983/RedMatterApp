import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

import AddFileModal from "./components/AddFileModal";
import GenerateReportModal from "./components/GenerateReportModal";
import MessageModal from "./components/MessageModal";

import GraphPanel from "./GraphPanel";

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
    marginLeft: 30,
  },
}));

// == Conservation of internal state ==
// ==== Avoid multiple re-renders of plots (which is computer intesive) ====
let plots: JSX.Element[] = [];
// ==== Avoid multiple listeners for screen resize ====
let eventListenerSet = false;
// ==== Avoid weird numbering for panel's indexes ====
let staticPanelCount = 0;

function GraphPrototype() {
  // == Styling ==
  const classes = useStyles();

  // == Modal logic ==
  const [addFileModalOpen, setAddFileModalOpen] = React.useState(false);
  const [generateReportModalOpen, setGenerateReportModalOpen] = React.useState(
    false
  );
  const [deletePanelModalOpen, setDeletePanelModalOpen] = React.useState(false);
  let [deletePanelModalOptions, setDeletePanelModalOptions] = React.useState(
    null
  );

  const handleOpen = (func: Function) => {
    func(true);
  };
  const handleClose = (func: Function) => {
    func(false);
  };

  // == Panels logic ==
  const [panelCount, setPanelCount] = React.useState(0);

  // ==== Panel-Parent interaction ==
  const deletePanel = (key: number) => {
    const deletePanelNo = () => {
      setDeletePanelModalOpen(false);
    };
    const deletePanelYes = () => {
      setDeletePanelModalOpen(false);
      for (let i = 0; i < plots.length; i++) {
        if (plots[i].key === key.toString()) {
          plots.splice(i, 1);
          setPanelCount(panelCount - 1);
          return;
        }
      }
      throw Error("Plot was not found for deletion");
    };
    setDeletePanelModalOptions({ yes: deletePanelYes, no: deletePanelNo });
    setDeletePanelModalOpen(true);
  };

  // ==== AddFileModal-Parent interaction ==
  const createPanelFromFile = (file: {
    title: string;
    information: string;
    data: Array<Array<number>>;
    lastModified: string;
  }) => {
    plots.push(
      <GraphPanel
        key={staticPanelCount}
        index={staticPanelCount}
        file={file}
        interaction={{
          deletePanel: deletePanel,
        }}
      />
    );
    staticPanelCount++;
    setPanelCount(panelCount + 1);
  };

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

  return (
    <div
      className={classes.header}
      style={{
        height: "100%",
      }}
    >
      {/* == MODALS == */}
      <AddFileModal
        addFile={createPanelFromFile}
        open={addFileModalOpen}
        closeCall={{ f: handleClose, ref: setAddFileModalOpen }}
      />

      <GenerateReportModal
        open={generateReportModalOpen}
        closeCall={{ f: handleClose, ref: setGenerateReportModalOpen }}
      />

      <MessageModal
        open={deletePanelModalOpen}
        closeCall={{
          f: handleClose,
          ref: setDeletePanelModalOpen,
        }}
        message={<h2>Are you sure you want to delete this panel?</h2>}
        options={deletePanelModalOptions}
      />

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

      <div
        style={{
          color: "#555",
          backgroundColor: "#dedede",
          paddingBottom: 1,
          paddingTop: 15,
          marginBottom: 30,
        }}
      >
        <p>
          This is a <b>PROTOTYPE</b> showing basic functionalities we expect to
          add to Red Matter.
          <br />
          You can help us improve or learn more by sending an email to{" "}
          <a href="mailto:redmatterapp@gmail.com">
            <b>redmatterapp@gmail.com</b>
          </a>
          .
        </p>
      </div>

      {/* == TOP CONTROL BAR == */}
      {/* <Grid
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          justifyContent: "center",
          display: "flex",
          marginBottom: 20,
        }}
        lg={12}
        xl={9}
      >
        <Grid
          style={{
            backgroundColor: "#fafafa",
            borderRadius: 10,
            marginLeft: 40,
            marginRight: 40,
            boxShadow: "2px 3px 3px #ddd",
            padding: 10,
          }}
          container
          justifyContent="left"
          xs={12}
        >
          <div
            style={{
              backgroundColor: "#eef",
              boxShadow: "2px 3px 3px #ddd",
              borderRadius: 5,
              padding: 10,
            }}
          >
            <TextField
              id="outlined-multiline-static"
              label="Workspace name"
              variant="outlined"
              style={{
                borderRadius: 5,
              }}
            />
          </div>
        </Grid>
      </Grid> */}

      {/* == MAIN PANEL == */}
      <Grid
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          justifyContent: "center",
          display: "flex",
          marginBottom: 50,
        }}
        lg={12}
        xl={9}
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
          <Grid
            style={{
              backgroundColor: "#66a",
              paddingTop: 20,
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 19,
              borderRadius: 10,
              WebkitBorderBottomLeftRadius: 0,
              WebkitBorderBottomRightRadius: 0,
            }}
            container
          >
            <Grid
              item
              xs={6}
              style={{
                textAlign: "left",
              }}
            ></Grid>
            <Grid
              item
              xs={6}
              style={{
                textAlign: "right",
              }}
            >
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
            </Grid>
          </Grid>

          <Grid>
            {plots.length > 0 ? (
              plots.map((plot) => {
                return plot;
              })
            ) : (
              <h4 style={{ marginBottom: 50, marginTop: 50, color: "#666" }}>
                Click add new file to add plots!
              </h4>
            )}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default GraphPrototype;
