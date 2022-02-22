import React, { useState } from "react";
import {
  File,
  Gate,
  Plot,
  // PlotID,
  PlotSpecificWorkspaceData,
  PlotsRerender,
  Population,
  Workspace as WorkspaceType,
  // Workspace,
  WorkspaceEvent,
} from "../../resources/types";

import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import PlotComponent from "./PlotComponent";
import { makeStyles } from "@material-ui/core";
import {
  getFile,
  getGate,
  getPopulation,
  // getWorkspace,
} from "../../utils/workspace";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import { useSelector } from "react-redux";
import EventQueueDispatch from "../../workspaceRedux/eventQueueDispatchers";
import Xarrow from "react-xarrows";
import {MINH, MINW} from "../workspaces/PlotController";

interface PlotsAndFiles {
  plot: Plot;
  file: File;
}

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
const ResponsiveGridLayout = WidthProvider(Responsive);

export const standardGridPlotItem = (
    index: number,
    plotData: any,
    plots: Plot[],
    editWorkspace: boolean
) => {
  return {
    x: plotData.positions.x,
    y: plotData.positions.y,
    w: plotData.dimensions.w,
    h: plotData.dimensions.h,
    minW: MINW,
    minH: MINH,
    static: !editWorkspace,
  };
};

interface Props {
  sharedWorkspace: boolean;
  experimentId: string;
  workspaceLoading: boolean;
  plotMoving?: boolean;
  // arrowFunc: Function;
  file: File;
  onRowClick: Function;
  isOpen?: boolean;
  noSorting?: boolean;
}

const PlotDataComponent = ({
  sharedWorkspace,
  experimentId,
  workspaceLoading,
  file,
  onRowClick,
  isOpen,
  noSorting,
}: Props) => {
  const classes = useStyles();
  //const updateXarrow = useXarrow();
  const [loader, setLoader] = React.useState(true);
  const [renderArrow, setRenderArrow] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [message, setMessage] = React.useState("");

  //@ts-ignore
  const workspace: WorkspaceType = useSelector((state) => state.workspace);
  const [customPlotRerender, setCustomPlotRerender] = React.useState([]);
  let updateTimeout: any = null;

  // const [changeType, setChangeType] = React.useState(
  //   workspace.updateType.split("---")[0] || ""
  // );
  // const [render, setRender] = React.useState(false);

  // React.useEffect(() => {
  //   if (changeType === "ROW_OPEN") {
  //     workspace.updateType.split("---")[1] === file.id && setRender(true);
  //   }
  // }, [workspace.updateType]);


  const getTableRowPlots = (file: File) => {
    if (file !== null) {
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
    }
  };

  useSelector((e: any) => {
    const eventQueue = e.workspaceEventQueue.queue;
    let eventPlotsRerenderArray = eventQueue.filter(
      (x: WorkspaceEvent) => x.type === "plotsRerender"
    );
    if (eventPlotsRerenderArray.length > 0) {
      let event: PlotsRerender = eventPlotsRerenderArray[0];
      setCustomPlotRerender(event.plotIDs);

      EventQueueDispatch.DeleteQueueItem(event.id);
      setTimeout(() => {
        setCustomPlotRerender([]);
        //setLoader(false);
      }, 0);
    }
  });

  React.useEffect(() => {
    if (file.id !== workspace.selectedFile) {
      processGraph()
        .then((response: any) => {
          if (response?.status) {
            setLoader(false);
            setError(false);
            setTimeout(() => setRenderArrow(true), 1000);
          } else {
            setLoader(false);
            setError(true);
            setMessage(response?.message);
          }
        })
        .catch((response) => {
          setLoader(false);
          setError(true);
          setMessage(response?.message);
        });
    }else {
      setTimeout(() => {setLoader(false); setRenderArrow(true)}, 1000);
    }
  }, []);

  const isPopulationAvailForPlots = (file: File) => {
    if (file !== null)
      return workspace.populations.filter(
        (population) => population.file === file.id
      );
    else return null;
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

  const processGraph = async () => {
    setLoader(true);
    return new Promise(async (resolve, reject) => {
      const isAvailable = isPopulationAvailForPlots(file);
      if (isAvailable) {
        setTimeout(
          () => resolve({ message: "Load Successfully", status: true }),
          1000
        );
      } else
        setTimeout(
          () =>
            reject({ message: "Load Failed  ", status: false, isError: true }),
          100
        );
    });
  };

  // if (isOpen && !renderArrow) {
  //     if (updateTimeout) {
  //       clearTimeout(updateTimeout);
  //     }
  //     updateTimeout = setTimeout(() => {
  //       updateXarrow();
  //     }, 1000);
  // }

  const _renderPageMessage = () => {
    return (
      <TableCell
        colSpan={workspace.gates.length + 2}
        className={classes.loaderContainerStyle}
      >
        {isError && message && (
          <>
            {message || " "}
            <a style={{ marginLeft: "5px" }} onClick={(event) => onRowClick()}>
              close and try
            </a>
          </>
        )}
      </TableCell>
    );
  };

  const getArrowArray = () => {
    let arr: any[] = [];
    let plots = getTableRowPlots(file);
    for (let i = 0; i < plots.length; i++) {
      let plot = plots[i].plot;
      let populationId = plot.population;
      let childPopulationIds = workspace.populations
          .filter((x) => x.parentPopulationId == populationId)
          .map((x) => x.id);

      let childPlots = plots.filter((x) =>
          childPopulationIds.includes(x.plot.population)
      );
      let plotId = plot.id;
      for (let j = 0; j < childPlots.length; j++) {
        arr.push({
          start: `workspace-outter-${plotId}`,
          end: `workspace-outter-${childPlots[j].plot.id}`,
        });
      }
    }
    return arr;
  };

  const renderForNoSorting = () => {
    return (
      <TableRow className={classes.show}>
        <TableCell colSpan={workspace.gates.length + 2}>
          <div
            className={classes.responsiveContainer}
            style={{
              transition: `all ${
                workspace.files.length < 30
                  ? 1
                  : workspace.files.length < 60
                  ? 2
                  : 3
              }s`,
            }}
          >
            <ResponsiveGridLayout
              className="layout"
              breakpoints={{ lg: 1200 }}
              cols={{ lg: 36 }}
              rows={{ lg: 30 }}
              rowHeight={30}
              compactType={null}
              isDraggable={workspace.editWorkspace}
              isResizable={false}
            >
              {
                //@ts-ignore
                getTableRowPlots(file).map(({ plot, file: PlotFile }, i) => {
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
                        <div id="inner" className={classes.itemInnerDiv}>
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
                })
              }
            </ResponsiveGridLayout>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const renderUI = () => {
    return (
      <>
        {!noSorting && loader && file.id !== workspace.selectedFile ? (
          <TableCell
            colSpan={workspace.gates.length + 2}
            className={classes.loaderContainerStyle}
          >
            <CircularProgress
              className={classes.loader}
              style={{ padding: "10px" }}
            />
          </TableCell>
        ) : !isError ? (
          <TableRow
            className={
              file.id === workspace.selectedFile
                ? classes.show
                : isOpen
                ? classes.show
                : classes.hide
            }
          >
            <TableCell colSpan={workspace.gates.length + 2}>
              <div
                className={classes.responsiveContainer}
                style={{
                  opacity:
                    file.id === workspace.selectedFile ? 1 : isOpen ? 1 : 0,
                  transition: `all ${
                    workspace.files.length < 30
                      ? 1
                      : workspace.files.length < 60
                      ? 2
                      : 3
                  }s`,
                }}
              >
                <ResponsiveGridLayout
                  className="layout"
                  breakpoints={{ lg: 1200 }}
                  cols={{ lg: 36 }}
                  rows={{ lg: 30 }}
                  rowHeight={30}
                  compactType={null}
                  isDraggable={workspace.editWorkspace}
                  isResizable={false}>
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
                              <div id="inner" className={classes.itemInnerDiv}>
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
                                  // plot={plot}
                                  //plotId={plot.id}
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
        ) : (
          _renderPageMessage()
        )}
      </>
    );
  };
  return (
    // (isOpen || file.id === getWorkspace().selectedFile) &&
    <>
      { noSorting && renderForNoSorting()}
      {!noSorting && getTableRowPlots(file).length > 0 && renderUI()}
      { renderArrow && !loader && getArrowArray().map( (obj:any, i:number) =>  <Xarrow start={obj.start} end={obj.end} path={"straight"}/>)}
    </>
  );
};

export default PlotDataComponent;
