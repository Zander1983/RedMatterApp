import { Grid } from "@material-ui/core";

export default function Plans(props: any) {
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
      <script src="https://js.stripe.com/v3/"></script>
      <Grid
        container
        lg={8}
        md={10}
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
        <h1>Premium Plan Checkout</h1>

        <Grid
          container
          lg={12}
          md={12}
          sm={12}
          justify="center"
          direction="row"
          style={{
            textAlign: "center",
          }}
        >
          <Grid item lg={6} md={6} sm={6}>
            <h3>Item</h3>
          </Grid>

          <Grid item lg={6} md={6} sm={6}>
            <h3>Price</h3>
          </Grid>
        </Grid>

        <Grid
          container
          lg={12}
          md={12}
          sm={12}
          justify="center"
          direction="row"
          style={{
            textAlign: "center",
          }}
        >
          <Grid item lg={6} md={6} sm={6}>
            <h3>Premium Plan</h3>
          </Grid>

          <Grid item lg={6} md={6} sm={6}>
            <h3>$30</h3>
          </Grid>
        </Grid>

        <Grid
          container
          lg={12}
          md={12}
          sm={12}
          justify="center"
          direction="row"
          style={{
            textAlign: "center",
          }}
        >
          <Grid item lg={7} md={6} sm={1}></Grid>
          <Grid item lg={3} md={6} sm={12}>
            <form id="payment-form">
              <div id="card-element"></div>
              <button id="submit">
                <div className="spinner hidden" id="spinner"></div>
                <span id="button-text">Pay now</span>
              </button>
              <p id="card-error" role="alert"></p>
              <p className="result-message hidden">
                Payment succeeded, see the result in your
                <a href="https://stripe.com" target="_blank" rel="noreferrer">
                  Stripe dashboard.
                </a>{" "}
                Refresh the page to pay again.
              </p>
            </form>
          </Grid>

          <Grid item lg={1} md={1} sm={1}></Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
