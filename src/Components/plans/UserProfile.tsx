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

export default function Plans(props: any) {
  const classes = useStyles();

  const [userObj, setuserObj] = useState(null);
  const [sub, setSub] = useState(null);
  const [date, setDate] = useState(null);
  const [product, setProduct] = useState(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [email, setEmail] = useState("email@email.com");
  const [subSelect, setSubSelect] = useState(null);
  const [openChange, setOpenChange] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [subscriptionSend, setSubscriptionSend] = useState(null);
  const getUserObj = useCallback(() => {
    if (product == null) {
      axios
        .get(`/profile-info`, {
          headers: {
            Token: userManager.getToken(),
          },
        })
        .then((response) => response.data)
        .then((user) => {
          setuserObj(user);
          if (user.userDetails.isOrganisationAdmin === true) {
            setuserObj(user);
            getSub(user);
          } else {
            axios
              .post(
                `/admin-profile-info`,
                {
                  adminId: user.userDetails.adminId,
                },
                {
                  headers: {
                    Token: userManager.getToken(),
                  },
                }
              )
              .then((user) => {
                getSub(user.data);
              });
          }
        });
    }
  }, [email]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const getProduct = useCallback((sub: any) => {
    axios
      .get(`/get-product?id=${sub.items.data[0].plan.product}`)
      .then((response) => response.data)
      .then((product) => {
        setProduct(product);
      });
  }, []);

  const getSub = useCallback(
    (user: any) => {
      if (
        user.userDetails.subscriptionId != null &&
        user.userDetails.subscriptionId !== ""
      ) {
        axios
          .get(`/get-subscription?id=${user.userDetails.subscriptionId}`)
          .then((response) => response.data)
          .then((subscription) => {
            setSub(subscription);
            setDate(new Date(subscription.current_period_end * 1000));
            getProduct(subscription);
          });
      } else {
        setSub("Not currently subscribed");
        setProduct({ name: "You are not currently Subscribed" });
      }
    },
    [getProduct]
  );

  const changeSubscription = (option: any) => {
    if (subSelect == null) {
      alert("Please Select a subscription");
    } else if (option === 3) {
      // enterprise subscription
      axios.post(
        "/update-subscription",
        {
          subscription: sub.id,
          price: "price_1JCapGFYFs5GcbAXGlbz4pJV",
          subscriptionType: "Enterprise",
        },
        {
          headers: {
            Token: userManager.getToken(),
          },
        }
      );
    } else if (option === 2) {
      // Premium Subscription
      axios.post(
        "/update-subscription",
        {
          subscription: sub.id,
          price: "price_1J7UmZFYFs5GcbAXvPronXSX",
          subscriptionType: "Premium",
        },
        {
          headers: {
            Token: userManager.getToken(),
          },
        }
      );
    } else if (option === 1) {
      axios.post(
        "/update-subscription",
        {
          subscription: sub.id,
          price: "price_1JCargFYFs5GcbAXZowQSPpK",
          subscriptionType: "Free",
        },
        {
          headers: {
            Token: userManager.getToken(),
          },
        }
      );
    }
    // Free Subscription
  };

  const cancelSubscription = (option: any) => {
    axios.post("/cancel-subscription", {
      subscription: sub.id,
      userId: userObj.userDetails._id,
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

  const refresh = () => {
    snackbarService.showSnackbar(
      "Subscription Updated Successfully!",
      "success"
    );
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  useEffect(() => {
    getUserObj();
  }, [getUserObj]);

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
        refresh={refresh}
        close={closeModal}
        updateSubscription={changeSubscription}
        subscription={subscriptionSend}
        subSelect={subSelect}
      ></ChangeSubscriptionModal>
      <CancelSubscriptionModal
        open={openCancel}
        refresh={refresh}
        close={closeModal}
        cancelSubscription={cancelSubscription}
        subscription={subscriptionSend}
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
        <script src="https://js.stripe.com/v3/"></script>
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
          <h1
            style={{
              marginBottom: "1.5em",
              fontSize: "36px",
            }}
          >
            My profile
          </h1>
          {/* <h2>{userObj == null ? "user email" : userObj.userDetails.email}</h2> */}

          <Grid item lg={12} md={12} sm={12} style={{ textAlign: "left" }}>
            <Grid item lg={6} md={6} sm={6}>
              <h3>
                Next Billing Date:
                <span>
                  {userObj == null
                    ? null
                    : userObj.userDetails.isOrganisationAdmin
                    ? date == null
                      ? "Not Active"
                      : " " + JSON.stringify(date).substring(1, 11)
                    : " Managed by Organisation"}
                </span>
              </h3>
            </Grid>
          </Grid>

          <Grid item lg={12} md={12} sm={12} style={{ textAlign: "left" }}>
            <Grid item lg={9} md={6} sm={6}>
              <h3 style={{ marginBottom: "1.5em" }}>
                Current Subscription:
                <span>
                  {" "}
                  {product == null
                    ? "Your Subscription Type"
                    : " " + product.name}{" "}
                </span>
              </h3>
              {userObj == null ? null : userObj.userDetails
                  .isOrganisationAdmin ? (
                product == null ? null : product.name ===
                  "You are not currently Subscribed" ? null : (
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
                        {product == null ? null : product.name ===
                          "Free Subscription" ? (
                          <option value={3}>Enterprise</option>
                        ) : (
                          <option value={1}>Free</option>
                        )}
                        {product == null ? null : product.name ===
                          "Premium Subscription" ? (
                          <option value={3}>Enterprise</option>
                        ) : (
                          <option value={2}>Premium</option>
                        )}{" "}
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
                )
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
              {userObj == null ? null : userObj.userDetails
                  .isOrganisationAdmin ? (
                product == null ? null : product.name ===
                  "You are not currently Subscribed" ? (
                  <h4>
                    Go to
                    <NavLink to="/plans">Plans</NavLink>to Subscribe
                  </h4>
                ) : (
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
                )
              ) : null}
              {}{" "}
            </Grid>

            <Grid item lg={2} md={6} sm={6}>
              {userObj == null ? null : userObj.userDetails
                  .isOrganisationAdmin ? (
                product == null ? null : product.name ===
                  "Enterprise Subscription" ? (
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
                ) : null
              ) : null}
              {}{" "}
            </Grid>
          </Grid>

          <Grid
            container
            justify="center"
            direction="row"
            style={{ textAlign: "center" }}
          >
            <Grid item lg={7} md={6} sm={1}></Grid>

            <Grid item lg={1} md={1} sm={1}></Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
