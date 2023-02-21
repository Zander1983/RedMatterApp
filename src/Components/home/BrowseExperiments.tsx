import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { NavLink, useHistory } from "react-router-dom";
import { Grid, Button, TextField } from "@material-ui/core";
import useForceUpdate from "hooks/forceUpdate";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiOutlinedInput-root": {
      color: "white",
    },
    "& .MuiInputLabel-root": {
      color: "white",
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "white",
    },
  },
  features: {
    display: "inline-block",
    margin: "0px 20px 0px 0px",
    fontSize: "10px",
    fontStyle: "italic",
    color: "#333",
  },
  experiment: {
    // padding: "25px 30px",
    margin: "10px 0",
    width: "100%",
    height: "13em",
    border: "2px solid #6666aa",
    borderRadius: "20px",
    "&:hover": {
      // background: "#efefef",
      borderRadius: "20px",
      cursor: "pointer",
      boxShadow: "1px 2px 5px 3px #a3a3a0",
    },
  },
}));

const BrowseExperiments = (props: { backFromQuestions?: boolean }) => {
  const history = useHistory();
  const classes = useStyles();

  const forceUpdate = useForceUpdate();

  const [experiments, setExperiments] = useState(null);
  const [name, setName] = useState("");
  const [skip, setSkip] = useState(0);

  // const getExperiments = useCallback(
  //   (name: string, skip: number) => {
  //     axios
  //       .post(
  //         "/browse-experiments",
  //         {
  //           name: name,
  //           items: 25,
  //           skip: skip,
  //         },
  //         {
  //           headers: {
  //             token: userManager.getToken(),
  //           },
  //         }
  //       )
  //       .then((response) => {
  //         const exp = response.data.filter((e: any) => e?.details);
  //         if (skip === 0) {
  //           setExperiments(exp);
  //         } else {
  //           let aux = experiments;
  //           //@ts-ignore
  //           exp.map((experiment) => {
  //             return aux.push(experiment);
  //           });

  //           setExperiments(aux);
  //           forceUpdate();
  //         }
  //       });
  //   },
  //   [name, skip]
  // );

  return (
    <>
      <Grid
        style={{
          justifyContent: "center",
          display: "flex",
          marginTop: 30,
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 4em",
        }}
        container
      >
        <Grid
          container
          style={{
            backgroundColor: "#fafafa",
            borderRadius: 10,
            marginLeft: 40,
            marginRight: 40,
            boxShadow: "2px 3px 3px #ddd",
            width: "75%",
          }}
        >
          <Grid container style={{ borderRadius: 5 }}>
            <Grid
              container
              style={{
                backgroundColor: "#66a",
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                padding: 20,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 18,
                  padding: "0 .5em 0 .5em",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <h3
                  style={{
                    color: "#fff",
                    marginBottom: 0,
                    display: "inline-block",
                  }}
                >
                  Browse Experiments
                </h3>

                <TextField
                  id="outlined-basic"
                  className={classes.root}
                  label="Search "
                  variant="outlined"
                  size="small"
                  onChange={(e) => {
                    setSkip(0);
                    setName(e.target.value);
                  }}
                  style={{
                    width: "70%",
                    color: "white",
                  }}
                />
              </div>
            </Grid>

            <Grid
              container
              style={{
                padding: "30px 30px",
                margin: "auto",
                width: "100%",
                justifyContent: "space-evenly",
              }}
            >
              {experiments == null ? (
                <h3 style={{ marginBottom: 0, color: "gray" }}>
                  <i>Loading experiments...</i>
                </h3>
              ) : (
                //@ts-ignore
                experiments.map((experiment, i) => {
                  return (
                    <NavLink
                      key={i}
                      style={{
                        width: "31%",
                      }}
                      to={`/experiment/${experiment.id}/poke`}
                    >
                      <div

                      // onClick={() => {
                      //   history.replace(`/experiment/${experiment.id}/poke`);
                      // }}
                      >
                        <div className={classes.experiment}>
                          <div>
                            <h3
                              style={{
                                marginBottom: 0,
                                color: "#fff",
                                backgroundColor: "#6666aa",
                                borderRadius: "14px 14px 0 0",
                                padding: ".5em .8em",
                              }}
                            >
                              <strong>
                                Name:{" "}
                                {experiment.name.length > 20
                                  ? `${experiment.name.slice(0, 20)}...`
                                  : experiment.name}
                              </strong>
                            </h3>
                          </div>

                          <div
                            style={{
                              padding: ".3em 1em .3em",
                            }}
                          >
                            <div className={classes.features}>
                              Device:{" "}
                              <strong>{experiment?.details?.device}</strong>
                            </div>
                            <br></br>
                            <div className={classes.features}>
                              Cell Type:{" "}
                              <strong>{experiment?.details?.cellType}</strong>
                            </div>
                            <br></br>
                            <div className={classes.features}>
                              Particle Size:{" "}
                              <strong>
                                {experiment?.details?.particleSize}
                              </strong>
                            </div>
                            <br></br>
                            <div className={classes.features}>
                              Fluorophores:{" "}
                              <strong>
                                {experiment?.details?.fluorophoresCategory}
                              </strong>
                            </div>
                            <div
                              className={classes.features}
                              style={{
                                overflow: "hidden",
                                width: "100%",
                              }}
                            >
                              <i>
                                Description:{" "}
                                <strong>
                                  {experiment?.details?.description}
                                </strong>
                              </i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </NavLink>
                  );
                })
              )}

              {experiments == null ? null : (
                <div style={{ display: "flex", width: "100%", margin: "20px" }}>
                  <Button
                    color="primary"
                    variant="contained"
                    style={{
                      margin: "0 auto",
                    }}
                    onClick={() => {
                      setSkip(skip + 25);
                    }}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default BrowseExperiments;
