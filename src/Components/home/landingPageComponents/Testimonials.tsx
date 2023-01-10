import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

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
const Testimonials = () => {
  const classes = useStyles();
  return (
    <Grid container>
      <Grid item xs={12} className={classes.featuresHeader}>
        <h1 id="testimonials" className={classes.featuresHeaderText}>
          Testimonials
        </h1>
      </Grid>
      <Grid item xs={5}>
        <p>
          "Thank you for making such a useful tool!" - Mariona R, Stanford
          University
        </p>
        <p>
          "I'm experimenting with your new software, which I think is a
          fantastic concept." - John B, Stanford University
        </p>
        <p>"Superb work guys!" - David S, Sanquin, Netherlands</p>
        <p>
          "Thank You!!!! Your program saved my butt in this Immunodiagnostics
          course! User-friendly, smooth looking, works on Windows 10... I love
          you guys so much." - Elizabeth S, graduate student at Michigan State
          University
        </p>
      </Grid>
      <Grid item xs={2}></Grid>
      <Grid item xs={5}>
        <p>
          "The app is really great though and super easy to use- thank you !" -
          Researcher, University of Oxford
        </p>
        <p>
          "This software is excellent and can be improved a lot. thanks." - Dr.
          Madan V, Indian Institute of Information Technology
        </p>
        <p>
          "Redmatter app is been an eye opener for novice cytometer use like
          myself learning to analyze the various flow data. I think this app is
          good idea and its great to be able to have FCS viewer on the 'go',
          currently our group is split between using this app to look at the
          data and the other using google slide to share the data results. " -
          Chung H, rHEALTH
        </p>
      </Grid>
    </Grid>
  );
};
export default Testimonials;
