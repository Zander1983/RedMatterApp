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
    height: 44,
    paddingTop: 3,
    textAlign: "left",
    border: "solid 0.5px #ccc",
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

  const xAxis = plot.plotData.xAxis;
  const yAxis = plot.plotData.yAxis;
  const xPlotType = plot.plotData.xPlotType;
  const yPlotType = plot.plotData.yPlotType;
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
        ? props.plot.plotData.xAxisToHistogram()
        : props.plot.plotData.yAxisToHistogram();
    } else {
      axis === "x"
        ? props.plot.plotData.setYAxis(oldYAxis)
        : props.plot.plotData.setXAxis(oldXAxis);
    }
  };

  const setAxis = (axis: "x" | "y", value: string) => {
    const otherAxisValue = axis == "x" ? yAxis : xAxis;
    if (value == otherAxisValue && !isPlotHistogram()) {
      setHistogram(axis == "x" ? "y" : "x", true);
    } else {
      axis == "x"
        ? props.plot.plotData.setXAxis(value)
        : props.plot.plotData.setYAxis(value);
    }
  };

  const setPlotType = (axis: "x" | "y", value: string) => {
    axis == "x"
      ? props.plot.plotData.setXAxisPlotType(value)
      : props.plot.plotData.setYAxisPlotType(value);
  };

  const [lastSelectEvent, setLastSelectEvent] = React.useState(0);
  const handleSelectEvent = (e: any, func: Function) => {
    if (lastSelectEvent + 500 < new Date().getTime()) {
      func(e);
      setLastSelectEvent(new Date().getTime());
    }
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
            disabled={true || isAxisDisabled("x") || isPlotHistogram()}
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
            onChange={(e) =>
              handleSelectEvent(e, (e: any) => setAxis("x", e.target.value))
            }
            disabled={isAxisDisabled("x")}
            value={xAxis}
          >
            {plot.plotData.file.axes.map((e: any) => (
              <MenuItem value={e}>{e}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid>
          <b
            style={{
              marginRight: 10,
              display: "inline",
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
            disabled={true || isAxisDisabled("y") || isPlotHistogram()}
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
            onChange={(e) =>
              handleSelectEvent(e, (e: any) => setAxis("y", e.target.value))
            }
            disabled={isAxisDisabled("y")}
            value={yAxis}
          >
            {plot.plotData.file.axes.map((e: any) => (
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
