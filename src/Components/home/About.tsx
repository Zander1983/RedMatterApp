import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";

import firebase from "utils/firebase";

const sentEmails: string[] = [];

function App() {
  const [senderEmail, setSenderEmail] = React.useState("");
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const sendEmail = (email: string) => {
    setLoading(true);
    if (!validateEmail(email)) {
      setError("The email informed is not valid!");
      setShow(true);
      setLoading(false);
      return;
    }
    if (sentEmails.includes(email)) {
      setError("This email has already been registred!");
      setShow(true);
      setLoading(false);
      return;
    }
    firebase.retrieveFromCloud(
      "email-list",
      "email",
      email,
      (collection: any) => {
        if (collection === null) {
          firebase.saveToCloud("email-list", {
            email: email,
            timestamp: new Date().toISOString(),
          });
          setSuccess(true);
          setShow(true);
          setLoading(false);
          sentEmails.push(email);
          return;
        } else {
          setError("This email has already been registred!");
          setLoading(false);
          setShow(true);
        }
      }
    );
  };

  function validateEmail(email: string): boolean {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  return (
    <Grid
      container
      alignContent="center"
      justify="center"
      style={{
        paddingTop: 30,
        paddingBottom: 50,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <Grid
        container
        lg={6}
        md={9}
        sm={12}
        justify="center"
        direction="column"
        style={{
          backgroundColor: "#fafafa",
          padding: 20,
          borderRadius: 10,
          boxShadow: "1px 1px 1px 1px #ddd",
          border: "solid 1px #ddd",
          textAlign: "center",
        }}
      >
        <h1> Join our mailing list!</h1>
        <div style={{ textAlign: "left" }}>
          <h3>Your email</h3>
          <TextField
            id="outlined-basic"
            placeholder="myemail@provider.cd"
            variant="outlined"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "white",
            }}
          />
        </div>
        {show ? (
          <div>
            {success ? (
              <div
                style={{
                  backgroundColor: "#ddf",
                  borderRadius: 5,
                  marginTop: 10,
                }}
              >
                ❤️ You have been subscribed to our mailing list ❤️
              </div>
            ) : null}
            {error ? (
              <div
                style={{
                  backgroundColor: "#fdd",
                  borderRadius: 5,
                  marginTop: 10,
                }}
              >
                {error}
              </div>
            ) : null}
          </div>
        ) : null}
        <Grid
          justify="center"
          container
          style={{
            marginTop: 30,
          }}
        >
          <Button
            style={{
              height: 50,
              marginRight: 20,
              width: 170,
              backgroundColor: "#66a",
              color: "white",
            }}
            onClick={() => {
              setError(null);
              setSuccess(false);
              setShow(false);
              sendEmail(senderEmail);
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress
                style={{
                  color: "white",
                  width: 23,
                  height: 23,
                }}
              />
            ) : (
              "Submit"
            )}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;
