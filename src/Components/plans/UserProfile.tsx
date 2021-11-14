/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Grid, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import { NavLink } from "react-router-dom";
import FormControl from "@material-ui/core/FormControl";
import ChangeSubscriptionModal from "./changeSubscriptionModal";
import CancelSubscriptionModal from "./cancelSubscriptionModal";
import AddUsersModal from "./addUsersModal";
import Select from "@material-ui/core/Select";
import userManager from "Components/users/userManager";
import { snackbarService } from "uno-material-ui";
import { useDispatch } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import {
  updateUserStripeDetails,
  getPlans,
} from "../../services/StripeService";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  paperStyle: {
    padding: "10px",
    height: "70vh",
    width: "450px",
    margin: "20px auto",
  },
  avatarStyle: {
    background: "#00dffffc",
  },
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
  textFieldWidth: {
    width: "100%",
  },
  nameHighlight: {
    backgroundColor: "#6666A9",
    color: "#ffffff",
    padding: "10px 5px 5px 5px",
    borderRadius: "20px 20px 0 0",
  },
  white: {
    color: "white",
  },

  price: {
    marginTop: 18,
    marginBottom: 18,
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },

  get: {
    backgroundColor: "#6666A9",
    border: "0px solid",
    fontSize: 18,
    padding: "8px 40px",
    color: "white",
    borderRadius: 5,
    fontWeight: 500,
  },

  plan: {
    border: "solid 1px #ddd",
    borderRadius: 20,
    paddingBottom: "30px",
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box css={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Plans(props: any) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [userObj, setuserObj] = useState(null);
  const [sub, setSub] = useState(null);
  const [lastDateText, setLastDateText] = useState("Next Billing Date:");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [email, setEmail] = useState("email@email.com");
  const [subSelect, setSubSelect] = useState(null);
  const [openChange, setOpenChange] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLastDate, setSubscriptionLastDate] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState(null);
  const [invoiceCurrency, setInvoiceCurrency] = useState(null);
  const [showSubscriptionDropdown, setShowSubscriptionDropdown] =
    useState(null);
  const [showCancelSubscription, setShowCancelSubscription] = useState(false);
  const [showResumeSubscription, setShowResumeSubscription] = useState(false);
  const [plans, setPlans] = useState([]);
  const [planFiltered, setPlanFiltered] = useState([]);
  const [profileLoader, setProfileLoader] = useState(true);

  const getInvoiceBill = async () => {
    try {
      let response = await axios.get("/api/getUserNextBill", {
        headers: {
          Token: userManager.getToken(),
        },
      });
      let data = response.data.data;
      setInvoiceAmount(data.amount ? data.amount / 100 : 0);
      setInvoiceCurrency(data.currency);
    } catch (e) {}
  };

  const setVisibility = async (plans: any[]) => {
    if (plans.length > 0) {
      let subscriptionType = "Free";
      let nextBillDate = "Not Active";
      setInvoiceAmount(null);
      let subscriptionDetails = userManager.getSubscriptionDetails();
      let date = new Date(subscriptionDetails.currentCycleEnd * 1000);
      let productId = subscriptionDetails.product;
      let showSubscriptionChange = false;
      let showResumeSubscriptionBtn = false;
      let showCancelSubscriptionBtn = false;
      if (subscriptionDetails.canceled) {
        let subEndTime = date.getTime();
        let currentTime = new Date().getTime();
        if (currentTime <= subEndTime) {
          subscriptionType = userManager.getSubscriptionType();
          nextBillDate = JSON.stringify(date).substring(1, 11);
          showResumeSubscriptionBtn = true;
          setLastDateText("Subscription ends at:");
        } else {
          subscriptionType = "Free";
          nextBillDate = "Not Active";
          showSubscriptionChange = false;
        }
      } else if (subscriptionDetails.everSubscribed) {
        if (plans.length > 1) {
          let filterPlans = plans.filter((x) => x.id != productId);
          filterPlans = filterPlans.filter((x) => x.name != "Enterprise");
          setPlanFiltered(filterPlans);
          if (filterPlans.length > 0) showSubscriptionChange = true;
        }
        subscriptionType = userManager.getSubscriptionType();
        nextBillDate = JSON.stringify(date).substring(1, 11);
        showCancelSubscriptionBtn = true;
        await getInvoiceBill();
      }
      setSubscription(subscriptionType);
      setSubscriptionLastDate(nextBillDate);
      setShowSubscriptionDropdown(showSubscriptionChange);
      setShowCancelSubscription(showCancelSubscriptionBtn);
      setShowResumeSubscription(showResumeSubscriptionBtn);
    }
  };

  const changeSubscription = (option: any) => {
    if (subSelect == null) {
      alert("Please Select a subscription");
    } else {
      setProfileLoader(true);
      let plan = plans.find((x) => x.id == option);
      axios
        .post(
          "/update-subscription",
          {
            price: plan.price.id,
            subscriptionType: plan.name,
          },
          {
            headers: {
              Token: userManager.getToken(),
            },
          }
        )
        .then(async (result) => {
          await updateUserStripeDetails(dispatch);
          await setVisibility(plans);
          snackbarService.showSnackbar(
            "Subscription Updated Successfully!",
            "success"
          );
        })
        .catch(() => {
          snackbarService.showSnackbar("Subscription Updated failed!", "error");
        })
        .finally(() => {
          setProfileLoader(false);
        });
    }
    // Free Subscription
  };

  const cancelSubscription = () => {
    setProfileLoader(true);
    axios
      .post(
        "/cancel-subscription",
        {},
        {
          headers: {
            Token: userManager.getToken(),
          },
        }
      )
      .then(async () => {
        await updateUserStripeDetails(dispatch);
        await setVisibility(plans);
      })
      .catch(() => {})
      .finally(() => {
        setProfileLoader(false);
      });
  };

  const closeModal = () => {
    setOpenChange(false);
    setOpenCancel(false);
    setOpenAddUser(false);
  };

  const copiedToClipboard = () => {
    snackbarService.showSnackbar("Copied to clipboard", "success");

    closeModal();
  };

  useEffect(() => {
    initUserProfile();
  }, []);

  const initUserProfile = async () => {
    setProfileLoader(true);
    let plans = await getPlans();
    setPlans(plans);
    await setVisibility(plans);
    setProfileLoader(false);
  };

  const resumeSubscription = () => {
    setProfileLoader(true);
    axios
      .post(
        "/api/resume-subscription",
        {},
        {
          headers: {
            Token: userManager.getToken(),
          },
        }
      )
      .then(async (result) => {
        await updateUserStripeDetails(dispatch);
        await setVisibility(plans);
      })
      .catch(() => {})
      .finally(() => {
        setProfileLoader(false);
      });
  };
  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <AddUsersModal
        open={openAddUser}
        close={closeModal}
        user={userObj}
        copiedToClipboard={copiedToClipboard}
      ></AddUsersModal>
      <ChangeSubscriptionModal
        open={openChange}
        close={closeModal}
        updateSubscription={changeSubscription}
        subSelect={subSelect}
      ></ChangeSubscriptionModal>
      <CancelSubscriptionModal
        open={openCancel}
        close={closeModal}
        cancelSubscription={cancelSubscription}
      ></CancelSubscriptionModal>
      <Grid
        container
        alignContent="center"
        justify="center"
        style={{
          margin: "0 auto",
          paddingTop: 30,
          paddingBottom: 50,
          paddingLeft: "4em",
          paddingRight: "4em",
        }}
      >
        <Grid
          item
          style={{
            backgroundColor: "#fafafa",
            padding: "3em 5em",
            borderRadius: 10,
            boxShadow: "1px 1px 1px 1px #ddd",
            border: "solid 1px #ddd",
            textAlign: "left",
            width: "75%",
          }}
        >
          <Box css={{ width: "100%" }}>
            <Box css={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={(e: any, value: any) => {
                  handleChange(e, value);
                }}
                aria-label="basic tabs example"
              >
                <Tab label="Profile Info" {...a11yProps(0)} />
                <Tab label="User Management" {...a11yProps(1)} />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <h1
                style={{
                  marginBottom: "1.5em",
                  fontSize: "36px",
                }}
              >
                My profile
              </h1>
              {/* <h2>{userObj == null ? "user email" : userObj.userDetails.email}</h2> */}
              {profileLoader ? (
                <div>
                  <CircularProgress></CircularProgress>
                </div>
              ) : (
                <div>
                  <Grid
                    item
                    lg={12}
                    md={12}
                    sm={12}
                    style={{ textAlign: "left" }}
                  >
                    <Grid item lg={6} md={6} sm={6}>
                      <h3>
                        {lastDateText}
                        <span> </span>
                        <span>{subscriptionLastDate}</span>
                      </h3>
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    lg={12}
                    md={12}
                    sm={12}
                    style={{ textAlign: "left" }}
                  >
                    <Grid item lg={6} md={6} sm={6}>
                      {invoiceAmount ? (
                        <h3>
                          Next Billing Amount:
                          <span> </span>
                          <span>{invoiceAmount}</span>
                          <span> </span>
                          <span>{invoiceCurrency}</span>
                        </h3>
                      ) : null}
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    lg={12}
                    md={12}
                    sm={12}
                    style={{ textAlign: "left" }}
                  >
                    <Grid item lg={9} md={6} sm={6}>
                      <h3 style={{ marginBottom: "1.5em" }}>
                        Current Subscription:
                        <span> </span>
                        <span>{subscription}</span>
                      </h3>
                      {showSubscriptionDropdown ? (
                        <div>
                          <h3>
                            <strong>Change Subscription</strong>
                          </h3>
                          <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="subscriptionSelect">
                              Select Subscription
                            </InputLabel>
                            <Select
                              native
                              onChange={(event) => {
                                setSubSelect(event.target.value);
                              }}
                              style={{
                                width: "200px",
                                height: "40px",
                              }}
                              inputProps={{
                                name: "age",
                                id: "subscriptionSelect",
                              }}
                            >
                              <option value={null}></option>
                              {planFiltered.map((plan) => {
                                return (
                                  <option value={plan.id}>{plan.name}</option>
                                );
                              })}
                            </Select>
                          </FormControl>
                          <Button
                            style={{ marginTop: 25 }}
                            color="secondary"
                            onClick={() => setOpenChange(true)}
                          >
                            Change Subscription
                          </Button>
                        </div>
                      ) : null}
                      {}
                      {}{" "}
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    alignItems="flex-end"
                    justify="flex-start"
                    direction="row"
                    style={{ textAlign: "left" }}
                  >
                    <Grid item lg={10} md={6} sm={6}>
                      {showCancelSubscription ? (
                        <div>
                          <Button
                            style={{ marginTop: 25 }}
                            color="secondary"
                            variant="contained"
                            onClick={() => setOpenCancel(true)}
                          >
                            Cancel Subscription
                          </Button>
                        </div>
                      ) : showResumeSubscription ? (
                        <div>
                          <Button
                            style={{ marginTop: 25 }}
                            color="secondary"
                            variant="contained"
                            onClick={() => resumeSubscription()}
                          >
                            Resume Subscription
                          </Button>
                        </div>
                      ) : (
                        <h4>
                          Go to
                          <NavLink to="/plans">
                            <span> </span>Plans <span> </span>
                          </NavLink>
                          to Subscribe
                        </h4>
                      )}
                    </Grid>

                    <Grid item lg={2} md={6} sm={6}>
                      {subscription == "Enterprise" ? (
                        <div>
                          <Button
                            style={{ marginTop: 25 }}
                            color="primary"
                            variant="contained"
                            onClick={() => setOpenAddUser(true)}
                          >
                            Add Users
                          </Button>
                        </div>
                      ) : null}
                    </Grid>
                  </Grid>
                </div>
              )}

              <Grid
                container
                justify="center"
                direction="row"
                style={{ textAlign: "center" }}
              >
                <Grid item lg={7} md={6} sm={1}></Grid>

                <Grid item lg={1} md={1} sm={1}></Grid>
              </Grid>
            </TabPanel>
            <TabPanel value={value} index={1}>
              Item Two
            </TabPanel>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}
