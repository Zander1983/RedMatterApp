import { makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) => ({
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
    textAlign: "left",
    fontWeight: 300,
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
  divider: {
    width: "100%", 
    marginBottom: 10, 
    marginTop: 5 
  },
  grid: {
    borderRadius: 0,
    paddingLeft: 60,
    paddingRight: 50,
    marginTop: 0,
    backgroundColor: "#FAFAFA",
  },
  gridContainer: {
    fontFamily: "Quicksand",
    marginTop: -10,
    marginBottom: 30,
    color: "#777",
  }

}));