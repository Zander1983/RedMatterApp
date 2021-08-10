import { Button, Grid } from "@material-ui/core";
import { useRef, useState } from "react";

const readTextFile = (file: File) => {
  var rawFile = new XMLHttpRequest();
  //@ts-ignore
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status === 0) {
        var allText = rawFile.responseText;
        console.log("read an got ", allText);
      }
    }
  };
  rawFile.send(null);
};

const WorkspaceParser = () => {
  const [errors, setErrors] = useState(["abc"]);
  const [workspace, setWorkpsace] = useState({});
  const inputFile = useRef(null);

  const uploadFile = (file: File) => {
    console.log(file);
    readTextFile(file);
  };

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
        <h1>flowjo workspace parser</h1>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#6666AA",
            maxHeight: 50,
            marginTop: 5,
            marginBottom: 15,
            color: "white",
          }}
          onClick={() => {
            inputFile.current.click();
          }}
        >
          Input file
          <input
            type="file"
            id="file"
            accept=".wsp"
            ref={inputFile}
            style={{ display: "none" }}
            onChange={(e) => {
              uploadFile(e.target.files[0]);
            }}
          />
        </Button>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#6666AA",
            maxHeight: 50,
            marginTop: 5,
            color: "white",
          }}
          onClick={() => {}}
        >
          Parse the .wsp file
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
