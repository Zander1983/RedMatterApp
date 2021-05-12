import { NavLink } from "react-router-dom";
import "./landing.css";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import CardHeader from "@material-ui/core/CardHeader";
import StarIcon from "@material-ui/icons/StarBorder";
import Divider from "@material-ui/core/Divider";

import loop_analytics from "../../assets/videos/loop_analytics.mp4";
import researchers_image from "../../assets/images/researchers.jpg";
import lab from "../../assets/images/lab.png";
import researcher from "../../assets/images/researcher.png";
import uni from "../../assets/images/uni2.jpg";

import icon from "../../assets/images/white_icon.png";

import Settings from "@material-ui/icons/Settings";
import Cloud from "@material-ui/icons/Cloud";
import Share from "@material-ui/icons/Share";
import Language from "@material-ui/icons/Language";
import Note from "@material-ui/icons/Note";

const useStyles = makeStyles((theme) => ({
  topDialogBar: {
    height: 500,
  },
  topDialogVisualContentBar: {
    height: 500,
    overflow: "hidden",
  },
  topDialogContent: {
    textAlign: "center",
    flexDirection: "column",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -500,
    height: "100%",
    width: "100%",
    fontFamily: "Quicksand",
  },
  card: {
    borderRadius: 10,
    zIndex: 0,
    width: 600,
    backgroundColor: "rgba(90, 110, 120, 0.8)",
  },
  marginButton: {
    margin: theme.spacing(1),
    width: 300,
    height: 50,
    boxShadow: "1px 1px 5px 1px #555",
    backgroundColor: "#66a",
    "&:hover": {
      backgroundColor: "#77b",
    },
  },
  backgroundTop: {
    width: "100%",
    marginTop: 0,
    filter: "blur(5px)",
    transform: "scale(1.3)",
  },
  heroContent: {
    marginTop: 50,
    marginBottom: 30,
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
  },
  cardHeader: {
    backgroundColor: "#303F9F",
    color: "#fff",
  },
  cardPricing: {
    display: "flex",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: theme.spacing(2),
  },
  verticalDivider: {
    marginLeft: 5,
    marginRight: 5,
    color: "#000",
    height: 500,
  },
  institutionTitle: {
    fontWeight: 700,
    fontSize: "1.8em",
  },
}));

const serviceTiers = [
  {
    title: "Free",
    price: "0",
    description: [
      "1 GB of storage",
      "Help center access",
      "Cloud based storage",
    ],
    buttonText: "Sign up for free",
    buttonVariant: "outlined",
  },
  {
    title: "Premium",
    subheader: "Most popular",
    price: "10",
    description: [
      "10 GB of storage",
      "Help center access",
      "Priority processing",
    ],
    buttonText: "Get started",
    buttonVariant: "contained",
  },
  {
    title: "Enterprise",
    price: "500",
    description: ["Unlimited accounts", "100 GB of storage", "Custom support"],
    buttonText: "Contact us",
    buttonVariant: "outlined",
  },
];

const featureList = [
  {
    title: "Cloud based storage",
    description:
      "Your files will be stored in the cloud, available anywhere! No more dongles.",
    icon: <Cloud fontSize="large" style={{ color: "#66d" }} />,
  },
  {
    title: "Shared workspaces",
    description: "You may share your workspace with other researchers",
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
    icon: <h1>...</h1>,
  },
];

const AppLandingPage = () => {
  const classes = useStyles();

  return (
    <div className="loading-page">
      <div className={classes.topDialogBar}>
        <div className={classes.topDialogVisualContentBar}>
          <video autoPlay muted loop>
            <source src={loop_analytics} type="video/mp4" />
          </video>
          {/* <img src={researchers_image} className={classes.backgroundTop}></img> */}
        </div>

        <div className={classes.topDialogContent}>
          <Card className={classes.card} variant="outlined">
            <CardContent>
              <Typography variant="h6">
                <img
                  src={icon}
                  alt="Logo"
                  height="25"
                  style={{
                    marginRight: 10,
                    marginTop: -8,
                  }}
                />
                <b
                  style={{
                    fontFamily: "quicksand",
                    fontWeight: 400,
                    fontSize: 29,
                    color: "#fff",
                  }}
                >
                  RED MATTER
                </b>
              </Typography>
              <p style={{ marginTop: 10 }}>
                <b style={{ color: "#eee" }}>Your flow analysis tool</b>
              </p>
              <p style={{ color: "#eee", marginTop: -15 }}>
                Analysing FCS files has never been easier
              </p>
              <NavLink to="/workspaces">
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  className={classes.marginButton}
                >
                  Start now
                </Button>
              </NavLink>
              <br />
              <NavLink to="/mailing-list">
                <a
                  style={{
                    color: "#ddf",
                  }}
                >
                  Or join our mailing list
                </a>
              </NavLink>
            </CardContent>
          </Card>
        </div>
      </div>

      <Grid
        container
        direction="row"
        xs={12}
        md={9}
        lg={6}
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          flexFlow: "row",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          marginTop: 20,
        }}
      >
        <div>
          <div
            style={{
              borderRadius: "50%",
              width: 270,
              height: 270,
              margin: 20,
              marginTop: -40,
              backgroundColor: "#fafafa",
              padding: 20,
              overflow: "hidden",
              border: "solid 1px #ddd",
            }}
          >
            <img
              style={{
                marginTop: -30,
                marginLeft: -10,
                height: 280,
              }}
              src={researcher}
            />
          </div>

          <h1 className={classes.institutionTitle}>Researchers</h1>
          <p
            style={{
              width: 300,
            }}
          >
            Researchers can analyse their FCS files on any device, instantly
            share, and collaborate with other researchers.
          </p>
        </div>

        <Divider
          orientation="vertical"
          className={classes.verticalDivider}
        ></Divider>

        <div>
          <div
            style={{
              borderRadius: "50%",
              width: 270,
              height: 270,
              margin: 20,
              backgroundColor: "#fafafa",
              padding: 20,
              overflow: "hidden",
              border: "solid 1px #ddd",
            }}
          >
            <img
              style={{
                marginTop: -30,
                marginLeft: -50,
                height: 420,
              }}
              src={lab}
            />
          </div>
          <h1 className={classes.institutionTitle}>Laboratories</h1>
          <p
            style={{
              marginLeft: 10,
              width: 280,
            }}
          >
            Laboratories can access their data from any device (stored securely
            in the cloud) and analyse data remotely. Red Matter provides smart
            algorithms to makes analysis of large amounts of files much more
            efficient.
          </p>
        </div>

        <Divider
          orientation="vertical"
          className={classes.verticalDivider}
        ></Divider>

        <div>
          <div
            style={{
              borderRadius: "50%",
              width: 270,
              height: 270,
              margin: 20,
              padding: 20,
              border: "solid 1px #ddd",
              overflow: "hidden",
            }}
          >
            <img
              style={{
                marginTop: -70,
                marginLeft: -153,
                height: 330,
              }}
              src={uni}
            />
          </div>
          <h1 className={classes.institutionTitle}>Universities</h1>
          <p
            style={{
              width: 300,
            }}
          >
            Red Matter is designed to flatten the steep learning curve of flow
            cytometry data analysis, and so makes for a perfect tool for users
            starting out their journey with flow cytometry.
          </p>
        </div>
      </Grid>

      <Grid
        xs={12}
        md={9}
        lg={6}
        className={classes.heroContent}
        style={{ marginTop: 20 }}
      >
        <Divider></Divider>
      </Grid>

      <Grid
        container
        xs={12}
        md={9}
        lg={6}
        style={{
          flex: 1,
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "center",
          marginBottom: -20,
        }}
      >
        {featureList.map((e) => (
          <Grid container xs={6} md={4} style={{ padding: 10 }}>
            <Grid
              container
              direction="column"
              justify="center"
              alignContent="center"
              alignItems="center"
              style={{
                border: "solid 1px #ddd",
                padding: 10,
                borderRadius: 5,
              }}
            >
              <Grid
                style={{
                  padding: 30,
                  borderRadius: "50%",
                  border: "solid 1px #ddd",
                  width: 100,
                  height: 100,
                  marginBottom: 20,
                }}
              >
                {e.icon}
              </Grid>
              <h1>{e.title}</h1>
              <p>{e.description}</p>
            </Grid>
          </Grid>
        ))}
      </Grid>

      <Grid xs={12} md={9} lg={6} className={classes.heroContent}>
        <Divider></Divider>
      </Grid>

      <Grid
        xs={12}
        md={9}
        lg={6}
        className={classes.heroContent}
        style={{
          marginTop: -5,
        }}
      >
        <h1
          style={{
            fontSize: "2em",
          }}
        >
          Pricing
        </h1>
      </Grid>

      <Grid
        container
        xs={12}
        md={9}
        lg={6}
        style={{
          marginLeft: "auto",
          marginRight: "auto",
        }}
        alignItems="flex-end"
      >
        {serviceTiers.map((tier) => (
          <Grid item key={tier.title} sm={12} md={4} style={{ padding: 10 }}>
            <Card
              style={{
                backgroundColor: "#fafafa",
                boxShadow: "1px 1px 3px 1px #ddd",
              }}
            >
              <CardHeader
                title={tier.title}
                subheader={tier.subheader}
                titleTypographyProps={{ align: "center" }}
                // @ts-ignore
                subheaderTypographyProps={{ align: "center", color: "white" }}
                action={tier.title === "Pro" ? <StarIcon /> : null}
                className={classes.cardHeader}
              />
              <CardContent>
                <div className={classes.cardPricing}>
                  <Typography component="h2" variant="h3" color="textPrimary">
                    ${tier.price}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    /mo
                  </Typography>
                </div>
                <ul>
                  {tier.description.map((line) => (
                    <Typography
                      component="li"
                      variant="subtitle1"
                      align="center"
                      key={line}
                    >
                      {line}
                    </Typography>
                  ))}
                </ul>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  // @ts-ignore
                  variant={tier.buttonVariant}
                  color="primary"
                >
                  {tier.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default AppLandingPage;
