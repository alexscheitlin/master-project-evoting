import { Box, Button, Divider, Grid, makeStyles, Step, StepLabel, Stepper, Theme } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import { VOTE_LABELS, VOTE_STATES } from '../models/states';
import { AuthBackend } from '../services';
import { Store } from '../store';
import { KeyGeneration } from './KeyGeneration';
import { Register } from './Register';
import { StartNode } from './StartNode';
import { TallyVotes } from './TallyVotes';
import { Voting } from './Voting/Voting';

export const Process: React.FC = () => {
  const classes = useStyles();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const { activeStep, setActiveStep, nextStep, reset } = Store.useActiveStepStore();

  useEffect(() => {
    const getRequiredValidators = async () => {
      try {
        const data = await AuthBackend.getState();
        console.log(data);
        setActiveStep(VOTE_STATES.indexOf(data.state));
      } catch (error) {
        setErrorMessage(error.message);
        setHasError(true);
      }
    };

    getRequiredValidators();
  }, []);

  const getStep = (step: number): any => {
    switch (step) {
      case 0:
        return <Register nextStep={nextStep} />;
      case 1:
        return <StartNode nextStep={nextStep} />;
      case 2:
        return <KeyGeneration nextStep={nextStep} />;
      case 3:
        return <Voting nextStep={nextStep} />;
      case 4:
        return <TallyVotes nextStep={nextStep} />;
      case 5:
        return (
          <div>
            <h1>Result State</h1>
            <h3>You are at the fucking end!!</h3>
            <h4>The vote is done! You won! Congrats Bro!</h4>
          </div>
        );
      default:
        reset();
    }
  };

  return (
    <Grid container className={classes.root}>
      <Grid item xs={2}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {VOTE_LABELS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Grid>
      <Grid item>
        <Divider orientation="vertical" />
      </Grid>
      <Grid item xs>
        <Grid container>
          <Grid item xs={6}>
            <Box className={classes.contentWrapper}>{getStep(activeStep)}</Box>
          </Grid>
        </Grid>
      </Grid>
      {hasError && <h1>{`${errorMessage}`}</h1>}
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  contentWrapper: {
    padding: theme.spacing(3, 2),
  },
}));
