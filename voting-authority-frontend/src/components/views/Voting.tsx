import {
  Button,
  createStyles,
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
import React from 'react';
import { useActiveStepStore, VOTE_LABELS } from '../../models/voting';
import { VoteDone, VoteOpen, VoteSetup } from './vote';

export const Voting: React.FC = () => {
  const classes = useStyles();

  const { activeStep, nextStep, reset } = useActiveStepStore();

  const getStep = (step: number): any => {
    switch (step) {
      case 0:
        return <VoteSetup handleNext={nextStep} />;
      case 1:
        return <VoteOpen handleNext={nextStep} />;
      case 2:
        return <VoteDone handleNext={nextStep} />;
      default:
        return (
          <div>
            <h1>Error</h1>
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
      <Grid item xs={1}>
        <Divider orientation="vertical" />
      </Grid>
      <Grid item xs={9}>
        {getStep(activeStep)}
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
