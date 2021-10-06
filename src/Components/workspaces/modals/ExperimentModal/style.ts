import { makeStyles } from "@material-ui/core/styles";
export const useStyles = makeStyles((theme) => ({
  modal: {
    backgroundColor: "#fafafa",
    boxShadow: theme.shadows[6],
    padding: "0px 0 20px",
    width: "800px",
    position: "absolute",
    left: "50%",
    top: "30%",
    marginLeft: "-400px",
    marginTop: "-150px",
    textAlign: "center",
    borderRadius: 10,
  },
  modalContainer: {
    overflow: "scroll",
    padding: "0",
    borderRadius: 10,
  },
  modalHeader: {
    backgroundColor: "#6666A9",
    padding: "6px 0 1px",
    borderRadius: "10px 10px 0 0",
    paddingTop: 15,
    marginBottom: 15,
  },
  modalHeaderTitle: {
    color: "white",
  },
  gridContainer: {
    paddingLeft: 60,
    paddingRight: 50,
    color: "#777777",
  },
  innerGrid: {
    paddingTop: 10,
    borderBottomStyle: "solid",
    borderBottomWidth: "0.01px",
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },
  inputlabel: {
    textAlign: "left",
    fontWeight: 300,
    color: "#777",
  },
  inputWidth: {
    width: "95%",
  },
  privateExperimentStyle: {
    fontSize: 13,
    fontWeight: 300,
  },
  privateExperimentText: {
    float: "left",
    fontSize: 10,
    marginLeft: 30,
    marginTop: -13,
  },
  btns: {
    display: "flex",
    justifyContent: "space-between",
    width: "50%",
    margin: "auto",
    paddingTop: "2rem",
  },
  cancelButton: {
    backgroundColor: "#F44336",
    color: "white",
  },
  componentContainer: {
    fontFamily: "Quicksand",
    textAlign: "center",
    display: "grid",
    placeItems: "center",
    marginTop: 5,
  },
  formControlLabel: {
    marginTop: -10,
    marginLeft: "-55%",
  },
  notFoundLabel: {
    fontSize: "13px",
    marginTop: "-10px",
    color: "#777",
  },
  notFoundContainer: {
    marginBottom: -30,
    fontSize: 10,
    textAlign: "left",
    marginTop: -10,
    marginLeft: "-20%",
  },
  description: {
    marginTop: 5,
    width: 400,
  },
}));
