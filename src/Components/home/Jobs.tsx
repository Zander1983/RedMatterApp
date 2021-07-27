import Grid from "@material-ui/core/Grid";

import logo_orig from "../../assets/images/logo_orig.png";
import { Divider } from "@material-ui/core";

const jobs: any[] = [
  {
    title: "Software Engineer",
    description:
      "We are looking for a smart and talented programmer, eager to have a startup experience and learn along the way. We don't expect you to know everything, and as long as the basics are fullfilled (see list below), we can teach you all you need to know on the job! We deal with a highly dynamic environment, business demands come and go, as such, we want developers who excel in uncertainty and are self-managed. We are at the beginning of our company, so growth potential is endless for those with a can-do attitude. We wear many hats to make the company and our products great, and expect you to do the same.",
    requisites: [
      "[Tech] Python OR Java",
      "[Tech] Typescript",
      "[Tech] Serverless/Microsservices knowledge",
      "[Soft Skills] Adaptive",
      "[Soft Skills] Self-managed",
    ],
    additional: [
      "[Tech] Competitive Programming",
      "[Tech] Machine Learning",
      "[Tech] Big Data",
      "[Tech] Devops",
    ],
  },
];

function About() {
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
        <Grid
          container
          justify="center"
          alignContent="center"
          alignItems="center"
          style={{ marginBottom: 50 }}
        >
          <Grid xs={12} md={9} lg={6} container direction="row">
            <img
              src={logo_orig}
              style={{
                maxWidth: "100%",
              }}
              alt="Red matter logo"
            ></img>
          </Grid>
        </Grid>
        <p
          style={{
            marginLeft: 20,
            marginRight: 20,
            color: "#555",
            fontSize: "1.12em",
          }}
        >
          Red Matter is dynamic and has a fast work environment, with many
          opportunities to make a real difference in how the company succeds and
          how our ideals play out in reality. No day is like the last, and we
          need to wear many hats to make sure we all accomplish our collective
          goal in the end. That's the Red Matter environment: hard and
          rewarding. We value bold people, who can manuver quickly and make the
          most out of their hours, who can find out for themselves what is
          needed and have the competency and independence to do it - we value
          action.
        </p>
        <p>
          Send an email to{" "}
          <b>
            <a href="mailto:jobs@redmatterapp.com">jobs@redmatterapp.com</a>
          </b>{" "}
          and we will contact you!
        </p>
        <h2 style={{ marginTop: 10 }}>Job postings</h2>
        <Grid
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            border: "solid 1px #ddd",
            padding: 10,
            textAlign: "left",
          }}
        >
          {jobs.map((e, i) => {
            return (
              <>
                <Grid>
                  <h1>
                    <b>{e.title}</b>
                  </h1>
                  <p>{e.description}</p>
                  <h3>Necessary:</h3>
                  <ul style={{ textAlign: "left" }}>
                    {e.requisites.map((i: any) => (
                      <li>•{" " + i}</li>
                    ))}
                  </ul>
                  <h3 style={{ marginTop: 10 }}>Optional:</h3>
                  <ul style={{ textAlign: "left" }}>
                    {e.additional.map((i: any) => (
                      <li>•{" " + i}</li>
                    ))}
                  </ul>
                </Grid>
                {i !== jobs.length - 1 ? (
                  <Divider
                    style={{ marginTop: 10, marginBottom: 10 }}
                  ></Divider>
                ) : null}
              </>
            );
          })}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default About;
