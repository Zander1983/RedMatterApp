import { Button, Grid } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import ReactPlayer from "react-player";

export default function HowToUse() {
  const history = useHistory();

  return (
    <Grid
      style={{
        justifyContent: "center",
        display: "flex",
        marginTop: 20,
        marginLeft: "auto",
        marginRight: "auto",
        padding: "0m 4em",
      }}
      container
    >
      <Grid
        container
        style={{
          backgroundColor: "#fafafa",
          borderRadius: 10,
          padding: "50px",
          paddingTop: "10px",
          boxShadow: "2px 3px 3px #ddd",
          width: "75%",
        }}
      >
        <h3
          style={{
            width: "100%",
            textAlign: "center",
          }}
        >
          Demonstration 1
        </h3>

        <div
          style={{
            // width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <ReactPlayer url="https://www.youtube.com/watch?v=toMj5kmlXBU" />
        </div>
      </Grid>
    </Grid>
  );
}
