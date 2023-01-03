import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import LogosSlider from "Components/common/LogosSlider";

import universities from "assets/text/universitiesUsingRedMatter";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    textAlign: "center",
    padding: 5,
  },
  universitiesContainer: {},
  back: {
    borderRadius: 5,
  },
}));

const Universities = () => {
  const classes = useStyles();

  return (
    <Grid id="institutes" container>
      <Grid item className={classes.mainContainer}>
        <h1>Users registered in over 2,000 Institutues</h1>
        <Grid container className={classes.universitiesContainer}>
          <Grid item className={classes.back}>
            <LogosSlider content={universities} />
            <LogosSlider content={universities.reverse()} rtl={true} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Universities;
