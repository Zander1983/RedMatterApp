import { makeStyles } from "@material-ui/core/styles";
import { useEffect, useState } from "react";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";

import {
  File,
  Workspace,
  Plot,
  Gate,
  PlotSpecificWorkspaceData,
} from "./resources/types";

import {
  PlotGroup,
  getPlotGroups,
  standardGridPlotItem,
} from "./components/workspaces/PlotController";

import {
  getFile,
  getGate,
  getPopulation,
  getWorkspace,
} from "graph/utils/workspace";
import PlotComponent from "./../graph/components/plots/PlotComponent";

const ResponsiveGridLayout = WidthProvider(Responsive);

const useStyles = makeStyles((theme) => ({
  welcomeTextContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    marginTop: 58,
    marginBottom: 10,
  },
  detailsText: {
    marginBottom: 70,
    color: "#777",
  },
  itemOuterDiv: {
    flex: 1,
    backgroundColor: "#eef",
    border: "solid 0.5px #bbb",
    boxShadow: "1px 3px 4px #bbd",
    borderRadius: 5,
    paddingBottom: "2rem",
  },
}));
interface GateBuilderInterface {
  file: undefined | File;
  workspace: Workspace;
  sharedWorkspace: boolean;
  workspaceLoading: boolean;
  experimentId: string;
  customPlotRerender: string[];
}
const GateBuilder = ({
  file,
  workspace,
  sharedWorkspace,
  workspaceLoading,
  experimentId,
  customPlotRerender,
}: GateBuilderInterface) => {
  const classes = useStyles();
  const [plotGroups, setPlotGroups] = useState<PlotGroup[]>([]);

  useEffect(() => {
    setPlotGroups(getPlotGroups(workspace.plots));
  }, []);

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

  return (
    <div>
      {file ? (
        plotGroups.map((plotGroup: PlotGroup, key: number) =>
          plotGroup.plots.map((plot, i) => (
            <ResponsiveGridLayout
              breakpoints={{ lg: 1200 }}
              cols={{ lg: 36 }}
              rows={{ lg: 30 }}
              rowHeight={30}
            >
              <div
                key={plot.id}
                className={classes.itemOuterDiv}
                data-grid={standardGridPlotItem(
                  i,
                  plot,
                  plotGroup.plots,
                  workspace.editWorkspace
                )}
                id={`workspace-outter-${plot.id}`}
              >
                <PlotComponent
                  plotRelevantResources={getPlotRelevantResources(plot)}
                  sharedWorkspace={sharedWorkspace}
                  editWorkspace={workspace.editWorkspace}
                  workspaceLoading={workspaceLoading}
                  customPlotRerender={customPlotRerender}
                  experimentId={experimentId}
                />
              </div>
            </ResponsiveGridLayout>
          ))
        )
      ) : (
        // <h1> {file.id} </h1>
        <span className={classes.welcomeTextContainer}>
          <h3 className={classes.headline}>
            Click on "Select Files" to visualization of GateBuilder
          </h3>
          <h4 className={classes.detailsText}>
            Selected file's data will be inserted inside the gate builder.
          </h4>
        </span>
      )}
    </div>
  );
};
export default GateBuilder;
