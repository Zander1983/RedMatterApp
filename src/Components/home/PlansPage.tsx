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
    <Grid container >
      <Grid item className={classes.mainContainer} xs={12} md={9} lg={8} component={"div"}>
        <Plans />
      </Grid>
    </Grid>
  );
};

export default PlansPage;
