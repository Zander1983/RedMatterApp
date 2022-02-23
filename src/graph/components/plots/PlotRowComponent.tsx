import React, { useEffect } from "react";
import { File, Plot, Population } from "../../resources/types";

import * as PlotResource from "graph/resources/plots";
import * as PopulationResource from "graph/resources/populations";
import PlotStateComponent from "./PlotStateComponent";
import PlotDataComponent from "./PlotDataComponent";
import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import { useSelector } from "react-redux";
import { getWorkspace } from "graph/utils/workspace";
import {Xwrapper} from "react-xarrows";
// import TableBody from "@material-ui/core/TableBody";

// interface PlotsAndFiles {
//   plot: Plot;
//   file: File;
// }

interface Props {
  sharedWorkspace: boolean;
  experimentId: string;
  workspaceLoading: boolean;
  // customPlotRerender: PlotID[];
  plotMoving?: boolean;
  noSorting?: boolean;
  file: File;
}

const PlotRowComponent = ({
  sharedWorkspace,
  // customPlotRerender,
  experimentId,
  workspaceLoading,
  file,
  noSorting,
}: Props) => {

  //@ts-ignore
  const clearOpenFiles = useSelector((state) => state.workspace.clearOpenFiles);
  const [isOpen, setIsopen] = React.useState<boolean>(false);

  useEffect(() => {
    if (clearOpenFiles && isOpen) {
      setIsopen(false);
    }
  }, [clearOpenFiles]);

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

  // const updatePlot = () => {
  // const plots: Plot[] = [];
  // getTableRowPlots(file).map(({ plot }) => {
  //   if (plot.plotWidth !== 319 || plot.plotHeight !== 204) {
  //     plot.plotHeight = 204;
  //     plot.plotWidth = 319;
  //     plots.push(plot);
  //   }
  // });
  // if (plots.length > 0) {
  //   WorkspaceDispatch.UpdatePlots(plots);
  // } else {
  //   const plotsRerenderQueueItem: PlotsRerender = {
  //     id: "",
  //     used: false,
  //     type: "plotsRerender",
  //     plotIDs: getTableRowPlots(file).map(({ plot }) => plot.id),
  //   };
  //   EventQueueDispatch.AddQueueItem(plotsRerenderQueueItem);
  // }
  // };

  // const getTableRowPlots = (file: File) => {
  //   if (file !== null) {
  //     const workspace = getWorkspace();
  //     let plots: PlotsAndFiles[] = [];
  //     let populations: Population[] = [];
  //     populations = workspace.populations.filter(
  //       (population) => population.file === file.id
  //     );

  //     workspace.plots.map((plot) => {
  //       populations.map((population) => {
  //         if (population.id === plot.population) {
  //           plots.push({ plot, file: getFile(population.file) });
  //         }
  //       });
  //     });
  //     return plots;
  //   }
  // };

  useEffect(() => {
    if (file.id === getWorkspace().selectedFile) {
      // updatePlot();
      generatePlots(file);
    }
  }, []);

  const onClick = () => {
    if (file.id !== getWorkspace().selectedFile) {
      if (isOpen) {
        // deletePlotAndPopulationOfFile(file.id);
      } else {
        // taking care of plots showing up from saved workspace
        // updatePlot();
        // WorkspaceDispatch.ChangeUpdateType("");
        // WorkspaceDispatch.ChangeUpdateType(`ROW_OPEN---${file.id}`);
        setTimeout(() => {
          generatePlots(file);
        }, 0);
      }
      setIsopen((prev) => !prev);
    }
  };

  const plotData = () => {
    return (
        <Xwrapper>
          <PlotDataComponent
            sharedWorkspace={sharedWorkspace}
            experimentId={experimentId}
            workspaceLoading={workspaceLoading}
            // customPlotRerender={customPlotRerender}
            file={file}
            onRowClick={onClick}
            isOpen={isOpen}
            noSorting={noSorting}
          />
        </Xwrapper>
    );
  };
  // console.log("==TableRow===");
  return (
    <>
      {!noSorting ? (
        <>
          <PlotStateComponent
            file={file}
            onRowClick={onClick}
            isOpen={isOpen}
          />
          {(isOpen || file.id === getWorkspace().selectedFile) && plotData()}
        </>
      ) : (
        getWorkspace().populations.find((pop) => pop.file === file.id) && (
          <>
            <h1
              style={{ backgroundColor: "#6666AA", color: "white", padding: 5 }}
            >
              {file.name}
            </h1>
            {plotData()}
          </>
        )
      )}
    </>
  );
};

export default PlotRowComponent;
