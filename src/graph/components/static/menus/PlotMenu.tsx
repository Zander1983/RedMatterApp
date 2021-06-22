import React, { useEffect } from "react";
import { Button } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import Delete from "@material-ui/icons/Delete";
import FileCopy from "@material-ui/icons/FileCopy";

import Overlays from "./overlays/Overlays";

import dataManager from "graph/dataManagement/dataManager";
import PlotStats from "graph/dataManagement/stats";
import ObserverList from "graph/dataManagement/observeList";
import PlotData from "graph/dataManagement/plotData";
import ObserversFunctionality from "graph/dataManagement/observersFunctionality";

import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import { getValue } from "@amcharts/amcharts4/.internal/core/utils/Type";

interface Dictionary {
  [key: string]: number;
}

const classes = {
  table: {},
};

const statsProvider = new PlotStats();

export default function PlotMenu(props: {
  onStatChange: (statObj: any) => void
}) : JSX.Element {
  const observerListProvider = new ObserverList();
  const [plots, setPlots] = React.useState([]);
  const [setup, setSetup] = React.useState(false);
  const [statsX, setStatsX] = React.useState(
    COMMON_CONSTANTS.DROPDOWNS.STATS.Median
  );
  const [statsY, setStatsY] = React.useState(
    COMMON_CONSTANTS.DROPDOWNS.STATS.Median
  );

  const setupObservers = () => {
    observerListProvider.setup(
      (newList: ObserversFunctionality[]) => {
        setPlots(newList);
      },
      () => dataManager.getAllPlots().map((e) => e.plot),
      (id: string) => dataManager.getPlot(id),
      dataManager,
      ["addNewPlotToWorkspace", "removePlotFromWorkspace", "clearWorkspace"],
      ["plotUpdated"]
    );
  };

  const getDropdownValue = (e: string) => {
    let statObj: Dictionary = COMMON_CONSTANTS.DROPDOWNS.STATS;
    return statObj[e];
  };

  const deletePlot = (plot: PlotData) => {
    dataManager.removePlotFromWorkspace(plot.id);
  };

  const clonePlot = (plot: PlotData) => {
    const newPlot = new PlotData();
    newPlot.setState(plot.getState());
    dataManager.addNewPlotToWorkspace(newPlot);
  };

  useEffect(() => {
    if (!setup) {
      setupObservers();
      setSetup(true);
    }
    return () => {
      observerListProvider.kill();
    };
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table style={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell>Overlays</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>From file</TableCell>
            <TableCell>Population</TableCell>
            <TableCell>Brute #</TableCell>
            <TableCell>Percentage</TableCell>
            <TableCell>
              <Select
                value={statsX}
                onChange={(e) => {
                  setStatsX(parseInt(e.target.value.toString()));
                  props.onStatChange({x: true, value: parseInt(e.target.value.toString())});
                }}
              >
                {Object.keys(COMMON_CONSTANTS.DROPDOWNS.STATS).map(
                  (e: string) => (
                    <MenuItem value={getDropdownValue(e)}>{`${e} X`}</MenuItem>
                  )
                )}
              </Select>
            </TableCell>
            <TableCell>
              <Select
                value={statsY}
                onChange={(e) => {
                  setStatsY(parseInt(e.target.value.toString()));
                  props.onStatChange({x: false, value: parseInt(e.target.value.toString())});
                }}
              >
                {Object.keys(COMMON_CONSTANTS.DROPDOWNS.STATS).map(
                  (e: string) => (
                    <MenuItem value={getDropdownValue(e)}>{`${e} Y`}</MenuItem>
                  )
                )}
              </Select>
            </TableCell>
            <TableCell>Points outside</TableCell>
            <TableCell>% of Points outside</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plots.map((plot) => {
            const type =
              plot.xAxis === plot.yAxis ? "histogram" : "scatterplot";
            let stats = statsProvider.getPlotStats(plot, statsX, statsY);
            return (
              <TableRow key={plot.id}>
                <TableCell>
                  <Button
                    style={{
                      display: "inline-block",
                      padding: 0,
                      minWidth: 0,
                    }}
                    onClick={() => deletePlot(plot)}
                  >
                    <Delete></Delete>
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    style={{
                      display: "inline-block",
                      padding: 0,
                      minWidth: 0,
                    }}
                    onClick={() => clonePlot(plot)}
                  >
                    <FileCopy></FileCopy>
                  </Button>
                </TableCell>
                <TableCell>
                  <Overlays plot={plot}></Overlays>
                </TableCell>
                <TableCell>{type}</TableCell>
                <TableCell>
                  <TextField
                    value={plot.label}
                    inputProps={{ "aria-label": "naked" }}
                    placeholder="Context of the plot"
                    style={{
                      fontSize: 14,
                    }}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      plot.update({ label: newLabel });
                    }}
                  />
                </TableCell>
                <TableCell>{plot.file.name}</TableCell>
                <TableCell>
                  {plot.population.length === 0
                    ? "All"
                    : plot.population
                        .reverse()
                        .map((e: any) => (
                          <b
                            style={{
                              color: e.gate.color,
                            }}
                          >
                            {e.inverseGating ? (
                              <b style={{ color: "#f00" }}>not </b>
                            ) : null}{" "}
                            {e.gate.name}
                          </b>
                        ))
                        //@ts-ignore
                        .reduce((prev, curr) => [prev, " & ", curr])}
                </TableCell>
                <TableCell>
                  {stats.gatedFilePopulationSize} / {stats.filePopulationSize}
                </TableCell>
                <TableCell>{stats.gatedFilePopulationPercentage}</TableCell>
                <TableCell>
                  {type === "histogram" && plot.histogramAxis === "horizontal"
                    ? "~"
                    : stats.statX}
                </TableCell>
                <TableCell>
                  {type === "histogram" && plot.histogramAxis === "vertical"
                    ? "~"
                    : stats.statY}
                </TableCell>
                <TableCell>{stats.pointsOutSideOfRangeObj.count}</TableCell>
                <TableCell>{stats.pointsOutSideOfRangeObj.percentage}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
