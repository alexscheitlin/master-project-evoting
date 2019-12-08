import {
  Divider,
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

  const voteStore = Store.useVoteStateStore();
  const { activeStep, nextStep, reset } = Store.useActiveStepStore();

  const getStep = (step: number): any => {
    switch (step) {
      case 0:
        return <Register nextStep={nextStep} />;
      case 1:
        return <StartNode />;
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
      <Grid item xs={2}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {phases.map((label: any, i) => (
            <Step key={i}>
              <StepLabel>{label.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Grid>
      <Grid item>
        <Divider orientation="vertical" />
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
    display: "flex",
    flexGrow: 1,
    padding: theme.spacing(1)
  },
  contentWrapper: {
    margin: "auto",
    padding: theme.spacing(3, 2)
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  resetContainer: {
    padding: theme.spacing(3)
  }
}));
