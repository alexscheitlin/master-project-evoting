import { Button, makeStyles, Theme } from '@material-ui/core';
import React, { useState } from 'react';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';
import { useVoteStateStore, useVoteQuestionStore, VotingState } from '../../../models/voting';
import { useInterval } from '../helper/UseInterval';
import { fetchState } from '../../../services/authBackend';

interface VotingStateResponse {
  state: VotingState;
  votesSubmitted: number;
  question: string;
}

interface VotingProps {
  handleNext: () => void;
}

export const Vote: React.FC<VotingProps> = ({ handleNext }: VotingProps) => {
  const classes = useStyles();

  const { nextState } = useVoteStateStore();
  const { question, setQuestion } = useVoteQuestionStore();

  const [votesSubmitted, setVotesSubmitted] = useState<number>(0);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const getState = async () => {
    try {
      const data: VotingStateResponse = (await fetchState()) as VotingStateResponse;
      setQuestion(data.question);
      setVotesSubmitted(data.votesSubmitted);
    } catch (error) {
      setErrorMessage(error.msg);
      setHasError(true);
      console.error(error);
    }
  };

  useInterval(() => {
    getState();
  }, 4000);

  const nextStep = async () => {
    try {
      await nextState();
      handleNext();
    } catch (error) {
      setErrorMessage(error.msg);
      setHasError(true);
    }
  };

  return (
    <div className={classes.container}>
      <div>
        <h1>{`Voting Phase - Question: ${question}`}</h1>
        <h4>{`The voting is currently in progress!`}</h4>
        <h4>{`Votes submitted: ${votesSubmitted}`}</h4>
      </div>
      <div className={classes.actionsContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={nextStep}
          className={classes.button}
          disabled={votesSubmitted === 0}
        >
          Close Vote
        </Button>
      </div>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  }
}));
