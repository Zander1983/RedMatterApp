import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import FluorofinderLogo from "./../../../assets/images/Fluorofinder-logo.svg";

const useStyles = makeStyles((theme) => ({
  featuresHeader: {
    textAlign: "center",
  },
  featuresHeaderText: {
    fontSize: 25,
    fontWeight: 600,
  },
  textContent: {
    fontSize: 16,
    fontWeight: 500,
    textAlign: "center",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
  },
  logo: {
    width: "25%",
  },
  fluoroFinder: {
    color: "#4F90C7",
  },
}));
const Partners = () => {
  const classes = useStyles();
  return (
    <Grid container>
      <Grid item xs={12} className={classes.featuresHeader}>
        <h1 className={classes.featuresHeaderText}>Partners</h1>
      </Grid>
      <Grid item xs={12}>
        <p className={classes.textContent}>
          {"Red Matter has partnered with "}
          <a
            href="https://fluorofinder.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.fluoroFinder}
          >
            {"FluoroFinder"}
          </a>
          .
          <a
            href="https://fluorofinder.com/"
            rel="noopener noreferrer"
            className={classes.fluoroFinder}
          >
            {"FluoroFinder"}
          </a>
          {
            "is a multicolor fluorescent experiment design software that is free for academic and non-profit labs. Using preloaded cytometer configurations from hundreds of core facilities, FluoroFinder dynamically searches antibodies/fluorophores from multiple vendors to find reagents suitable for you specific machine."
          }
        </p>
        <div className={classes.logoContainer}>
          <img
            src={FluorofinderLogo}
            alt="FluorofinderLogo"
            className={classes.logo}
          />
        </div>
      </Grid>
    </Grid>
  );
};
export default Partners;
