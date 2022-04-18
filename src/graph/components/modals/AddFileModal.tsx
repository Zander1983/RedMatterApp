/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Button, Divider, Grid, TextField, Tooltip } from "@material-ui/core";

import { File } from "graph/resources/types";
import { getWorkspace } from "graph/utils/workspace";

const useStyles = makeStyles((theme) => ({
  fileSelectModal: {
    backgroundColor: "#fafafa",
    boxShadow: theme.shadows[6],
    padding: 20,
    width: "800px",
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    height: "90vh",
    top: "5vh",
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

const AddFileModal = React.memo(
  (props: {
    open: boolean;
    closeCall: { f: Function; ref: Function };
    onPipeline?: { save: Function };
    isShared: boolean;
    experimentId: string;
    pipelineId?: string;
    files: File[];
    selectedFile: string;
  }): JSX.Element => {
    const classes = useStyles();

    const filesMetadata = props.files;
    const [onHover, setOnHover] = React.useState(-1);
    const [files, setFiles] = React.useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    const [nameError, setNameError] = React.useState(false);
    const [name, setName] = React.useState("");
    const [searchingText, setSearchingText] = React.useState("");

    const onSetControl = (FileId: any, isDownloading = false) => {
      // eventStacker(`A plot added on experimentID: ${props.experimentId} from file ${FileId}.`);
      if (name?.length === 0) {
        setErrorMessage("Name is Required");
        setNameError(true);
      } else if (name?.length <= 8 || name?.length >= 20) {
        setErrorMessage("Name must be equal 8 to 20 char");
        setNameError(true);
      } else {
        let isSavePermitted = true;
        if (getWorkspace()?.pipelines?.length > 1) {
          const isHasIndex = getWorkspace()?.pipelines?.findIndex(
            (pipeline) => pipeline?.name?.toLowerCase() === name.toLowerCase()
          );
          if (isHasIndex > -1) {
            setErrorMessage("Duplicate name not allowed.");
            setNameError(true);
            isSavePermitted = false;
          }
        }
        if (isSavePermitted) {
          setNameError(false);
          setErrorMessage("This Field Is Required");
          setName("");
          props.onPipeline.save(name, FileId);
        }
      }
    };

    useEffect(() => {
      const fileArray = props?.files
        ?.map((file: File) => {
          if (searchingText === "") {
            return {
              id: file?.id,
              label: file?.label,
              eventCount: file?.eventCount,
            };
          } else {
            if (
              file?.label
                .slice(0, searchingText.length)
                .toLowerCase()
                .includes(searchingText.toLowerCase())
            ) {
              return {
                id: file?.id,
                label: file?.label,
                eventCount: file?.eventCount,
              };
            }
          }
        })
        .filter(Boolean);
      setFiles(fileArray);
    }, [searchingText]);

    return (
      <Modal
        open={props.open}
        onClose={() => {
          props.closeCall.f(props.closeCall.ref);
        }}
      >
        <div className={classes.fileSelectModal}>
          <h2 style={{ margin: 0 }}>{"Gate Pipeline"}</h2>
          <p
            style={{
              color: "#777",
              fontSize: 15,
              textAlign: "center",
              margin: 0,
            }}
          >
            {"Name your Gate Pipeline & select the Control File"}
          </p>

          <Grid container direction="row">
            {/* <Grid item xs={4} style={{ paddingRight: 20 }}>
              <Button
                size="large"
                variant="contained"
                style={{
                  backgroundColor: "#66d",
                  color: "white",
                  width: "100%",
                  height: 30,
                  marginBottom: 15,
                }}
                startIcon={
                  everythingDownloaded ? null : (
                    <DownloadOutlined
                      style={{ fontSize: 15, color: "white" }}
                    />
                  )
                }
                onClick={downloadAll}
                // disabled={everythingDownloaded}
              >
                Plot all samples
              </Button>
            </Grid> */}
            <Grid item xs={12}>
              <div>
                <TextField
                  style={{ width: "100%", padding: 0, margin: 0 }}
                  error={nameError}
                  value={name}
                  helperText={errorMessage}
                  autoFocus
                  margin="dense"
                  id="gate-name-textinput"
                  label="Gate Pipeline Name*"
                  type="text"
                  onChange={(e: any) => {
                    setName(e.target.value);
                  }}
                />
              </div>
            </Grid>
            {/* <Grid item xs={12}>
              <div>
                <TextField
                  style={{
                    width: "100%",
                    padding: 0,
                    marginTop: 5,
                    marginBottom: 5,
                  }}
                  value={searchingText}
                  margin="dense"
                  id="gate-name-textinput"
                  label="Search By File Title"
                  type="text"
                  onChange={(e: any) => {
                    setSearchingText(e.target.value);
                  }}
                />
              </div>
            </Grid> */}
          </Grid>

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

          <div
            style={{
              backgroundColor: "#fff",
              padding: 15,
              textAlign: "left",
              maxHeight: "75%",
              overflowY: "scroll",
              border: "solid #ddd",
              borderRadius: 5,
              borderWidth: 0.3,
            }}
          >
            {files.length === 0 ? (
              <Grid style={{ textAlign: "center" }}>
                No files found with search term '{searchingText}'
              </Grid>
            ) : (
              files.map((fileMetadata: any, i: number) => {
                const divider =
                  i === filesMetadata.length - 1 ? null : (
                    <Divider className={classes.fileSelectDivider} />
                  );

                return (
                  <div key={i.toString() + fileMetadata.label}>
                    <div
                      onMouseEnter={() => setOnHover(i)}
                      onMouseLeave={() => setOnHover(-1)}
                      className={
                        onHover === i
                          ? classes.fileSelectFileContainerHover
                          : classes.fileSelectFileContainer
                      }
                    >
                      <Grid container direction="row">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <div style={{ display: "flex" }}>
                            <Tooltip
                              title={
                                fileMetadata.label.length > 45
                                  ? fileMetadata?.label
                                  : ""
                              }
                            >
                              <p
                                style={{
                                  width: 400,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                <b>{"Title: "}</b>

                                {fileMetadata.label}
                              </p>
                            </Tooltip>
                            <p
                              style={{
                                marginLeft: 5,
                                width: 100,
                              }}
                            >
                              <b>{"Events: "}</b>
                              <span>{fileMetadata.eventCount}</span>
                            </p>
                          </div>
                          <div
                            style={{
                              marginBottom: 10,
                              marginLeft: -60,
                              textAlign: "right",
                            }}
                          >
                            <Button
                              style={{
                                backgroundColor: "#66d",
                                color: "white",
                                fontSize: 13,
                                width: 180,
                              }}
                              onClick={() => onSetControl(fileMetadata.id)}
                            >
                              {props.selectedFile === fileMetadata.id
                                ? "Selected As Control"
                                : "Set As Control"}
                            </Button>
                          </div>
                        </div>
                      </Grid>
                    </div>
                    {divider}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    );
  }
);

export default AddFileModal;
