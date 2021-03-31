import React from "react";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";

const classes = {
  axisBar: {
    marginTop: 10,
    marginBottom: 10,
  },
  axisBarAxis: {
    textAlign: "left",
    border: "solid 0.5px #ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fafafa",
    boxShadow: "1px 3px 4px #bbd",
  },
};

export default function AxisBar(props: any) {
  const canvas = props.canvas;

  const xAxis = canvas.xAxis;
  const yAxis = canvas.yAxis;
  const xPlotType = canvas.xPlotType;
  const yPlotType = canvas.yPlotType;
  const [xHistogram, setXHistogram] = React.useState(false);
  const [yHistogram, setYHistogram] = React.useState(false);
  const [oldXAxis, setOldXAxis] = React.useState(null);
  const [oldYAxis, setOldYAxis] = React.useState(null);

  const isAxisDisabled = (axis: "x" | "y") => {
    return axis === "x" ? yHistogram : xHistogram;
  };

  const isCanvasHistogram = () => {
    return isAxisDisabled("y") || isAxisDisabled("x");
  };

  const setHistogram = (axis: "x" | "y", value: boolean) => {
    axis === "x" ? setXHistogram(value) : setYHistogram(value);

    if (value) {
      axis === "x" ? setOldYAxis(yAxis) : setOldXAxis(xAxis);
      axis === "x"
        ? props.canvas.xAxisToHistogram()
        : props.canvas.yAxisToHistogram();
    } else {
      axis === "x"
        ? props.canvas.setYAxis(oldYAxis)
        : props.canvas.setXAxis(oldXAxis);
    }
  };

  const setAxis = (axis: "x" | "y", value: string) => {
    const otherAxisValue = axis == "x" ? yAxis : xAxis;
    if (value == otherAxisValue && !isCanvasHistogram()) {
      setHistogram(axis == "x" ? "y" : "x", true);
    } else {
      axis == "x" ? props.canvas.setXAxis(value) : props.canvas.setYAxis(value);
    }
  };

  const setPlotType = (axis: "x" | "y", value: string) => {
    axis == "x"
      ? props.canvas.setXAxisPlotType(value)
      : props.canvas.setYAxisPlotType(value);
  };

  return (
    <Grid xs={12} container direction="column" style={classes.axisBar}>
      <Grid
        container
        direction="row"
        justify="space-evenly"
        //@ts-ignore
        style={classes.axisBarAxis}
      >
        <Grid>
          <h3
            style={{
              marginTop: 1,
            }}
          >
            X axis
          </h3>
        </Grid>
        <Grid>
          <b>Type:</b>
          <Select
            style={{ width: 100, marginLeft: 10 }}
            disabled={isAxisDisabled("x") || isCanvasHistogram()}
            value={xPlotType}
            //@ts-ignore
            onChange={(e) => setPlotType("x", e.target.value)}
          >
            <MenuItem value={"lin"}>Linear</MenuItem>
            <MenuItem value={"log"}>Log</MenuItem>
            {/* <MenuItem value={"bin"}>Bilinear</MenuItem> */}
          </Select>
        </Grid>
        <Grid>
          <b>Axis:</b>
          <Select
            style={{ width: 100, marginLeft: 10 }}
            //@ts-ignore
            onChange={(e) => setAxis("x", e.target.value)}
            disabled={isAxisDisabled("x")}
            value={canvas.xAxis}
          >
            {canvas.getFile().axes.map((e: any) => (
              <MenuItem value={e}>{e}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid>
          <b
            style={{
              marginRight: 10,
            }}
          >
            Histogram:
          </b>
          <Switch
            color="primary"
            name="checkedB"
            inputProps={{ "aria-label": "primary checkbox" }}
            checked={xHistogram}
            disabled={isAxisDisabled("x")}
            onChange={(_, checked) => setHistogram("x", checked)}
          />
        </Grid>
      </Grid>

      <Grid
        container
        direction="row"
        justify="space-evenly"
        //@ts-ignore
        style={{ ...classes.axisBarAxis, marginTop: 10 }}
      >
        <Grid>
          <h3
            style={{
              marginTop: 1,
            }}
          >
            Y axis
          </h3>
        </Grid>
        <Grid>
          <b>Type:</b>
          <Select
            style={{ width: 100, marginLeft: 10 }}
            value={yPlotType}
            disabled={isAxisDisabled("y") || isCanvasHistogram()}
            //@ts-ignore
            onChange={(e) => setPlotType("y", e.target.value)}
          >
            <MenuItem value={"lin"}>Linear</MenuItem>
            <MenuItem value={"log"}>Log</MenuItem>
          </Select>
        </Grid>
        <Grid>
          <b>Axis:</b>
          <Select
            style={{ width: 100, marginLeft: 10 }}
            //@ts-ignore
            onChange={(e) => setAxis("y", e.target.value)}
            disabled={isAxisDisabled("y")}
            value={yAxis}
          >
            {canvas.getFile().axes.map((e: any) => (
              <MenuItem value={e}>{e}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid>
          <b
            style={{
              marginRight: 10,
            }}
          >
            Histogram:
          </b>
          <Switch
            color="primary"
            name="checkedB"
            inputProps={{ "aria-label": "primary checkbox" }}
            checked={yHistogram}
            disabled={isAxisDisabled("y")}
            onChange={(_, checked) => setHistogram("y", checked)}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
