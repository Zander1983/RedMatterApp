import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { Workspace } from "graph/resources/types";
import PlotStats from "graph/utils/stats";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "absolute",
    zIndex: 500,
    bottom: "-13vh",
    backgroundColor: "#333",
    height: "35vh",
    width: "100%",
    color: "white",
    padding: 20,
  },
  tableCell: {
    width: "25%",
    color: "white",
    border: "1px white solid",
    textAlign: "center",
    padding: "5px !important",
  },
}));

interface TableProps {
  workspace: Workspace;
}

const statsProvider = new PlotStats();

const PlotTable = ({ workspace }: TableProps) => {
  const classes = useStyles();
  const [headers, setHeaders] = useState<string[]>(["File Name"]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [data, setData] = useState([]);

  const raws: any[] = [];
  let gateLength: number = 1;
  const fillUpRows = () => {
    for (let i = 0; i < workspace.files.length; i++) {
      const raw = [];
      for (let j = 0; j < statistics.length; j += workspace.files.length) {
        if (statistics[i + j]?.gatedFilePopulationPercentage) {
          raw.push(statistics[i + j]?.gatedFilePopulationPercentage);
        }
      }

      if (!raw.includes(undefined)) {
        raws.push(raw);
      }
    }
    setData(raws);
  };

  const updateStats = () => {
    let stats: any[] = [];
    workspace.populations.map((population) => {
      if (population.gates.length > 0) {
        workspace.files.map((file) => {
          if (workspace.plots.length > 0) {
            const { xAxis, yAxis } = workspace.plots[0];
            const { gates } = population;
            stats.push(
              statsProvider.getPlotStatsWithFiles(
                file,
                gates,
                1,
                1,
                xAxis,
                yAxis
              )
            );
          }
        });
      }
    });
    setStatistics(stats);
  };

  useEffect(() => {
    gateLength = workspace.gates.length;
    setFileNames(workspace.files.map((file) => file.name));
    // works with plot (takes so much time)
    // workspace.plots.map((plot, id) => {
    //   id && stats.push(statsProvider.getPlotStats(plot, 1, 1));
    // });

    // works with files and events (takes less time)
    updateStats();
  }, [workspace]);

  useEffect(() => {
    setHeaders(["File Name", ...workspace.gates.map((gate) => gate.name)]);
  }, [workspace.gates]);

  useEffect(() => {
    fillUpRows();
  }, [statistics]);

  return (
    <TableContainer component={Paper} className={classes.container}>
      <Table style={{ overflowY: "scroll" }}>
        <TableHead>
          <TableRow>
            {headers.map((values) => (
              <TableCell className={classes.tableCell} key={values}>
                {values}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {workspace?.files?.map((files, i) => (
            <TableRow key={i}>
              <TableCell className={classes.tableCell}>
                {fileNames[i]}
              </TableCell>
              {headers.length > 1 &&
                data.length > 0 &&
                data[i]?.map((value: any, index: any) => (
                  <TableCell className={classes.tableCell} key={index + value}>
                    {value}
                  </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default PlotTable;
