import React from "react";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Check from "@material-ui/icons/Check";
import SettingsIcon from "@material-ui/icons/Settings";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import VideoLabelIcon from "@material-ui/icons/VideoLabel";
import StepConnector from "@material-ui/core/StepConnector";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Grid } from "@material-ui/core";

const QontoConnector = withStyles({
  alternativeLabel: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  active: {
    "& $line": {
      borderColor: "#784af4",
    },
  },
  completed: {
    "& $line": {
      borderColor: "#784af4",
    },
  },
  line: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
})(StepConnector);

const useQontoStepIconStyles = makeStyles({
  root: {
    color: "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
  },
  active: {
    color: "#784af4",
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  completed: {
    color: "#784af4",
    zIndex: 1,
    fontSize: 18,
  },
});

function QontoStepIcon(props: any) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {completed ? (
        <Check className={classes.completed} />
      ) : (
        <div className={classes.circle} />
      )}
    </div>
  );
}

QontoStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
};

function getSteps() {
  return [
    "Sample selector",
    "Gate Creator",
    "Group operations",
    "Stats",
    "Report Creation",
  ].map((e, i) => {
    return {
      label: e,
      key: i,
    };
  });
}

const OnRailsHeader = () => {
  const [activeStep, setActiveStep] = React.useState(getSteps()[0].key);
  const steps = getSteps();

  return (
    <Grid
      style={{
        position: "fixed",
        zIndex: 100,
        top: 64 + 47 + 10,
        left: 10,
      }}
    >
      <Stepper
        style={{
          backgroundColor: "#fafafa",
          borderRadius: 10,
        }}
        activeStep={activeStep}
      >
        {steps.map((step) => (
          <Step
            key={step.key}
            onClick={() => {
              setActiveStep(step.key);
            }}
          >
            <StepLabel StepIconComponent={QontoStepIcon}>
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Grid>
  );
};

export default OnRailsHeader;
