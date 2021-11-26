import { useEffect, useState } from "react";
import { useStyles } from "Components/workspaces/modals/ExperimentModal/style";
import { Button, FormControlLabel } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { deviceData } from "assets/staticData/CreateExperimentModalData";

import userManager from "Components/users/userManager";
import useGAEventTrackers from "hooks/useGAEvents";
import { ExperimentApiFetchParamCreator } from "api_calls/nodejsback";
import axios from "axios";
import { snackbarService } from "uno-material-ui";
import { useStore } from "react-redux";
import { filterArrayAsPerInput } from "utils/searchFunction";

interface iApplyGateToFilesModal {
  filesMetadata: any[];
  modalOpen: boolean;
  handleSubmitFiles: Function;
}

function ApplyGateToFilesModal({
  filesMetadata,
  modalOpen,
  handleSubmitFiles,
}: iApplyGateToFilesModal): JSX.Element {
  const classes = useStyles();

  const [selectedFiles, setSelectedFiles] = useState<any>({});
  const [showFileError, setShowFileError] = useState<boolean>(false);

  const handleSubmit = () => {};

  return (
    <div>
      <Modal
        onBackdropClick={() => {
          handleSubmitFiles([]);
          setSelectedFiles({});
          setShowFileError(false);
        }}
        open={modalOpen}
        disableScrollLock={true}
        className={classes.modalContainer}
      >
        <div>
          <div className={classes.modal}>
            {/* Header Title */}
            <div className={classes.modalHeader}>
              <h2 className={classes.modalHeaderTitle}>Select files!!</h2>
            </div>
            {showFileError ? (
              <div style={{ marginBottom: "20px", color: "red" }}>
                **You can only selected 3 files in one time**
              </div>
            ) : null}
            <div
              style={{
                color: "black",
                display: "flex",
                justifyContent: "center",
                maxHeight: "500px",
                overflow: "auto",
              }}
              className={classes.modalHeaderTitle}
            >
              {filesMetadata && filesMetadata.length > 0 ? (
                <div
                  style={{
                    textAlign: "left",
                  }}
                >
                  {filesMetadata.map((file) => {
                    return file.selected ? (
                      <div style={{ marginLeft: "30px" }}>{file.name}</div>
                    ) : (
                      <div>
                        <FormControlLabel
                          style={{}}
                          control={
                            <Checkbox
                              color="primary"
                              inputProps={{
                                "aria-label": "secondary checkbox",
                              }}
                              checked={selectedFiles[file.id] ? true : false}
                              onChange={(e) => {
                                let values = Object.values(selectedFiles);
                                let trueValues = values.filter((x) => x);
                                if (
                                  trueValues.length < 3 ||
                                  !e.target.checked
                                ) {
                                  selectedFiles[file.id] = e.target.checked;
                                  setSelectedFiles(
                                    JSON.parse(JSON.stringify(selectedFiles))
                                  );
                                } else {
                                  setShowFileError(true);
                                }
                              }}
                              name="Private workspace"
                            />
                          }
                          label={
                            <span className={classes.privateExperimentStyle}>
                              {file.name}
                            </span>
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span>No files found</span>
              )}
            </div>
            <Button
              style={{
                flex: 1,
                height: "2rem",
                fontSize: 13,
                color: "white",
                backgroundColor: "#6666aa",
                marginTop: "20px",
              }}
              variant="contained"
              size="small"
              onClick={() => {
                handleSubmitFiles(Object.keys(selectedFiles));
                setSelectedFiles({});
                setShowFileError(false);
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ApplyGateToFilesModal;
