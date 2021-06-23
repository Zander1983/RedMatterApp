import React, { useState } from "react";
import axios from "axios";
import { NavLink, useHistory, Redirect } from "react-router-dom";
import { Grid, Button, CircularProgress } from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import ExperimentCard from "./ExperimentCard";
import CreateExperimentModal from "./modals/CreateExperimentModal";

import { ExperimentApiFetchParamCreator } from "api_calls/nodejsback";
import userManager from "Components/users/userManager";
import { snackbarService } from "uno-material-ui";

const Experiments = (props: { backFromQuestions?: boolean }) => {
  const history = useHistory();
  const isLoggedIn = userManager.isLoggedIn();
  if (!isLoggedIn || process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/login");
  }
  if (process.env.REACT_APP_NO_WORKSPACES === "true") {
    history.replace("/");
  }

  const gettingOrganizationId = () => {
    try {
      let orgID = userManager.getOrganiztionID();
      return orgID;
    } catch (error) {
      let orgID = null;
      history.replace("/login");
      return orgID;
    }
    
  }

  const [experiments, setExperiments] = React.useState([]);
  const [pvtExperiments, setPrivateExperiments] = React.useState([]);
  const [fetchExperimentsComplete, setFetchExperimentsComplete] = React.useState(false);
  const [createExperimentModal, setCreateExperimentModal] = React.useState(false);
  const organizationId = gettingOrganizationId();

  const fetchExperiments = () => {
    if (!isLoggedIn) return;
    const fetchArgs = ExperimentApiFetchParamCreator({
      accessToken: userManager.getToken(),
    }).getAllExperiments(userManager.getOrganiztionID(), userManager.getToken());
    axios
      .get(fetchArgs.url, fetchArgs.options)
      .then((response) => {
        let tempPrivate = [];
        let tempOrg = [];
        
        for(let exp of response.data) {
          if(userManager.getUid() === exp.owner)
            tempPrivate.push(exp);
          else
            tempOrg.push(exp);
        }


        setExperiments(tempOrg);
        setPrivateExperiments(tempPrivate);
        setFetchExperimentsComplete(true);
      })
      .catch((e) => {
        setFetchExperimentsComplete(true);
        snackbarService.showSnackbar(
          "Failed to find experiment information",
          "error"
        );
        userManager.logout();
        history.replace("/login");
      });
  };


  const redirect = (organizationId:any) => {
    if(organizationId == null){
      //return <Redirect to='/login'/>;
      history.push('/login');
    } else{
      return
    }
  }

  const handleClose = (func: Function) => {
    func(false);
  };

  React.useEffect(() => {
    fetchExperiments();
    if (props.backFromQuestions) {
      snackbarService.showSnackbar("Experiment created", "success");
    }
  }, [organizationId]);

  if(organizationId !== undefined){
    return !isLoggedIn ? (
      <div><h1>HELLO WORLD</h1></div>
    ) : (
      <>
        <CreateExperimentModal
          open={createExperimentModal}
          closeCall={{
            f: handleClose,
            ref: setCreateExperimentModal,
          }}
          created={(experimentID: string) => {
            fetchExperiments();
          }}
          experiments={experiments.map((e) => e.name)}
          redirectIfTokenExpired={redirect}
          organizationId = {organizationId}
        />
        <Grid
          style={{
            justifyContent: "center",
            display: "flex",
            marginTop: 30,
            marginLeft: "auto",
            marginRight: "auto",
          }}
          container
          xs={12}
          md={10}
          lg={8}
        >
          <Grid
            style={{
              backgroundColor: "#fafafa",
              borderRadius: 10,
              marginLeft: 40,
              marginRight: 40,
              boxShadow: "2px 3px 3px #ddd",
            }}
            xs={12}
          >
            <Grid style={{ borderRadius: 5 }}>
              <Grid
                container
                lg={12}
                sm={12}
                style={{
                  backgroundColor: "#66a",
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  padding: 20,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 20 }}>
                  My Experiments
                </div>
                <Button
                  variant="contained"
                  style={{
                    backgroundColor: "#fafafa",
                    maxHeight: 40,
                  }}
                  onClick={() => setCreateExperimentModal(true)}
                >
                  Create
                </Button>
              </Grid>
  
              <Grid
                container
                style={{
                  padding: "10px",
                  margin: "auto",
                  width: "100%",
                }}
                xs={12}
              >
                {pvtExperiments.length > 0 ? (
                  pvtExperiments.map((data: any, index: number) => {
                    return <ExperimentCard key={`pvt${index}`} data={data} update={fetchExperiments} />;
                  })
                ) : (
                  <div
                    style={{ textAlign: "center", width: "100%", padding: 50 }}
                  >
                    { !fetchExperimentsComplete ? ( <CircularProgress
                      style={{ width: 20, height: 20 }}
                    /> ) : 'There are no experiments' }
                  </div>
                )}
              </Grid>
            </Grid>
            <Grid style={{ borderRadius: 5 }}>
              <Grid
                container
                lg={12}
                sm={12}
                style={{
                  backgroundColor: "#66a",
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  padding: 20,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 20 }}>
                  Organization Experiments
                </div>              
              </Grid>
  
              <Grid
                container
                style={{
                  padding: "10px",
                  margin: "auto",
                  width: "100%",
                }}
                xs={12}
              >
                {experiments.length > 0 ? (
                  experiments.map((data: any, index: number) => {
                    return <ExperimentCard key={`org${index}`} data={data} update={fetchExperiments} />;
                  })
                ) : (
                  <div
                    style={{ textAlign: "center", width: "100%", padding: 50 }}
                  >
                    { !fetchExperimentsComplete ? ( <CircularProgress
                      style={{ width: 20, height: 20 }}
                    /> ) : 'There are no experiments' }
                  </div>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  } 
  else{
    return(
      <h1>HELLO WORLD</h1>
    )
  }
  }

export default Experiments;
