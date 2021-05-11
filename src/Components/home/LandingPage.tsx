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
import cooldiagram1 from "../../assets/images/testpics/cooldiagram1.png";
import cooldiagram2 from "../../assets/images/testpics/cooldiagram2.png";
import cooldiagram3 from "../../assets/images/testpics/cooldiagram3.png";

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
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[200]
        : theme.palette.grey[700],
  },
  cardPricing: {
    display: "flex",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: theme.spacing(2),
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
    icon: <Cloud fontSize="large" />,
  },
  {
    title: "Shared workspaces",
    description: "You may share your workspace with other researchers",
    icon: <Language fontSize="large" />,
  },
  {
    title: "Sharable links",
    description:
      "You can also share a simple link for other users to see what you've done",
    icon: <Share fontSize="large" />,
  },
  {
    title: "Report generation",
    description: "You can generate reports of your flow analysis",
    icon: <Note fontSize="large" />,
  },
  {
    title: "Highly customizable",
    description: "Make your analysis look however you want it to look",
    icon: <Settings fontSize="large" />,
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
        style={{
          flex: 1,
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
              backgroundColor: "red",
              borderRadius: "50%",
              width: 300,
              height: 300,
              margin: 20,
              padding: 20,
              overflow: "hidden",
            }}
          >
            <img
              style={{
                marginTop: -30,
                marginLeft: -50,
                width: 370,
                height: 310,
              }}
              src={cooldiagram1}
            />
          </div>
          <h1>Researchers</h1>
          <p
            style={{
              width: 340,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>
        <Divider
          orientation="vertical"
          style={{
            marginLeft: 1,
            marginRight: 1,
          }}
        ></Divider>
        <div>
          <div
            style={{
              backgroundColor: "green",
              borderRadius: "50%",
              width: 300,
              height: 300,
              margin: 20,
              padding: 20,
              overflow: "hidden",
            }}
          >
            <img
              style={{
                marginTop: -37,
                marginLeft: -44,
                width: 345,
                height: 330,
              }}
              src={cooldiagram2}
            />
          </div>
          <h1>Laboratories</h1>
          <p
            style={{
              width: 340,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>
        <Divider
          orientation="vertical"
          style={{
            marginLeft: 1,
            marginRight: 1,
          }}
        ></Divider>
        <div>
          <div
            style={{
              backgroundColor: "blue",
              borderRadius: "50%",
              width: 300,
              height: 300,
              margin: 20,
              padding: 20,
              overflow: "hidden",
            }}
          >
            <img
              style={{
                marginTop: -35,
                marginLeft: -33,
                width: 330,
                height: 330,
              }}
              src={cooldiagram3}
            />
          </div>
          <h1>Universities</h1>
          <p
            style={{
              width: 340,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>
      </Grid>

      <Grid xs={12} md={9} lg={6} className={classes.heroContent}>
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

      <Grid xs={12} md={9} lg={6} className={classes.heroContent}>
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
            <Card>
              <CardHeader
                title={tier.title}
                subheader={tier.subheader}
                titleTypographyProps={{ align: "center" }}
                subheaderTypographyProps={{ align: "center" }}
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
