import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { useHistory } from "react-router-dom";
import Divider from "@material-ui/core/Divider";

import formSteps from "./FormSteps";
import { useDispatch, useStore } from "react-redux";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    fontFamily: "Quicksand",
  },
  emptyButton: {
    height: 50,
    marginRight: 20,
    width: 170,
    border: "solid 2px #66a",
    color: "#66a",
  },
  filledButton: {
    height: 50,
    marginRight: 20,
    width: 170,
    backgroundColor: "#66a",
    color: "white",
    "&:hover": {
      backgroundColor: "#66a",
    },
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  marginButton: {
    margin: theme.spacing(1),
    width: 170,
    height: 50,
    backgroundColor: "#66a",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#66a",
    },
  },
  activeStepLabel: {
    color: "white",
  },
  avatar: {
    width: "1em",
    height: "1em",
    backgroundColor: "#fafafa",
  },
}));

function getSteps() {
  return [
    "Device selection",
    "Cell type",
    "Particle size",
    "Fluorophores category",
    "Description",
  ];
}
// FUNCTION THAT GETS ALL THE COMBOBOXES FROM FORMSTEPS.TSX
function getStepContent(step: number) {
  switch (step) {
    case 0:
      return formSteps.formDeviceType;
    case 1:
      return formSteps.formCellType;
    case 2:
      return formSteps.formParticleSize;
    case 3:
      return formSteps.formFlurophores;
    case 4:
      return formSteps.formDescription;
    default:
      throw Error("Unknown step");
  }
}
// THE COMPILED FORM
export default function PrototypeForm2(props: {
  workspaceID?: string;
  onSend?: Function;
}) {
  const history = useHistory();
  const store = useStore();
  const dispatch = useDispatch();
  const classes = useStyles();

  return (
    <Grid
      style={{
        borderRadius: 0,
        paddingLeft: 60,
        paddingRight: 50,
        marginTop: 0,
        backgroundColor: "#FAFAFA",
      }}
    >
      <div
        style={{
          fontFamily: "Quicksand",
          marginTop: -10,
          marginBottom: 30,
          color: "#777",
        }}
      >
        {/* //THIS IS THE MODAL FORM, EACH TYPOGRAPHY IS THE TITLE FOR THE SELECTION, AND 
            //GET STEPCONTENT(number) GETS THE CONTENT, AS YOU'D EXPECT */}

        <form>
          {" "}
          {/* //DEVICE TYPE */}
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <Typography
                className={classes.instructions}
                style={{ marginTop: 0, textAlign: "left" }}
              >
                <h4 style={{ fontWeight: 300 }}>{getStepContent(0).title}</h4>
              </Typography>
            </Grid>
            <Grid item xs={4}>
              {getStepContent(0).component}
            </Grid>
          </Grid>
          <Divider
            style={{ width: "100%", marginBottom: 10, marginTop: 5 }}
          ></Divider>
          {/* //TYPE OF CELL TO MEASURE */}
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <Typography
                className={classes.instructions}
                style={{ marginTop: 0, textAlign: "left" }}
              >
                <h4 style={{ fontWeight: 300 }}>{getStepContent(1).title}</h4>
              </Typography>
            </Grid>

            <Grid item xs={4}>
              {getStepContent(1).component}
            </Grid>
          </Grid>
          <Divider
            style={{ width: "100%", marginBottom: 10, marginTop: 5 }}
          ></Divider>
          {/* //PARTICLE SIZE */}
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <Typography
                className={classes.instructions}
                style={{ marginTop: 10, textAlign: "left" }}
              >
                <h4 style={{ fontWeight: 300 }}>{getStepContent(2).title}</h4>
              </Typography>
            </Grid>

            <Grid item xs={4}>
              {getStepContent(2).component}
            </Grid>
          </Grid>
          <Divider
            style={{ width: "100%", marginBottom: 10, marginTop: 5 }}
          ></Divider>
          {/* //FLUOROSPHORES CATEGORY */}
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <Typography
                className={classes.instructions}
                style={{ marginTop: 10, textAlign: "left" }}
              >
                <h4 style={{ fontWeight: 300 }}>{getStepContent(3).title}</h4>
              </Typography>
            </Grid>
            <Grid item xs={4}>
              {getStepContent(3).component}
            </Grid>
          </Grid>
          <Divider
            style={{ width: "100%", marginBottom: 10, marginTop: 5 }}
          ></Divider>
          {/* DESCRIPTION */}
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <Typography
                className={classes.instructions}
                style={{ marginTop: 0, textAlign: "left" }}
              >
                <h4 style={{ fontWeight: 300 }}>{getStepContent(4).title}</h4>
              </Typography>
            </Grid>
            <Grid item xs={4}>
              {getStepContent(4).component}
            </Grid>
          </Grid>
        </form>
      </div>
    </Grid>
  );
}
