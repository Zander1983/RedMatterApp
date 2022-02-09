import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Divider from "@material-ui/core/Divider";
import useGAEventTrackers from "hooks/useGAEvents";
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
interface MessageModalProps {
  open: boolean;
  // closeCall: { f: Function; ref: Function };
  close: React.Dispatch<React.SetStateAction<boolean>>;
  // message: React.Component;
  noButtons?: boolean;
  options?: {
    yes(): void;
    no(): void;
  };
}

function MessageModal(
  props: React.PropsWithChildren<MessageModalProps>
): JSX.Element {
  const classes = useStyles();
  // useWhyDidYouUpdate("Modal", props);
  const eventStacker = useGAEventTrackers("Plot Deleted.");
  return (
    <Modal
      open={props.open}
      onClose={() => {
        props.close(false);
        // props.closeCall.f(props.closeCall.ref);
      }}
    >
      <div className={classes.modal}>
        {props.children}
        {props.noButtons ? null : (
          <div>
            <Divider style={{ marginTop: 10, marginBottom: 10 }}></Divider>
            {props.options === undefined ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  props.close(false);
                  // props.closeCall.f(props.closeCall.ref)
                }}
              >
                Go back
              </Button>
            ) : (
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    eventStacker("A plot was deleted.");
                    props.options?.yes();
                    props.close(false);

                    // props.closeCall.f(props.closeCall.ref);
                  }}
                >
                  Yes
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    marginLeft: 20,
                  }}
                  onClick={() => {
                    props.options?.no();
                    props.close(false);

                    // props.closeCall.f(props.closeCall.ref);
                  }}
                >
                  No
                </Button>
              </div>
            )}{" "}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default MessageModal;
