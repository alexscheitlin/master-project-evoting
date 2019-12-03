import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Theme,
  Typography
} from '@material-ui/core';
import React from 'react';
import { VoteDone, VoteOpen, VoteSetup } from './vote';
import { useActiveStepStore } from '../../models/voting';

const getSteps = (): string[] => {
  return ['Vote Setup', 'Vote Open', 'Vote Completed'];
};

export const Voting: React.FC = () => {
  const classes = useStyles();
  const steps = getSteps();

  const { activeStep, updateActiveStep, resetActiveStep } = useActiveStepStore();

  const getStepContent = (step: number): any => {
    switch (step) {
      case 0:
        return <VoteSetup handleNext={updateActiveStep} />;
      case 1:
        return <VoteOpen handleNext={updateActiveStep} />;
      case 2:
        return <VoteDone handleNext={updateActiveStep} />;
      default:
        throw new Error('Invalid Component Selected!');
    }
  };

  return (
    <Grid container direction={'row'} className={classes.root}>
      <Grid item>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>{getStepContent(index)}</StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed. The vote is done.</Typography>
            <Button onClick={resetActiveStep} className={classes.button}>
              Reset
            </Button>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1)
    },
    actionsContainer: {
      marginBottom: theme.spacing(2)
    },
    resetContainer: {
      padding: theme.spacing(3)
    },
    divider: {
      borderRight: `1px solid ${theme.palette.divider}`
    }
  })
);
