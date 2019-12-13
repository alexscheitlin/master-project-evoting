import { Grid, makeStyles, Paper, Step, StepLabel, Stepper, Theme, Button } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { VOTE_STATES, VOTE_LABELS } from './models/states';
import { AuthBackend } from './services';
import { KeyGeneration } from './components/KeyGeneration';
import { Register } from './components/Register';
import { StartNode } from './components/StartNode';
import { TallyVotes } from './components/TallyVotes';
import { Store } from './store';

const App: React.FC = () => {
  const classes = useStyles();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const { activeStep, setActiveStep, nextStep, reset } = Store.useActiveStepStore();

  useEffect(() => {
    const getRequiredValidators = async () => {
      try {
        const data = await AuthBackend.getState();
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
        return (
          <div>
            <h1>DummyState</h1>
            <Button onClick={nextStep}>MoveNext</Button>
          </div>
        );
      case 4:
        return <TallyVotes />;
      default:
        reset();
    }
  };

  return (
    <Grid container direction={'row'} className={classes.root}>
      <Grid item xs={3}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {VOTE_LABELS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Grid>
      <Grid item className={classes.mainContainer}>
        <Paper className={classes.contentWrapper}>{getStep(activeStep)}</Paper>
      </Grid>
      {hasError && <h1>{`${errorMessage}`}</h1>}
    </Grid>
  );
};

export default App;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  mainContainer: {
    padding: theme.spacing(1),
  },
  contentWrapper: {
    width: 550,
    margin: 'auto',
    padding: theme.spacing(3, 2),
  },
}));
