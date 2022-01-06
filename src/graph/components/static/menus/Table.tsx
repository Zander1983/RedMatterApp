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
    backgroundColor: "#6666AA",
    height: "35vh",
    width: "80vw",
    marginLeft: "10vw",
    color: "white",
    padding: 20,
  },
  tableCell: { width: "25%", color: "white", border: "1px white solid" },
}));

interface TableProps {
  workspace: Workspace;
}

const statsProvider = new PlotStats();

const PlotTable = ({ workspace }: TableProps) => {
  const classes = useStyles();
  const [headers, setHeaders] = useState<string[]>(["File Name", "All"]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [data, setData] = useState([]);

  const raws: any[] = [];
  let gateLength: number = 1;
  const fillUpRows = () => {
    for (let i = 0; i < workspace.files.length; i++) {
      const raw = [];
      for (let j = 0; j < workspace.plots.length; j += workspace.files.length) {
        raw.push(statistics[i + j]?.gatedFilePopulationPercentage);
      }
      raws.push(raw);
    }
    setData(raws);
  };

  let stats: any[] = [];
  useEffect(() => {
    gateLength = workspace.gates.length;
    setFileNames(workspace.files.map((file) => file.name));
    workspace.plots.map((plot) => {
      stats.push(statsProvider.getPlotStats(plot, 1, 1));
    });

    setStatistics(stats);
  }, [workspace]);

  useEffect(() => {
    setHeaders([
      "File Name",
      "All",
      ...workspace.gates.map((gate) => gate.name),
    ]);
  }, [workspace.gates]);

  useEffect(() => {
    fillUpRows();
  }, [headers]);

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
{
  /* <div className={classes.container}>
  <table>
    <thead>
      <tr>
        <th> File Name </th>
        <th> X-Axis Name </th>
        <th> Y-Axis Name </th>
        <th> Percentage </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
      </tr>
    </tbody>
  </table>
</div> */
}
