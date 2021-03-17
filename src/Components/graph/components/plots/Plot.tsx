import React from "react";
import { Button } from "@material-ui/core";
import { Divider } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";

import DeleteIcon from "@material-ui/icons/Delete";

import FCSFile from "../../classes/fcsFile";

interface GraphPanel {
  file: {
    title: string;
    lastModified: string;
    data: number[][];
    information: string;
  };
}

const classes = {
  header: {
    textAlign: "center",
  },
  title: {},
  fileSelectModal: {
    backgroundColor: "#efefef",
    boxShadow: "1px 1px 1px 1px #000",
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
};

function GraphPanel(props: any) {
  // Delete plot modal
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const deletePlot = () => {};

  return (
    <div
      style={{
        padding: 20,
      }}
    >
      <Grid
        container
        direction="row"
        style={{
          flex: 1,
          backgroundColor: "#eef",
          border: "solid 0.5px #bbb",
          boxShadow: "1px 3px 4px #bbd",
          borderRadius: 5,
        }}
      >
        <Grid
          style={{
            flex: 1,
            flexDirection: "column",
          }}
          xs={9}
        >
          <Grid container direction="row" xs={12}>
            <Grid
              container
              xs={6}
              direction="row"
              alignItems="center"
              style={{
                paddingLeft: 10,
              }}
            >
              <h2 style={{ marginTop: 8, marginLeft: 10, fontSize: 21 }}>
                Name of data
              </h2>
              <Button onClick={() => setDeleteModalOpen(true)}>
                <DeleteIcon
                  fontSize="small"
                  style={{ marginTop: -5 }}
                ></DeleteIcon>
              </Button>
            </Grid>
            <Grid
              container
              xs={6}
              direction="row"
              style={{
                padding: 10,
                display: "inline",
                textAlign: "right",
              }}
            >
              <Button
                variant="contained"
                size="medium"
                // onClick={}
                style={{
                  backgroundColor: "#66a",
                  color: "white",
                }}
              >
                Gate
              </Button>
              <Button
                variant="contained"
                size="medium"
                // onClick={}
                style={{
                  backgroundColor: "#66a",
                  color: "white",
                  marginLeft: 10,
                }}
              >
                Oval Gate
              </Button>
              <Button
                variant="contained"
                size="medium"
                // onClick={}
                style={{
                  backgroundColor: "#66a",
                  color: "white",
                  marginLeft: 10,
                }}
              >
                Quadrant
              </Button>
            </Grid>
          </Grid>
          <Divider
            style={{
              marginLeft: 10,
            }}
          ></Divider>
          <Grid container xs={12}>
            <Grid style={{}} xs={9}>
              <div
                style={{
                  margin: 10,
                  marginLeft: 20,
                  backgroundColor: "white",
                  borderRadius: 5,
                  boxShadow: "1px 3px 4px #bbd",
                }}
              >
                <div
                  style={{ width: 500, height: 500, backgroundColor: "#dfd" }}
                >
                  <h1> This is supposed to be a scatter plot graph </h1>
                </div>
              </div>
            </Grid>
            <Grid
              xs={3}
              container
              direction="column"
              style={{ paddingTop: 10 }}
            >
              <div
                style={{
                  textAlign: "left",
                  border: "solid 0.5px #ccc",
                  padding: 7,
                  borderRadius: 5,
                  backgroundColor: "#fafafa",
                  boxShadow: "1px 3px 4px #bbd",
                }}
              >
                <Grid xs={12} style={{ textAlign: "center" }}>
                  <h3
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    X axis
                  </h3>
                  <Divider></Divider>
                </Grid>
                <Grid
                  xs={12}
                  direction="row"
                  container
                  style={{ marginTop: 10 }}
                >
                  <Grid xs={6}>Plot Type:</Grid>
                  <Grid xs={6}>
                    <Select style={{ width: 100, marginLeft: 10 }}>
                      <MenuItem value={"lin"}>Linear</MenuItem>
                      <MenuItem value={"log"}>Log</MenuItem>
                      <MenuItem value={"bin"}>Bilinear</MenuItem>
                    </Select>
                  </Grid>
                </Grid>
                <Grid
                  xs={12}
                  direction="row"
                  container
                  style={{ marginTop: 10 }}
                >
                  <Grid xs={6}>Axis:</Grid>
                  <Grid xs={6}>
                    <Select style={{ width: 100, marginLeft: 10 }}>
                      <MenuItem value={"lin"}>FCA-1</MenuItem>
                      <MenuItem value={"log"}>FCA-1</MenuItem>
                      <MenuItem value={"bin"}>FTP-69</MenuItem>
                    </Select>
                  </Grid>
                </Grid>
                <Grid
                  xs={12}
                  direction="row"
                  container
                  style={{ marginTop: 10 }}
                >
                  <Grid xs={6}>Histogram:</Grid>
                  <Grid
                    xs={6}
                    style={{
                      textAlign: "right",
                    }}
                  >
                    <Switch
                      color="primary"
                      name="checkedB"
                      inputProps={{ "aria-label": "primary checkbox" }}
                    />
                  </Grid>
                </Grid>
              </div>
              <div
                style={{
                  textAlign: "left",
                  border: "solid 0.5px #ccc",
                  padding: 10,
                  paddingTop: 5,
                  marginTop: 10,
                  borderRadius: 5,
                  backgroundColor: "#fafafa",
                  boxShadow: "1px 3px 4px #bbd",
                }}
              >
                <Grid xs={12} style={{ textAlign: "center" }}>
                  <h3
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    Y axis
                  </h3>
                  <Divider></Divider>
                </Grid>
                <Grid
                  xs={12}
                  direction="row"
                  container
                  style={{ marginTop: 10 }}
                >
                  <Grid xs={6}>Plot Type:</Grid>
                  <Grid xs={6}>
                    <Select style={{ width: 100, marginLeft: 10 }}>
                      <MenuItem value={"lin"}>Linear</MenuItem>
                      <MenuItem value={"log"}>Log</MenuItem>
                      <MenuItem value={"bin"}>Bilinear</MenuItem>
                    </Select>
                  </Grid>
                </Grid>
                <Grid
                  xs={12}
                  direction="row"
                  container
                  style={{ marginTop: 10 }}
                >
                  <Grid xs={6}>Axis:</Grid>
                  <Grid xs={6}>
                    <Select style={{ width: 100, marginLeft: 10 }}>
                      <MenuItem value={"lin"}>FCA-1</MenuItem>
                      <MenuItem value={"log"}>FCA-1</MenuItem>
                      <MenuItem value={"bin"}>FTP-69</MenuItem>
                    </Select>
                  </Grid>
                </Grid>
                <Grid
                  xs={12}
                  direction="row"
                  container
                  style={{ marginTop: 10 }}
                >
                  <Grid xs={6}>Histogram:</Grid>
                  <Grid
                    xs={6}
                    style={{
                      textAlign: "right",
                    }}
                  >
                    <Switch
                      color="primary"
                      name="checkedB"
                      inputProps={{ "aria-label": "primary checkbox" }}
                    />
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid container direction="row" xs={3}>
          <Divider
            orientation="vertical"
            style={{
              marginLeft: 10,
              marginRight: 10,
            }}
          ></Divider>
          <Grid
            container
            direction="column"
            xs={11}
            style={{
              textAlign: "left",
              paddingTop: 12,
            }}
          >
            <h3
              style={{
                textAlign: "center",
              }}
            >
              Gates and Quadrants
            </h3>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default GraphPanel;
