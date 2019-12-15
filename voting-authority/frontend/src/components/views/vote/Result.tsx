import { Button, makeStyles, Theme } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { useVoteStateStore, VotingState } from '../../../models/voting';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';
import { fetchState } from '../../../services/authBackend';

interface ResultProps {
  handleNext: () => void;
}

interface ResultStateResponse {
  state: VotingState;
  yesVotes: number;
  noVotes: number;
}

export const Result: React.FC<ResultProps> = ({ handleNext }: ResultProps) => {
  const classes = useStyles();
  const { nextState } = useVoteStateStore();

  const [yesVotes, setYesVotes] = useState<number>(0);
  const [noVotes, setNoVotes] = useState<number>(0);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const getState = async () => {
    try {
      const data: ResultStateResponse = (await fetchState()) as ResultStateResponse;
      setYesVotes(data.yesVotes);
      setNoVotes(data.noVotes);
      console.log(data);
    } catch (error) {
      setErrorMessage(error.msg);
      setHasError(true);
      console.error(error);
    }
  };

  // fetch state once at the beginning
  useEffect(() => {
    getState();
  });

  const reset = async () => {
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
        <h1>{`Result Phase`}</h1>
        <h4>{`The vote has ended.`}</h4>

        {yesVotes >= 0 && noVotes >= 0 && (
          <div>
            <h4>{yesVotes > noVotes ? `Bro, you won!` : `Bro, you lost!`}</h4>
            <h4>{`Yes Votes: ${yesVotes}`}</h4>
            <h4>{`No Votes: ${noVotes}`}</h4>
          </div>
        )}
      </div>
      <div className={classes.actionsContainer}>
        <Button variant="contained" color="primary" onClick={reset} className={classes.button}>
          New Vote
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
