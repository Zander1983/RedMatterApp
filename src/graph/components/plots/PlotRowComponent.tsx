import React, { useEffect } from "react";
import {
    File,
    Plot,
    PlotID,
    Population,
    Workspace,
    PlotsRerender,
} from "../../resources/types";

import { getFile } from "../../utils/workspace";
//@ts-ignore
import * as PlotResource from "graph/resources/plots";
import * as PopulationResource from "graph/resources/populations";
import PlotStateComponent from "./PlotStateComponent";
import PlotDataComponent from "./PlotDataComponent";

import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import EventQueueDispatch from "graph/workspaceRedux/eventQueueDispatchers";

interface PlotsAndFiles {
    plot: Plot;
    file: File;
}

interface Props {
    sharedWorkspace: boolean;
    experimentId: string;
    workspace: Workspace;
    workspaceLoading: boolean;
    customPlotRerender: PlotID[];
    plotMoving?: boolean;
    file: File;
    headers: string[];
    openFiles: string[];
    setOpenFiles: React.Dispatch<React.SetStateAction<string[]>>;
}

const PlotRowComponent = ({
                              workspace,
                              sharedWorkspace,
                              customPlotRerender,
                              experimentId,
                              workspaceLoading,
                              file,
                              headers,
                              openFiles,
                              setOpenFiles,
                          }: Props) => {
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

    useEffect(() => {
        if (file.id === workspace.selectedFile) {
            updatePlot();
            generatePlots(file);
        }
    }, []);

    const onClick = () => {
        if (file.id !== workspace.selectedFile) {
            if (openFiles.includes(file.id)) {
                setOpenFiles((prev) => prev.filter((id) => id !== file.id));
                setTimeout(() => {
                    generatePlots(file);
                }, 0);
            } else if (!file.view) {
                setOpenFiles((prev) => [...prev, file.id]);
                // taking care of plots showing up from saved workspace
                updatePlot();
                setTimeout(() => {
                    generatePlots(file);
                }, 0);
            }
        }
    };

    const plotData = () => {
        return (
            <PlotDataComponent
                sharedWorkspace={sharedWorkspace}
                experimentId={experimentId}
                workspace={workspace}
                workspaceLoading={workspaceLoading}
                customPlotRerender={customPlotRerender}
                file={file}
                headers={headers}
                openFiles={openFiles}
            />
        );
    };

    return (
        <>
            <PlotStateComponent
                workspace={workspace}
                file={file}
                headers={headers}
                openFiles={openFiles}
                onRowClick={onClick}
            />
            {openFiles.includes(file.id) && plotData()}
        </>
    );
};

export default PlotRowComponent;