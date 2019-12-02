import {
  Button,
  createStyles,
  Divider,
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
import React, { useState } from 'react';
import { VotingState, useStore } from '../../models/voting';
import { State } from '../defaults/State';
import { VoteDone, VoteOpen, VoteSetup } from './vote';

const getSteps = (): string[] => {
  return ['Vote Setup', 'Vote Open', 'Vote Completed'];
};

const getButtonText = (step: number): string => {
  switch (step) {
    case 0:
      return 'Create Vote';
    case 1:
      return 'Open Vote';
    case 2:
      return 'End Vote';
    default:
      return 'Unkown Step!';
  }
};

export const Voting: React.FC = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();

  const { voteState } = useStore();

  const [votingQuestion, setVotingQuestion] = useState('');
  const [votingState, setVotingState] = useState<VotingState>(VotingState.PRE_VOTING);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleVotingQuestionChange = (question: string) => {
    setVotingQuestion(question);
    console.log(voteState);
  };

  const getStepContent = (step: number): any => {
    switch (step) {
      case 0:
        return <VoteSetup votingQuestion={votingQuestion} setVoteQuestion={handleVotingQuestionChange} />;
      case 1:
        return <VoteOpen votingQuestion={votingQuestion} votingState={votingState} />;
      case 2:
        return <VoteDone />;
      default:
        throw new Error('Invalid Component Selected!');
    }
  };

  return (
    <Grid container direction={'row'} className={classes.root}>
      <Grid xs={10} item>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {getStepContent(index)}
                <div className={classes.actionsContainer}>
                  <Button variant="contained" color="primary" onClick={handleNext} className={classes.button}>
                    {getButtonText(index)}
                  </Button>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed. The vote is done.</Typography>
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
          </Paper>
        )}
      </Grid>
      <Divider orientation="vertical" className={classes.divider} />
      <State />
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // width: '100%',
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
