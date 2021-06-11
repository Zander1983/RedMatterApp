import React from "react";
import {makeStyles, Theme, createStyles, withStyles} from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {NavLink, useHistory} from "react-router-dom";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";

import Done from "@material-ui/icons/Done";

import formSteps from "./FormSteps";
import {ExperimentApiFetchParamCreator} from "api_calls/nodejsback";
import userManager from "Components/users/userManager";
import {useDispatch, useStore} from "react-redux";
import axios from "axios";
import {snackbarService} from "uno-material-ui";

const useStyles = makeStyles((theme : Theme) => ({
    root: {
        width: "100%",
        fontFamily: "Quicksand"
    },
    emptyButton: {
        height: 50,
        marginRight: 20,
        width: 170,
        border: "solid 2px #66a",
        color: "#66a"
    },
    filledButton: {
        height: 50,
        marginRight: 20,
        width: 170,
        backgroundColor: "#66a",
        color: "white",
        "&:hover": {
            backgroundColor: "#66a"
        }
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1)
    },
    marginButton: {
        margin: theme.spacing(1),
        width: 170,
        height: 50,
        backgroundColor: "#66a",
        color: "#fff",
        "&:hover": {
            backgroundColor: "#66a"
        }
    },
    activeStepLabel: {
        color: "white"
    },
    avatar: {
        width: "1em",
        height: "1em",
        backgroundColor: "#fafafa"
    }
}));

function getSteps() {
    return [
        "Device selection",
        "Cell type",
        "Particle size",
        "Fluorophores category",
        "Description",
    ];
}
// FUNCTION THAT GETS ALL THE COMBOBOXES FROM FORMSTEPS.TSX
function getStepContent(step : number) {
    switch (step) {
        case 0:
            return formSteps.formDeviceType;
        case 1:
            return formSteps.formCellType;
        case 2:
            return formSteps.formParticleSize;
        case 3:
            return formSteps.formFlurophores;
        case 4:
            return formSteps.formDescription;
        default:
            throw Error("Unknown step");
    }
}
// THE COMPILED FORM
export default function PrototypeForm2(props : {
    workspaceID? : string;
    onSend? : Function;
}) {
    const history = useHistory();
    const store = useStore();
    const dispatch = useDispatch();
    const classes = useStyles();


    return (
        <Grid style={
            {
                borderRadius: 10,
                paddingBottom: 0,
                marginTop: 0,
                backgroundColor: "#FAFAFA"
            }
        }>
            <div style={
                {
                    fontFamily: "Quicksand",
                    marginTop: -10,
                    marginBottom: 30,
                    color: "#777"
                }
            }>
                {/* //THIS IS THE MODAL FORM, EACH TYPOGRAPHY IS THE TITLE FOR THE SELECTION, AND 
            //GET STEPCONTENT(number) GETS THE CONTENT, AS YOU'D EXPECT */}

                <form> {/* //DEVICE TYPE */}
                    <Typography className={
                            classes.instructions
                        }
                        style={
                            {marginTop: 20}
                    }>
                        <h4>{
                            getStepContent(0).title
                        }</h4>
                    </Typography>

                    {
                    getStepContent(0).component
                }

                    {/* //TYPE OF CELL TO MEASURE */}
                    <Typography className={
                            classes.instructions
                        }
                        style={
                            {marginTop: 0}
                    }>
                        <h4>{
                            getStepContent(1).title
                        }</h4>
                    </Typography>

                    {
                    getStepContent(1).component
                }

                    {/* //PARTICLE SIZE */}
                    <Typography className={
                            classes.instructions
                        }
                        style={
                            {marginTop: 10}
                    }>
                        <h4>{
                            getStepContent(2).title
                        }</h4>
                    </Typography>

                    {
                    getStepContent(2).component
                }

                    {/* //FLUOROSPHORES CATEGORY */}
                    <Typography className={
                            classes.instructions
                        }
                        style={
                            {marginTop: 10}
                    }>
                        <h4>{
                            getStepContent(3).title
                        }</h4>
                    </Typography>

                    {
                    getStepContent(3).component
                }

                    {/* DESCRIPTION */}
                    <Typography className={
                            classes.instructions
                        }
                        style={
                            {marginTop: 0}
                    }>
                        <h4>{
                            getStepContent(4).title
                        }</h4>
                    </Typography>

                    {
                    getStepContent(4).component
                } </form>

            </div>
        </Grid>
    );
}
