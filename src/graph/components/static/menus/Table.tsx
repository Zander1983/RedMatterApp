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

import upArrow from "./../../../../assets/images/up_arrow.png";
import downArrow from "./../../../../assets/images/down_arrow.png";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "absolute",
    zIndex: 2,
    top: "78vh",
    backgroundColor: "#F0F0FE",
    width: "100%",
    color: "#333",
    padding: 20,
  },
  tableCell: {
    width: "auto",
    color: "#333",
    border: "1px #333 solid",
    textAlign: "center",
    padding: "5px !important",
  },
  view: {
    textDecoration: "underline",
    cursor: "pointer",
  },
  otherFiles: {
    height: "15vh",
    transition: "height 1s ease",
  },
  arrow: {
    height: 15,
    width: 10,
    marginLeft: 5,
    cursor: "pointer",
  },
}));

interface TableProps {
  workspace: Workspace;
}

const statsProvider = new PlotStats();

const PlotTable = ({ workspace }: TableProps) => {
  const classes = useStyles();
  const [headers, setHeaders] = useState<string[]>([
    "File Name",
    "Click to View",
  ]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [data, setData] = useState([]);
  const [fileToBeViewed, setFileToBeViewed] = useState<string>("");

  const raws: any[] = [];
  let gateLength: number = 1;
  const fillUpRows = () => {
    for (let i = 0; i < workspace.files.length; i++) {
      const raw = [fileNames[i]];
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
            stats.push(statsProvider.getPlotStatsWithFiles(file, population));
          }
        });
      }
    });
    setStatistics(stats);
  };

  const sortByColumn = (colIndex: number, type: string) => {
    let array = data;

    // filtering out the neumeric values from the string
    array = array.map((arr) => {
      return arr.map((value: any, index: number) => {
        if (index) {
          return parseFloat(value.match(/[-+]?([0-9]*\.[0-9]+|[0-9]+)/));
        } else {
          return value;
        }
      });
    });

    array.sort(sortFunction);

    // this is the sort function
    function sortFunction(a: string[], b: string[]) {
      if (a[colIndex] === b[colIndex]) {
        return 0;
      } else {
        if (type === "asc") {
          return a[colIndex] < b[colIndex] ? -1 : 1;
        } else if (type === "dsc") {
          return a[colIndex] > b[colIndex] ? -1 : 1;
        }
      }
    }

    // converting the neumeric values to suitable string format
    array = array.map((arr) => {
      return arr.map((value: number, index: number) => {
        if (index) {
          if (value === 1) {
            return `< ${value}%`;
          } else {
            return `${value} %`;
          }
        } else {
          return value;
        }
      });
    });

    setData(array);
  };

  useEffect(() => {
    gateLength = workspace.gates.length;
    setFileNames(workspace.files.map((file) => file.name));

    // works with files and events (takes less time)
    updateStats();
  }, [workspace]);

  useEffect(() => {
    workspace.files.map((file) => setData((prev) => [...prev, [file.name]]));
  }, [workspace.files.length]);

  useEffect(() => {
    setHeaders([
      "File Name",
      ...workspace.gates.map((gate) => gate.name),
      "Click to View",
    ]);
  }, [workspace.gates]);

  useEffect(() => {
    fillUpRows();
  }, [statistics]);

  return (
    <TableContainer component={Paper} className={classes.container}>
      <Table style={{ overflowY: "scroll" }}>
        <TableHead>
          <TableRow>
            {headers.map((values, index) => (
              <TableCell className={classes.tableCell} key={"top-"+ index}>
                {values}
                {index !== 0 && index !== headers.length - 1 && (
                  <>
                    <img
                      onClick={() => {
                        sortByColumn(index, "asc");
                      }}
                      src={downArrow}
                      alt="down-arrow"
                      className={classes.arrow}
                    />
                    <img
                      onClick={() => {
                        sortByColumn(index, "dsc");
                      }}
                      src={upArrow}
                      alt="up-arrow"
                      className={classes.arrow}
                    />
                  </>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {workspace?.files?.map((files, i) => (
            <>
              <TableRow key={"file-" + i}>
                {headers.length > 1 &&
                  data.length > 0 &&
                  data[i]?.map((value: any, index: any) => (
                    <TableCell
                      className={classes.tableCell}
                      key={"content-" + value}
                    >
                      {value || "NA"}
                    </TableCell>
                  ))}
                <TableCell
                  className={`${classes.tableCell}  ${classes.view}`}
                  onClick={() =>
                    setFileToBeViewed(
                      fileToBeViewed === fileNames[i] ? "" : fileNames[i]
                    )
                  }
                >
                  {fileToBeViewed === fileNames[i] ? "Close" : "View"}
                </TableCell>
              </TableRow>

              {fileToBeViewed === fileNames[i] && (
                <TableRow className={classes.otherFiles}/>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default PlotTable;
