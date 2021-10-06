import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import lab from "assets/images/lab2.png";
import researcher from "assets/images/researcher.png";
import uni from "assets/images/uni3.png";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    paddingTop: 20,
  },
  institutionTitle: {
    fontWeight: 700,
    fontSize: "1.8em",
  },
  cardContainer: {
    padding: 10,
    textAlign: "center",
    justifyContent: "center",
  },
  imageContainer: {
    borderRadius: "50%",
    backgroundColor: "#fff",
    overflow: "hidden",
    width: 200,
    border: "solid 1px #ddd",
    height: 200,
  },
  image: {
    display: "absolute",
    height: 200,
  },
}));

const TargetUsers = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.mainContainer}>
      {targetUserList.map((targetUser) => (
        <Grid item container xs={12} md={4} className={classes.cardContainer}>
          <Grid className={classes.imageContainer}>
            <img
              alt={targetUser.title}
              src={targetUser.img}
              className={classes.image}
            />
          </Grid>
          <Grid>
            <h1 className={classes.institutionTitle}>{targetUser.title}</h1>
            <p>{targetUser.text}</p>
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

const targetUserList = [
  {
    img: researcher,
    title: "Researchers",
    text: "Researchers can analyse their FCS files on any device, instantly share, and collaborate with other researchers.",
  },
  {
    img: lab,
    title: "Laboratories",
    text: "Laboratories can access their data from any device (stored securely in the cloud) and analyse data remotely. Red Matter provides smart algorithms to makes analysis of large amounts of files much more efficient.",
  },
  {
    img: uni,
    title: "Universities",
    text: "Red Matter is designed to flatten the steep learning curve of flow cytometry data analysis, and so makes for a perfect tool for users starting out their journey with flow cytometry.",
  },
];

export default TargetUsers;
