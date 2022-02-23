import React, { useEffect, useState } from "react";
import {
  File,
  Workspace as WorkspaceType,
  Workspace,
} from "../../resources/types";

import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import { makeStyles } from "@material-ui/core";
import PlotStats from "graph/utils/stats";
import { useSelector } from "react-redux";
import infoIcon from "assets/images/info.png";
import { getWorkspace } from "graph/utils/workspace";
import { Tooltip } from "@material-ui/core";
const statsProvider = new PlotStats();

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: "#FAFAFA",
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
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: 500,
    padding: "2px 5px",
    background: "#333333",
    minWidth: 90,
    margin: "0px 8px",
    borderRadius: 5,
  },
  arrow: {
    height: 15,
    width: 10,
    marginLeft: 5,
    cursor: "pointer",
  },
  delete: {
    height: 15,
    width: 15,
    marginLeft: 10,
    cursor: "pointer",
  },
  itemOuterDiv: {
    flex: 1,
    border: "solid 0.5px #bbb",
    boxShadow: "1px 3px 4px #bbd",
    borderRadius: 5,
    paddingBottom: "2rem",
    minWidth: 370,
    backgroundColor: "rgb(238, 238, 255)",
  },
  itemInnerDiv: {
    width: "100%",
    height: "100%",
  },
  show: {
    opacity: 1,
    display: "block",
  },
  hide: {
    opacity: 0,
    display: "none",
    transition: "opacity 1s ease-out",
  },
  responsiveContainer: {
    marginTop: 3,
    marginBottom: 10,
  },
  loaderContainerStyle: {
    position: "relative",
    left: "45vw",
    height: 419,
  },
  loader: {
    width: 50,
    height: 50,
  },
}));

interface Props {
  onRowClick: Function;
  file: File;
  isOpen: boolean;
}

const PlotStateComponent = ({ file, onRowClick, isOpen }: Props) => {
  const classes = useStyles();

  //@ts-ignore
  const workspace: WorkspaceType = useSelector((state) => state.workspace);

  const [data, setData] = useState([]);

  const raws: any[] = [];

  const fillUpRows = (statistics: any[]) => {
    let raw = [file.id];

    for (let i = 0; i < statistics.length; i += 1) {
      if (statistics[i]?.gatedFilePopulationPercentage) {
        raw.push(statistics[i]?.gatedFilePopulationPercentage);
      }
    }
    raw.push(file.view ? "Close" : "View");

    // Removing unnecessary extra values
    if (raw.length < workspace.gates.length + 2) {
      raw = [
        raw[0],
        ...raw.slice(1, workspace.gates.length),
        raw[raw.length - 1] === "View" || "Close" ? "--" : raw[raw.length - 2],
        raw[raw.length - 1],
      ];
    } else {
      raw = [
        raw[0],
        ...raw.slice(1, 1 + workspace.gates.length),
        raw[raw.length - 1],
      ];
    }

    if (!raw.includes(undefined)) {
      raws.push(raw);
    }

    setData(raws[0]);
  };

  const updateStats = () => {
    let stats: any[] = [];
    let i = 0;
    workspace.populations.map((population) => {
      if (
        population.gates.length > 0 &&
        workspace.selectedFile === population.file
      ) {
        stats.push(statsProvider.getPlotStatsWithFiles(file, population));
      }
    });
    fillUpRows(stats);
  };

  useEffect(() => {
    updateStats();
  }, [workspace]);

  // console.log("== Plot state ==", file.name);
  const renderStateRow = () => {
    return (
      <TableRow>
        {data !== undefined &&
          // headers.length > 1 &&
          data.length > 0 &&
          data?.map((value: any, i: any) =>
            i === 0 ? (
              <TableCell
                className={`${classes.tableCell}`}
                key={"content-" + value + i}
              >
                {file.id === workspace.selectedFile && "Selected File: "}
                <span
                  style={{
                    fontWeight: file.id === workspace.selectedFile && 500,
                  }}
                >
                  {file?.name}
                </span>
                {file.id !== workspace.selectedFile && (
                  <Tooltip
                    title={
                      "Non Control files, gates can be adjusted if you have a membership of one of our paid plans"
                    }
                  >
                    <img
                      src={infoIcon}
                      alt={`icon-${value}-${i}`}
                      style={{ width: 15, height: 15, marginLeft: 5 }}
                    />
                  </Tooltip>
                )}
              </TableCell>
            ) : i !== data.length - 1 ? (
              <TableCell
                className={classes.tableCell}
                key={"content-" + value + i}
              >
                {value || "NA"}
              </TableCell>
            ) : (
              <TableCell
                className={`${classes.tableCell}`}
                key={"content-" + value + i}
                onClick={() => {
                  onRowClick();
                }}
              >
                <button
                  className={classes.view}
                  style={{
                    cursor:
                      file.id === workspace.selectedFile
                        ? "default"
                        : "pointer",
                    backgroundColor:
                      file.id === workspace.selectedFile ? "#FAFAFA" : "#333",
                    color:
                      file.id === workspace.selectedFile ? "black" : "whilte",
                  }}
                  disabled={file.id === workspace.selectedFile}
                >
                  {file.id === workspace.selectedFile
                    ? "Selected File"
                    : isOpen
                    ? "Close"
                    : "View Plots"}
                </button>
              </TableCell>
            )
          )}
      </TableRow>
    );
  };

  return workspace.plots.length > 0 && renderStateRow();
};

export default PlotStateComponent;
