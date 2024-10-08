import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import Button from "@material-ui/core/Button";
import { useHistory, useLocation } from "react-router";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";

const useStyles = makeStyles((theme) => ({
  "@global": {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
  },
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: "wrap",
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
  heroContent: {
    padding: theme.spacing(8, 0, 6),
  },
  cardHeader: {
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[200]
        : theme.palette.grey[700],
  },
  cardPricing: {
    display: "flex",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: theme.spacing(2),
  },
  footer: {
    overflow: "hidden",
    borderTop: `1px solid ${theme.palette.divider}`,

    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
    marginTop: -225,
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    padding: 10,
  },
  footerMain: {
    position: "absolute",
    left: 0,
    right: 0,
    background:
      "linear-gradient(180deg, #6666F919 0%, #6666F913 50%, #F0F2F5 100%)",
  },
}));

const footerData = [
  {
    title: "About us",
    description: [
      {
        name: "Team",
        open: false,
        description: (
          <ul>
            <li>
              <b>Mark Kelly</b>
              <br /> Chief Executive Officer and software development consultant
              <br />
              <br />
            </li>
            <li>
              <b>Dr. Tomaz Einfalt</b>
              <br /> Chief Science Officer
              <br />
              <br />
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    title: "History",
    description: [
      {
        name: "History",
        open: false,
        description: (
          <div>
            Red Matter was founded in 2018 in Dublin, Ireland by Mark Kelly. It
            was built in conjunction with a local hospital who wanted to be able
            to access FCS tools remotely and from mobile devices. Red Matter is
            now used by users in over 2,000 institutes and in over 100
            countries.
          </div>
        ),
      },
      // {
      //   name: "Terms of use",
      //   open: false,
      //   description: (
      //     <div>
      //       Any FCS data uploaded to Red Matter may be used by Red Matter in an
      //       anonymised form. Red Matter defines anonymised FCS data as data that
      //       excludes any file metadata, labels, or any other infromation that
      //       would identify the FCS file or its source.
      //     </div>
      //   ),
      // },
      // {
      //   name: "Credits",
      //   path: "/credits",
      // },
    ],
  },

  // {
  //   title: "Contact",
  //   description: [
  //     {
  //       name: "Contact us",
  //       open: false,
  //       description: (
  //         <div>
  //           Send us an email at <b>support@redmatterapp.com</b>
  //         </div>
  //       ),
  //     },
  //     {
  //       name: "Join our team",
  //       path: "/jobs",
  //     },
  //   ],
  // },
];
export default function Footer(props: any) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const [footers, setFooters] = React.useState(footerData);

  const renderFooter = () => {
    return (
      <div className={classes.footerMain}>
        <Grid item xs={12} md={8} component="footer" className={classes.footer}>
          <Grid container spacing={4} justify="space-evenly">
            {footers.map((footer, i) => (
              <Grid
                key={footer.title}
                item
                xs={12}
                md={4}
                style={{ textAlign: "left" }}
              >
                <Typography variant="h6" color="textPrimary" gutterBottom>
                  {footer.title}
                </Typography>
                <ul>
                  {footer.description.map((item, j) => (
                    <li key={item.name} style={{ textAlign: "left" }}>
                      {item.open !== undefined ? (
                        <>
                          <Button
                            onClick={() => {
                              let newFooter = footers;
                              newFooter[i].description[j].open = !item.open;
                              setFooters(newFooter);
                            }}
                          >
                            {item.name}
                            {item.open ? (
                              <ArrowDropDownIcon></ArrowDropDownIcon>
                            ) : (
                              <ArrowRightIcon></ArrowRightIcon>
                            )}
                          </Button>
                          <Collapse
                            in={item.open}
                            children={item.description}
                          />
                        </>
                      ) : (
                        /* @ts-ignore */
                        <Button onClick={() => history.push(item.path)}>
                          {item.name}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </div>
    );
  };
  // !location.pathname.includes("/workspace") &&
  return renderFooter();
}
