import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";

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

function TextPromptModal(props: {
  open: boolean;
  closeCall: { f: Function; ref: Function };
  title: string;
  value: Function;
  setValue: (text: string) => void;
  placeholder?: string;
  description?: string;
  cancel?: Function;
  confirm?: Function;
  validate?: (text: string) => string;
  invalidated?: (text: string) => void;
}): JSX.Element {
  const classes = useStyles();

  return (
    <Modal
      open={props.open}
      onClose={() => {
        props.closeCall.f(props.closeCall.ref);
      }}
    >
      <div className={classes.modal}>
        <h2>{props.title}</h2>

        <TextField
          variant="outlined"
          placeholder={props.placeholder}
          onChange={(textField: any) => {
            props.setValue(textField.target.value);
          }}
          value={props.value()}
          style={{
            width: "50%",
          }}
        ></TextField>

        <Divider
          style={{
            marginTop: 10,
            marginBottom: 10,
          }}
        ></Divider>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "50%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {props.confirm !== undefined ? (
            <Button
              variant="contained"
              style={{ backgroundColor: "#4CCF50", color: "white" }}
              onClick={() => {
                let validation = "";
                if (props.validate !== undefined) {
                  validation = props.validate(props.value());
                }
                if (validation.length > 0) {
                  props.invalidated(validation);
                  return;
                }
                props.confirm();
                props.setValue("");
                props.closeCall.f(props.closeCall.ref);
              }}
            >
              Confirm
            </Button>
          ) : null}
          {props.cancel !== undefined ? (
            <Button
              variant="contained"
              style={{ backgroundColor: "#F44336", color: "white" }}
              onClick={() => {
                props.cancel();
                props.closeCall.f(props.closeCall.ref);
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

export default TextPromptModal;
