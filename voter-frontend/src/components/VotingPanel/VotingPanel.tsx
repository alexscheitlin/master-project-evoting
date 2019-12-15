import { Button, CircularProgress, makeStyles, Theme, Typography } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import React, { useState } from 'react';

import { SubmissionState, VotingOption } from '../../models/voting';
import { BallotService } from '../../services';
import { useVoterStore } from '../../store';
import { delay } from '../../util/helper';

interface Props {
  votingQuestion: string;
}

const VotingPanel: React.FC<Props> = ({ votingQuestion }) => {
  const [selectedVote, setSelectedVote] = useState<VotingOption>(VotingOption.UNSPEC);
  const [submissionState, setSubmissionState] = useState(SubmissionState.NOT_CONFIRMED);
  const [message, setMessage] = useState('Please submit a vote below');
  const [loading, setLoading] = useState(false);
  const voterState = useVoterStore();

  const handleToggle = (event: React.MouseEvent<HTMLElement>, newValue: string): void => {
    if (newValue === VotingOption.YES) {
      setSelectedVote(VotingOption.YES);
    } else if (newValue === VotingOption.NO) {
      setSelectedVote(VotingOption.NO);
    }
  };

  const submitVote = async (): Promise<any> => {
    setMessage('Submitting Vote');
    setSubmissionState(SubmissionState.IN_SUBMISSION);
    setLoading(true);
    await delay(1000);
    switch (selectedVote) {
      case VotingOption.YES:
        try {
          await BallotService.castYesVote(voterState.contract, voterState.wallet);
          setMessage('Your Vote was submitted successfully.');
          setSubmissionState(SubmissionState.CONFIRMED);
        } catch (error) {
          setMessage(`Unable to submit your vote.`);
          setSubmissionState(SubmissionState.NOT_CONFIRMED);
        }
        break;
      case VotingOption.NO:
        try {
          await BallotService.castNoVote(voterState.contract, voterState.wallet);
          setMessage('Your Vote was submitted successfully');
          setSubmissionState(SubmissionState.CONFIRMED);
        } catch (error) {
          setMessage(`Unable to submit your vote.`);
          setSubmissionState(SubmissionState.NOT_CONFIRMED);
        }
        break;
      default:
        setMessage('Please choose YES or NO first');
        setSubmissionState(SubmissionState.NOT_CONFIRMED);
    }
    setLoading(false);
  };

  const classes = useStyles();

  const isButtonDisabled =
    submissionState === SubmissionState.IN_SUBMISSION || submissionState === SubmissionState.CONFIRMED;

  return (
    <div className={classes.root}>
      <div className={classes.message}>
        <Typography>{message}</Typography>
        {loading && <CircularProgress size={15} />}
        {submissionState === SubmissionState.CONFIRMED && <CheckCircleIcon color={'primary'} />}
      </div>
      <div className={classes.buttons}>
        <ToggleButtonGroup className={classes.buttons} exclusive onChange={handleToggle}>
          <ToggleButton
            disabled={isButtonDisabled}
            classes={{
              selected: classes.selected,
            }}
            className={classes.button}
            key={1}
            value="YES"
            selected={selectedVote === VotingOption.YES}
          >
            <Typography variant="h3">YES</Typography>
          </ToggleButton>
          <ToggleButton
            disabled={isButtonDisabled}
            classes={{
              selected: classes.selected,
            }}
            className={classes.button}
            key={2}
            value="NO"
            selected={selectedVote === VotingOption.NO}
          >
            <Typography variant="h3">NO</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div>
        <Button color="primary" variant="outlined" onClick={submitVote} disabled={isButtonDisabled}>
          submit
        </Button>
      </div>
    </div>
  );
};

export default VotingPanel;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(4, 0),
    padding: theme.spacing(4, 2),
    textAlign: 'center',
  },
  button: {
    padding: theme.spacing(5, 8),
    height: '100%',
    width: 200,
  },
  selected: {
    '&$selected': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  buttons: {
    margin: theme.spacing(2, 0),
  },
  message: {
    height: '30px',
  },
  proof: {
    margin: theme.spacing(2, 0),
  },
  proofPaper: {
    padding: theme.spacing(2, 4),
  },
  proofButton: {},
}));
