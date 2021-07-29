import { Grid } from "@material-ui/core";
import cancel from "./img/multiply.png";

export default function Plans() {
  return (
    <Grid
      container
      alignContent="center"
      justify="center"
      style={{
        paddingTop: 30,
        paddingBottom: 50,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <Grid
        container
        lg={8}
        md={10}
        sm={12}
        justify="center"
        direction="column"
        style={{
          backgroundColor: "#fafafa",
          padding: 20,
          borderRadius: 10,
          boxShadow: "1px 1px 1px 1px #ddd",
          border: "solid 1px #ddd",
          textAlign: "center",
        }}
      >
        <img
          src={cancel}
          alt="success icon"
          style={{ height: "4em", width: "4em", margin: "15px auto 20px" }}
        ></img>
        <h1>Payment Cancelled</h1>
        <p> Redirecting you to Homepage</p>
      </Grid>
    </Grid>
  );
}
