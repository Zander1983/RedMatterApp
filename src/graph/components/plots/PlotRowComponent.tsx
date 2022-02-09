import React, {useEffect, useState} from "react";
import {
    File,
    Gate,
    Plot,
    PlotID,
    PlotSpecificWorkspaceData,
    Population,
    Workspace as WorkspaceType,
    Workspace,
    PlotsRerender,
} from "../../resources/types";

import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import { standardGridPlotItem } from "../workspaces/PlotController";
import PlotComponent from "./PlotComponent";
import { makeStyles } from "@material-ui/core";
import {
    getFile,
    getGate,
    getPopulation,
    getWorkspace,
} from "../../utils/workspace";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import * as PlotResource from "graph/resources/plots";
import * as PopulationResource from "graph/resources/populations";
import _ from "lodash";
import PlotStateComponent from './PlotStateComponent';

import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import EventQueueDispatch from "graph/workspaceRedux/eventQueueDispatchers";
import PlotStats from "graph/utils/stats";
const statsProvider = new PlotStats();

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

export const setCanvasSize = (
    save: boolean = false,
    isAsync: boolean = false
) => {
    const plots = getWorkspace().plots;
    const updateList: Plot[] = [];
    for (let plot of plots) {
        let id = `canvas-${plot.id}`;
        let displayRef = `display-ref-${plot.id}`;
        let barRef = `bar-ref-${plot.id}`;

        let docIdRef = document.getElementById(id);
        let docDisplayRef: any = document.getElementById(displayRef);
        let docBarRef: any = document.getElementById(barRef);

        if (docBarRef && docDisplayRef && docIdRef) {
            let width = docDisplayRef.offsetWidth - 50;
            let height = docDisplayRef.offsetHeight - docBarRef.offsetHeight - 40;
            plot.plotHeight = height;
            plot.plotWidth = width;

            docIdRef.setAttribute("style", `width:${width}px;height:${height}px;`);
            updateList.push(plot);
        }
    }
    if (save && plots.length > 0) {
        if (isAsync)
            _.debounce(() => WorkspaceDispatch.UpdatePlots(updateList), 100);
        else WorkspaceDispatch.UpdatePlots(updateList); //setTimeout( () => , 10);
    }
};

export const MINW = 9;
export const MINH = 10;

export const resetPlotSizes = (id?: string) => {
    let tPlots = getWorkspace().plots.map((e) => e.id);
    if (id) tPlots = [id];
    for (const id of tPlots) {
        let docIdRef = document.getElementById(`canvas-${id}`);
        let docDisplayRef: any = document.getElementById(`display-ref-${id}`);
        let docBarRef: any = document.getElementById(`bar-ref-${id}`);

        if (docBarRef && docDisplayRef && docIdRef) {
            let width = docDisplayRef.offsetWidth - 55;
            let height = docDisplayRef.offsetHeight - docBarRef.offsetHeight - 40;
            docIdRef.setAttribute("style", `width:${width}px;height:${height}px;`);
        }
    }
};

interface Props {
    sharedWorkspace: boolean;
    experimentId: string;
    workspace: Workspace;
    workspaceLoading: boolean;
    customPlotRerender: PlotID[];
    plotMoving?: boolean;
    // arrowFunc: Function;
    file: File;
    headers: string[];
    data: any[];
    openFiles: string[];
    setOpenFiles: React.Dispatch<React.SetStateAction<string[]>>;
}
const PlotRowComponent = ({workspace, data,
                              sharedWorkspace,
                              customPlotRerender,
                              experimentId,
                              workspaceLoading,
                              file,
                              headers,
                              openFiles,
                              setOpenFiles,
                          }: Props) => {
    const classes = useStyles();

    // console.log("Row: " + file.id);
    // const [data, setData] = useState([]);

    const generatePlots = (file: File) => {
        if (file.view) {
            file.view = !file.view;
            WorkspaceDispatch.UpdateFile(file);
            return;
        }

        const newPlots: Plot[] = [];
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
        }

        file.view = !file.view;
        WorkspaceDispatch.UpdateFile(file);
    };

    const updatePlot = () => {
        const plots: Plot[] = [];
        getTableRowPlots(file).map(({ plot }) => {
            if (plot.plotWidth !== 319 || plot.plotHeight !== 204) {
                plot.plotHeight = 204;
                plot.plotWidth = 319;
                plots.push(plot);
            }
        });
        if (plots.length > 0) {
            WorkspaceDispatch.UpdatePlots(plots);
        } else {
            const plotsRerenderQueueItem: PlotsRerender = {
                id: "",
                used: false,
                type: "plotsRerender",
                plotIDs: getTableRowPlots(file).map(({ plot }) => plot.id),
            };
            EventQueueDispatch.AddQueueItem(plotsRerenderQueueItem);
        }
    };

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

    const raws: any[] = [];

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
        // setData(raws);
    };

    const updateStats = () => {
        let stats: any[] = [];
        workspace.populations.map((population) => {
            if (
                population.gates.length > 0 &&
                workspace.selectedFile === population.file
            ) {
                // workspace.files.map((file) => {
                    if (file.downloaded && !file.downloading) {
                        stats.push(statsProvider.getPlotStatsWithFiles(file, population));
                    }
                // });
            }
        });
        fillUpRows(stats);
    };

    useEffect(() => {
        if (file.id === workspace.selectedFile) {
            updatePlot();
            generatePlots(file);
        }
    }, []);

    // useEffect(() => {
    //     console.log(workspace.files);
    //     console.log(workspace.populations);
    //     updateStats();
    // }, [workspace]);

    const onClick = () => {
        if (file.id !== workspace.selectedFile) {
            if (openFiles.includes(file.id)) {
                setOpenFiles((prev) =>
                    prev.filter((id) => id !== file.id)
                );
                setTimeout(() => {
                    generatePlots(file);
                }, 0);
            } else if (!file.view) {
                setOpenFiles((prev) => [...prev, file.id]);
                // taking care of plots showing up from saved workspace
                updatePlot();
                setTimeout(() => {
                    generatePlots(file);
                }, 500);
            }
        }
    };

    const plotData = () => {
        //console.log("===== Plot Render =====");
        return(
            <TableRow
                className={
                    file.id === workspace.selectedFile
                        ? classes.show
                        : openFiles.includes(file.id)
                        ? classes.show
                        : classes.hide
                }>
                {getTableRowPlots(file).length === 0 ? (
                    <TableCell
                        colSpan={headers.length}
                        className={classes.loaderContainerStyle}
                    >
                        <CircularProgress className={classes.loader} />
                    </TableCell>
                ) : (
                    <TableCell colSpan={headers.length}>
                        <div
                            className={classes.responsiveContainer}
                            style={{
                                opacity: file.view ? 1 : 0,
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
                )}
            </TableRow>
        );
    }

    return (
        <>
            <PlotStateComponent
                workspace={workspace}
                file={file}
                headers={headers}
                data={data} openFiles={openFiles}
                setOpenFiles={setOpenFiles}
                onRowClick={onClick} />
            {file.view && plotData()}

        </>
    );
};

export default PlotRowComponent;