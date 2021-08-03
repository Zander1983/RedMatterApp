import { NavLink } from "react-router-dom";
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
import lab from "../../assets/images/lab.png";
import researcher from "../../assets/images/researcher.png";
import uni from "../../assets/images/uni2.jpg";
import universities from "../../assets/text/universitiesUsingRedMatter";

import icon from "../../assets/images/white_icon.png";

import Settings from "@material-ui/icons/Settings";
import Cloud from "@material-ui/icons/Cloud";
import Share from "@material-ui/icons/Share";
import Language from "@material-ui/icons/Language";
import Note from "@material-ui/icons/Note";
import userManager from "Components/users/userManager";
import Plans from "../plans/Plans";

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
  majorColumnItem: {
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
    description: ["10 experiments/month", "Public experiments"],
    buttonText: "Sign up for free",
    buttonVariant: "outlined",
  },
  {
    title: "Premium",
    subheader: "Most popular",
    price: "30",
    description: ["Unlimited experiments/month", "Private experiments"],
    buttonText: "Get started",
    buttonVariant: "contained",
  },
  {
    title: "Enterprise",
    price: "500",
    description: [
      "Unlimited experiments/month",
      "Private experiments",
      "Custom support",
    ],
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
    icon: <h1>...</h1>,
  },
];

const AppLandingPage = () => {
  const classes = useStyles();
  const isLoggedIn = userManager.isLoggedIn();

  return (
    <div className="loading-page">
      <div className={classes.topDialogBar}>
        <div className={classes.topDialogVisualContentBar}>
          <video autoPlay muted loop>
            <source src={loop_analytics} type="video/mp4" />
          </video>
        </div>

        <div className={classes.topDialogContent}>
          <Card className={classes.card} variant="outlined">
            <CardContent>
              <Typography variant="h6">
                <img
                  src={icon}
                  alt="Red matter logo"
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
              <NavLink
                to={
                  "/" +
                  (process.env.REACT_APP_NO_WORKSPACES === "true"
                    ? "analyse"
                    : "test-red-matter")
                }
              >
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  className={classes.marginButton}
                >
                  {process.env.REACT_APP_NO_WORKSPACES === "true"
                    ? "Start Analysing"
                    : "Test Red Matter"}
                </Button>
              </NavLink>{" "}
              {!isLoggedIn ? (
                <div>
                  <div>
                    <NavLink to="/login">
                      <Button
                        variant="contained"
                        size="large"
                        color="primary"
                        className={classes.marginButton}
                      >
                        Login
                      </Button>
                    </NavLink>{" "}
                    <NavLink to="/register">
                      <Button
                        variant="contained"
                        size="large"
                        color="primary"
                        className={classes.marginButton}
                      >
                        Register
                      </Button>
                    </NavLink>
                  </div>
                </div>
              ) : process.env.REACT_APP_NO_WORKSPACES === "true" ? null : (
                <div>
                  <NavLink to="/experiments">
                    <Button
                      variant="contained"
                      size="large"
                      color="primary"
                      className={classes.marginButton}
                    >
                      Experiments
                    </Button>
                  </NavLink>
                </div>
              )}
              <br />
              <NavLink to="/mailing-list">
                <p
                  style={{
                    color: "#ddf",
                  }}
                >
                  Or join our mailing list
                </p>
              </NavLink>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Start of the container  */}

      <Grid
        container
        direction="row"
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
        <Grid item xs={12} md={9} lg={6}>
          <div>
            <div
              style={{
                borderRadius: "50%",
                width: 270,
                height: 270,
                margin: "0 auto 20px",
                marginTop: -40,
                backgroundColor: "#fafafa",
                padding: 20,
                overflow: "hidden",
                border: "solid 1px #ddd",
              }}
            >
              <img
                alt="Researcher"
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
                margin: "0 auto",
              }}
            >
              Researchers can analyse their FCS files on any device, instantly
              share, and collaborate with other researchers.
            </p>
          </div>
        </Grid>

        <Divider
          orientation="vertical"
          className={classes.verticalDivider}
        ></Divider>

        <Grid item xs={12} md={9} lg={6}>
          <div>
            <div
              style={{
                borderRadius: "50%",
                width: 270,
                height: 270,
                margin: "0 auto 20px",
                backgroundColor: "#fafafa",
                padding: 20,
                overflow: "hidden",
                border: "solid 1px #ddd",
              }}
            >
              <img
                alt="Laboratory"
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
                width: 280,
                margin: "0 auto",
              }}
            >
              Laboratories can access their data from any device (stored
              securely in the cloud) and analyse data remotely. Red Matter
              provides smart algorithms to makes analysis of large amounts of
              files much more efficient.
            </p>
          </div>
        </Grid>

        <Divider
          orientation="vertical"
          className={classes.verticalDivider}
        ></Divider>
        <Grid item xs={12} md={9} lg={6}>
          <div>
            <div
              style={{
                borderRadius: "50%",
                width: 270,
                height: 270,
                margin: "0 auto 20px",
                padding: 20,
                border: "solid 1px #ddd",
                overflow: "hidden",
              }}
            >
              <img
                alt="University"
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
                margin: "0 auto",
              }}
            >
              Red Matter is designed to flatten the steep learning curve of flow
              cytometry data analysis, and so makes for a perfect tool for users
              starting out their journey with flow cytometry.
            </p>
          </div>
        </Grid>
      </Grid>
      {/* End of the container */}
      <Grid
        item
        xs={12}
        md={9}
        lg={6}
        className={classes.majorColumnItem}
        style={{ marginTop: 20 }}
      >
        <Divider></Divider>
      </Grid>

      <Grid
        container
        style={{
          flex: 0,
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "center",
          marginBottom: -20,
          padding: ".5rem 8rem",
        }}
      >
        {featureList.map((e, i) => (
          <Grid item key={i} xs={12} md={6} lg={4} style={{ padding: 10 }}>
            <Grid
              container
              direction="column"
              justify="center"
              //alignContent="center"
              alignItems="center"
              style={{
                border: "solid 1px #ddd",
                padding: 10,
                borderRadius: 5,
                backgroundColor: "#fafaff",
                height: 300,
              }}
            >
              <Grid
                item
                style={{
                  padding: 30,
                  borderRadius: "50%",
                  border: "solid 1px #ddd",
                  width: 100,
                  height: 100,
                  marginBottom: 20,
                  backgroundColor: "white",
                  boxShadow: "1px 1px 3px 1px #ddd",
                }}
              >
                {e.icon}
              </Grid>
              <h1 style={{ color: "#333" }}>{e.title}</h1>
              <p style={{ color: "#333" }}>{e.description}</p>
            </Grid>
          </Grid>
        ))}
      </Grid>

      <Grid item xs={12} md={9} lg={6} className={classes.majorColumnItem}>
        <Divider></Divider>
      </Grid>

      <Grid
        item={true}
        xs={12}
        md={9}
        lg={6}
        className={classes.majorColumnItem}
        style={{
          marginBottom: -10,
          marginTop: -10,
          padding: 10,
        }}
      >
        <h1>
          Users all over the world trust{" "}
          <b style={{ color: "#303F9F" }}>Red Matter</b> for flow cytometry
        </h1>
        <Grid
          container
          className={classes.majorColumnItem}
          style={{
            padding: 10,
            backgroundColor: "#fff",
            borderRadius: 10,
            border: "solid 1px #ddd",
          }}
        >
          {universities.map((item, i) => (
            <Grid item key={i} xs={4} md={3} lg={2}>
              <div
                style={{
                  backgroundColor: "#fff",
                  height: 55,
                }}
              >
                <img
                  alt={item.name}
                  src={"/universityLogos/" + item.name}
                  height={50}
                />
              </div>
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid item xs={12} md={9} lg={6} className={classes.majorColumnItem}>
        <Divider></Divider>
      </Grid>

      <Grid
        item
        xs={12}
        md={9}
        lg={6}
        className={classes.majorColumnItem}
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
      <Plans></Plans>
      {/* <Grid
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
      </Grid> */}
    </div>
  );
};

export default AppLandingPage;
