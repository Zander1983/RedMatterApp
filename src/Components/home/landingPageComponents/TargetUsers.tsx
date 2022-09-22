import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Divider } from "antd";
import lab from "assets/images/lab2.png";
import researcher from "assets/images/researcher.png";
import uni from "assets/images/uni3.png";
import integration from "assets/images/integration.png";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    paddingTop: 20,
  },
  institutionTitle: {
    fontWeight: 700,
    fontSize: "1.8em",
  },
  cardContainer: {
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
    display: "block",
  },
  image: {
    display: "absolute",
    height: 200,
  },
}));

const TargetUsers = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.mainContainer} spacing={3}>
      {analysis.map((targetUser, i) => (
        <Grid
          key={i}
          item
          container
          xs={12}
          md={12}
          className={classes.cardContainer}
        >
          {/* <Grid className={classes.imageContainer}>
            <img
              alt={targetUser.title}
              src={targetUser.img}
              className={classes.image}
            />
          </Grid> */}
          <Grid>
            <h1 className={classes.institutionTitle}>{targetUser.title}</h1>
            <p>{targetUser.text}</p>
          </Grid>
        </Grid>
      ))}
      <Divider />
      {integrate.map((targetUser, i) => (
        <Grid
          key={i}
          item
          container
          xs={12}
          md={12}
          className={classes.cardContainer}
        >
          {/* <Grid className={classes.imageContainer}>
            <img
              alt={targetUser.title}
              src={targetUser.img}
              className={classes.image}
            />
          </Grid> */}
          <Grid>
            <h1 className={classes.institutionTitle}>{targetUser.title}</h1>
            <p>{targetUser.text}</p>
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

const analysis = [
  {
    img: researcher,
    title: "Core Flow Cytometry Functionality",
    text:
      "Most flow users do not need the huge amount of functionality provided by traditional Desktop applications. Red Matter took the core functionality, and built it in the web. No installation. Works on all browsers.",
  },
  // {
  //   img: integration,
  //   title: "Integrate On Any Site",
  //   text:
  //     "A white-label version of the Red Matter software can be run on any website by simply dropping in the Red Matter Javascript library. For more email me at mark.kelly@redmatterapp.com",
  // },
  // {
  //   img: uni,
  //   title: "Universities",
  //   text: "Red Matter is designed to flatten the steep learning curve of flow cytometry data analysis, and so makes for a perfect tool for users starting out their journey with flow cytometry.",
  // },
];

const integrate = [
  // {
  //   img: researcher,
  //   title: "Researchers",
  //   text: "Researchers can analyse their FCS files on any device, instantly share, and collaborate with other researchers.",
  // },
  {
    img: integration,
    title: "Integrate On Any Site",
    text:
      "A white-label version of the Red Matter software can be run on any website by simply dropping in the Red Matter Javascript library. For more email me at mark.kelly@redmatterapp.com",
  },
  // {
  //   img: uni,
  //   title: "Universities",
  //   text: "Red Matter is designed to flatten the steep learning curve of flow cytometry data analysis, and so makes for a perfect tool for users starting out their journey with flow cytometry.",
  // },
];

export default TargetUsers;
