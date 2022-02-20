import React, { useEffect, useState } from "react";
import {
  File,
  Plot,
  PlotID,
  Population,
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
import { Workspace as WorkspaceType } from "../../resources/types";
import { useSelector } from "react-redux";
import { getWorkspace } from "graph/utils/workspace";

interface PlotsAndFiles {
  plot: Plot;
  file: File;
}

interface Props {
  sharedWorkspace: boolean;
  experimentId: string;
  workspaceLoading: boolean;
  customPlotRerender: PlotID[];
  plotMoving?: boolean;
  file: File;
}

const PlotRowComponent = ({
  sharedWorkspace,
  customPlotRerender,
  experimentId,
  workspaceLoading,
  file,
}: Props) => {
  // console.log("==Plot Raw==", file.name);
  const [isOpen, setIsopen] = React.useState<boolean>(false);
  const generatePlots = (file: File) => {
    const workspace = getWorkspace();
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
      const workspace = getWorkspace();
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
    if (file.id === getWorkspace().selectedFile) {
      updatePlot();
      generatePlots(file);
    }
  }, []);

  const onClick = () => {
    if (file.id !== getWorkspace().selectedFile) {
      if (isOpen) {
        setTimeout(() => {
          generatePlots(file);
        }, 0);
      } else {
        // taking care of plots showing up from saved workspace
        updatePlot();
        setTimeout(() => {
          generatePlots(file);
        }, 0);
      }
      setIsopen((prev) => !prev);
    }
  };

  const plotData = () => {
    return (
      <PlotDataComponent
        sharedWorkspace={sharedWorkspace}
        experimentId={experimentId}
        workspaceLoading={workspaceLoading}
        customPlotRerender={customPlotRerender}
        file={file}
        onRowClick={onClick}
        isOpen={isOpen}
      />
    );
  };
  return (
    <>
      <PlotStateComponent file={file} onRowClick={onClick} isOpen={isOpen} />
      {(isOpen || file.id === getWorkspace().selectedFile) && plotData()}
    </>
  );
};

export default PlotRowComponent;
