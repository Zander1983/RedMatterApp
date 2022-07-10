import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import FluorofinderLogo from "./../../../assets/images/Fluorofinder-logo.svg";
import EasyPanel from "./../../../assets/images/easy-panel.png";

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
      <Grid item xs={6}>
        <p className={classes.textContent}>
          <a
            href="https://fluorofinder.com/"
            rel="noopener noreferrer"
            className={classes.fluoroFinder}
          >
            {"FluoroFinder"}
          </a>
          {
            " dynamically searches antibodies/fluorophores from multiple vendors to find reagents suitable for you specific machine."
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

      <Grid item xs={6}>
        <p className={classes.textContent}>
          <a href="https://flow-cytometry.net/" rel="noopener noreferrer">
            {"Easy Panel"}
          </a>
          {
            " provides an Automated/Intelligent Panel Design Algorithm (Traditional/Spectral Cytometers)"
          }
        </p>
        <div className={classes.logoContainer}>
          <img src={EasyPanel} alt="Easy Panel Logo" className={classes.logo} />
        </div>
      </Grid>
    </Grid>
  );
};
export default Partners;
