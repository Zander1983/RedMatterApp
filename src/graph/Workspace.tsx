import Grid from "@material-ui/core/Grid";
import { useStore } from "react-redux";
import Plots from "./Plots";
import { WorkspaceType } from "./Types";

const Workspace = (props: { experimentId: string }) => {
  const workspace: WorkspaceType = useStore().getState().workspace;

  return (
    <Grid container item xs={12} style={{ marginTop: 50 }} justify="center">
      <Grid item container xs={9} style={{ textAlign: "center" }}>
        <Plots workspace={workspace}></Plots>
        <Grid>{JSON.stringify(workspace)}</Grid>
      </Grid>
    </Grid>
  );
};

export default Workspace;
