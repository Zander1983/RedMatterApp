import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import { Workspace, File } from "graph/resources/types";
import { deleteAllPlotsAndPopulationOfNonControlFile } from "graph/components/plots/MainBar";

import PlotHeadComponent from "./PlotHeadComponent";
import PlotRowComponent from "./PlotRowComponent";
import { getWorkspace } from "graph/utils/workspace";
import PlotStats from "graph/utils/stats";

const statsProvider = new PlotStats();
const deletedPlots: string[] = [];
const deletedPopulations: string[] = [];
const deletedGates: string[] = [];

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

const sortByColumn = (colIndex: number, type: string) => {
  // calculating the stats of the entire table
  const workspace = getWorkspace();
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
  const raws: any[] = [];
  for (let i = 0; i < workspace.files.length; i++) {
    let raw = [workspace.files[i].id];
    for (let j = 0; j < stats.length; j += workspace.files.length) {
      if (stats[i + j]?.gatedFilePopulationPercentage) {
        raw.push(stats[i + j]?.gatedFilePopulationPercentage);
      }
    }
    raw.push(workspace.files[i].view ? "Close" : "View");

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
  }

  let array = raws;

  // filtering out the neumeric values from the string
  array = array.map((arr) => {
    return arr.map((value: any, index: number) => {
      if (index !== 0 && index !== arr.length - 1) {
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
      if (index !== 0 && index !== arr.length - 1) {
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
  const files: File[] = [
    workspace.files.find((item) => item.id === workspace.selectedFile),
  ];
  for (let i = 0; i < workspace.files.length; i++) {
    if (array[i][0] !== workspace.selectedFile) {
      files.push(workspace.files.find((item) => item.id === array[i][0]));
    }
  }
  WorkspaceDispatch.SetFiles(files);
};

const deleteColumn = (index: number) => {
  const workspace = getWorkspace();
  deleteAllPlotsAndPopulationOfNonControlFile();
  workspace.populations.map((pop) => {
    if (pop.gates && pop.gates.length > 0) {
      if (pop.gates[0].gate === workspace.gates[index].id) {
        workspace.plots.map((plot) => {
          if (plot.gates.includes(workspace.gates[index].id)) {
            plot.gates = plot.gates.filter(
              (gate) => gate !== workspace.gates[index].id
            );
            // removing gate from the plot
            WorkspaceDispatch.UpdatePlot(plot);
          }
          if (plot.population === pop.id) {
            // deleting the plot of the gate
            deletedPlots.push(plot.id);
          }
        });
        // deleting the population of the gate
        deletedPopulations.push(pop.id);
      }
    }
  });
  // deleting the children
  deleteChildGate(workspace.gates[index].children);

  // deleting the gate
  deletedGates.push(workspace.gates[index].id);

  // updating the parents gates
  deletedGates.map((gateId) => {
    workspace.gates.map((gate) => {
      if (gate.children.includes(gateId)) {
        gate.children = gate.children.filter((child) => child !== gateId);
        WorkspaceDispatch.UpdateGate(gate);
      }
    });
  });

  WorkspaceDispatch.DeletePlotsAndPopulations(
    deletedPlots,
    deletedPopulations,
    deletedGates
  );

  deletedPlots.length = 0;
  deletedPopulations.length = 0;
  deletedGates.length = 0;
};

const deleteChildGate = (children: string[]) => {
  const workspace = getWorkspace();

  children.map((child) => {
    workspace.populations.map((pop) => {
      if (pop.gates && pop.gates.length > 0) {
        if (pop.gates[0].gate === child) {
          workspace.plots.map((plot) => {
            if (plot.gates.includes(child)) {
              plot.gates = plot.gates.filter((gate) => gate !== child);
              WorkspaceDispatch.UpdatePlot(plot);
            }
            if (plot.population === pop.id) {
              deletedPlots.push(plot.id);
            }
          });
          deletedPopulations.push(pop.id);
        }
      }
    });
    if (workspace.gates.find((gate) => gate.id === child).children) {
      deleteChildGate(
        workspace.gates.find((gate) => gate.id === child).children
      );
    }
    deletedGates.push(child);
  });
};

interface TableProps {
  // workspace: Workspace;
  sharedWorkspace: boolean;
  experimentId: string;
  workspaceLoading: boolean;
  customPlotRerender: string[];
  // arrowFunc: Function;
  isRenderTable: Function;
}

const PlotTableComponent = ({
  // workspace,
  sharedWorkspace,
  experimentId,
  workspaceLoading,
  customPlotRerender,
  isRenderTable
}: TableProps) => {
  const classes = useStyles();
  //@ts-ignore
  // const [openFiles, setOpenFiles] = useState<string[]>([ getWorkspace().selectedFile]);

  useLayoutEffect(() => {
    // making the selected file the first element of filesArray
    const workspace = getWorkspace();
    const filesInNewOrder: File[] = [];
    for (let i = 0; i < workspace.files.length; i++) {
      if (workspace.files[i].id === workspace.selectedFile) {
        filesInNewOrder.unshift(workspace.files[i]);
      } else {
        filesInNewOrder.push(workspace.files[i]);
      }
    }
    WorkspaceDispatch.SetFiles(filesInNewOrder);
  }, []);

  const headers = useMemo(() => {
    return [
      "File Name",
      ...getWorkspace().gates.map((gate: any) => gate.name),
      "Click to View",
    ];
  }, [getWorkspace().gates]);

  // useEffect(() => {
  //   if (getWorkspace().clearOpenFiles) {
  //     // setOpenFiles([getWorkspace().selectedFile]);
  //     WorkspaceDispatch.ClearOpenFiles();
  //   }
  // }, [getWorkspace().clearOpenFiles]);

  return (
    <TableContainer component={Paper} className={classes.container}>
      <Table style={{ overflowY: "scroll" }}>
        <PlotHeadComponent
          // headers={headers}
          sortByColumn={sortByColumn}
          deleteColumn={deleteColumn}
        />
        <TableBody>
          {getWorkspace()?.files?.map((file: any, i: number) => (
            <PlotRowComponent
              key={file?.id || i}
              sharedWorkspace={sharedWorkspace}
              experimentId={experimentId}
              workspaceLoading={workspaceLoading}
              customPlotRerender={customPlotRerender}
              file={file}
              // headers={headers}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PlotTableComponent;
