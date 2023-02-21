import { Button, Grid } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import ReactPlayer from "react-player";
import Generic from "../../assets/images/1_generic_analyse.png";
import AddAnlyse from "../../assets/images/1_generic_analyse_with_arrow.png";
import AddFiles from "../../assets/images/3_add_files.png";
import SignUp from "../../assets/images/4_sign_up.png";
import Plots from "../../assets/images/5_plots.png";
import Insights1 from "../../assets/images/6_insights.png";
import Insights2 from "../../assets/images/7_insights.png";

export default function Integrate() {
  const history = useHistory();

  return (
    <Grid
      style={{
        justifyContent: "center",
        display: "flex",
        marginTop: 20,
        marginLeft: "auto",
        marginRight: "auto",
        padding: "0m 4em",
      }}
      container
    >
      <Grid
        container
        style={{
          backgroundColor: "#fafafa",
          borderRadius: 10,
          padding: "50px",
          paddingTop: "10px",
          boxShadow: "2px 3px 3px #ddd",
          width: "75%",
        }}
      >
        <h2
          style={{
            width: "100%",
            textAlign: "center",
          }}
        >
          Integration
        </h2>

        <p style={{ fontSize: 16 }}>
          Red Matter can be dropped as an iframe on any website, allowing that
          website to offer its users the ability to analyse flow cytometry
          experiments.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginLeft: "20px",
            marginRight: "20px",
            padding: "20px",
            fontWeight: 900,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              borderBottom: "1px solid #ccc",
              paddingBottom: "10px",
              marginBottom: "40px",
            }}
          >
            1. e.g. Here we have a generic antibodies/reagents online store
            <img width="80%" src={Generic} alt="Generic" />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              borderBottom: "1px solid #ccc",
              paddingBottom: "10px",
              marginBottom: "40px",
            }}
          >
            2. Add a new menu item e.g. Flow Anlaysis
            <img width="80%" src={AddAnlyse} alt="AddAnlyse" />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              borderBottom: "1px solid #ccc",
              paddingBottom: "10px",
              marginBottom: "40px",
            }}
          >
            3. Drop the Red Matter iframe on the page
            <img width="80%" src={AddFiles} alt="AddFiles" />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              borderBottom: "1px solid #ccc",
              paddingBottom: "10px",
              marginBottom: "40px",
            }}
          >
            4. Collect email addresses
            <img width="80%" src={SignUp} alt="AddFiles" />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              borderBottom: "1px solid #ccc",
              paddingBottom: "10px",
              marginBottom: "40px",
            }}
          >
            5. Advertise your catalog to users as they analyse their files
            <img width="80%" src={Plots} alt="AddFiles" />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              borderBottom: "1px solid #ccc",
              paddingBottom: "10px",
              marginBottom: "40px",
            }}
          >
            6. Collect insights from users and discover antibodies, reagents and
            flow cytometry trends via Red Matter Insights
            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <img
                style={{
                  margin: "5%",
                }}
                width="40%"
                src={Insights1}
                alt="AddFiles"
              />
              <img
                style={{
                  margin: "5%",
                }}
                width="40%"
                src={Insights2}
                alt="AddFiles"
              />
            </div>
          </div>
        </div>
      </Grid>
    </Grid>
  );
}
