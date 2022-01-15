import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import Settings from "@material-ui/icons/Settings";
import Cloud from "@material-ui/icons/Cloud";
import Share from "@material-ui/icons/Share";
import Language from "@material-ui/icons/Language";
import Note from "@material-ui/icons/Note";

const useStyles = makeStyles((theme) => ({
  featuresContainer: {},
  featureContainer: {
    flexDirection: "row",
    padding: 10,
    border: "solid 1px #ddd",
    backgroundColor: "#fff",
    borderRadius: 5,
    margin: 5,
  },
  featuresHeader: {
    textAlign: "center",
  },
  featuresHeaderText: {
    fontSize: 25,
    fontWeight: 600,
  },
  featureIconContainer: {
    padding: 20,
    borderRadius: "50%",
    width: 77,
    height: 77,
    // border: "solid 1px #ddd",
    // backgroundColor: "white",
    // boxShadow: "1px 1px 2px 1px #ddd",
  },
  typography: { color: "#333", marginTop: -5 },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
}));

const Features = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.featuresContainer}>
      <Grid item xs={12} className={classes.featuresHeader}>
        <h1 className={classes.featuresHeaderText}>Features</h1>
      </Grid>
      {featureList.map((e, i) => (
        <Grid key={i} item container xs={12} sm={6} lg={4} direction="row">
          <Grid container direction="row" className={classes.featureContainer}>
            <Grid item className={classes.featureIconContainer}>
              {e.icon}
            </Grid>
            <Grid item className={classes.textContainer}>
              <h1 className={classes.typography}>{e.title}</h1>
              <p className={classes.typography}>{e.description}</p>
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

const featureList = [
  {
    title: "Cloud based storage",
    description:
      "Your files will be stored in the cloud, available anywhere! No more dongles.",
    icon: <Cloud fontSize="large" style={{ color: "#66d" }} />,
  },
  {
    title: "Shared experiments",
    description: "You may share your experiments with other researchers",
    icon: <Language fontSize="large" style={{ color: "#8a27b3" }} />,
  },
  {
    title: "Sharable links",
    description:
      "You can also share a simple link for other users to see what you've done",
    icon: <Share fontSize="large" style={{ color: "#6d6" }} />,
  },
  {
    title: "Report generation",
    description: "You can generate reports of your flow analysis",
    icon: <Note fontSize="large" style={{ color: "#FF8C00" }} />,
  },
  {
    title: "Highly customizable",
    description: "Make your analysis look however you want it to look",
    icon: <Settings fontSize="large" style={{ color: "#D2691E" }} />,
  },
  {
    title: "Many others",
    description: "Have a play around our tools!",
    icon: <h1 style={{ marginLeft: 10 }}>...</h1>,
  },
];

export default Features;
