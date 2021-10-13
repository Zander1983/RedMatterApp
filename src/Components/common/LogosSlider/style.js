import { makeStyles } from "@material-ui/core/styles";

const useStyle = makeStyles((theme) => ({
  logosContainer: {
    backgroundColor: theme.palette.common.white,
  },
  logo: { "& svg ": { height: "100%", width: "80%" } },
}));

export default useStyle;
