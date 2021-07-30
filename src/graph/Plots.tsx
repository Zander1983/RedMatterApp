import { Grid } from "@material-ui/core";
import { getMockPlotNoGates } from "./mocks";
import Plot, { PlotProps } from "./Plot";
import { PlotType, WorkspaceType } from "./Types";

const filterPlotData = (workspace: WorkspaceType): PlotProps[] => {
  const plots: PlotProps[] = [];
  for (const key in Object.keys(workspace.plots)) {
    const plot: PlotType = workspace.plots[key];
    const plotProps: PlotProps = {
      plot,
      gates: [],
    };
    for (const gateData of plot.gates) {
      plotProps.gates.push(workspace.gates[gateData.gateId]);
    }
    plots.push(plotProps);
  }
  return plots;
};

const Plots = (props: { workspace: WorkspaceType }): any => {
  let plots = filterPlotData(props.workspace);

  while (plots.length <= 0) {
    plots.push({
      gates: [],
      plot: getMockPlotNoGates(),
    });
  }

  return (
    <Grid>
      {plots.map((plotProps: PlotProps) => (
        <Plot plotData={plotProps} key={plotProps.plot.id} />
      ))}
    </Grid>
  );
};

export default Plots;
