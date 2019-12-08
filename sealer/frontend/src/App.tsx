import {
  Divider,
  Grid,
  makeStyles,
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

  const { activeStep, nextStep, reset } = Store.useActiveStepStore();

  const getStep = (step: number): any => {
    switch (step) {
      case 0:
        return <Register />;
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
          {phases.map((label: any) => (
            <Step key={label.label}>
              <StepLabel>{label.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Grid>
      <Grid item>
        <Divider orientation="vertical" />
      </Grid>
      <Grid item className={classes.mainContainer}>
        <div className={classes.contentWrapper}>{getStep(activeStep)}</div>
      </Grid>
      <button onClick={nextStep}>next</button>
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
    flexGrow: 1
  },
  contentWrapper: {
    padding: theme.spacing(1)
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  resetContainer: {
    padding: theme.spacing(3)
  }
}));
