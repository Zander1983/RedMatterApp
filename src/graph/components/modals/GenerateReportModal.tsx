import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import useWhyDidYouUpdate from "hooks/useWhyDidYouUpdate";

const useStyles = makeStyles((theme) => ({
  modal: {
    backgroundColor: "#fafafa",
    boxShadow: theme.shadows[6],
    padding: 20,
    width: "800px",
    position: "absolute",
    left: "50%",
    top: "30%",
    marginLeft: "-400px",
    marginTop: "-150px",
    textAlign: "center",
    borderRadius: 10,
  },
}));

function GenerateReportModal(props: {
  open: boolean;
  close: React.Dispatch<React.SetStateAction<boolean>>;
  // closeCall: { f: Function; ref: Function };
}): JSX.Element {
  const classes = useStyles();
  // useWhyDidYouUpdate("Report Generate", props);
  return (
    <Modal
      open={props.open}
      onClose={() => {
        props.close(false);
        // props.closeCall.f(props.closeCall.ref);
      }}
    >
      <div className={classes.modal}>
        <h2>Generate a Report</h2>
        <p
          style={{
            color: "#777",
            fontSize: 15,
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          The prototype still doesn't allow for creating a report<br></br>
          based on your workspace, but we very much<br></br>
          intend to add this important feature ❤️
        </p>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            props.close(false);
            // props.closeCall.f(props.closeCall.ref);
          }}
        >
          Go back
        </Button>
      </div>
    </Modal>
  );
}

export default GenerateReportModal;
