import { makeStyles } from "@material-ui/core/styles";

const useStyle = makeStyles((theme) => ({
  logosContainer: {
    backgroundColor: theme.palette.common.white,
  },
  logoContainerWidth: {
    width: "65vw",
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
    backgroundColor: "#fff",

    [theme.breakpoints.down("md")]: {
      width: "73.2vw",
    },
    [theme.breakpoints.down("sm")]: {
      width: "97vw",
    },
  },

  logo: { "& svg ": { height: "100%", width: "80%", maxWidth: 140 } },
}));

export default useStyle;
