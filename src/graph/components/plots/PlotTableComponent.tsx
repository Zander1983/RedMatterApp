import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";

import PlotStats from "graph/utils/stats";
import { useEffect, useState } from "react";

import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";

import { Workspace } from "graph/resources/types";

import PlotHeadComponent from "./PlotHeadComponent";
import PlotRowComponent from "./PlotRowComponent";

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

interface TableProps {
  workspace: Workspace;
  sharedWorkspace: boolean;
  experimentId: string;
  workspaceLoading: boolean;
  customPlotRerender: string[];
  // arrowFunc: Function;
}

const statsProvider = new PlotStats();

const PlotTableComponent = ({
  workspace,
  sharedWorkspace,
  experimentId,
  workspaceLoading,
  customPlotRerender,
}: TableProps) => {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [openFiles, setOpenFiles] = useState<string[]>([
    workspace.selectedFile,
  ]);
  const [headers, setHeaders] = useState<string[]>([
    "File Name",
    "Click to View",
  ]);
  const raws: any[] = [];

  useEffect(() => {
    updateStats();
    setHeaders([
      "File Name",
      ...workspace.gates.map((gate) => gate.name),
      "Click to View",
    ]);
    if (workspace.clearOpenFiles) {
      setOpenFiles([]);
      WorkspaceDispatch.ClearOpenFiles();
    }
  }, [workspace]);

  const fillUpRows = (statistics: any[]) => {
    for (let i = 0; i < workspace.files.length; i++) {
      let raw = [workspace.files[i].id];
      for (let j = 0; j < statistics.length; j += workspace.files.length) {
        if (statistics[i + j]?.gatedFilePopulationPercentage) {
          raw.push(statistics[i + j]?.gatedFilePopulationPercentage);
        }
      }
      raw.push(workspace.files[i].view ? "Close" : "View");

      // Removing unnecessary extra values
      if (raw.length < workspace.gates.length + 2) {
        raw = [
          raw[0],
          ...raw.slice(1, workspace.gates.length),
          raw[raw.length - 1] === "View" || "Close"
            ? "--"
            : raw[raw.length - 2],
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
    }
    setData(raws);
  };

  const updateStats = () => {
    let stats: any[] = [];
    workspace.populations.map((population) => {
      if (
        population.gates.length > 0 &&
        workspace.selectedFile === population.file
      ) {
        workspace.files.map((file) => {
          if (file.downloaded && !file.downloading) {
            stats.push(statsProvider.getPlotStatsWithFiles(file, population));
          }
        });
      }
    });
    fillUpRows(stats);
  };

  return (
    <TableContainer component={Paper} className={classes.container}>
      <Table style={{ overflowY: "scroll" }}>
        <PlotHeadComponent
          workspace={workspace}
          data={data}
          headers={headers}
          setData={setData}
          setOpenFiles={setOpenFiles}
        />
        <TableBody>
          {workspace?.files?.map((file, i) => (
            <PlotRowComponent
              sharedWorkspace={sharedWorkspace}
              experimentId={experimentId}
              workspace={workspace}
              workspaceLoading={workspaceLoading}
              customPlotRerender={customPlotRerender}
              file={file}
              data={data}
              headers={headers}
              index={i}
              openFiles={openFiles}
              setOpenFiles={setOpenFiles}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default PlotTableComponent;
