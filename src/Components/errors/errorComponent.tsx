import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import BrokenImageIcon from "@material-ui/icons/BrokenImage";
import { Grid, Button, TextField } from "@material-ui/core";
// import BrokenImageIcon from "@mui/icons-material/BrokenImage";

const ErrorComponent = (props: any) => {
  const history = useHistory();
  const [mainScreenError, setMainScreenError] = useState(false);
  const [appScreenError, setAppScreenError] = useState(false);

  useEffect(() => {
    let mainScreenError = false;
    try {
      mainScreenError = props.location.state.mainScreen;
    } catch (e) {
      mainScreenError = false;
    }
    setMainScreenError(mainScreenError);
    setAppScreenError(!mainScreenError);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 100,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: "auto",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {mainScreenError ? (
          <div>
            <div>
              <BrokenImageIcon
                style={{ width: 130, height: 130, color: "rgb(255 37 69)" }}
              ></BrokenImageIcon>
            </div>
            <div style={{ fontSize: 20, color: "#736464", fontWeight: 600 }}>
              <div>Server is down. We will be live shortly.</div>
              <div>For more information contact support@redmatterapp.com</div>
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 180 }}>
            <div>
              <BrokenImageIcon
                style={{ width: 100, height: 100, color: "rgb(255 37 69)" }}
              ></BrokenImageIcon>
            </div>
            <div style={{ fontSize: 20, color: "#736464", fontWeight: 600 }}>
              <div>Something went wrong.</div>
              <div>
                please reload the page, if it persists email us at
                support@redmatterapp.com
              </div>
            </div>
            <Button
              color="primary"
              variant="contained"
              style={{
                marginTop: 20,
              }}
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Go to home page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorComponent;
