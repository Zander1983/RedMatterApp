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
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
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

import upArrow from "./../../../../assets/images/up_arrow.png";
import downArrow from "./../../../../assets/images/down_arrow.png";
import EventQueueDispatch from "graph/workspaceRedux/eventQueueDispatchers";

const useStyles = makeStyles((theme) => ({
  container: {
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
    backgroundColor: "white !important",
  },
  arrow: {
    height: 15,
    width: 10,
    marginLeft: 5,
    cursor: "pointer",
  },
  itemOuterDiv: {
    flex: 1,
    backgroundColor: "#eef",
    border: "solid 0.5px #bbb",
    boxShadow: "1px 3px 4px #bbd",
    borderRadius: 5,
    paddingBottom: "2rem",
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
}

const statsProvider = new PlotStats();
const ResponsiveGridLayout = WidthProvider(Responsive);

const PlotTable = ({
  workspace,
  sharedWorkspace,
  experimentId,
  workspaceLoading,
  customPlotRerender,
}: TableProps) => {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [file, setFile] = useState<File>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([
    "File Name",
    "Click to View",
  ]);

  const raws: any[] = [];
  const fillUpRows = () => {
    for (let i = 0; i < workspace.files.length; i++) {
      const raw = [workspace.files[i].name];
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
      if (
        population.gates.length > 0 &&
        workspace.selectedFile === population.file
      ) {
        workspace.files.map((file) => {
          if (workspace.plots.length > 0) {
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

  const generatePlots = (file: File) => {
    if (!file.view) {
      let populations: Population[] = [];
      populations = workspace.populations.filter(
        (population) => population.file === file.id
      );

      if (populations.length === 0) {
        // Creating new Populations from old Populations
        const controlFilePopulations = workspace.populations.filter(
          (pop) => pop.file === workspace.selectedFile
        );
        const controlFilePlots: Plot[] = [];
        const newPlots: Plot[] = [];
        const newPopulations = controlFilePopulations.map((pop) =>
          PopulationResource.createPopulation({
            clonePopulation: pop,
            file: file.id,
          })
        );

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
        setFile(file);
        return;
      }

      const plots: Plot[] = [];
      workspace.plots.map((plot) => {
        populations.map((population) => {
          if (population.id === plot.population) {
            plots.push(plot);
          }
        });
      });
      const plotsRerenderQueueItem: PlotsRerender = {
        id: "",
        used: false,
        type: "plotsRerender",
        plotIDs: plots.map((plot) => plot.id),
      };
      EventQueueDispatch.AddQueueItem(plotsRerenderQueueItem);
      setPlots(plots);
    }
    file.view = !file.view;
    setFile(null);
    WorkspaceDispatch.UpdateFile(file);
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

  useEffect(() => {
    file && generatePlots(file);
  }, [workspace.plots.length]);

  return (
    <TableContainer component={Paper} className={classes.container}>
      <Table style={{ overflowY: "scroll" }}>
        <TableHead>
          <TableRow>
            {headers.map((values, index) => (
              <TableCell className={classes.tableCell} key={index}>
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
          {workspace?.files?.map((file, i) => (
            <>
              <TableRow key={i}>
                {headers.length > 1 &&
                  data.length > 0 &&
                  data[i]?.map((value: any, index: any) => (
                    <TableCell className={classes.tableCell} key={index}>
                      {value}
                    </TableCell>
                  ))}
                <TableCell
                  className={`${classes.tableCell}  ${classes.view}`}
                  onClick={() => generatePlots(file)}
                >
                  {file.view ? "Close" : "View"}
                </TableCell>
              </TableRow>
              {file.view && (
                <TableRow className={classes.otherFiles}>
                  <TableCell colSpan={headers.length}>
                    <div style={{ marginTop: 3, marginBottom: 10 }}>
                      <ResponsiveGridLayout
                        className="layout"
                        breakpoints={{ lg: 1200 }}
                        cols={{ lg: 36 }}
                        rows={{ lg: 30 }}
                        rowHeight={30}
                        isDraggable={workspace.editWorkspace}
                        onLayoutChange={(layout: any) => {
                          savePlotPosition(layout);
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
                          plots.map((plot, i) => {
                            return (
                              <div
                                key={plot.id}
                                className={classes.itemOuterDiv}
                                data-grid={standardGridPlotItem(
                                  i,
                                  plot,
                                  plots,
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
                                    fileName={""}
                                  />
                                </div>
                              </div>
                            );
                          })
                        }
                      </ResponsiveGridLayout>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default PlotTable;
