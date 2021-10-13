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
    backgroundColor: "#fff",
    borderRadius: 5,
  },
}));

const Universities = () => {
  const classes = useStyles();

  return (
    <Grid>
      <Grid item={true} className={classes.mainContainer}>
        <h1>
          Users all over the world trust{" "}
          <b style={{ color: "#303F9F" }}>Red Matter</b> for flow cytometry
        </h1>
        <Grid container className={classes.universitiesContainer}>
          <Grid container className={classes.back}>
            <LogosSlider content={universities} />
            {/* {universities.map((item, i) => (
              <Grid item key={i} xs={6} md={4} lg={3} xl={2}>
                <Grid
                  style={{
                    height: 55,
                  }}
                >
                  <img
                    alt={item.name}
                    src={"/universityLogos/" + item.name}
                    height={50}
                    style={{ maxWidth: 140 }}
                  />
                </Grid>
              </Grid>
            ))} */}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Universities;
