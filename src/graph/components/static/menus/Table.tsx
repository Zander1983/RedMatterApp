//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import PlotStats from "graph/utils/stats";
import { useEffect, useState } from "react";

import PlotComponent from "graph/components/plots/PlotComponent";
import { getFile, getGate, getPopulation } from "graph/utils/workspace";
import * as PlotResource from "graph/resources/plots";
import * as PopulationResource from "graph/resources/populations";

import {
  Gate,
  Plot,
  PlotSpecificWorkspaceData,
  Population,
  Workspace,
  File,
  PlotsRerender,
} from "graph/resources/types";
import {
  standardGridPlotItem,
  setCanvasSize,
} from "graph/components/workspaces/PlotController";
import { deleteAllPlotsAndPopulationOfNonControlFile } from "graph/components/plots/MainBar";

import EventQueueDispatch from "graph/workspaceRedux/eventQueueDispatchers";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";

import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";
import deleteIcon from "assets/images/delete.png";

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
    textDecoration: "underline",
    cursor: "pointer",
  },
  otherFiles: {
    transition: "height 1s ease",
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
    backgroundColor: "rgb(238, 238, 255)",
  },
  itemInnerDiv: {
    width: "100%",
    height: "100%",
  },
}));

interface TableProps {
  workspace: Workspace;
  sharedWorkspace: boolean;
  experimentId: string;
  workspaceLoading: boolean;
  customPlotRerender: string[];
  arrowFunc: Function;
}

interface PlotsAndFiles {
  plot: Plot;
  file: File;
}

const statsProvider = new PlotStats();
const ResponsiveGridLayout = WidthProvider(Responsive);

const PlotTable = ({
  workspace,
  sharedWorkspace,
  experimentId,
  workspaceLoading,
  customPlotRerender,
  arrowFunc,
}: TableProps) => {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([
    "File Name",
    "Click to View",
  ]);

  const raws: any[] = [];
  const deletedPlots: string[] = [];
  const deletedPopulations: string[] = [];
  const deletedGates: string[] = [];

  const fillUpRows = () => {
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
          ...raw.slice(1, 1 + workspace.gates.length - 1),
          raw[raw.length - 1] === "View" ? "--" : raw[raw.length - 2],
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
    setStatistics(stats);
  };

  const savePlotPosition = (layouts: any) => {
    let plots = workspace.plots;
    let plotChanges = [];
    for (let i = 0; i < layouts.length; i++) {
      let layout = layouts[i];
      let plotId = layouts[i].i;

      let plot = plots.find((x: Plot) => x.id === plotId);
      if (!plot) continue;
      if (
        plot.dimensions.h !== layout.h ||
        plot.dimensions.w !== layout.w ||
        plot.positions.x !== layout.x ||
        plot.positions.y !== layout.y
      ) {
        plot.dimensions = {
          h: layout.h,
          w: layout.w,
        };
        plot.positions = {
          x: layout.x,
          y: layout.y,
        };
        plotChanges.push(plot);
      }
    }
    WorkspaceDispatch.UpdatePlots(plotChanges);
  };

  const getPlotRelevantResources = (plot: Plot) => {
    const population = getPopulation(plot.population);
    const file = getFile(population.file);
    const gates: Gate[] = [
      ...plot.gates.map((e) => getGate(e)).filter((x) => x),
      ...population.gates.map((e) => getGate(e.gate)),
    ];
    const workspaceForPlot: PlotSpecificWorkspaceData = {
      file,
      gates,
      plot,
      population,
      key: plot.id,
    };
    return workspaceForPlot;
  };

  const sortByColumn = (colIndex: number, type: string) => {
    let array = data;

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
    const files: File[] = [];
    for (let i = 0; i < workspace.files.length; i++) {
      files.push(workspace.files.find((item) => item.id === array[i][0]));
    }
    WorkspaceDispatch.SetFiles(files);
    setData(array);
  };

  const generatePlots = (file: File) => {
    if (file.view) {
      file.view = !file.view;
      WorkspaceDispatch.UpdateFile(file);
      return;
    }
    file.view = !file.view;
    WorkspaceDispatch.UpdateFile(file);
    let populations: Population[] = [];
    populations = workspace.populations.filter(
      (population) => population.file === file.id
    );

    if (populations.length === 0) {
      const controlFilePopulations = workspace.populations.filter(
        (pop) => pop.file === workspace.selectedFile
      );
      controlFilePopulations.sort((a, b) => {
        return a.gates.length - b.gates.length;
      });

      let populationIdMap: any = {};

      const controlFilePlots: Plot[] = [];
      const newPlots: Plot[] = [];
      const newPopulations = controlFilePopulations.map((pop) => {
        let newPopulation = PopulationResource.createPopulation({
          clonePopulation: pop,
          file: file.id,
          parentPopulationId:
            populationIdMap && populationIdMap[pop.parentPopulationId]
              ? populationIdMap[pop.parentPopulationId]
              : "",
        });
        populationIdMap[pop.id] = newPopulation.id;
        return newPopulation;
      });

      // Creating new plots with the newPopulations
      controlFilePopulations.map((pop) =>
        workspace.plots.map((plot) => {
          if (plot.population === pop.id) {
            controlFilePlots.push(plot);
          }
        })
      );

      for (let i = 0; i < controlFilePlots.length; i++) {
        newPlots.push(
          PlotResource.createPlot({
            clonePlot: controlFilePlots[i],
            population: newPopulations[i],
          })
        );
      }

      WorkspaceDispatch.AddPlotsAndPopulations(newPlots, newPopulations);
      const plotsRerenderQueueItem: PlotsRerender = {
        id: "",
        used: false,
        type: "plotsRerender",
        plotIDs: newPlots.map((plot) => plot.id),
      };
      EventQueueDispatch.AddQueueItem(plotsRerenderQueueItem);
    }
  };

  const getTableRowPlots = (file: File) => {
    let plots: PlotsAndFiles[] = [];

    let populations: Population[] = [];
    populations = workspace.populations.filter(
      (population) => population.file === file.id
    );

    workspace.plots.map((plot) => {
      populations.map((population) => {
        if (population.id === plot.population) {
          plots.push({ plot, file: getFile(population.file) });
        }
      });
    });

    return plots;
  };

  const deleteChildGate = (children: string[]) => {
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
  const deleteColumn = (index: number) => {
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

  useEffect(() => {
    updateStats();
  }, [workspace]);

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
              <TableCell className={classes.tableCell} key={"top-" + index}>
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
                    <img
                      onClick={() => {
                        deleteColumn(index - 1);
                      }}
                      src={deleteIcon}
                      alt="delete-icon"
                      className={classes.delete}
                    />
                  </>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {workspace?.files?.map((file, i) => (
            <>
              <TableRow key={"file-" + i}>
                {headers.length > 1 &&
                  data.length > 0 &&
                  data[i]?.map((value: any, index: any) =>
                    index === 0 ? (
                      <TableCell
                        className={`${classes.tableCell}`}
                        key={"content-" + value + index}
                      >
                        {workspace.files?.find((f) => f.id === value).name}
                      </TableCell>
                    ) : index !== data[i].length - 1 ? (
                      <TableCell
                        className={classes.tableCell}
                        key={"content-" + value + index}
                      >
                        {value || "NA"}
                      </TableCell>
                    ) : (
                      <TableCell
                        className={`${classes.tableCell}`}
                        key={"content-" + value + index}
                        onClick={() => {
                          generatePlots(file);
                        }}
                      >
                        <span className={classes.view}> {value} </span>
                      </TableCell>
                    )
                  )}
              </TableRow>

              <TableRow
                className={classes.otherFiles}
                style={{ display: file.view ? "block" : "none" }}
              >
                <TableCell colSpan={headers.length}>
                  <div style={{ marginTop: 3, marginBottom: 10 }}>
                    <ResponsiveGridLayout
                      className="layout"
                      breakpoints={{ lg: 1200 }}
                      cols={{ lg: 36 }}
                      rows={{ lg: 30 }}
                      rowHeight={30}
                      compactType={null}
                      isDraggable={workspace.editWorkspace}
                      onLayoutChange={(layout: any) => {
                        savePlotPosition(layout);
                        setTimeout(() => {
                          arrowFunc();
                        }, 100);
                      }}
                      onDrag={() => {
                        arrowFunc();
                      }}
                      onDragStop={() => {
                        arrowFunc();
                      }}
                      onDragStart={() => {
                        arrowFunc();
                      }}
                      onResize={(layout: any) => {
                        setCanvasSize(false);
                      }}
                      onResizeStop={(layout: any) => {
                        setCanvasSize(true);
                      }}
                    >
                      {
                        //@ts-ignore
                        getTableRowPlots(file).map(
                          ({ plot, file: PlotFile }, i) => {
                            if (PlotFile.id === file.id) {
                              return (
                                <div
                                  key={plot.id}
                                  className={classes.itemOuterDiv}
                                  data-grid={standardGridPlotItem(
                                    i,
                                    plot,
                                    workspace.plots,
                                    workspace.editWorkspace
                                  )}
                                  id={`workspace-outter-${plot.id}`}
                                >
                                  <div
                                    id="inner"
                                    className={classes.itemInnerDiv}
                                  >
                                    <PlotComponent
                                      plotRelevantResources={getPlotRelevantResources(
                                        plot
                                      )}
                                      sharedWorkspace={sharedWorkspace}
                                      editWorkspace={workspace.editWorkspace}
                                      workspaceLoading={workspaceLoading}
                                      customPlotRerender={customPlotRerender}
                                      experimentId={experimentId}
                                      fileName={file.name}
                                    />
                                  </div>
                                </div>
                              );
                            }
                          }
                        )
                      }
                    </ResponsiveGridLayout>
                  </div>
                </TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default PlotTable;
