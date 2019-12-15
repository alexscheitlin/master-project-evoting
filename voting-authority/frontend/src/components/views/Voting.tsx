import {
  Button,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Theme,
  Typography
} from '@material-ui/core';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { DEV_URL } from '../../constants';
import { useActiveStepStore, useVoteStateStore, VOTE_LABELS, VOTE_STATES, VotingState } from '../../models/voting';
import { ErrorSnackbar } from '../defaults/ErrorSnackbar';
import { Config, Register, Startup, Tally, Vote } from './vote';
import { Result } from './vote/Result';

interface StateResponse {
  state: VotingState;
  registeredSealers: number;
  requiredSealers: number;
}

export const Voting: React.FC = () => {
  const classes = useStyles();

  const [requiredSealers, setRequiredSealers] = useState<number>(3);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const { setState } = useVoteStateStore();
  const { activeStep, setActiveStep, nextStep, reset } = useActiveStepStore();

  useEffect(() => {
    const getRequiredValidators = async () => {
      try {
        const response: AxiosResponse<StateResponse> = await axios.get(`${DEV_URL}/state`);

        if (response.status === 200) {
          setRequiredSealers(response.data.requiredSealers);
          setState(response.data.state);
          setActiveStep(VOTE_STATES.indexOf(response.data.state));
        } else {
          throw new Error(`GET /state -> status code not 200. Status code is: ${response.status}`);
        }
      } catch (error) {
        setErrorMessage(error.message);
        setHasError(true);
      }
    };

    getRequiredValidators();
    // TODO: figure out why this only works with an empty dependency array added but not when it is removed
    // => should be the same since we only want to run this hook once at the beginning of the component rendering
  }, []);

  const getStep = (step: number): any => {
    switch (step) {
      case 0:
        return <Register handleNext={nextStep} requiredSealers={requiredSealers} />;
      case 1:
        return <Startup handleNext={nextStep} requiredSealers={requiredSealers} />;
      case 2:
        return <Config handleNext={nextStep} />;
      case 3:
        return <Vote handleNext={nextStep} />;
      case 4:
        return <Tally handleNext={nextStep} />;
      case 5:
        return <Result handleNext={nextStep} />;
      default:
        return (
          <div>
            <h1>Error: Step doesn't exist!</h1>
            <ErrorSnackbar open={hasError} message={errorMessage} />
          </div>
        );
    }
  };

  return (
    <Grid container direction={'row'} className={classes.root}>
      <Grid item xs={2}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {VOTE_LABELS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === VOTE_LABELS.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed. The vote is done.</Typography>
            <Button onClick={reset} className={classes.button}>
              Reset
            </Button>
          </Paper>
        )}
      </Grid>
      <Grid item>
        <Divider orientation="vertical" />
      </Grid>
      <Grid item className={classes.mainContainer}>
        {getStep(activeStep)}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  mainContainer: {
    display: 'flex',
    flexGrow: 1
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  resetContainer: {
    padding: theme.spacing(3)
  }
}));
