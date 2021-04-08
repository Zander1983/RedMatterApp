import React, { useEffect } from "react";
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

function useForceUpdate() {
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

export default function AxisBar(props: any) {
  const plot = props.plot;
  const rerender = useForceUpdate();

  const xAxis = plot.xAxis;
  const yAxis = plot.yAxis;
  const xPlotType = plot.xPlotType;
  const yPlotType = plot.yPlotType;
  const [xHistogram, setXHistogram] = React.useState(false);
  const [yHistogram, setYHistogram] = React.useState(false);
  const [oldXAxis, setOldXAxis] = React.useState(null);
  const [oldYAxis, setOldYAxis] = React.useState(null);

  const isAxisDisabled = (axis: "x" | "y") => {
    return axis === "x" ? yHistogram : xHistogram;
  };

  const isPlotHistogram = () => {
    return isAxisDisabled("y") || isAxisDisabled("x");
  };

  const setHistogram = (axis: "x" | "y", value: boolean) => {
    axis === "x" ? setXHistogram(value) : setYHistogram(value);

    if (value) {
      axis === "x" ? setOldYAxis(yAxis) : setOldXAxis(xAxis);
      axis === "x"
        ? props.plot.xAxisToHistogram()
        : props.plot.yAxisToHistogram();
    } else {
      axis === "x"
        ? props.plot.setYAxis(oldYAxis)
        : props.plot.setXAxis(oldXAxis);
    }
  };

  const setAxis = (axis: "x" | "y", value: string) => {
    const otherAxisValue = axis == "x" ? yAxis : xAxis;
    if (value == otherAxisValue && !isPlotHistogram()) {
      setHistogram(axis == "x" ? "y" : "x", true);
    } else {
      axis == "x" ? props.plot.setXAxis(value) : props.plot.setYAxis(value);
    }
  };

  const setPlotType = (axis: "x" | "y", value: string) => {
    axis == "x"
      ? props.plot.setXAxisPlotType(value)
      : props.plot.setYAxisPlotType(value);
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
            disabled={isAxisDisabled("x") || isPlotHistogram()}
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
            value={xAxis}
          >
            {plot.getFile().axes.map((e: any) => (
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
            disabled={isAxisDisabled("y") || isPlotHistogram()}
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
            {plot.getFile().axes.map((e: any) => (
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
