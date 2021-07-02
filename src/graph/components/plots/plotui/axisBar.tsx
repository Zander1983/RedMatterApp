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

  const xPlotType = plot.plotData.xPlotType;
  const yPlotType = plot.plotData.yPlotType;

  const isAxisDisabled = (axis: "x" | "y") => {
    return axis === "x" ? plot.plotData.yHistogram : plot.plotData.xHistogram;
  };

  const isPlotHistogram = () => {
    return plot.plotData.xHistogram || plot.plotData.yHistogram;
  };

  const setPlotType = (axis: "x" | "y", value: string) => {
    axis == "x"
      ? props.plot.plotData.setXAxisPlotType(value)
      : props.plot.plotData.setYAxisPlotType(value);
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
            <MenuItem value={"bi"}>Logicle</MenuItem>
            {/* <MenuItem value={"bin"}>Bilinear</MenuItem> */}
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
            checked={plot.plotData.xHistogram}
            disabled={isAxisDisabled("x")}
            onChange={(_, checked) => props.histogramCallback("x", checked)}
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
            <MenuItem value={"bi"}>Logicle</MenuItem>
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
            checked={props.plot.plotData.yHistogram}
            disabled={isAxisDisabled("y")}
            onChange={(_, checked) => props.histogramCallback("y", checked)}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
