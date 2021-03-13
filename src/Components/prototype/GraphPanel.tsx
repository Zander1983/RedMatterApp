import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import { Divider } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";

import DeleteIcon from "@material-ui/icons/Delete";

import ScatterPlotGraph from "./graph/ScatterPlotGraph";
import { JsxEmit } from "typescript";
import { ConsoleSqlOutlined } from "@ant-design/icons";
// import HistogramPlotGraph from "./graph/HistogramPlotGraph";

interface GraphPanel {
  file: {
    title: string;
    lastModified: string;
    data: number[][];
    information: string;
  };
}

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

function GraphPanel(props: {
  file: {
    title: string;
    information: string;
    data: Array<Array<number>>;
    lastModified: string;
    axes: Array<{ key: number; value: string; display: string }>;
  };
  interaction: {
    deletePanel(key: number): void;
  };
  index: number;
}) {
  // Base draw components
  let scatterPlotGraph: ScatterPlotGraph | null = null;
  // let histogramPlotGraph: HistogramPlotGraph | null = null;

  const [gates, setGates] = React.useState(
    Array.from({ length: Math.round(Math.random() * 8) }, (v, i) => i + 1)
  );
  console.log(gates);
  // Constant params
  const axes: Array<{ key: number; value: string; display: string }> =
    props.file.axes;
  const data: Array<Array<number>> = props.file.data;

  // Changable params
  let parsedData: Array<[number, number]>;
  let xAxis: { key: number; value: string; display: string } =
    props.file.axes[0];
  let yAxis: { key: number; value: string; display: string } =
    props.file.axes[1];

  const parseAxis = (
    xAxis: { key: number; value: string; display: string },
    yAxis: { key: number; value: string; display: string }
  ) => {
    parsedData = data.map((p: Array<number>): [number, number] => {
      return [p[xAxis.key], p[yAxis.key]];
    });
  };

  const parseData = () => {
    parseAxis(xAxis, yAxis);
    scatterPlotGraph = (
      <ScatterPlotGraph data={parsedData} xAxis={xAxis} yAxis={yAxis} />
    );
  };

  parseData();

  // Interaction with parent

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
              <h1 style={{ marginTop: 12, marginLeft: 10 }}>Name of data</h1>
              <Button
                onClick={() => props.interaction.deletePanel(props.index)}
                style={{ marginLeft: 10 }}
              >
                <DeleteIcon></DeleteIcon>
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
                size="large"
                // onClick={}
                style={{
                  backgroundColor: "#66a",
                  color: "white",
                }}
              >
                Create Gate
              </Button>
              <Button
                variant="contained"
                size="large"
                // onClick={}
                style={{
                  backgroundColor: "#66a",
                  color: "white",
                  marginLeft: 10,
                }}
              >
                Some other action....
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
                {scatterPlotGraph}
              </div>
              {/* xAxis == yAxis ? histogramPlotGraph : scatterPlotGraph */}
            </Grid>
            <Grid xs={3} container direction="column" style={{}}>
              <div
                style={{
                  textAlign: "left",
                  border: "solid 0.5px #ccc",
                  padding: 10,
                  paddingTop: 5,
                  borderRadius: 5,
                  backgroundColor: "#fafafa",
                  margin: 10,
                  boxShadow: "1px 3px 4px #bbd",
                }}
              >
                <Grid xs={12} style={{ textAlign: "center" }}>
                  <h2
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    X axis
                  </h2>
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
                  borderRadius: 5,
                  margin: 10,
                  backgroundColor: "#fafafa",
                  boxShadow: "1px 3px 4px #bbd",
                }}
              >
                <Grid xs={12} style={{ textAlign: "center" }}>
                  <h2
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    Y axis
                  </h2>
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
            <h2
              style={{
                textAlign: "center",
              }}
            >
              Gates
            </h2>
            <Divider></Divider>
            <div
              style={{
                overflowY: "scroll",
                maxHeight: 624,
                padding: 5,
                borderBottom: "solid 1px #ddf",
                backgroundColor: "#e5e5ff",
                borderRadius: 5,
              }}
            >
              {gates.map((e) => {
                return (
                  <div
                    style={{
                      boxShadow: "1px 3px 4px #bbd",
                      border: "solid 0.4px #ccc",
                      backgroundColor: "#fafafa",
                      borderRadius: 5,
                      padding: 10,
                      paddingTop: 0,
                      marginBottom: 10,
                    }}
                  >
                    <Grid container xs={12} direction="row" style={{}}>
                      <h3 style={{ marginTop: 5 }}>Gate{e}</h3>
                      <Button style={{ marginLeft: 10 }}>
                        <DeleteIcon></DeleteIcon>
                      </Button>
                    </Grid>
                    <Grid>
                      <TextField placeholder="Gate color"></TextField>
                    </Grid>
                  </div>
                );
              })}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default GraphPanel;
