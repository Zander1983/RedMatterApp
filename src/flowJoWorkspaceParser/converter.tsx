import { Button, Grid } from "@material-ui/core";
import { useState } from "react";

const WorkspaceParser = () => {
  const [errors, setErrors] = useState(["abc"]);
  const [workspace, setWorkpsace] = useState({});

  return (
    <Grid container direction="row">
      <Grid item container xs={3} />
      <Grid
        item
        container
        xs={6}
        style={{ textAlign: "center", marginTop: 20 }}
        direction="column"
      >
        <h1>Hi and welcome!</h1>
        <p>This is the flowjo workspace parser, pls input file:</p>
        <p>This is the flowjo workspace parser, pls input file:</p>
        <p>Now press button:</p>
        <Button style={{ backgroundColor: "#66f", color: "white" }}>
          Click me
        </Button>
        <div
          style={{
            marginTop: 10,
            border: "solid 1px #f88",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <h1>Errors:</h1>
          <ul>
            {errors.map((e) => (
              <li>e</li>
            ))}
          </ul>
        </div>
        <div
          style={{
            marginTop: 10,
            border: "solid 1px #88f",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <h1>Workspace (as JSON):</h1>
          <ul>{JSON.stringify(workspace)}</ul>
        </div>
      </Grid>
      <Grid item container xs={3} />
    </Grid>
  );
};

export default WorkspaceParser;
