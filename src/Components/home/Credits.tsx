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
      <ul>
        <li>
          <a href="https://pngtree.com/so/science">
            science png from pngtree.com
          </a>
        </li>
        <li>
          <a href="https://www.freepik.com/vectors/banner">
            Banner vector created by vectorpocket - www.freepik.com
          </a>
        </li>
        <li>
          <a href="https://pngtree.com/so/education">
            education png from pngtree.com
          </a>
        </li>
        <li>
          <a href="https://www.freepik.com/vectors/school">
            School vector created by pch.vector - www.freepik.com
          </a>
        </li>
      </ul>
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
