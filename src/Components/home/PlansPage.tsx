import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import Plans from "./landingPageComponents/Plans";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    flexDirection: "column",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 30,
  },
}));

const PlansPage = () => {
  const classes = useStyles();

  return (
    <Grid>
      <Grid className={classes.mainContainer} container xs={12} md={9} lg={8}>
        <Plans />
      </Grid>
    </Grid>
  );
};

export default PlansPage;
