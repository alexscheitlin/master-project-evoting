import { Button, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import ReceiptIcon from '@material-ui/icons/Receipt';
import React, { useEffect, useState } from 'react';

import { useVoteQuestionStore, useVoteStateStore, VotingState } from '../../../models/voting';
import { fetchState } from '../../../services/authBackend';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';
import { StepContentWrapper } from '../../defaults/StepContentWrapper';
import { StepTitle } from '../../defaults/StepTitle';
import { LoadSuccess } from '../helper/LoadSuccess';
import { useInterval } from '../helper/UseInterval';

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

  const [inTransition, setInTransition] = useState(false);

  useEffect(() => {
    getState();
  }, []);

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
      setInTransition(true);
      await nextState();
      setInTransition(false);
      handleNext();
    } catch (error) {
      setInTransition(false);
      setErrorMessage(error.msg);
      setHasError(true);
    }
  };

  return (
    <StepContentWrapper>
      <StepTitle title="Voting Phase" subtitle={'the vote is currently open'} />
      <List>
        <ListItem>
          <ListItemIcon>
            <QuestionAnswerIcon />
          </ListItemIcon>
          <ListItemText primary={`${question}`} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText>{votesSubmitted} - votes submitted</ListItemText>
        </ListItem>
        <ListItem>
          The vote is currently ongoing. Press the button below to end the vote. After closing the vote, no voters can
          submit votes anymore. This action cannot be reverted!
        </ListItem>
      </List>
      <List className={classes.nextButton}>
        <ListItem>
          <Button
            variant="contained"
            color="primary"
            onClick={nextStep}
            className={classes.closeButton}
            disabled={votesSubmitted === 0}
          >
            {!inTransition ? `Close Vote` : <LoadSuccess loading={true} white={true} />}
          </Button>
        </ListItem>
      </List>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </StepContentWrapper>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  closeButton: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 160,
    height: 36
  },
  nextButton: {
    position: 'absolute',
    bottom: 0
  }
}));
