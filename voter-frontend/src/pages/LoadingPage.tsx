import {CircularProgress, Container} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, {useEffect} from 'react';

import {useAuth} from '../hooks/useAuth';
import {delay} from '../util/helper';
import {AccessProviderBackend} from '../mock';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      marginTop: theme.spacing(16),
    },
    container: {},
  }),
);

function getSteps() {
  return ['Checking your Login ', 'Creating Voting Material', 'Connect to Blockchain'];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return `Authenticating with the e-Identity provider`;
    case 1:
      return 'Generating your Voter-Wallet and waiting for activation';
    case 2:
      return `Connecting to deployed Ballot on the Blockchain`;
    default:
      return 'Unknown step';
  }
}

export default function LoadingPage() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  const auth = useAuth();

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const generateWallet = () => {
    const wallet = '0x02191612638124780216416783612739';
    const token = localStorage.getItem('token');
    if (token !== null) {
      console.log(token);
      AccessProviderBackend.fundWallet(token, wallet).then((res: any) => {
        console.log(res);
      });
    }
  };

  useEffect(() => {
    generateWallet();
    if (auth !== null) {
      delay(2000)
        .then(() => handleNext())
        .then(() => delay(2000))
        .then(() => handleNext())
        .then(() => delay(2000))
        .then(() => auth.setWallet('0x02191612638124780216416783612739'));
    }
    return () => {};
  }, [auth]);

  return (
    <Container maxWidth="xs">
      <Paper className={classes.root}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <strong>{label}</strong> {index === activeStep ? <CircularProgress size={20} /> : null}
              </StepLabel>
              <StepContent>
                <Typography>{getStepContent(index)}</Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
}
