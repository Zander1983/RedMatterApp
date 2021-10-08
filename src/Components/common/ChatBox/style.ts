import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  chatBoxContainer: {
    position: "fixed",
    bottom: 0,
    right: 0,
  },
  icon: {
    background: "#6666AA",
    color: "white",
    borderRadius: "50%",
    fontSize: 40,
    height: "auto",
    position: "fixed",
    bottom: 5,
    right: 5,
    zIndex: 100,
  },
  chatBox: {
    width: 250,
    background: "white",
    position: "absolute",
    bottom: 50,
    right: 0,
    zIndex: 50,
    borderRadius: 5,
    boxShadow: "5px 5px 20px 0 rgba(0, 0, 0, 0.1);",
  },
  open: {
    transform: "translateX(-5px);",
    transitionDuration: "1s",
  },
  close: {
    // transform: "translateY(0px);",
    transform: "translateX(250px);",
    transitionDuration: "1s",
  },
  chatBoxHeader: {
    width: "100%",
    background: "#6666AA",
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    display: "flex",
    // justifyContent: "center",
  },
  headerMessage: {
    color: "white",
    fontWeight: 300,
    fontSize: 12,
    marginTop: -15,
  },
  chatBoxHeaderTitle: {
    fontWeight: 400,
    color: "white",
    marginTop: 5,
  },
  backIcon: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 12,
    color: "white",
  },
  mailInput: {
    border: "none",
    width: "100%",
    padding: 5,
    borderBottom: "solid 1px #f5f5f5",
    "&:focus": {
      outline: "none",
    },
  },
  messageInput: {
    border: "none",
    width: "100%",
    padding: 5,
    height: 200,
    resize: "none",
    "&:focus": {
      outline: "none",
    },
  },
  sendButton: {
    background: "white",
    padding: 0,
    border: "none",
    float: "right",
  },
  sendIcon: {
    padding: 5,
    width: "auto",
    cursor: "pointer",
  },
}));
