import { Button, Grid } from "@material-ui/core";
import { NavLink } from "react-router-dom";

export default function Terms() {
  return (
    <Grid
      container
      xs={12}
      md={9}
      lg={6}
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 10,
        padding: 10,
      }}
    >
      <h1>Red Matter's Terms ({new Date().getFullYear()})</h1>
      <p>
        Any FCS data uploaded to Red Matter may be used by Red Matter in an
        anonymised form. Red Matter defines anonymised FCS data as data that
        excludes any file metadata, labels, or any other infromation that would
        identify the FCS file or its source.
      </p>
      <div
        style={{
          width: "100%",
          textAlign: "center",
        }}
      >
        <NavLink to="/">
          <Button
            style={{
              border: "solid 1px #000",
            }}
          >
            Go back
          </Button>
        </NavLink>
      </div>
    </Grid>
  );
}
