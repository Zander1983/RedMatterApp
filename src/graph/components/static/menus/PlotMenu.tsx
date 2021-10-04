import React from "react";

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

import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import { Plot, PopulationGateType } from "graph/resources/types";
import { createPlot } from "graph/resources/plots";
import PlotStats from "graph/utils/stats";
import { getFile, getGate, getPopulation } from "graph/utils/workspace";
import WorkspaceDispatch from "graph/resources/dispatchers";

const statsProvider = new PlotStats();

export default function PlotMenu(props: {
  plots: Plot[];
  onStatChange: (params: { x: any; value: any }) => void;
}) {
  const populations = props.plots.map((e) => getPopulation(e.population));

  const [statsX, setStatsX] = React.useState(
    COMMON_CONSTANTS.DROPDOWNS.STATS.Median
  );
  const [statsY, setStatsY] = React.useState(
    COMMON_CONSTANTS.DROPDOWNS.STATS.Median
  );

  const getDropdownValue = (e: string) => {
    let statObj: {
      [key: string]: number;
    } = COMMON_CONSTANTS.DROPDOWNS.STATS;
    return statObj[e];
  };

  const setPlotLabel = (plot: Plot, label: string) => {
    plot.label = label;
    WorkspaceDispatch.UpdatePlot(plot);
  };

  const deletePlot = (plot: Plot) => {
    WorkspaceDispatch.DeletePlot(plot);
  };

  const clonePlot = (plot: Plot) => {
    let newPlot = createPlot({
      clonePlot: plot,
    });
    newPlot.label = plot.label + " clone";
    WorkspaceDispatch.AddPlot(newPlot);
  };

  let percentages: any[] = [];

  const getMean = (list: Array<number>) => {
    let sum = 0;
    list.forEach((e) => (sum += e));
    let count = list.length;
    return sum / count;
  };

  const getStandardDeviation = (list: Array<number>) => {
    let mean = getMean(list);

    let squareSum = 0;

    for (let i = 0; i < list.length; i++) {
      squareSum += Math.pow(list[i] - mean, 2);
    }

    let divideByNMinus1 = squareSum / list.length;

    let sd = Math.sqrt(divideByNMinus1);

    return sd;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
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
                  props.onStatChange({
                    x: true,
                    value: parseInt(e.target.value.toString()),
                  });
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
                  props.onStatChange({
                    x: false,
                    value: parseInt(e.target.value.toString()),
                  });
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
          {props.plots.map((plot, i) => {
            const type =
              plot.xAxis === plot.yAxis ? "histogram" : "scatterplot";
            let stats = statsProvider.getPlotStats(plot, statsX, statsY);
            let percentageToFloat: number = 0;
            let meanPlusStandard: number = 0;
            let meanMinusStandard: number = 0;
            if (i > 0) {
              percentageToFloat = parseFloat(
                stats.gatedFilePopulationPercentage.slice(0, -1)
              );

              percentages.push(percentageToFloat);
              let mean = getMean(percentages);
              let standard = getStandardDeviation(percentages);
              meanPlusStandard = mean + standard;
              meanMinusStandard = mean - standard;
            }

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
                      setPlotLabel(plot, newLabel);
                    }}
                  />
                </TableCell>
                <TableCell>{getFile(populations[i].file).name}</TableCell>
                <TableCell>
                  {populations[i].gates.length === 0
                    ? "All"
                    : populations[i].gates
                        .map((e: PopulationGateType) => (
                          <b
                            style={{
                              color: getGate(e.gate).color,
                            }}
                          >
                            {e.inverseGating ? (
                              <b style={{ color: "#f00" }}>not </b>
                            ) : null}{" "}
                            {getGate(e.gate).name}
                          </b>
                        ))
                        //@ts-ignore
                        .reduce((prev, curr) => [prev, " & ", curr])}
                </TableCell>
                <TableCell>
                  {stats.gatedFilePopulationSize} / {stats.filePopulationSize}
                </TableCell>
                <TableCell
                  style={{
                    color:
                      percentageToFloat > meanPlusStandard
                        ? "red"
                        : percentageToFloat < meanMinusStandard
                        ? "orange"
                        : "black",
                  }}
                >
                  {stats.gatedFilePopulationPercentage}{" "}
                  {percentageToFloat > meanPlusStandard ||
                  percentageToFloat < meanMinusStandard
                    ? "(Outlier)"
                    : null}
                </TableCell>
                <TableCell>{stats.statX}</TableCell>
                <TableCell>
                  {type === "histogram" ? "~" : stats.statY}
                </TableCell>
                <TableCell>{stats.pointsOutSideOfRangeObj.count}</TableCell>
                <TableCell>
                  {stats.pointsOutSideOfRangeObj.percentage}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
