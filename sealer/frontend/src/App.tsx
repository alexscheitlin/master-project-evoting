import {
  Grid,
  makeStyles,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Theme
} from "@material-ui/core";
import React from "react";

import { KeyGeneration } from "./components/KeyGeneration";
import { Register } from "./components/Register";
import { StartNode } from "./components/StartNode";
import { TallyVotes } from "./components/TallyVotes";
import { Store } from "./store";

// Title of the progress tracker on left
const phases = [
  {
    title: "Address Registration"
  },
  {
    title: "Starting Sealer Node"
  },
  {
    title: "Key Generation"
  },
  {
    title: "Tally Votes"
  }
];

const App: React.FC = () => {
  const classes = useStyles();
  const { activeStep, nextStep, reset } = Store.useActiveStepStore();

  const getStep = (step: number): any => {
    switch (step) {
      case 0:
        return <Register nextStep={nextStep} />;
      case 1:
        return <StartNode nextStep={nextStep} />;
      case 2:
        return <KeyGeneration />;
      case 3:
        return <TallyVotes />;
      default:
        reset();
    }
  };

  return (
    <Grid container direction={"row"} className={classes.root}>
      <Grid item xs={3}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {phases.map((phase: any, i) => (
            <Step key={i}>
              <StepLabel>{phase.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Grid>
      <Grid item className={classes.mainContainer}>
        <Paper className={classes.contentWrapper}>{getStep(activeStep)}</Paper>
      </Grid>
    </Grid>
  );
};

export default App;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  mainContainer: {
    padding: theme.spacing(1)
  },
  contentWrapper: {
    width: 550,
    margin: "auto",
    padding: theme.spacing(3, 2)
  }
}));
